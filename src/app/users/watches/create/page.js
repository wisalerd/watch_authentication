"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import path from "path";
import Image from "next/image";
import ReactCountryDropdown from "react-country-dropdown";
import { useWallet } from "@/app/components/WalletContext"; // Import useWallet to access wallet data
import { ethers } from "ethers";
import NFTCertificationABI from "@/app/contracts/NFTCertification.json"; 


import { v4 as uuidv4 } from 'uuid'; // Import UUID for tempId generation
const dotenv = require('dotenv');
dotenv.config(); // โหลดตัวแปรจากไฟล์ .env

const contractAddress = process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS;  // ที่อยู่สัญญาจาก Remix

export default function AddItem() {
    const [files, setFiles] = useState([]);
    const [imageUrls, setImageUrls] = useState([]);
    const [blockId, setBlockId] = useState(''); // blockId input
    const [tempId, setTempId] = useState(''); // Temp input
    const [isModalOpen, setIsModalOpen] = useState(false); // ควบคุมการแสดง Modal

    const [users, setUsers] = useState(null); // State to hold user data
    const [loading, setLoading] = useState(true); // Loading state
    const [isSubmitting, setIsSubmitting] = useState(false); // New state
    const { accountData, connectToWallet } = useWallet(); // Access wallet data and connect function
    const router = useRouter();
  
    useEffect(() => {
      setTempId(uuidv4()); // Generate unique tempId

      const init = async () => {
        if (!accountData.address) {
          await connectToWallet(); // Auto connect if not connected
        }
        if (accountData?.address) {
          if (formData.certificate.owner == "")
            formData.certificate.owner = accountData.address;
          fetchUsers(accountData.address);
        }
      };
      init();
    }, [accountData, connectToWallet]);

    
    // Generate tempId when component mounts
    useEffect(() => {
        setTempId(uuidv4()); // Generate unique tempId
    }, []);
  
    const fetchUsers = async (walletAddress) => {
        try {
          const response = await fetch(`/api/user?walletAddress=${walletAddress}`); // Fetch user data from API
    
          if (!response.ok) {
            throw new Error("Failed to fetch users");
          }
    
          const data = await response.json();
    
          if (data?.error) {
            console.log(data);
            window.location.href = "/register";
            return;
          }
    
          setUsers(data); // Set user data to state
        } catch (error) {
          console.error("Error fetching users:", error);
        } finally {
          setLoading(false); // Set loading to false after fetch completes
        }
    };

    const [formData, setFormData] = useState({
      certificate: {
        owner: accountData?.address || "",
        watchname: "",
        rfid: "",
        serialId: "",
        watchReference: "",
        dateOfPurchase: "",
        storeName: "",
        street: "",
        cityStateZip: "",
        country: "Thailand"
      },
    });


    /*
    const [formData, setFormData] = useState({
        brand: "",
        model: "",
        reference: "",
        serialNumber: "",
        warrantyPeriod: "",
        fromDate: "",
        toDate: "",
        certificate: {
          rfid: "",
          owner: accountData?.address || "",
          storeName: users?.userName || "",
          street: "",
          cityStateZip: "",
          country: "Thailand",
          dateOfPurchase: "",
        },
        imageUrl: "",
        qrCodeValue: "",
      });
    */
    
    useEffect(() => {
        if (users) {
          setFormData((prevFormData) => ({
              ...prevFormData,
              certificate: {
              ...prevFormData.certificate,
              storeName: users.userName,
              },
          }));
        }
    }, [users]);

    const handleCountryChange = (country) => {
      console.log(country);
      formData.certificate.country = country;
      console.log( formData.certificate.country.name);
    };

   
    const handleChange = (e) => {
      const { name, value } = e.target;
      console.log(name, value);
      // Handle nested certificate fields
      if (name.startsWith("certificate.")) {
          const fieldName = name.split(".")[1];
          setFormData((prevData) => ({
              ...prevData,
              certificate: {
              ...prevData.certificate,
              [fieldName]: value,
              },
          }));
      } else {
          setFormData((prevData) => ({
              ...prevData,
              [name]: value,
          }));
      }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsSubmitting(true); // Set submitting state

        try {
            console.log(formData.brand);
            //await handleUpload(5);
            setIsModalOpen(true); // เปิด Modal
            await createNFTAndTransaction(formData);
            router.push("/users/watches");
            
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Failed to create NFT or Transaction.");
        } finally {
          setIsModalOpen(false); // ปิด Modal  
          setIsSubmitting(false); // Reset submitting state
        }
        //console.log("New Item Data:", formData);
        //await createNFT(formData);
        //await createNFTAndTransaction(formData);
    };

    const handleCancel = () => {
        router.back(); // Navigate to the previous page
    };

    const createNFTAndTransaction = async (formData) => {
      if (formData.certificate.owner == "")
        formData.certificate.owner = accountData.address;
      
      //try {
       //setIsModalOpen(true); // เปิด Modal

        if (!window.ethereum) throw new Error("No crypto wallet found");
      
        // Request wallet connection
        await window.ethereum.request({ method: "eth_requestAccounts" });

        //const provider = new ethers.providers.Web3Provider(window.ethereum);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        
        // Connect to contract
        const contract = new ethers.Contract(contractAddress, NFTCertificationABI, signer);
        console.log(formData);

        // Step 1: Call createNFT function
        const tx = await contract.createNFT(
          formData.certificate.owner,
          formData.brand,
          formData.model,
          formData.certificate.watchname,
          formData.certificate.rfid,
          formData.certificate.serialId,
          formData.certificate.watchReference,
          formData.certificate.dateOfPurchase + "<:>" + formData.fromDate + "<:>" + formData.toDate,
          formData.certificate.storeName,
          formData.certificate.street,
          formData.certificate.cityStateZip + "<:>" + formData.certificate.country
        );
    
        // รอการยืนยันธุรกรรม
        await tx.wait();

        console.log("NFT created with transaction:", tx);

        // Step 2: Retrieve tokenId (assuming tokenCounter increments after each creation)
        //const tokenId = await contract.tokenCounter() - 1;
        const tokenCounter = await contract.tokenCounter();
        console.log("tokenCounter:", tokenCounter);

        const tokenId = BigInt(tokenCounter.toString()) - BigInt(1);
        console.log("tokenId:", tokenId);

        // ** Call handleUpload to upload images after NFT creation **
        await handleUpload(tokenId);
        console.log("Images uploaded successfully!");
        /* transaction 
        // Step 3: Call createTransaction function
        const transactionTx = await contract.createTransaction(
          tokenId,
          formData.brand || "",
          formData.model || "",
          formData.warrantyPeriod || "",
          formData.fromDate || "",
          formData.toDate || ""
        );
    
        await transactionTx.wait(); // Wait for the transaction to be confirmed
        console.log("Transaction created with transaction:", transactionTx);
        */

        alert("Certificate and images uploaded successfully!");
        /*
      } catch (error) {
        console.error("Error creating NFT or Transaction:", error);
        alert("Failed to create NFT or Transaction.");
      }
      finally {
        setIsModalOpen(false); // ปิด Modal
      }
        */
      setIsModalOpen(false); // ปิด Modal
    };
  
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);

    const handleFileChange = (event) => {
      setSelectedFiles(event.target.files);
    };

    const handleUpload = async (_tokenId) => {
      /*
      const formData = new FormData();
      console.log(Array.from(selectedFiles));
      Array.from(selectedFiles).forEach((file) => {
        formData.append('file', file);
      });
      */
      const fileInput = document.getElementById("file-upload"); // Replace with your HTML element ID
      const files = fileInput.files;
      const formData = new FormData();

      formData.append('tokenId', _tokenId);
      
      // Append multiple files to the FormData object
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]); // Use the same key for all files
      }
     
      try {
        fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error(error));
      }
      catch (error) {
        console.error(error);
        alert('An error occurred during upload.');
      }

      /*
      try {
        const response = await axios.post('/api/upload', formData, {
          headers: {
            'method': 'POST',
            'Content-Type': 'multipart/form-data',
          },
          data: formData, 
        });

        if (response.status === 200) {
          const data = response.data;
          setUploadedFiles(data.fileUrls || []);
          alert('Files uploaded successfully!');
        } else {
          alert('Upload failed.');
        }
      } catch (error) {
        console.error(error);
        alert('An error occurred during upload.');
      }
      */
    };
    
    return (
        <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Add New Watch Item</h1>
        {isSubmitting && <p className="text-center text-blue-600">Processing... Please wait.</p>} {/* Loading Message */}
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
      
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Model</label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Watch name</label>
            <input
              type="text"
              name="certificate.watchname"
              value={formData.certificate.watchname}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Reference</label>
            <input
              type="text"
              name="certificate.watchReference"
              value={formData.certificate.watchReference}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Serial Number</label>
            <input
              type="text"
              name="certificate.serialId"
              value={formData.certificate.serialId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <fieldset className="col-span-1 md:col-span-2">
          <legend className="text-lg font-medium text-gray-700 mb-4">Warranty Period</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">From Date</label>
                <input
                type="date"
                name="fromDate"
                value={formData.fromDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">To Date</label>
                <input
                type="date"
                name="toDate"
                value={formData.toDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
                />
            </div>
            </div>
        </fieldset>

          {/*
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Warranty Period</label>
            <input
              type="text"
              name="warrantyPeriod"
              value={formData.warrantyPeriod}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          */}
        
        <fieldset className="col-span-1 md:col-span-2">
          <legend className="text-lg font-semibold text-gray-700 mb-4">Upload Files</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-all">
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <Image
                      src="/icons/Upload_Button_Icon.svg"
                      alt="Upload Icon"
                      width={48}
                      height={48}
                      className="mb-2 mx-auto"
                    />
                    <span className="text-blue-600 hover:text-blue-800 font-medium">
                      Click to Upload Files
                    </span>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {selectedFiles.length > 0 && (
                    <div className="mt-4">
                      <ul className="list-disc list-inside text-gray-600">
                        {Array.from(selectedFiles).map((file, index) => (
                          <li key={index}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <button
                    onClick={handleUpload}
                    className={`mt-4 px-4 py-2 rounded-lg ${
                      selectedFiles.length > 0
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={false}
                  >
                    Upload Files
                  </button>
                </div>
            </div>
          </div>
        </fieldset>      
         
          {/*
          <fieldset className="col-span-1 md:col-span-2">
            <legend className="text-lg font-medium text-gray-700 mb-4">Upload Images</legend>
            <div {...getRootProps({ className: 'dropzone border-dashed border-2 border-gray-400 p-4 mb-4 text-center' })}>
                <input {...getInputProps()} />
                <p>Drag & drop some files here, or click to select files</p>
            </div>

            <button onClick={handleUpload} className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                Upload Temp
            </button>

            <div className="mt-4">
                <input
                    type="text"
                    value={blockId}
                    onChange={(e) => setBlockId(e.target.value)}
                    placeholder="Enter Block ID after blockchain creation"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
                />
                <button onClick={handleFinalize} className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
                    Finalize Upload
                </button>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {imageUrls.map((url, idx) => (
                    <img 
                        key={idx} 
                        src={url} 
                        alt={`Preview ${idx + 1}`} 
                        className="w-full h-auto rounded-lg shadow-md" 
                    />
                ))}
            </div>
          </fieldset>
           */}
         {/* Certificate Fields 
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">QR Code Value</label>
            <input
              type="text"
              name="qrCodeValue"
              value={formData.qrCodeValue}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
           */}

          {/* Certificate Fields */}
          <fieldset className="col-span-1 md:col-span-2">
            <legend className="text-lg font-medium text-gray-700 mb-4">Certificate Details</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="mb-4">
                <label className="block text-sm text-gray-700">RFID</label>
                <input
                  type="text"
                  name="certificate.rfid"
                  value={formData.certificate.rfid}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-700">Owner</label>
                <input
                  type="text"
                  name="certificate.owner"
                  value={formData.certificate.owner}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  disabled="true"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-700">Store Name</label>
                <input
                  type="text"
                  name="certificate.storeName"
                  value={formData.certificate.storeName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div className="mb-4 ">
                <label className="block text-sm text-gray-700">Country</label>
                <ReactCountryDropdown 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    name="certificate.country"
                    defaultCountry="TH"
                    onSelect={handleCountryChange}
                    required
                />
                {/* 
                <input
                  type="text"
                  name="certificate.country"
                  value={formData.certificate.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
                */}
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-700">Street</label>
                <input
                  type="text"
                  name="certificate.street"
                  value={formData.certificate.street}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-700">City, State, Zip Code</label>
                <input
                  type="text"
                  name="certificate.cityStateZip"
                  value={formData.certificate.cityStateZip}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm text-gray-700">Date of Purchase</label>
                <input
                  type="date"
                  name="certificate.dateOfPurchase"
                  value={formData.certificate.dateOfPurchase}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
            </div>
          </fieldset>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-6">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="shadow-md  text-black py-2 px-4 border border-gray-300 rounded-md hover:bg-red rounded-md hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting} // Disable button while submitting
                >
                    Submit
                </button>
            </div>
        </form>

        {isModalOpen && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex justify-center items-center">
              <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                <h2 className="text-lg font-semibold text-center">Creating Certificate...</h2>
                <p className="text-center text-gray-600 mt-4">
                  Please wait while we create your NFT certificate on the blockchain.
                </p>
              </div>
            </div>
          )}
        </div>
    );
}
