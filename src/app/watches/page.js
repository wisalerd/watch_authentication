"use client";

import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import Image from "next/image";
import { useWallet } from "@/app/components/WalletContext"; // Import useWallet to access wallet data


// Watch data in JSON format
const watchData = {
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
  imageUrl: "/images/tissot/prx/T137-407-11-051-00_shadow.png", // Link to the watch image
  qrCodeValue: "http://localhost:3000/certificate/987654321", // Link to the certificate page
};

export default function WatchDetails() {
  const { accountData, connectToWallet } = useWallet(); // Access wallet data and connect function


  const [isWarrantyOpen, setIsWarrantyOpen] = useState(false); // State for warranty visibility
  const [isCertificateOpen, setIsCertificateOpen] = useState(false); // State for certificate visibility

  useEffect(() => {
    if (!accountData.address) {
      connectToWallet();  // Auto connect if not connected
    }
  }, [accountData, connectToWallet]);

  
  const handleConnectWallet = async () => {
    await connectToWallet(); // Call the connect function from WalletContext
    setIsConnected(true); // Set connection status
  };

  // Toggle warranty visibility
  const toggleWarranty = () => {
    setIsWarrantyOpen(!isWarrantyOpen);
  };

  // Toggle certificate visibility
  const toggleCertificate = () => {
    setIsCertificateOpen(!isCertificateOpen);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Image
            src={watchData.imageUrl}
            alt={`${watchData.brand} ${watchData.model}`}
            width={500}
            height={500}
            className="w-full h-auto"
          />
        </div>

        {/* Column: Watch Information */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            {watchData.brand} {watchData.model}
          </h2>
          <p>
            <strong>Watch Reference:</strong> {watchData.reference}
          </p>
          <p>
            <strong>Serial Number:</strong> {watchData.serialNumber}
          </p>

          {/* Warranty Section */}
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
                  <strong>Warranty Period:</strong> {watchData.warrantyPeriod}
                </p>
                <p className="mt-4 text-sm underline">
                  If you have issues accessing your warranty details, please contact our Support Team.
                </p>
              </div>
            )}
          </div>

          {/* Certificate & QR Code Section */}
          <div className="mt-8">
            <button
              onClick={toggleCertificate}
              className="font-semibold underline flex justify-between items-center w-full"
            >
              Certificate as non-fungible token (NFT)
              <span>{isCertificateOpen ? "▲" : "▼"}</span>
            </button>
            {isCertificateOpen && (
              <div className="mt-4">
                <p><strong>RFID:</strong> {watchData.certificate.rfid}</p>
                <p><strong>Owner:</strong> {watchData.certificate.owner}</p>
                <p><strong>Name of Store:</strong> {watchData.certificate.storeName}</p>
                <p><strong>Street:</strong> {watchData.certificate.street}</p>
                <p><strong>City, State, Zip Code:</strong> {watchData.certificate.cityStateZip}</p>
                <p><strong>Country:</strong> {watchData.certificate.country}</p>
                <p><strong>Date of Purchase:</strong> {watchData.certificate.dateOfPurchase}</p>
                <p className="mt-4 text-sm text-gray-600">
                  This certificate is registered as a unique NFT (Non-Fungible Token) on the blockchain. Ownership is verifiable, and the authenticity of this watch is secured by blockchain technology.
                </p>
                {/* Display QR Code */}
                <div className="mt-4 flex justify-center">
                  <QRCode value={watchData.qrCodeValue} size={100} /> {/* QR Code size reduced */}
                </div>
                <p className="mt-4 text-sm text-gray-600 text-center">
                  Scan the QR code to verify this NFT certificate on the blockchain.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
