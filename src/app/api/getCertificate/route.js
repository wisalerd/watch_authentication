import { NextResponse } from "next/server";
import { ethers } from "ethers";
import NFTCertificationABI from "@/app/contracts/NFTCertification.json";

// Smart Contract Address
const contractAddress = process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS;

// RPC Provider

const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL); // Replace with your Blockchain RPC URL

const contract = new ethers.Contract(contractAddress, NFTCertificationABI, provider);


function formatTimestamp(timestamp) {
  const date = new Date(Number(timestamp) * 1000); // แปลง BigInt เป็น Number และ * 1000 สำหรับ milliseconds
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // เดือนเริ่มที่ 0 จึงบวกเพิ่ม 1
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const rfid = searchParams.get("rfid");
  ;
  if (!rfid) {
    return NextResponse.json({ error: "RFID parameter is required" }, { status: 400 });
  }
  
  try {
    // Get total number of tokens
   
    const totalTokens = await contract.tokenCounter();
  
    // Iterate through all tokens to find the one matching the RFID
    for (let tokenId = 0; tokenId < totalTokens; tokenId++) {
      const certificate = await contract.getCertificate(tokenId);
     
      try {
       
        const histories = await contract.getHistory(tokenId);

        const formattedHistories = histories.map((history) => ({
          from: history.from,
          to: history.to,
          tokenId: history.tokenId.toString(), // แปลง BigInt เป็น string
          timestamp: formatTimestamp(history.timestamp)
        }));
    
       
        if (certificate.rfid === rfid) {

          // Return the certificate details if the RFID matches
          return NextResponse.json({
            tokenId,
            owner: certificate.owner,
            watchname: certificate.watchname,
            rfid: certificate.rfid,
            serialId: certificate.serialId,
            watchReference: certificate.watchReference,
            dateOfPurchase: certificate.dateOfPurchase,
            storeName: certificate.storeName,
            street: certificate.street,
            cityStateZipAndcountry: certificate.cityStateZipAndcountry,
            histories:formattedHistories
          });
        }
      } catch (error) {
        console.error("Error fetching history:", error);
        return NextResponse.json({ error: error.message });
      }
     
      
    }

    // If no matching RFID found
    return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
  } catch (error) {
    console.error("Error fetching certificate data from blockchain:", error);
    return NextResponse.json({ error: "Failed to fetch certificate data." }, { status: 500 });
  }
}
