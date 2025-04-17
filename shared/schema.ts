import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table for storing wallet addresses
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address").unique(),
});

// Game rounds table
export const gameRounds = pgTable("game_rounds", {
  id: serial("id").primaryKey(),
  roundNumber: integer("round_number").notNull(),
  status: text("status").notNull().default("active"), // active, ended
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  winningCardId: text("winning_card_id"),
  totalPool: text("total_pool").notNull().default("0"),
});

// Bets table
export const bets = pgTable("bets", {
  id: serial("id").primaryKey(),
  roundId: integer("round_id").notNull(),
  userId: integer("user_id"),
  walletAddress: text("wallet_address").notNull(),
  cardId: text("card_id").notNull(),
  amount: text("amount").notNull(),
  txHash: text("tx_hash").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Game results table
export const gameResults = pgTable("game_results", {
  id: serial("id").primaryKey(),
  roundId: integer("round_id").notNull(),
  userId: integer("user_id"),
  walletAddress: text("wallet_address").notNull(),
  winnings: text("winnings").notNull().default("0"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Wallet transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  walletAddress: text("wallet_address").notNull(),
  type: text("type").notNull(), // bet, win, refund
  amount: text("amount").notNull(),
  txHash: text("tx_hash").notNull(),
  metadata: jsonb("metadata"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  walletAddress: true,
});

export const insertBetSchema = createInsertSchema(bets).pick({
  roundId: true,
  walletAddress: true,
  cardId: true,
  amount: true,
  txHash: true,
});

export const insertGameRoundSchema = createInsertSchema(gameRounds).pick({
  roundNumber: true,
  status: true,
  startTime: true,
  endTime: true,
  winningCardId: true,
  totalPool: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertBet = z.infer<typeof insertBetSchema>;
export type InsertGameRound = z.infer<typeof insertGameRoundSchema>;

export type User = typeof users.$inferSelect;
export type Bet = typeof bets.$inferSelect;
export type GameRound = typeof gameRounds.$inferSelect;
export type GameResult = typeof gameResults.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
