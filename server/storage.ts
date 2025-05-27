import {
  users,
  type User,
  type InsertUser,
  gameRounds,
  type GameRound,
  type InsertGameRound,
  bets,
  type Bet,
  type InsertBet,
  gameResults,
  type GameResult,
  transactions,
  type Transaction,
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Game round methods
  getCurrentRound(): Promise<GameRound | undefined>;
  getLatestCompletedRound(): Promise<GameRound | undefined>;
  createRound(round: InsertGameRound): Promise<GameRound>;
  updateRoundStatus(id: number, status: string): Promise<GameRound>;
  updateRoundWinner(id: number, winningCardId: string): Promise<GameRound>;
  updateRoundPool(id: number, amount: string): Promise<GameRound>;
  
  // Bet methods
  createBet(bet: {
    roundId: number;
    walletAddress: string;
    cardId: string;
    amount: string;
    txHash: string;
  }): Promise<Bet>;
  
  getRoundBets(roundId: number): Promise<Bet[]>;
  getUserBets(walletAddress: string): Promise<Bet[]>;
  getRoundTotalBets(roundId: number): Promise<string>;
  getCardsWithBets(roundId: number): Promise<{ id: string; totalBets: string; }[]>;
  
  // Transaction methods
  createTransaction(transaction: {
    walletAddress: string;
    type: string;
    amount: string;
    txHash: string;
    metadata?: any;
  }): Promise<Transaction>;
  
  // Game result methods
  getRecentResults(walletAddress?: string): Promise<any[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private gameRounds: Map<number, GameRound>;
  private bets: Map<number, Bet>;
  private gameResults: Map<number, GameResult>;
  private transactions: Map<number, Transaction>;
  
  userIdCounter: number;
  roundIdCounter: number;
  betIdCounter: number;
  resultIdCounter: number;
  transactionIdCounter: number;

  constructor() {
    this.users = new Map();
    this.gameRounds = new Map();
    this.bets = new Map();
    this.gameResults = new Map();
    this.transactions = new Map();
    
    this.userIdCounter = 1;
    this.roundIdCounter = 1;
    this.betIdCounter = 1;
    this.resultIdCounter = 1;
    this.transactionIdCounter = 1;
    
    // Initialize with a default active round
    this.createRound({
      roundNumber: 1,
      status: "active",
      startTime: new Date(),
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.walletAddress === walletAddress,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    // Ensure walletAddress is either string or null, not undefined
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password,
      walletAddress: insertUser.walletAddress || null
    };
    this.users.set(id, user);
    return user;
  }
  
  // Game round methods
  async getCurrentRound(): Promise<GameRound | undefined> {
    return Array.from(this.gameRounds.values()).find(
      (round) => round.status === "active",
    );
  }
  
  async getLatestCompletedRound(): Promise<GameRound | undefined> {
    // Find the latest completed round by round number
    const completedRounds = Array.from(this.gameRounds.values())
      .filter((round) => round.status === "completed")
      .sort((a, b) => b.roundNumber - a.roundNumber);
    
    return completedRounds.length > 0 ? completedRounds[0] : undefined;
  }
  
  async createRound(round: InsertGameRound): Promise<GameRound> {
    const id = this.roundIdCounter++;
    // Explicitly set all required fields to avoid type errors
    const gameRound: GameRound = { 
      id,
      roundNumber: round.roundNumber,
      status: round.status || "active", // Ensure status is not undefined
      startTime: round.startTime || new Date(), // Ensure startTime is not undefined
      winningCardId: null,
      totalPool: "0",
      endTime: null,
    };
    this.gameRounds.set(id, gameRound);
    return gameRound;
  }
  
  async updateRoundStatus(id: number, status: string): Promise<GameRound> {
    const round = this.gameRounds.get(id);
    if (!round) throw new Error(`Round with id ${id} not found`);
    
    const updatedRound = { ...round, status, endTime: status === "ended" ? new Date() : round.endTime };
    this.gameRounds.set(id, updatedRound);
    return updatedRound;
  }
  
  async updateRoundWinner(id: number, winningCardId: string): Promise<GameRound> {
    const round = this.gameRounds.get(id);
    if (!round) throw new Error(`Round with id ${id} not found`);
    
    const updatedRound = { ...round, winningCardId };
    this.gameRounds.set(id, updatedRound);
    return updatedRound;
  }
  
  async updateRoundPool(id: number, amount: string): Promise<GameRound> {
    const round = this.gameRounds.get(id);
    if (!round) throw new Error(`Round with id ${id} not found`);
    
    const totalPool = (parseFloat(round.totalPool) + parseFloat(amount)).toString();
    const updatedRound = { ...round, totalPool };
    this.gameRounds.set(id, updatedRound);
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
    const id = this.betIdCounter++;
    const newBet: Bet = { 
      ...bet, 
      id,
      userId: null,
      timestamp: new Date(),
    };
    this.bets.set(id, newBet);
    return newBet;
  }
  
  async getRoundBets(roundId: number): Promise<Bet[]> {
    return Array.from(this.bets.values()).filter(
      (bet) => bet.roundId === roundId,
    );
  }
  
  async getUserBets(walletAddress: string): Promise<Bet[]> {
    return Array.from(this.bets.values()).filter(
      (bet) => bet.walletAddress === walletAddress,
    );
  }
  
  async getRoundTotalBets(roundId: number): Promise<string> {
    const bets = await this.getRoundBets(roundId);
    const total = bets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0);
    return total.toString();
  }
  
  async getCardsWithBets(roundId: number): Promise<{ id: string; totalBets: string; }[]> {
    const bets = await this.getRoundBets(roundId);
    const cardBets = new Map<string, number>();
    
    for (const bet of bets) {
      const current = cardBets.get(bet.cardId) || 0;
      cardBets.set(bet.cardId, current + parseFloat(bet.amount));
    }
    
    // Ensure we always return the two cards
    const result = [
      { id: "Card 1", totalBets: "0" },
      { id: "Card 2", totalBets: "0" },
    ];
    
    // Convert Map to Array for ES5 compatibility
    Array.from(cardBets.entries()).forEach(([cardId, totalBet]) => {
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
    const id = this.transactionIdCounter++;
    // Explicitly set all required fields
    const newTransaction: Transaction = { 
      id,
      walletAddress: transaction.walletAddress,
      type: transaction.type,
      amount: transaction.amount,
      txHash: transaction.txHash,
      userId: null,
      timestamp: new Date(),
      metadata: transaction.metadata || {} // Ensure metadata is not undefined
    };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }
  
  // Game result methods
  async getRecentResults(walletAddress?: string): Promise<any[]> {
    // Mock implementation of recent results
    return [
      { 
        round: 24, 
        winningCard: "Card 2", 
        totalPool: "1.55 ETH", 
        userWinnings: "+0.12 ETH", 
        timestamp: "5 min ago" 
      },
      { 
        round: 23, 
        winningCard: "Card 1", 
        totalPool: "2.13 ETH", 
        userWinnings: "0.00 ETH", 
        timestamp: "12 min ago" 
      },
      { 
        round: 22, 
        winningCard: "Card 1", 
        totalPool: "1.87 ETH", 
        userWinnings: "+0.32 ETH", 
        timestamp: "18 min ago" 
      }
    ];
  }
}

import { DatabaseStorage } from "./database-storage";

// Choose which storage implementation to use
// Temporarily using memory storage due to database authentication issue
// export const storage = new DatabaseStorage();

// Using memory storage for now
export const storage = new MemStorage();
