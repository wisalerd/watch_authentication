"use client"; // Ensure this is a client component

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image"; // Import next/image
import { useWallet } from "@/app/components/WalletContext"; // Correct import

export const MenuBar = () => {
  const { accountData } = useWallet(); // Access wallet context
  const [users, setUsers] = useState([]); // State to hold user data


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
          if(data?.error )
          {
            console.log(data);
          }
      
          setUsers(data); // Set user data to state
        } catch (error) {
          console.error("Error fetching users:", error);
        } finally {
          
        }
      }
    };
  
    fetchUsers(); // Call the fetch function
  }, [accountData?.address]);

  if (!accountData?.address) {
    return null;
  }

  return (
    
    <nav className="bg-gray-800 text-white p-4">
      <div className="flex flex-col md:flex-row justify-between items-center">
        {/* Left: Navigation links */}
          <ul className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
          {/* 
          <li>
          {accountData?.address && users?.role === 'Admin' ? (
            <>
              <Link href="/" className="hover:underline">
                Home
              </Link>
            </>
              ): (
              <></>
              )
          }
          </li>
          */}

          {accountData?.address && users?.role === 'Admin' ? (
            <>
              <li>
                <Link href="/users" className="hover:underline">
                  Users
                </Link>
              </li>
            </>
          ):( 
            <></>
          )
          }

          {accountData?.address && users?.Id ? (
            <>
              <li>
                <Link href="/register" className="hover:underline">
                  Register
                </Link>
              </li>
            </>
          ):( 
            <></>
          )
          }
           {/* Right: Display wallet information 
          <li>
            <Link href="/profile" className="hover:underline">
              Profile
            </Link>
          </li>
         
         
          <li>
            <Link href="/about" className="hover:underline">
              About
            </Link>
          </li>
           */}
          
          {accountData?.address ? (
            <>
              <li>
                <Link href="/users/watches" className="hover:underline">
                Watches
                </Link>
              </li>
            </>
            ):( 
              <></>
            )
            }
          
        </ul>

        {/* Right: Display wallet information */}
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          {/* 
          <Image
            src="https://images.ctfassets.net/9sy2a0egs6zh/4zJfzJbG3kTDSk5Wo4RJI1/1b363263141cf629b28155e2625b56c9/mm-logo.svg"
            alt="MetaMask"
            width={90}  // Adjust the size to fit on the menu bar
            height={90} // Adjust the size to fit on the menu bar
            priority
          />
           */ }
         {/* <span className="text-sm md:text-base">{accountData?.address ?? "Not Connected"}</span> */ }
          <span className="text-sm md:text-base">{accountData?.balance ? `${accountData.balance} ETH` : "Balance"}</span>
          <span className="text-sm md:text-base">{accountData?.chainId ? `Chain ID: ${accountData.chainId}` : "Chain ID"}</span>
          <span className="text-sm md:text-base">{accountData?.network ?? "Network"}</span>
        </div>
      </div>
    </nav>
  );
};
