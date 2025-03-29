"use client"; // Ensure this is a client component

import { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers"; // Import ethers.js for wallet interaction
import Image from "next/image"; // Import Image for handling images
import { useWallet } from "@/app/components/WalletContext"; // Import useWallet to access wallet data


export default function Home() {
  const { accountData, connectToWallet } = useWallet(); // Access wallet data and connect function
  const [adminName, setAdminName] = useState("Administrator"); // State for admin name
  const [isConnected, setIsConnected] = useState(false); // State to manage connection status

  useEffect(() => {
    if (!accountData.address) {
      connectToWallet();  // Auto connect if not connected
    }
  }, [accountData, connectToWallet]);


  const handleConnectWallet = async () => {
    await connectToWallet(); // Call the connect function from WalletContext
    setIsConnected(true); // Set connection status
  };



  // Check current User
  useEffect(() => {
    const fetchUsers = async () => {
      if (accountData?.address) {
        try {
          
          const response = await fetch(`/api/user?walletAddress=${ accountData.address }`); // Fetch user data from API
          
          if (!response.ok) {
            throw new Error('Failed to fetch users');
          }
          const data = await response.json();

          if(data?.error)
          {
            console.log(data);
            window.location.href = "/register";
          }

          //setUsers(data); // Set user data to state
        } catch (error) {
          console.error("Error fetching users:", error);
        } finally {
          
        }
      }
    };
  
    fetchUsers(); // Call the fetch function
  }, [accountData?.address]);

  
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold text-center mb-4">Login</h1>
        {accountData?.address ? (
          <>
            <div className="text-green-600 mb-4">
              Wallet connected: {accountData?.address} {/* Display connected wallet address */}
            </div>
          </>
        ) : (
          <button
            onClick={handleConnectWallet} // Use connectToWallet from WalletContext
            className="bg-green-500 text-white px-4 py-2 rounded-md"
          >
            login
          </button>
        )}

      
      </div>
    </div>
  );
}

