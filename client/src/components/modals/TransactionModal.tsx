import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionData: {
    amount: string;
    cardId: string;
    hash?: string;
  } | null;
}

export default function TransactionModal({ isOpen, onClose, transactionData }: TransactionModalProps) {
  if (!transactionData) return null;
  
  const viewOnEtherscan = () => {
    if (transactionData.hash) {
      window.open(`https://etherscan.io/tx/${transactionData.hash}`, "_blank");
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border border-gray-700 shadow-2xl max-w-md w-full mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Transaction in Progress</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-6">
          <div className="animate-spin w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full mb-4"></div>
          <p className="text-center mb-1">
            Processing your bet of <span className="font-mono font-medium">{transactionData.amount} ETH</span>
          </p>
          <p className="text-muted-foreground text-sm text-center">
            Please confirm the transaction in your wallet
          </p>
          
          {transactionData.hash && (
            <div className="mt-6 w-full bg-accent/10 rounded-lg p-3 font-mono text-xs break-all border border-gray-700">
              <p className="text-muted-foreground mb-1">Transaction Hash:</p>
              <p>{transactionData.hash}</p>
            </div>
          )}
        </div>
        
        {transactionData.hash && (
          <div className="mt-4 flex justify-end">
            <button 
              className="text-muted-foreground hover:text-foreground text-sm"
              onClick={viewOnEtherscan}
            >
              View on Etherscan
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
