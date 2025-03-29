"use client";

import { useEffect, useState } from "react";
const dotenv = require('dotenv');
dotenv.config(); // โหลดตัวแปรจากไฟล์ .env

const contractAddress = process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS;  // ที่อยู่สัญญาจาก Remix
const rpc2 = process.env.NEXT_PUBLIC_RPC_URL;  // ที่อยู่สัญญาจาก Remix
const poweredby = process.env.NEXT_PUBLIC_POWERBY;
const powerByURL = process.env.NEXT_PUBLIC_POWERBYIMG;

export default function CertificatePage({ params }) {
  const { rfid } = params; // ดึงค่า rfid จาก dynamic route
  const [certificateData, setCertificateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // เริ่มโหลดข้อมูล
        const response = await fetch(`/api/getCertificate?rfid=${rfid}`);

        if (!response.ok) {
          throw new Error("Certificate not found or server error.");
        }

        const data = await response.json();
        
        const dateString = data.dateOfPurchase;
        const dateArray = dateString.split("<:>");
        
        const dateStringAddress = data.cityStateZipAndcountry;
        const addressArray = dateStringAddress.split("<:>");

        const watches = {
          dateOfPurchase: dateArray[0] || '',
          fromDate: dateArray[1] || '',
          toDate: dateArray[2] || '',
          cityStateZip: addressArray[0] || '',
          country: addressArray[1] || '',
          certificate: data,
          history: data.histories || []
        };
        console.log(watches);
        
        setCertificateData(watches);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false); // จบการโหลดข้อมูล
      }
    };

    if (rfid) {
      fetchData();
    }
  }, [rfid]);

  if (loading) {
    return <p className="text-center mt-8 text-gray-500">Loading certificate data...</p>;
  }

  if (error) {
    return (
    <div className="container mx-auto py-8 text-center">
      <h1 className="text-2xl font-bold text-red-600">Error</h1>
      <p className="text-gray-700">{error}</p>
    </div>
    );
  }
  if (!certificateData) {
    return (
      <div className="container mx-auto py-8 text-center">
      <h1 className="text-2xl font-bold text-gray-600">Certificate Not Found</h1>
      <p className="text-gray-700">RFID: {rfid}</p>
    </div>
    );
  }

  const fullURLRPC = rpc2 + "/nft/"+ contractAddress +"/"+certificateData.certificate.tokenId   ;  // ที่อยู่สัญญาจาก Remix sepolia
  //const fullURLRPC = rpc2 + "/tx/"+ contractAddress +"/"+certificateData.certificate.tokenId   ;  // ที่อยู่สัญญาจาก Remix
  

  return (
    
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-xl mx-auto">
      <h1 className="text-sm font-bold mb-6 text-center">Certificate Details</h1>
     
        <div className="border-b pb-4 mb-4">
          <p className="text-sm ">
            <strong>RFID:</strong> {certificateData.certificate.rfid}
          </p>
          <p className="text-sm ">
              <strong>Reference:</strong> {certificateData.certificate.watchReference}
          </p>
          <p className="text-sm ">
            <strong>Serial Number:</strong> {certificateData.certificate.serialId}
          </p>
          <p className="text-sm ">
            <strong>Owner:</strong> {certificateData.certificate.owner}
          </p>
          <p className="text-sm ">
            <strong>From Date:</strong>   {certificateData.fromDate} 
          </p>

          <p className="text-sm ">
            <strong>To Date:</strong>  {certificateData.toDate}
          </p>
        
        </div>

        <div className="border-b pb-4 mb-4">
          <h3 className="text-sm font-bold mb-6 text-center">Retailer</h3>
          <p className="text-sm "><strong>Store Name:</strong> {certificateData.certificate.storeName}</p>
          <p className="text-sm "><strong>Street:</strong> {certificateData.certificate.street}</p>
          <p className="text-sm "><strong>City, State, Zip:</strong> {certificateData.cityStateZip}</p>
          <p className="text-sm "><strong>Country:</strong> {certificateData.country}</p>
          <p className="text-sm mb-2">
          <strong>Date of Purchase:</strong> {certificateData.dateOfPurchase}</p>
        </div>

        {/* History Table */}
        <div className="border-b pb-4 mb-4">
          <h3 className="text-sm font-bold mb-6 text-center">History</h3>
          {certificateData.history.length > 0 ? (
             <>
              {certificateData.history.map((record, index) => (
                <div key={index} className="mb-4">
                  <p className="text-sm"><strong>No:</strong> {index+1}</p>
                  <p className="text-sm"><strong>From:</strong> {record.from}</p>
                  <p className="text-sm"><strong>To:</strong> {record.to}</p>
                  <p className="text-sm"><strong>Timestamp:</strong> {record.timestamp}</p>
                </div>
              ))}
            </>
            
          ) : (
            <p className="text-gray-600 text-center">No history found.</p>
          )}
        </div>

        {/* Powered By */}
        <div className="border-b pb-4 mb-4 d-flex align-items-center" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            width="28"
            data-img-theme="light"
            src={powerByURL}
            alt="Polygon PoS Chain Amoy Logo"
          />
          <strong className="text-sm font-semibold " >{poweredby}</strong>
          <a href={fullURLRPC} className="text-sm text-blue-600" style={{ marginLeft: '10px' }}>
            <p style={{ margin: 0 }}>more</p>
          </a>
      </div>

      </div>
    </div>
  );
}
