import { useState } from "react";
import { Slider } from "@/components/ui/slider";

interface CardProps {
  id: string;
  name: string;
  emoji: string;
  totalBets: string;
  userBet: string;
  isWinner?: boolean;
  onPlaceBet: (cardId: string, amount: string) => void;
  disabled: boolean;
}

export default function Card({ id, name, emoji, totalBets, userBet, isWinner, onPlaceBet, disabled }: CardProps) {
  const [betAmount, setBetAmount] = useState("10.00");
  
  const handleSliderChange = (value: number[]) => {
    setBetAmount(value[0].toFixed(2));
  };
  
  return (
    <div className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
      isWinner 
        ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]' 
        : 'border-gray-700 hover:border-gray-600'
    }`}>
      <div className="aspect-[3/4] relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
        {/* Card Name Badge */}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md rounded-lg py-2 px-4 font-bold text-lg">
          <span>{name}</span>
        </div>
        
        {/* Card Emoji */}
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-9xl animate-pulse">
            {emoji}
          </div>
        </div>
        
        {/* Total Bets Badge */}
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md rounded-lg py-2 px-4 font-medium text-sm flex items-center">
          <span className="material-icons text-xs mr-2">groups</span>
          <span>{totalBets}</span>
        </div>
        
        {/* Winner Overlay */}
        {isWinner && (
          <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-green-500 text-white px-8 py-4 rounded-xl font-bold text-2xl shadow-lg flex items-center">
              <span className="material-icons mr-3">emoji_events</span> WINNER
            </div>
          </div>
        )}
      </div>
      
      {/* Betting Controls */}
      <div className="p-6 border-t border-gray-700 bg-gray-900/50 backdrop-blur-md">
        <h3 className="text-lg font-semibold mb-4">Place Your Bet</h3>
        
        {/* Bet Slider */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>10 USDT</span>
            <span>1000 USDT</span>
          </div>
          <Slider
            defaultValue={[10]}
            min={10}
            max={1000}
            step={10}
            onValueChange={handleSliderChange}
            disabled={disabled}
          />
        </div>
        
        {/* Bet Amount and Button */}
        <div className="flex items-center justify-between">
          <div className="bg-black/30 rounded-lg px-4 py-3 border border-gray-700">
            <span className="text-xs text-gray-400 block">Bet Amount</span>
            <div className="flex items-center">
              <span className="text-xl font-mono font-semibold">{betAmount}</span>
              <span className="ml-2 text-gray-400">USDT</span>
            </div>
          </div>
          
          <button
            className={`bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-6 py-3 transition-colors ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => onPlaceBet(id, betAmount)}
            disabled={disabled}
          >
            Place Bet
          </button>
        </div>
        
        {/* User Bet Info */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Your Bet:</span>
            <span className="font-mono font-medium">{userBet}</span>
          </div>
        </div>
      </div>
    </div>
  );
}