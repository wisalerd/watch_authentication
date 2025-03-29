"use client"; // Ensure this is a client component

import { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers"; // Import ethers.js for wallet interaction
import Image from "next/image"; // Import Image for handling images
import { useWallet } from "@/app/components/WalletContext"; // Import useWallet to access wallet data


export default function Home() {
  const { accountData, connectToWallet } = useWallet(); // Access wallet data and connect function
  const [userName, setUserName] = useState();
  const [userType, setUserType] = useState("Brand"); // State for user type (default to 'User')

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

  useEffect(() => {
    const fetchUsers = async () => {
      if (accountData?.address) {
        try {
          const response = await fetch(`/api/user?walletAddress=${ accountData.address }`); // Fetch user data from API
          
          if (!response.ok) {
            throw new Error('Failed to fetch users');
          }
          const data = await response.json();
          if(data.approve == true)
            window.location.href = "/users/watches";
          
          setCurrentUser(data); // Set user data to state
        } catch (error) {
          
        } 
      }
    };

    fetchUsers(); // Call the fetch function
  }, [accountData?.address]);

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
          role: userType
        }),
      });

      if (response.ok) {
        const newUser = await response.json(); // Get the newly created user data
        console.log('Admin Created:', newUser); // Log the created user
        window.location.href = "/"; // Redirect to root page
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
        <h1 className="text-3xl font-bold text-center mb-4">Register Account</h1>

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


          <div className="mb-4">
            <label class="font-medium text-gray-700 p-2">
              Username
            </label>
            <input
              type="text"
              name="userName"
              onChange={(e) => setUserName(e.target.value)} // Update admin name on input change
              placeholder="Enter User Name"
              className="border border-gray-300 p-2 mb-4  max-w-xs"
            />
          </div>

          {/* User Type Radio Buttons */}
          <div className="mb-4">
              <label className="font-medium text-gray-700 p-2 max-w-xs">User Type</label>
          </div>
          <div className="mb-4 max-w-xs">
          
              <div className="flex items-center mb-2">
                <input
                  type="radio"
                  id="brand"
                  name="userType"
                  value="Brand"
                  checked={userType === "Brand"}
                  onChange={(e) => setUserType(e.target.value)}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="brand" className="text-sm text-gray-600">Brand</label>
              </div>
              <div className="flex items-center mb-2">
                <input
                  type="radio"
                  id="user"
                  name="userType"
                  value="User"
                  checked={userType === "User"}
                  onChange={(e) => setUserType(e.target.value)}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="user" className="text-sm text-gray-600">User</label>
              </div>
            </div>

          </>
        ) : (
          <button
            onClick={handleConnectWallet} // Use connectToWallet from WalletContext
            className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4"
          >
            Connect Wallet
          </button>
        )}


        {accountData?.address ? (
            <>
             <button
              onClick={handleCreateAccount}
              className="bg-green-500 text-white px-4 py-2 rounded-md"
            >
              Create 
            </button>
            </>
          ):( 
            <></>
          )
          }
      </div>
    </div>
  );
}

