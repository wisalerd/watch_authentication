"use client"; // Make sure this is here

import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { ethers } from "ethers";

// Create WalletContext
const WalletContext = createContext(undefined);

export const WalletProvider = ({ children, autoConnect = true }) => {
  const [accountData, setAccountData] = useState({});
  const [isConnected, setIsConnected] = useState(false);

  // Function to connect to MetaMask wallet
  const connectToWallet = useCallback(async () => {
    const ethereum = window.ethereum;
    if (typeof ethereum !== "undefined") {
      try {
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        const address = accounts[0];
        const provider = new ethers.BrowserProvider(ethereum);
        const balance = await provider.getBalance(address);
        const network = await provider.getNetwork();

        setAccountData({
          address,
          balance: ethers.formatEther(balance), // Convert balance to ether
          chainId: network.chainId.toString(),
          network: network.name,
        });
        setIsConnected(true);
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
        alert(`Error connecting to MetaMask: ${error.message || error}`);
      }
    } else {
      console.error("MetaMask not installed");
     // alert("MetaMask not installed");
    }
  }, []);

  // Automatically connect to wallet if `autoConnect` is true
  useEffect(() => {
    if (autoConnect && !isConnected) {
      connectToWallet();
    }
  }, [autoConnect, isConnected, connectToWallet]);

  // Provide wallet data and connect function to children
  return (
    <WalletContext.Provider value={{ accountData, connectToWallet, isConnected }}>
      {children}
    </WalletContext.Provider>
  );
};

// Hook for accessing wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
