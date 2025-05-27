import { useState } from "react";
import { Slider } from "@/components/ui/slider";

interface CardProps {
  id: string;
  emoji: string;
  totalBets: string;
  userBet: string;
  isWinner?: boolean;
  onPlaceBet: (cardId: string, amount: string) => void;
  disabled: boolean;
}

const cardImages = [
  "https://images.unsplash.com/photo-1641219539648-5d878db818be?auto=format&fit=crop&w=500&h=700",
  "https://images.unsplash.com/photo-1641219541154-80334fe64494?auto=format&fit=crop&w=500&h=700"
];

export default function Card({ id, emoji, totalBets, userBet, isWinner, onPlaceBet, disabled }: CardProps) {
  const [betAmount, setBetAmount] = useState("0.05");
  
  // Get card index for image
  const cardIndex = parseInt(id.split(" ")[1]) - 1;
  
  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    setBetAmount(value[0].toString());
  };
  
  return (
    <div className="card relative overflow-hidden rounded-xl border border-gray-700 bg-card hover:bg-card-hover transition-all duration-200 shadow-lg">
      <div className="aspect-[3/4] relative overflow-hidden">
        {/* Card Identifier Badge */}
        <div className="absolute top-3 left-3 bg-background/80 backdrop-blur rounded-lg py-1 px-3 font-semibold">
          <span>{id}</span>
        </div>
        
        {/* Card Emoji */}
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="text-9xl animate-pulse">
            {emoji}
          </div>
        </div>
        
        {/* Bet Amount Indicator */}
        <div className="absolute top-3 right-3 bg-primary text-white rounded-lg py-1 px-2 font-medium text-sm flex items-center">
          <span className="material-icons text-xs mr-1">groups</span>
          <span>{totalBets}</span>
        </div>
        
        {/* Winner Overlay */}
        {isWinner && (
          <div className="absolute inset-0 bg-success/20 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-success text-white px-6 py-3 rounded-xl font-bold text-xl shadow-lg flex items-center">
              <span className="material-icons mr-2">emoji_events</span> WINNER
            </div>
          </div>
        )}
      </div>
      
      {/* Betting Controls */}
      <div className="p-4 border-t border-gray-700">
        <h3 className="text-lg font-semibold mb-3">Place Your Bet</h3>
        
        {/* Bet Slider */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>0.01 ETH</span>
            <span>1.0 ETH</span>
          </div>
          <Slider
            defaultValue={[0.05]}
            min={0.01}
            max={1}
            step={0.01}
            onValueChange={handleSliderChange}
            disabled={disabled}
          />
        </div>
        
        {/* Bet Amount and Button */}
        <div className="flex items-center justify-between">
          <div className="bg-accent/10 rounded-lg px-3 py-2 border border-gray-700 w-1/2">
            <span className="text-xs text-muted-foreground block">Bet Amount</span>
            <div className="flex items-center">
              <span className="text-lg font-mono font-semibold">{betAmount}</span>
              <span className="ml-1 text-muted-foreground">ETH</span>
            </div>
          </div>
          
          <button
            className={`bg-accent hover:bg-accent/90 text-white font-medium rounded-lg px-4 py-2 transition-colors ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => onPlaceBet(id, betAmount)}
            disabled={disabled}
          >
            Place Bet
          </button>
        </div>
        
        {/* User Bet Info */}
        <div className="mt-4 pt-3 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Your Bet:</span>
            <span className="font-mono font-medium">{userBet}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
