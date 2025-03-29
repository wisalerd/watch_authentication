"use client"; // Ensure this is a client component

import { useEffect, useState } from "react";
import { useWallet } from "@/app/components/WalletContext"; // Import useWallet to access wallet data

export default function Welcome() {
  const [users, setUsers] = useState([]); // State to hold user data
  const { accountData, connectToWallet } = useWallet(); // Access wallet data and connect function


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
          console.log(data);

          if(data?.error)
          {
            window.location.href = "/register";
          }
          
          if(data?.role != 'Admin')
          {
            window.location.href = "/user/welcome";
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





  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch('/api/users'); // Fetch user data from API
      const data = await response.json();
      setUsers(data); // Set user data to state
    };

    fetchUsers();
  }, []);






  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-4">Welcome, Admin!</h1>
      <h2 className="text-2xl font-semibold mb-4">User List:</h2>
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">User ID</th>
            <th className="border border-gray-300 px-4 py-2">Role</th>
            <th className="border border-gray-300 px-4 py-2">Admin Name</th>
            <th className="border border-gray-300 px-4 py-2">Wallet Address</th>
            <th className="border border-gray-300 px-4 py-2">createdAt</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b">
              <td className="border border-gray-300 px-4 py-2">{user.id}</td>
              <td className="border border-gray-300 px-4 py-2">{user.role}</td>
              <td className="border border-gray-300 px-4 py-2">{user.adminName}</td>
              <td className="border border-gray-300 px-4 py-2">{user.walletAddress}</td>
              <td className="border border-gray-300 px-4 py-2">{user.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
