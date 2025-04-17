interface GameStatusProps {
  round: number;
  timeRemaining: string;
  totalBets: string;
}

export default function GameStatus({ round, timeRemaining, totalBets }: GameStatusProps) {
  return (
    <div className="mb-8 bg-card rounded-xl p-4 shadow-lg border border-gray-700">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-lg font-semibold">
            Current Round: <span className="text-accent">{round}</span>
          </h2>
          <p className="text-muted-foreground text-sm">Choose a card to place your bet</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="bg-accent/10 rounded-lg px-3 py-2 border border-gray-700">
            <span className="text-xs text-muted-foreground block">Time Remaining</span>
            <span className="text-lg font-mono font-semibold text-warning">{timeRemaining}</span>
          </div>
          
          <div className="bg-accent/10 rounded-lg px-3 py-2 border border-gray-700">
            <span className="text-xs text-muted-foreground block">Total Bets</span>
            <span className="text-lg font-mono font-semibold">{totalBets}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
