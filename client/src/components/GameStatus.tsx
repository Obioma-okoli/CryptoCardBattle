interface GameStatusProps {
  round: number;
  timeRemaining: string;
  totalBets: string;
}

export default function GameStatus({ round, timeRemaining, totalBets }: GameStatusProps) {
  return (
    <div className="mb-8 bg-black/30 backdrop-blur-md rounded-xl p-6 border border-gray-700 shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">
            Round <span className="text-blue-500">#{round}</span>
          </h2>
          <p className="text-gray-400">Choose your winning card and place your bet</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-black/30 rounded-xl px-6 py-3 border border-gray-700">
            <span className="text-xs text-gray-400 block mb-1">Time Remaining</span>
            <span className="text-2xl font-mono font-bold text-yellow-500">{timeRemaining}</span>
          </div>
          
          <div className="bg-black/30 rounded-xl px-6 py-3 border border-gray-700">
            <span className="text-xs text-gray-400 block mb-1">Total Pool</span>
            <span className="text-2xl font-mono font-bold text-green-500">{totalBets}</span>
          </div>
        </div>
      </div>
    </div>
  );
}