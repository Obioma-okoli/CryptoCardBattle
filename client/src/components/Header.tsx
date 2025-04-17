import { useWeb3 } from "@/lib/web3";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { address, balance, isConnected, isConnecting, connectWallet } = useWeb3();
  
  // Format wallet address for display
  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };
  
  return (
    <header className="bg-card py-4 px-6 border-b border-gray-700">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center mb-4 sm:mb-0">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mr-3">
            <span className="material-icons text-white">casino</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            CryptoCards
          </h1>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
          {isConnected && address && (
            <>
              <div className="flex items-center bg-card rounded-lg py-1 px-3 border border-gray-700">
                <span className="inline-block w-2 h-2 rounded-full bg-success mr-2"></span>
                <span className="text-sm font-medium text-muted-foreground">
                  <span className="font-mono">{formatAddress(address)}</span>
                </span>
              </div>
              
              {balance && (
                <div className="flex items-center bg-card rounded-lg py-1 px-3 border border-gray-700">
                  <span className="material-icons text-accent text-sm mr-1">account_balance_wallet</span>
                  <span className="text-sm font-medium">
                    <span className="font-mono">{parseFloat(balance).toFixed(4)} ETH</span>
                  </span>
                </div>
              )}
            </>
          )}
          
          {!isConnected && (
            <Button 
              onClick={connectWallet}
              disabled={isConnecting}
              className="bg-primary hover:bg-primary/90 text-white rounded-lg py-2 px-4 font-medium transition-colors flex items-center"
            >
              {isConnecting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </>
              ) : (
                <>
                  <span className="material-icons text-sm mr-1">account_balance_wallet</span>
                  Connect Wallet
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
