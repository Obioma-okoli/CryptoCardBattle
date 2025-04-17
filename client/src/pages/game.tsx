import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import GameStatus from "@/components/GameStatus";
import Card from "@/components/Card";
import GameHistory from "@/components/GameHistory";
import Footer from "@/components/Footer";
import TransactionModal from "@/components/modals/TransactionModal";
import { useWeb3 } from "@/lib/web3";

// Card data type
interface CardData {
  id: string;
  totalBets: string;
  userBet: string;
  isWinner?: boolean;
}

// Game state type
interface GameState {
  status: 'active' | 'ended';
  round: number;
  timeRemaining: number;
  totalBets: string;
}

// Result history type
interface GameResult {
  round: number;
  winningCard: string;
  totalPool: string;
  userWinnings: string;
  timestamp: string;
}

export default function Game() {
  // Transaction modal state
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionData, setTransactionData] = useState<{
    amount: string;
    cardId: string;
    hash?: string;
  } | null>(null);
  
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    status: 'active',
    round: 1,
    timeRemaining: 165, // 2:45 in seconds
    totalBets: '1.55 ETH',
  });
  
  // Cards data
  const [cards, setCards] = useState<CardData[]>([
    { id: "Card 1", totalBets: "0.45 ETH", userBet: "0.00 ETH" },
    { id: "Card 2", totalBets: "0.32 ETH", userBet: "0.00 ETH" },
  ]);
  
  // Game history
  const [recentResults, setRecentResults] = useState<GameResult[]>([
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
      winningCard: "Card 2", 
      totalPool: "1.87 ETH", 
      userWinnings: "+0.32 ETH", 
      timestamp: "18 min ago" 
    }
  ]);
  
  // Web3 context
  const { placeBet, isConnected } = useWeb3();
  
  // Timer effect
  useEffect(() => {
    if (gameState.status === 'active') {
      const timer = setInterval(() => {
        setGameState(prev => {
          const newTimeRemaining = prev.timeRemaining - 1;
          
          if (newTimeRemaining <= 0) {
            clearInterval(timer);
            // End round logic would go here
            return {
              ...prev,
              status: 'ended',
              timeRemaining: 0
            };
          }
          
          return {
            ...prev,
            timeRemaining: newTimeRemaining
          };
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [gameState.status]);
  
  // Format time remaining
  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Handle placing bet
  const handlePlaceBet = async (cardId: string, amount: string) => {
    // Open transaction modal
    setTransactionData({ cardId, amount });
    setIsTransactionModalOpen(true);
    
    // Place bet
    const success = await placeBet(cardId, amount);
    
    // Close modal
    setIsTransactionModalOpen(false);
    setTransactionData(null);
    
    // Update card data if successful
    if (success) {
      setCards(prev => 
        prev.map(card => 
          card.id === cardId 
            ? { 
                ...card, 
                userBet: `${amount} ETH`,
                totalBets: `${parseFloat(card.totalBets) + parseFloat(amount)} ETH`
              } 
            : card
        )
      );
    }
  };
  
  // Fetch game data from API
  const { data: gameData } = useQuery({
    queryKey: ['/api/game-state'],
    enabled: false, // Disabled for now, would be enabled in production
  });
  
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <GameStatus 
          round={gameState.round} 
          timeRemaining={formatTimeRemaining(gameState.timeRemaining)} 
          totalBets={gameState.totalBets} 
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {cards.map((card) => (
            <Card 
              key={card.id}
              id={card.id}
              totalBets={card.totalBets}
              userBet={card.userBet}
              isWinner={card.isWinner}
              onPlaceBet={handlePlaceBet}
              disabled={!isConnected}
            />
          ))}
        </div>
        
        <GameHistory results={recentResults} />
      </main>
      
      <Footer />
      
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        transactionData={transactionData}
      />
    </div>
  );
}
