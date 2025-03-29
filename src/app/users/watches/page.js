"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import Image from "next/image";
import { useWallet } from "@/app/components/WalletContext";
import { ethers } from "ethers";
import NFTCertificationABI from "@/app/contracts/NFTCertification.json";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

const dotenv = require('dotenv');
dotenv.config(); // โหลดตัวแปรจากไฟล์ .env

const contractAddress = process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS;  // ที่อยู่สัญญาจาก Remix

const getCertificatesAndTransactionsByOwner = async (ownerAddress) => {
  
  try {
    if (!window.ethereum) throw new Error("No crypto wallet found");
    
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, NFTCertificationABI, signer);

    const totalTokens = await contract.tokenCounter();
    const ownerCertificates = [];
    //const ownerTransactions = [];
    console.log("totalTokens : " + totalTokens);

    for (let tokenId = 0; tokenId < totalTokens; tokenId++) {
      const certificate = await contract.getCertificate(tokenId);
      console.log("------------------------");
      console.log("certificate : " + certificate);
      console.log("tokenId : " + certificate.tokenId);
      console.log("owner : " + certificate.owner);
      console.log("ownerAddress : " + ownerAddress);

      if (certificate.owner.toLowerCase() === ownerAddress.toLowerCase()) {
        ownerCertificates.push(certificate);

        //const transactions = await contract.getTransactions(tokenId);
        //ownerTransactions.push({ tokenId, transactions });
      }
    }
    //return { certificates: ownerCertificates, transactions: ownerTransactions };
    return { certificates: ownerCertificates};

  } catch (error) {
    console.error("Error fetching certificates and transactions:", error);
    return { certificates: [], transactions: [] };
  }
};

function WatchItem({ watch } ) {
  const { accountData, connectToWallet } = useWallet();
  const [loading, setLoading] = useState(false); // สถานะการโหลด
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState("");
  
  const toggleCertificate = () => setIsCertificateOpen(!isCertificateOpen);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setRecipientAddress("");
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (!accountData.address) {
      connectToWallet();
    }
  }, [accountData, connectToWallet]);

  const createTransferTransaction = async (watch, fromAddress, toAddress) => {

    try {
      if (!window.ethereum) throw new Error("No crypto wallet found");
   
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, NFTCertificationABI, signer);
  
      // ตรวจสอบ Transaction เดิม
      const existingTransactions = await contract.getTransactions(watch.tokenId);

      let lastTransaction = null;
      if (existingTransactions.length > 0) {
        lastTransaction = existingTransactions[existingTransactions.length - 1]; // เอา Transaction ล่าสุด
      }

      console.log("Creating new transaction for Token ID:", watch.tokenId);

      // Create new a transaction 
      const tx = await contract.createTransaction(
        watch.tokenId,
        lastTransaction ? lastTransaction.brand : "Transfer",
        lastTransaction ? lastTransaction.model : "Ownership Transfer",
        lastTransaction ? lastTransaction.warrantyPeriod : "N/A",
        new Date().toISOString().slice(0, 10), // วันที่โอน
        lastTransaction ? lastTransaction.toDate : new Date().toISOString().slice(0, 10) // วันที่สิ้นสุด
      );

       // รอให้ Transaction ถูกบันทึกใน Blockchain
      const receipt = await tx.wait();
      console.log("Transaction successfully recorded on blockchain:", receipt);

    } catch (error) {
      console.log("Error creating transaction:", error);
      alert("Failed to create transaction.");
    }
  };

  const handleTransfer = async () => {

    if (!recipientAddress) {
      alert("Please enter a recipient address.");
      return;
    }

    try {
      if (!window.ethereum) throw new Error("No crypto wallet found");

      setLoading(true); // เริ่มโหลดข้อมูล

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, NFTCertificationABI, signer);

      //console.log("address : " + accountData.address);
      //console.log("recipientAddress : " + recipientAddress); //0xAc2Edb624621f81E5f03E67c2B74a35563951bd6
      console.log("Starting transfer for tokenId:", watch.tokenId);

     
      //await createTransferTransaction(watch, accountData.address, recipientAddress);

       // เรียก Transfer NFT
      const tx = await contract.transferFrom(accountData.address, recipientAddress, watch.tokenId);
      await tx.wait();

      console.log(`NFT with Token ID ${watch.tokenId} has been transferred to ${recipientAddress}`);


      //// รีเฟรชข้อมูลหลังการโอน
      //await fetchCertificatesAndTransactions(); 
      alert(`Transfer completed successfully! Token ID: ${watch.tokenId}`);
      closeModal();
      
      window.location.href = "/users/watches";
    } catch (error) {
      console.error("Error transferring NFT:", error);
      alert("Failed to transfer NFT.");
    }
    finally {
      setLoading(false); // จบการโหลดข้อมูลไม่ว่าจะสำเร็จหรือเกิดข้อผิดพลาด
    }
  };

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  };
  
  function CustomSlide(props) {
    const { index, ...otherProps } = props;
    return (
      <div {...otherProps}>
        <h3>{index}</h3>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md group relative">
      {/* Transfer Button */}
      <button
          onClick={openModal}
          className="shadow-md absolute top-2 right-2 text-black text-sm px-4 py-2 border border-gray-300 rounded-md hover:bg-blue hover:text-white transition-colors duration-300 hover:bg-blue-700 focus:outline-none   z-10"
        >
          Transfer
      </button>
    
      <div className="slider-container">
      <Slider {...settings}>
        {watch.imageUrls.map((imageUrl, index) => (
          <div key={index} className="image-container">
            <Image
              src={imageUrl}
              alt={`Image ${index + 1} of ${watch.watchBrand} ${watch.watchModel}`}
              width={300}
              height={400}
              className="w-full h-auto"
            />
          </div>
        ))}
      </Slider>
    </div>

      <h2 className="text-sm font-semibold mb-2 mt-6">
        {watch.watchBrand} {watch.watchModel}
      </h2>
      <p className="text-sm"><strong>Reference:</strong> {watch.reference}</p>
      <p className="text-sm"><strong>Serial Number:</strong> {watch.serialNumber}</p>
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 relative z-60">
            
            {loading ? (
              <>
              <h2 className="text-lg font-semibold">Transferring...</h2>
              <p className="text-center text-gray-600 mt-4">
                  Please wait while we transfer your NFT certificate on the blockchain.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold">Transfer</h2>
                  <label className="block text-sm font-medium text-gray-700 mt-4">Recipient Address</label>
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    autoComplete="off"
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter recipient address"
                  />
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={closeModal}
                      className="bg-gray-300 text-black py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleTransfer}
                      className="ml-3 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading} 
                    >
                      Transfer
                    </button>
                  </div>
              </>
            )}
          </div>
        </div>
      )}
      <div className="mt-4">
        <button
          onClick={toggleCertificate}
          className="text-sm font-semibold underline flex justify-between items-center w-full"
        >
          Certificate as NFT
          <span>{isCertificateOpen ? "▲" : "▼"}</span>
        </button>
        {isCertificateOpen && (
          <div className="text-sm mt-4">
            <p><strong>Token ID:</strong> {watch.tokenId}</p>
            <p><strong>RFID:</strong> {watch.certificate.rfid}</p>
            {/* Modal
            <p><strong>Owner:</strong> {watch.certificate.owner}</p>
            */}
            <p><strong>Store Name:</strong> {watch.certificate.storeName}</p>
            <p><strong>Street:</strong> {watch.certificate.street}</p>
            <p><strong>City, State, Zip:</strong> {watch.cityStateZip}</p>
            <p><strong>Country:</strong> {watch.country}</p>
            <p><strong>Date of Purchase:</strong> {watch.dateOfPurchase}</p>
            <div className="mt-4 flex justify-center">
              <QRCode value={watch.qrCodeValue} size={100} />
              
            </div>
            <div className="mt-4 flex justify-center">
            <a href={watch.qrCodeValue} target="_blank" className="text-sm text-blue-600" style={{ marginLeft: '10px' }}>
              <p style={{ margin: 0 }}>URL</p>
            </a>
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
  const [currentUser, setCurrentUser] = useState([]); // State to hold user data
  const [watches, setWatches] = useState([]);
  const [loading, setLoading] = useState(true); // สถานะการโหลด
  const router = useRouter();
  const { accountData, connectToWallet } = useWallet();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;


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
            window.location.href = "/";
          }

          if(data.approve != true)
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


  useEffect(() => {

    const fetchImageUrls = async (tokenId) => {

      try {
        const formData = new FormData();
        formData.append("tokenId", tokenId); 

        const response = await fetch("/api/images", {
          method: "POST", // กำหนด Method เป็น POST
          body: formData,
        });
        //console.log(response);

        if (!response) {
         // const error = await response.json();
          //console.error("Error fetching images:", error);
          return ["/images/nft-placeholder.svg"];
        }
        const data = await response.json();

        if(data.error)
          return ["/images/nft-placeholder.svg"];

        return data.images.map((imageName) => `/uploads/NFT/tokenId_${tokenId}/${imageName}`);
        
      } catch (error) {
        console.error("Error fetching image URLs:", error);
        return ["/images/nft-placeholder.svg"];
      }
    };
    
    let timeout;

    const fetchCertificatesAndTransactions = async () => {
      clearTimeout(timeout); // Clear any previous timeouts
      timeout = setTimeout(async () => {
        setLoading(true); // เริ่มโหลดข้อมูล
        if (accountData.address) {
          const data = await getCertificatesAndTransactionsByOwner(accountData.address);

          const watches = await Promise.all(
            data.certificates.map(async (certificate, index) => {
              const tokenId = certificate.tokenId.toString();
              const imageUrls = await fetchImageUrls(tokenId);
              //console.log('imageUrls');
              //console.log(certificate);
              const dateString = certificate.dateOfPurchase;
              const dateArray = dateString.split("<:>");

              const dateStringAddress = certificate.cityStateZipAndcountry;
              const addressArray = dateStringAddress.split("<:>");

              return {
                watchBrand: certificate.watchBrand,
                watchModel: certificate.watchdModel,
                reference: certificate.watchReference,
                serialNumber: certificate.serialId,
                dateOfPurchase: dateArray[0] || '',
                fromDate: dateArray[1] || '',
                toDate: dateArray[2] || '',
                cityStateZip: addressArray[0] || '',
                country: addressArray[1] || '',
                certificate: certificate,
                tokenId,
                imageUrls, // ใช้ข้อมูลจาก API
                qrCodeValue: `${baseUrl}/certificate/${certificate.rfid}`,
              };
            })
          );
          console.log('watches');
          console.log(watches);
          setWatches(watches);
        }
        setLoading(false); // จบการโหลดข้อมูล

        }, 300); // Debounce with 300ms delay
    };

    if (!accountData.address) {
      connectToWallet();
    } else {
      fetchCertificatesAndTransactions();
    }
  }, [accountData, connectToWallet]);

  // go to page create.
  const handleAddItem = () => {
    router.push("/users/watches/create");
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-end mb-8">
        <button
          onClick={handleAddItem}
          className="shadow-md text-white text-sm px-4 bg-blue-600 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300 focus:outline-none"
        >
          Add Item
        </button>
      </div>

      <h1 className="text-3xl font-bold text-center mb-8">My Watch Collection</h1>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {watches.length > 0 ? (
            watches.map((watch, index) => <WatchItem key={index} watch={watch} />)
          ) : (
            <p className="text-center">No watches found for this address.</p>
          )}
        </div>
      )}
    </div>
  );
}