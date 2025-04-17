interface GameResult {
  round: number;
  winningCard: string;
  totalPool: string;
  userWinnings: string;
  timestamp: string;
}

interface GameHistoryProps {
  results: GameResult[];
}

export default function GameHistory({ results }: GameHistoryProps) {
  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <span className="material-icons mr-2">history</span>
        Recent Results
      </h2>
      
      <div className="bg-card rounded-xl overflow-hidden border border-gray-700 shadow-lg">
        <table className="w-full text-left">
          <thead className="bg-background">
            <tr>
              <th className="py-3 px-4 text-muted-foreground font-medium">Round</th>
              <th className="py-3 px-4 text-muted-foreground font-medium">Winning Card</th>
              <th className="py-3 px-4 text-muted-foreground font-medium">Total Pool</th>
              <th className="py-3 px-4 text-muted-foreground font-medium">Your Winnings</th>
              <th className="py-3 px-4 text-muted-foreground font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.round} className="border-t border-gray-700">
                <td className="py-3 px-4 font-medium">#{result.round}</td>
                <td className="py-3 px-4">
                  <span className="bg-success/10 text-success px-2 py-1 rounded">
                    {result.winningCard}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono">{result.totalPool}</td>
                <td className={`py-3 px-4 font-mono ${result.userWinnings.startsWith('+') ? 'text-success' : 'text-muted-foreground'}`}>
                  {result.userWinnings}
                </td>
                <td className="py-3 px-4 text-muted-foreground text-sm">{result.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
