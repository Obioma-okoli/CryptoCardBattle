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
  const contextValue: Web3ContextType = {
    provider: null,
    signer: null,
    address: "0x1234...5678", // Mock address
    balance: "1.5", // Mock balance
    isConnected: true, // Mock connected state
    isConnecting: false,
    connectWallet: async () => { console.log("Connect wallet clicked"); },
    placeBet: async (cardId, amount) => { 
      console.log(`Placing bet on ${cardId} with amount ${amount}`); 
      return true;
    },
    disconnectWallet: () => { console.log("Disconnect wallet clicked"); }
  };

  return React.createElement(
    Web3Context.Provider,
    { value: contextValue },
    props.children
  );
};
