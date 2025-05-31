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
  name: string;
  emoji: string;
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
  // Modern, fun card themes
  const cardThemes = [
    { emoji: "🌙", name: "LUNAR" },
    { emoji: "☀️", name: "SOLAR" },
    { emoji: "🌊", name: "WAVE" },
    { emoji: "🔥", name: "FLAME" },
    { emoji: "⚡", name: "VOLT" },
    { emoji: "🌿", name: "LEAF" },
    { emoji: "💎", name: "GEM" },
    { emoji: "⭐", name: "STAR" },
    { emoji: "🎯", name: "TARGET" },
    { emoji: "🎲", name: "CHANCE" }
  ];

  // Get random card themes for a new round
  const getRandomThemes = () => {
    const shuffled = [...cardThemes].sort(() => Math.random() - 0.5);
    return [shuffled[0], shuffled[1]];
  };

  // Transaction modal state
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionData, setTransactionData] = useState<{
    amount: string;
    cardId: string;
    hash?: string;
  } | null>(null);
  
  // Game state with 30 minute timer (1800 seconds)
  const [gameState, setGameState] = useState<GameState>({
    status: 'active',
    round: 1,
    timeRemaining: 1800,
    totalBets: '0.00 USDT',
  });
  
  // Initialize cards with random themes
  const [cards, setCards] = useState<CardData[]>(() => {
    const [theme1, theme2] = getRandomThemes();
    return [
      { id: "1", name: theme1.name, emoji: theme1.emoji, totalBets: "0.00 USDT", userBet: "0.00 USDT" },
      { id: "2", name: theme2.name, emoji: theme2.emoji, totalBets: "0.00 USDT", userBet: "0.00 USDT" },
    ];
  });
  
  // Game history
  const [recentResults, setRecentResults] = useState<GameResult[]>([
    { 
      round: 24, 
      winningCard: "Card 2", 
      totalPool: "1000.00 USDT", 
      userWinnings: "+125.50 USDT", 
      timestamp: "5 min ago" 
    },
    { 
      round: 23, 
      winningCard: "Card 1", 
      totalPool: "750.00 USDT", 
      userWinnings: "0.00 USDT", 
      timestamp: "35 min ago" 
    },
    { 
      round: 22, 
      winningCard: "Card 2", 
      totalPool: "1250.00 USDT", 
      userWinnings: "+180.25 USDT", 
      timestamp: "1 hour ago" 
    }
  ]);
  
  // Web3 context for handling transactions
  const { placeBet, isConnected } = useWeb3();
  
  // Timer effect
  useEffect(() => {
    if (gameState.status === 'active') {
      const timer = setInterval(() => {
        setGameState(prev => {
          const newTimeRemaining = prev.timeRemaining - 1;
          
          if (newTimeRemaining <= 0) {
            clearInterval(timer);
            
            // Randomly pick a winning card
            const winnerIndex = Math.floor(Math.random() * 2);
            const winningCard = cards[winnerIndex];
            
            // Update cards to show winner
            setCards(prevCards => 
              prevCards.map((card, index) => ({
                ...card,
                isWinner: index === winnerIndex
              }))
            );
            
            // Add result to history
            const newResult: GameResult = {
              round: prev.round,
              winningCard: winningCard.emoji + " " + winningCard.name,
              totalPool: prev.totalBets,
              userWinnings: winningCard.userBet !== "0.00 USDT" ? "+125.50 USDT" : "0.00 USDT",
              timestamp: "Just now"
            };
            
            setRecentResults(prevResults => [newResult, ...prevResults.slice(0, 4)]);
            
            // Start new round after 5 seconds
            setTimeout(() => {
              const [theme1, theme2] = getRandomThemes();
              setCards([
                { id: "1", name: theme1.name, emoji: theme1.emoji, totalBets: "0.00 USDT", userBet: "0.00 USDT" },
                { id: "2", name: theme2.name, emoji: theme2.emoji, totalBets: "0.00 USDT", userBet: "0.00 USDT" },
              ]);
              
              setGameState(prevState => ({
                status: 'active',
                round: prevState.round + 1,
                timeRemaining: 1800,
                totalBets: '0.00 USDT'
              }));
            }, 5000);
            
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
  }, [gameState.status, cards]);
  
  // Format time remaining in MM:SS format
  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Handle placing bet
  const handlePlaceBet = async (cardId: string, amount: string) => {
    setTransactionData({ cardId, amount });
    setIsTransactionModalOpen(true);
    
    const success = await placeBet(cardId, amount);
    
    setIsTransactionModalOpen(false);
    setTransactionData(null);
    
    if (success) {
      setCards(prev => 
        prev.map(card => 
          card.id === cardId 
            ? { 
                ...card, 
                userBet: `${amount} USDT`,
                totalBets: `${(parseFloat(card.totalBets) + parseFloat(amount)).toFixed(2)} USDT`
              } 
            : card
        )
      );
      
      // Update total pool
      setGameState(prev => ({
        ...prev,
        totalBets: `${(parseFloat(prev.totalBets) + parseFloat(amount)).toFixed(2)} USDT`
      }));
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <GameStatus 
          round={gameState.round} 
          timeRemaining={formatTimeRemaining(gameState.timeRemaining)} 
          totalBets={gameState.totalBets} 
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
          {cards.map((card) => (
            <Card 
              key={card.id}
              id={card.id}
              name={card.name}
              emoji={card.emoji}
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