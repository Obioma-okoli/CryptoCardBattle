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
  // Emoji collection for cards
  const emojiPool = [
    "🦁", "🐯", "🐸", "🐼", "🦊", "🐺", "🐨", "🐮", "🐷", "🐙", 
    "🦀", "🐝", "🦋", "🌟", "⚡", "🔥", "❄️", "🌈", "🎯", "🎲",
    "💎", "👑", "🏆", "🎪", "🎨", "🎭", "🎵", "🎸", "🚀", "⭐"
  ];

  // Function to get random emojis for a new round
  const getRandomEmojis = () => {
    const shuffled = [...emojiPool].sort(() => Math.random() - 0.5);
    return [shuffled[0], shuffled[1]];
  };

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
    timeRemaining: 10, // Short timer for testing
    totalBets: '1.55 ETH',
  });
  
  // Initialize cards with random emojis
  const [cards, setCards] = useState<CardData[]>(() => {
    const [emoji1, emoji2] = getRandomEmojis();
    return [
      { id: "Card 1", emoji: emoji1, totalBets: "0.45 ETH", userBet: "0.00 ETH" },
      { id: "Card 2", emoji: emoji2, totalBets: "0.32 ETH", userBet: "0.00 ETH" },
    ];
  });
  
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
            
            // Randomly pick a winning card
            const winnerIndex = Math.floor(Math.random() * 2);
            const winningCard = cards[winnerIndex];
            
            // Update cards to show the winner
            setCards(prevCards => 
              prevCards.map((card, index) => ({
                ...card,
                isWinner: index === winnerIndex
              }))
            );
            
            // Add result to history
            const newResult: GameResult = {
              round: prev.round,
              winningCard: winningCard.emoji + " " + winningCard.id,
              totalPool: prev.totalBets,
              userWinnings: winningCard.userBet !== "0.00 ETH" ? "+0.25 ETH" : "0.00 ETH",
              timestamp: "Just now"
            };
            
            setRecentResults(prevResults => [newResult, ...prevResults.slice(0, 4)]);
            
            // Start new round after 3 seconds
            setTimeout(() => {
              const [emoji1, emoji2] = getRandomEmojis();
              setCards([
                { id: "Card 1", emoji: emoji1, totalBets: "0.00 ETH", userBet: "0.00 ETH" },
                { id: "Card 2", emoji: emoji2, totalBets: "0.00 ETH", userBet: "0.00 ETH" },
              ]);
              
              setGameState(prevState => ({
                status: 'active',
                round: prevState.round + 1,
                timeRemaining: 10,
                totalBets: '0.00 ETH'
              }));
            }, 3000);
            
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
