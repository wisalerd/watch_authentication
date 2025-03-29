"use client"; // Ensure this is a client component

import { useEffect, useState } from "react";
import { useWallet } from "@/app/components/WalletContext"; // Import useWallet to access wallet data

export default function Welcome() {
  const [currentUser, setCurrentUser] = useState([]); // State to hold user data
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

          if(data?.error)
          {
            console.log(data);
            window.location.href = "/register";
          }

          if(data.role != "Admin")
            window.location.href = "/";

         
          setCurrentUser(data); // Set user data to state
        } catch (error) {
          console.error("Error fetching users:", error);
        } finally {
          
        }
      }
    };

    fetchUsers(); // Call the fetch function
  }, [accountData?.address]);

  // Fetch all users
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await fetch('/api/users'); // Fetch user data from API

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();

        console.log(data);
        setUsers(data); // Set all user data to state
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchAllUsers(); // Call the fetch function
  }, []);

  const handleApprove = async (userId) => {
    try {
      const response = await fetch(`/api/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }), // ส่ง userId ไปที่ API
      });
  
      if (!response.ok) {
        throw new Error("Failed to approve user");
      }
  
      const updatedUser = await response.json();
  
      // อัปเดตสถานะ approve ใน state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, approve: true } : user
        )
      );
  
      alert(`User ${updatedUser.userName} has been approved.`);
    } catch (error) {
      console.error("Error approving user:", error);
      alert("Failed to approve user.");
    }
  };

  const handleUnapprove = async (userId) => {
    try {
      const response = await fetch(`/api/unapprove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }), // ส่ง userId ไปที่ API
      });
  
      if (!response.ok) {
        throw new Error("Failed to unapprove user");
      }
  
      const updatedUser = await response.json();
  
      // อัปเดตสถานะ approve ใน state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, approve: false } : user
        )
      );
  
      alert(`User ${updatedUser.userName} has been unapproved.`);
    } catch (error) {
      console.error("Error unapproving user:", error);
      alert("Failed to unapprove user.");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-4">Welcome, {currentUser?.userName}</h1>
      <h1 className="text-3xl font-bold text-center mb-4">Role, {currentUser?.role}</h1>
      <h2 className="text-2xl font-semibold mb-4">All Users:</h2>
      <table className="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2 bg-gray-500 text-white">Name</th>
            <th className="border border-gray-300 px-4 py-2 bg-gray-500 text-white">Role</th>
            <th className="border border-gray-300 px-4 py-2 bg-gray-500 text-white">Wallet ID</th>
            <th className="border border-gray-300 px-4 py-2 bg-gray-500 text-white">Approve</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="border border-gray-300 px-4 py-2">{user.userName}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">{user.role}</td>
              <td className="border border-gray-300 px-4 py-2">{user.walletAddress}</td>
              <td className="border border-gray-300 px-3 py-2 text-center">

                {user.approve ? (
                 <div className="flex items-center justify-center space-x-2">
                    <span className="text-green-500 font-bold">✔</span> {/* Icon ติ๊กถูก */}

                    {user.role !== "Admin" ? ( // ไม่แสดงปุ่มสำหรับ Admin
                      <button
                        className=" text-white text-sm bg-red-500 px-4 py-2 border border-gray-300 hover:text-white rounded-md transition-colorshover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                        onClick={() => handleUnapprove(user.id)}
                      >
                        UnApprove
                      </button>
                      ) : (
                       <></>
                      )}
                  </div>
                ) : (
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={() => handleApprove(user.id)}
                  >
                    Approve
                  </button>
                )}

              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
