"use client"; // Ensure this is a client component

import { useState, useCallback, useEffect } from "react";
import { useWallet } from "@/app/components/WalletContext"; // Import useWallet to access wallet data

export default function Home() {
  const [currentUser, setCurrentUser] = useState([]); // State to hold user data
  const { accountData, connectToWallet } = useWallet(); // Access wallet data and connect function
  const [userName, setAdminName] = useState("Administrator"); // State for admin name
  const [isConnected, setIsConnected] = useState(false); // State to manage connection status
  const {isAdmin} = useState(false);
  

  useEffect(() => {
    if (!accountData.address) {
      connectToWallet();  // Auto connect if not connected
    }
  }, [accountData, connectToWallet]);


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
          console.log("Error fetching users:", data);

          if(data?.error && data?.error == 'User not found')
          {
            window.location.href = "/register";
          }

          if(data.approve == true)
            window.location.href = "/users/watches";
          
          setCurrentUser(data); // Set user data to state
        } catch (error) {
          console.log("Error fetching users:", error);
        } 
      }
    };

    fetchUsers(); // Call the fetch function
  }, [accountData?.address]);

/*
  useEffect(() => {
    const checkUser = async () => {
      const response = await fetch('/api/users'); // Fetch users from API
      const data = await response.json();
      if (data.length > 0) {
        // If admin exists, redirect to login page
        window.location.href = "/users/watches";
      }
      else
        window.location.href = "/register";
    };
    checkUser();
  }, []);
  */

  const handleConnectWallet = async () => {
    await connectToWallet(); // Call the connect function from WalletContext
    setIsConnected(true); // Set connection status
  };

  const handleCreateAccount = async () => {
    try {
      const response = await fetch('/api/createUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName,
          walletAddress: accountData.address, // Use wallet address from accountData
          role: 'Admin'
        }),
      });

      if (response.ok) {
        const newUser = await response.json(); // Get the newly created user data
        console.log('Admin Created:', newUser); // Log the created user
        window.location.href = "/welcome"; // Redirect to Welcome page
      } else {
        const error = await response.json();
        console.error('Error creating account:', error);
      }
    } catch (error) {
      console.error("Error during account creation:", error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold text-center mb-4">Connect Account</h1>

        {accountData?.address ? (
          <>
          {
          /* 
            <div className="text-green-600 mb-4 ">
             Wallet connected: {accountData?.address}  Display connected wallet address 
            </div>
          */}
          <div className="text-green-600 mb-4">
            <label class="p-2"> Wallet connected</label>
          </div>
          {currentUser.approve == false ? (
            <div className="text-red-600 mb-4">
              <label class="p-2"> Your account is not approved.</label>
            </div>
           ) : (
            <></>
          )}
          </>
        ) : (
          <button
            onClick={handleConnectWallet} // Use connectToWallet from WalletContext
            className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4"
          >
            Connect Wallet
          </button>
        )}
        
      </div>
    </div>
  );
}

