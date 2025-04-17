import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBetSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";

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

  const httpServer = createServer(app);
  return httpServer;
}
