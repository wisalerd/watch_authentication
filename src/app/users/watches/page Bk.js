"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import Image from "next/image";
import { useWallet } from "@/app/components/WalletContext"; // Import useWallet to access wallet data
import { ethers } from "ethers";
import NFTCertificationABI from "@/app/contracts/NFTCertification.json";

const contractAddress = "0x2ea78917a832b035df9dd6a1d591c3fc3b1b1bb3";  // ที่อยู่สัญญาจาก Remix

const getCertificatesAndTransactionsByOwner = async (ownerAddress) => {
  try {
    if (!window.ethereum) throw new Error("No crypto wallet found");

    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, NFTCertificationABI, signer);

    // ดึง tokenCounter เพื่อหาจำนวน Token ทั้งหมด
    const totalTokens = await contract.tokenCounter();

    const ownerCertificates = [];
    const ownerTransactions = [];

    for (let tokenId = 0; tokenId < totalTokens; tokenId++) {
      const certificate = await contract.getCertificate(tokenId);
      if (certificate.owner.toLowerCase() === ownerAddress.toLowerCase()) {
        // เก็บ Certificate ของ owner
        ownerCertificates.push(certificate);

        // ดึง Transactions ที่เกี่ยวข้องกับ tokenId นี้
        const transactions = await contract.getTransactions(tokenId);
        ownerTransactions.push({ tokenId, transactions });
      }
    }

    return { certificates: ownerCertificates, transactions: ownerTransactions };

  } catch (error) {
    console.error("Error fetching certificates and transactions:", error);
    return { certificates: [], transactions: [] };
  }
};

const watches = [
    {
      brand: "Tissot",
      model: "Seastar 1000 Quartz Chronograph",
      reference: "T120.407.17.041.00",
      serialNumber: "WS123456789",
      warrantyPeriod: "16.05.2022 - 16.05.2022",
      certificate: {
        rfid: "123456789RFID",
        owner: "John Doe",
        storeName: "Watch Store",
        street: "123 Main St",
        cityStateZip: "Los Angeles, CA, 90001",
        country: "USA",
        dateOfPurchase: "16.05.2022",
      },
      imageUrl: "/images/tissot/T120-417-11-051-01_shadow.png",
      qrCodeValue: "http://localhost:3000/certificate/987654321",
    },
    {
      brand: "Tissot",
      model: "Tissot Gentleman Powermatic 80 Open Heart",
      reference: "210.30.42.20.03.001",
      serialNumber: "OM123456789",
      warrantyPeriod: "01.01.2023 - 01.01.2025",
      certificate: {
        rfid: "987654321RFID",
        owner: "Alice Smith",
        storeName: "Luxury Watches",
        street: "456 Elm St",
        cityStateZip: "New York, NY, 10001",
        country: "USA",
        dateOfPurchase: "01.01.2023",
      },
      imageUrl: "/images/tissot/Tissot Gentleman Powermatic 80 Open Heart.png",
      qrCodeValue: "http://localhost:3000/certificate/123456789",
    },
    {
      brand: "Tissot",
      model: "Tissot T-Race Powermatic 80 41mm",
      reference: "126610LN",
      serialNumber: "RL987654321",
      warrantyPeriod: "10.10.2021 - 10.10.2026",
      certificate: {
        rfid: "192837465RFID",
        owner: "Michael Brown",
        storeName: "Prestige Time",
        street: "789 Oak St",
        cityStateZip: "Chicago, IL, 60601",
        country: "USA",
        dateOfPurchase: "10.10.2021",
      },
      imageUrl: "/images/tissot/Tissot T-Race Powermatic 80 41mm.png",
      qrCodeValue: "http://localhost:3000/certificate/192837465",
    },
    {
        brand: "Tissot",
        model: "TTissot PRX",
        reference: "126610LN",
        serialNumber: "RL987654321",
        warrantyPeriod: "10.10.2021 - 10.10.2026",
        certificate: {
          rfid: "192837465RFID",
          owner: "Michael Brown",
          storeName: "Prestige Time",
          street: "789 Oak St",
          cityStateZip: "Chicago, IL, 60601",
          country: "USA",
          dateOfPurchase: "10.10.2021",
        },
        imageUrl: "/images/tissot/T137-410-33-021-00_shadow.png",
        qrCodeValue: "http://localhost:3000/certificate/192837465",
      },
      
];
 

function WatchItem({ watch }) {
  const { accountData, connectToWallet } = useWallet(); // Access wallet data and connect function
  const [isWarrantyOpen, setIsWarrantyOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);

  useEffect(() => {
      if (!accountData.address) {
        connectToWallet(); 
      }
    }, [accountData, connectToWallet]);
    

const toggleWarranty = () => setIsWarrantyOpen(!isWarrantyOpen);
const toggleCertificate = () => setIsCertificateOpen(!isCertificateOpen);

const handleTransfer = () => {
  // Add your transfer logic here
  alert(`Initiating transfer for ${watch.serialNumber}`);
};




return (
  <div className="bg-white p-4 rounded-lg shadow-md group relative">
  {/* Transfer Button */}
  <button
      onClick={handleTransfer}
      className="shadow-md absolute top-2 right-2 text-black text-sm px-4 py-2 border border-gray-300 rounded-md hover:bg-blue hover:text-white transition-colors duration-300 hover:bg-blue-700 focus:outline-none   z-10"
    >
      Transfer
  </button>

  <div className="overflow-hidden relative">
    <Image
      src={watch.imageUrl}
      alt={`${watch.brand} ${watch.model}`}
      width={369.5}
      height={369.5}
      className="w-full h-auto transition-transform duration-300 transform group-hover:scale-110"
    />
  </div>
  <h2 className="text-sm font-semibold mb-2 mt-4">
    {watch.brand} {watch.model}
  </h2>
  <p class="text-sm"><strong>Reference:</strong> {watch.reference}</p>
  <p class="text-sm"><strong>Serial Number:</strong> {watch.serialNumber}</p>

  {/* Warranty Section 
  <div className="mt-8">
    <button
      onClick={toggleWarranty}
      className="font-semibold underline flex justify-between items-center w-full"
    >
      International warranty
      <span>{isWarrantyOpen ? "▲" : "▼"}</span>
    </button>
    {isWarrantyOpen && (
      <div className="mt-2">
        <p>
          <strong>Warranty Period:</strong> {watch.warrantyPeriod}
        </p>
        <p className="mt-4 text-sm underline">
          If you have issues accessing your warranty details, please contact our Support Team.
        </p>
      </div>
    )}
  </div>
*/}
  {/* Certificate & QR Code Section */}
  <div className="mt-8">
    <button
      onClick={toggleCertificate}
      className="text-sm font-semibold underline flex justify-between items-center w-full"
    >
      Certificate as NFT
      <span>{isCertificateOpen ? "▲" : "▼"}</span>
    </button>
    {isCertificateOpen && (
      <div className="mt-4">
        <p><strong>RFID:</strong> {watch.certificate.rfid}</p>
        <p><strong>Owner:</strong> {watch.certificate.owner}</p>
        <p><strong>Name of Store:</strong> {watch.certificate.storeName}</p>
        <p><strong>Street:</strong> {watch.certificate.street}</p>
        <p><strong>City, State, Zip Code:</strong> {watch.certificate.cityStateZip}</p>
        <p><strong>Country:</strong> {watch.certificate.country}</p>
        <p><strong>Date of Purchase:</strong> {watch.certificate.dateOfPurchase}</p>
        <p className="mt-4 text-sm text-gray-600">
          This certificate is registered as a unique NFT (Non-Fungible Token) on the blockchain. Ownership is verifiable, and the authenticity of this watch is secured by blockchain technology.
        </p>
        <div className="mt-4 flex justify-center">
          <QRCode value={watch.qrCodeValue} size={100} />
        </div>
        <p className="mt-4 text-sm text-gray-600 text-center">
          Scan the QR code to verify this NFT certificate on the blockchain.
        </p>
      </div>
    )}
  </div>
</div>





    
);
}

export default function WatchList() {
    const router = useRouter();

    const handleAddItem = () => {
        router.push("/users/watches/create"); // Navigate to the "Add Item" page
    };

    return (
      <div className="container mx-auto py-8">
        {/* Add Item Button */}
      <div className="flex justify-end mb-8">
        <button
          onClick={handleAddItem}
          className="shadow-md absolute text-white text-sm px-4 bg-blue-600 py-2  rounded-md hover:bg-blue-700 hover:text-white transition-colors duration-300 focus:outline-none "
        >
          Add Item
        </button>
      </div>

        <h1 className="text-3xl font-bold text-center mb-8">My Watch Collection</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {watches.map((watch, index) => (
            <WatchItem key={index} watch={watch} />
          ))}
        </div>
      </div>
    );
}

