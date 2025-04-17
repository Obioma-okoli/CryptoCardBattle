import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBetSchema, insertGameRoundSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { ethers } from "ethers";

export async function registerRoutes(app: Express): Promise<Server> {
  // Bet placement route
  app.post("/api/place-bet", async (req, res) => {
    try {
      // Validate payload
      const placeBetSchema = z.object({
        playerId: z.string().min(1),
        cardId: z.string().min(1),
        amount: z.string().min(1),
        txHash: z.string().min(1),
      });
      
      const payload = placeBetSchema.parse(req.body);
      
      // Get current round
      const currentRound = await storage.getCurrentRound();
      
      if (!currentRound) {
        return res.status(400).json({ message: "No active round found" });
      }
      
      // Create bet record
      const bet = await storage.createBet({
        roundId: currentRound.id,
        walletAddress: payload.playerId,
        cardId: payload.cardId,
        amount: payload.amount,
        txHash: payload.txHash,
      });
      
      // Update total pool
      await storage.updateRoundPool(currentRound.id, payload.amount);
      
      // Create transaction record
      await storage.createTransaction({
        walletAddress: payload.playerId,
        type: "bet",
        amount: payload.amount,
        txHash: payload.txHash,
        metadata: { roundId: currentRound.id, cardId: payload.cardId },
      });
      
      res.status(200).json({ 
        message: "Bet placed successfully", 
        data: bet,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      
      console.error("Error placing bet:", error);
      res.status(500).json({ message: "Error placing bet" });
    }
  });
  
  // Get current game state
  app.get("/api/game-state", async (req, res) => {
    try {
      // Get current round
      const currentRound = await storage.getCurrentRound();
      
      if (!currentRound) {
        return res.status(404).json({ message: "No active round found" });
      }
      
      // Get total bets for current round
      const totalBets = await storage.getRoundTotalBets(currentRound.id);
      
      // Get cards with bet amounts
      const cards = await storage.getCardsWithBets(currentRound.id);
      
      // Calculate time remaining (mock implementation)
      const timeRemaining = 165; // 2:45 in seconds
      
      res.status(200).json({
        round: currentRound.roundNumber,
        status: currentRound.status,
        totalBets,
        timeRemaining,
        cards,
      });
    } catch (error) {
      console.error("Error fetching game state:", error);
      res.status(500).json({ message: "Error fetching game state" });
    }
  });
  
  // Get recent results
  app.get("/api/recent-results", async (req, res) => {
    try {
      // Get wallet address from query params
      const walletAddress = req.query.walletAddress as string;
      
      // Get recent results
      const results = await storage.getRecentResults(walletAddress);
      
      res.status(200).json(results);
    } catch (error) {
      console.error("Error fetching recent results:", error);
      res.status(500).json({ message: "Error fetching recent results" });
    }
  });

  // Create HTTP Server
  const httpServer = createServer(app);
  
  // Initialize game round if none exists
  const initializeGameRound = async () => {
    try {
      const currentRound = await storage.getCurrentRound();
      
      if (!currentRound) {
        // Create a new round
        const latestRound = await storage.getLatestCompletedRound();
        const roundNumber = latestRound ? latestRound.roundNumber + 1 : 1;
        
        await storage.createRound({
          status: 'active',
          roundNumber,
          startTime: new Date(),
          endTime: null,
          winningCardId: null,
          totalPool: '0',
        });
        
        console.log(`Created new round #${roundNumber}`);
      }
    } catch (error) {
      console.error('Error initializing game round:', error);
    }
  };
  
  // Function to determine the winner and distribute winnings
  const determineWinner = async () => {
    try {
      const currentRound = await storage.getCurrentRound();
      
      if (!currentRound || currentRound.status !== 'active') {
        return;
      }
      
      // Get all bets for the round
      const bets = await storage.getRoundBets(currentRound.id);
      
      if (bets.length === 0) {
        // If no bets, just end the round and create a new one
        await storage.updateRoundStatus(currentRound.id, 'completed');
        await initializeGameRound();
        return;
      }
      
      // Determine winning card (random for now)
      const winningCardId = Math.random() < 0.5 ? 'Card 1' : 'Card 2';
      
      // Update round with winner
      await storage.updateRoundWinner(currentRound.id, winningCardId);
      await storage.updateRoundStatus(currentRound.id, 'completed');
      
      // Get winning bets
      const winningBets = bets.filter(bet => bet.cardId === winningCardId);
      
      // Calculate total pool
      const totalPool = parseFloat(currentRound.totalPool);
      
      // Take platform fee (10%)
      const platformFee = totalPool * 0.1;
      const prizePool = totalPool - platformFee;
      
      // Calculate total winning bets amount
      const totalWinningBetsAmount = winningBets.reduce(
        (sum, bet) => sum + parseFloat(bet.amount), 
        0
      );
      
      // If no winning bets, create a new round
      if (totalWinningBetsAmount === 0) {
        await initializeGameRound();
        return;
      }
      
      // Distribute winnings
      for (const bet of winningBets) {
        const share = (parseFloat(bet.amount) / totalWinningBetsAmount) * prizePool;
        
        // In a real implementation, this would send ETH to the player's wallet
        // For now, just create a transaction record
        await storage.createTransaction({
          walletAddress: bet.walletAddress,
          type: 'win',
          amount: share.toString(),
          txHash: `win_${currentRound.id}_${bet.id}`, // Mock transaction hash
          metadata: {
            roundId: currentRound.id,
            cardId: winningCardId,
            originalBet: bet.amount,
          },
        });
        
        console.log(`Distributed ${share} ETH to ${bet.walletAddress}`);
      }
      
      // Create a new round
      await initializeGameRound();
    } catch (error) {
      console.error('Error determining winner:', error);
    }
  };
  
  // Start game timer
  let gameTimer: NodeJS.Timer;
  
  const startGameTimer = async () => {
    // Initialize first round
    await initializeGameRound();
    
    // Set up game timer
    gameTimer = setInterval(async () => {
      const currentRound = await storage.getCurrentRound();
      
      if (!currentRound) {
        await initializeGameRound();
        return;
      }
      
      // Check if round has been active for 3 minutes (180 seconds)
      const now = new Date();
      const startTime = new Date(currentRound.startTime);
      const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      
      if (elapsedSeconds >= 180) {
        // End the round and determine winner
        await determineWinner();
      }
    }, 5000); // Check every 5 seconds
  };
  
  // Start game timer when server starts
  startGameTimer();
  
  // Clean up on server close
  httpServer.on('close', () => {
    if (gameTimer) {
      clearInterval(gameTimer);
    }
  });
  
  return httpServer;
}
