"use client"; // Make sure this is here

import React, { createContext, useState, useContext, useCallback } from "react";
import { ethers } from "ethers";

const WalletContext = createContext(undefined);

export const WalletProvider = ({ children }) => {
  const [accountData, setAccountData] = useState({});

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
          balance: ethers.formatEther(balance),
          chainId: network.chainId.toString(),
          network: network.name,
        });
        
      } catch (error) {
        alert(`Error connecting to MetaMask: ${error.message || error}`);
      }
    } else {
      alert("MetaMask not installed");
    }
  }, []);

  return (
    <WalletContext.Provider value={{ accountData, connectToWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
