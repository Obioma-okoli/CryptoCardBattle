import * as React from "react";

// Define context type
export interface Web3ContextType {
  provider: any | null;
  signer: any | null;
  address: string | null;
  balance: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  placeBet: (cardId: string, amount: string) => Promise<boolean>;
  disconnectWallet: () => void;
}

// Create context with default values
const defaultContext: Web3ContextType = {
  provider: null,
  signer: null,
  address: null,
  balance: null,
  isConnected: false,
  isConnecting: false,
  connectWallet: async () => { console.log("Connect wallet not implemented"); },
  placeBet: async () => { 
    console.log("Place bet not implemented"); 
    return true; 
  },
  disconnectWallet: () => { console.log("Disconnect wallet not implemented"); },
};

// Create the context
const Web3Context = React.createContext<Web3ContextType>(defaultContext);

// Hook to use the context
export const useWeb3 = () => React.useContext(Web3Context);

// Simplified provider component
export const Web3Provider: React.FC<{ children: React.ReactNode }> = (props) => {
  const [isConnected, setIsConnected] = React.useState(false);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [address, setAddress] = React.useState<string | null>(null);
  const [balance, setBalance] = React.useState<string | null>(null);

  const connectWallet = async () => {
    setIsConnecting(true);
    // Simulate wallet connection
    setTimeout(() => {
      setAddress("0x1234...5678");
      setBalance("1.5");
      setIsConnected(true);
      setIsConnecting(false);
      console.log("Wallet connected successfully!");
    }, 1500);
  };

  const disconnectWallet = () => {
    setAddress(null);
    setBalance(null);
    setIsConnected(false);
    console.log("Wallet disconnected");
  };

  const contextValue: Web3ContextType = {
    provider: null,
    signer: null,
    address,
    balance,
    isConnected,
    isConnecting,
    connectWallet,
    placeBet: async (cardId, amount) => { 
      console.log(`Placing bet on ${cardId} with amount ${amount}`); 
      return true;
    },
    disconnectWallet
  };

  return React.createElement(
    Web3Context.Provider,
    { value: contextValue },
    props.children
  );
};
