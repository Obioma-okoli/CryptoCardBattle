import { db } from "./db";
import { 
  users, type User, type InsertUser, 
  gameRounds, type GameRound, type InsertGameRound,
  bets, type Bet,
  transactions, type Transaction,
  gameResults, type GameResult
} from "@shared/schema";
import { IStorage } from "./storage";
import { eq, desc, and, asc } from "drizzle-orm";

// Implement the IStorage interface with database operations
export class DatabaseStorage implements IStorage {
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }
  
  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress as any));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Game round methods
  async getCurrentRound(): Promise<GameRound | undefined> {
    const [round] = await db
      .select()
      .from(gameRounds)
      .where(eq(gameRounds.status, "active"));
    return round || undefined;
  }
  
  async getLatestCompletedRound(): Promise<GameRound | undefined> {
    const [round] = await db
      .select()
      .from(gameRounds)
      .where(eq(gameRounds.status, "completed"))
      .orderBy(desc(gameRounds.roundNumber))
      .limit(1);
    return round || undefined;
  }
  
  async createRound(round: InsertGameRound): Promise<GameRound> {
    const [gameRound] = await db
      .insert(gameRounds)
      .values(round)
      .returning();
    return gameRound;
  }
  
  async updateRoundStatus(id: number, status: string): Promise<GameRound> {
    let updateValues: any = { status };
    
    // If status is "completed", set end time
    if (status === "completed") {
      updateValues.endTime = new Date();
    }
    
    const [updatedRound] = await db
      .update(gameRounds)
      .set(updateValues)
      .where(eq(gameRounds.id, id))
      .returning();
    
    return updatedRound;
  }
  
  async updateRoundWinner(id: number, winningCardId: string): Promise<GameRound> {
    const [updatedRound] = await db
      .update(gameRounds)
      .set({ winningCardId })
      .where(eq(gameRounds.id, id))
      .returning();
    
    return updatedRound;
  }
  
  async updateRoundPool(id: number, amount: string): Promise<GameRound> {
    // Get current round
    const [round] = await db
      .select()
      .from(gameRounds)
      .where(eq(gameRounds.id, id));
    
    if (!round) {
      throw new Error(`Round with id ${id} not found`);
    }
    
    // Calculate new total pool
    const currentTotal = parseFloat(round.totalPool);
    const betAmount = parseFloat(amount);
    const newTotal = (currentTotal + betAmount).toString();
    
    // Update the total pool
    const [updatedRound] = await db
      .update(gameRounds)
      .set({ totalPool: newTotal })
      .where(eq(gameRounds.id, id))
      .returning();
    
    return updatedRound;
  }
  
  // Bet methods
  async createBet(bet: {
    roundId: number;
    walletAddress: string;
    cardId: string;
    amount: string;
    txHash: string;
  }): Promise<Bet> {
    const [newBet] = await db
      .insert(bets)
      .values({
        ...bet,
        userId: null,
        timestamp: new Date()
      })
      .returning();
    
    return newBet;
  }
  
  async getRoundBets(roundId: number): Promise<Bet[]> {
    return db
      .select()
      .from(bets)
      .where(eq(bets.roundId, roundId));
  }
  
  async getUserBets(walletAddress: string): Promise<Bet[]> {
    return db
      .select()
      .from(bets)
      .where(eq(bets.walletAddress, walletAddress));
  }
  
  async getRoundTotalBets(roundId: number): Promise<string> {
    const roundBets = await this.getRoundBets(roundId);
    const total = roundBets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0);
    return total.toString();
  }
  
  async getCardsWithBets(roundId: number): Promise<{ id: string; totalBets: string; }[]> {
    const roundBets = await this.getRoundBets(roundId);
    
    // Prepare data map for cards
    const result = [
      { id: "Card 1", totalBets: "0" },
      { id: "Card 2", totalBets: "0" },
    ];
    
    // Aggregate bets by card
    const cardTotals: Record<string, number> = {};
    
    for (const bet of roundBets) {
      const currentTotal = cardTotals[bet.cardId] || 0;
      cardTotals[bet.cardId] = currentTotal + parseFloat(bet.amount);
    }
    
    // Update the result with totals
    Object.entries(cardTotals).forEach(([cardId, totalBet]) => {
      const cardIndex = parseInt(cardId.split(" ")[1]) - 1;
      if (cardIndex >= 0 && cardIndex < result.length) {
        result[cardIndex].totalBets = totalBet.toString();
      }
    });
    
    return result;
  }
  
  // Transaction methods
  async createTransaction(transaction: {
    walletAddress: string;
    type: string;
    amount: string;
    txHash: string;
    metadata?: any;
  }): Promise<Transaction> {
    // Add required properties and ensure metadata is not null/undefined
    const transactionData = {
      userId: null,
      walletAddress: transaction.walletAddress,
      type: transaction.type,
      amount: transaction.amount,
      txHash: transaction.txHash,
      timestamp: new Date(),
      metadata: transaction.metadata || {} // Ensure metadata is not undefined
    };
    
    const [newTransaction] = await db
      .insert(transactions)
      .values(transactionData)
      .returning();
    
    return newTransaction;
  }
  
  // Game result methods
  async getRecentResults(walletAddress?: string): Promise<any[]> {
    // Get completed rounds
    const completedRounds = await db
      .select()
      .from(gameRounds)
      .where(eq(gameRounds.status, "completed"))
      .orderBy(desc(gameRounds.roundNumber))
      .limit(10);
      
    // Filter rounds with winningCardId not null
    const roundsWithWinners = completedRounds
      .filter(round => round.winningCardId !== null)
      .slice(0, 5);
    
    // Format results
    return Promise.all(roundsWithWinners.map(async (round) => {
      let userWinnings = "0.00 ETH";
      
      if (walletAddress) {
        // Get user bets for this round
        const userBets = await db
          .select()
          .from(bets)
          .where(
            and(
              eq(bets.roundId, round.id),
              eq(bets.walletAddress, walletAddress)
            )
          );
        
        // Check if user won
        const didWin = userBets.some(bet => bet.cardId === round.winningCardId);
        
        if (didWin) {
          // Get winnings from transactions
          const winTransactions = await db
            .select()
            .from(transactions)
            .where(
              and(
                eq(transactions.walletAddress, walletAddress),
                eq(transactions.type, "win"),
                // Check in metadata.roundId
                eq((transactions.metadata as any)?.roundId, round.id)
              )
            );
          
          // Sum winnings
          const totalWinnings = winTransactions.reduce(
            (sum, tx) => sum + parseFloat(tx.amount), 
            0
          );
          
          userWinnings = `+${totalWinnings.toFixed(2)} ETH`;
        } else if (userBets.length > 0) {
          // User bet but didn't win
          userWinnings = "0.00 ETH";
        }
      }
      
      // Format timestamp
      const now = new Date();
      const roundEnd = round.endTime || now;
      const minutesAgo = Math.floor((now.getTime() - roundEnd.getTime()) / (1000 * 60));
      const timeDisplay = minutesAgo < 60 
        ? `${minutesAgo} min ago`
        : `${Math.floor(minutesAgo / 60)} hours ago`;
      
      return {
        round: round.roundNumber,
        winningCard: round.winningCardId,
        totalPool: `${round.totalPool} ETH`,
        userWinnings,
        timestamp: timeDisplay
      };
    }));
  }
}