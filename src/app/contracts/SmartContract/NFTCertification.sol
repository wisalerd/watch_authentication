// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTCertification is ERC721 {
    uint256 public tokenCounter;
  
    mapping(uint256 => Certificate) public certificates;
    mapping(uint256 => Transaction[]) public transactions; 
    mapping(uint256 => History[]) public historyRecords; 

    constructor() ERC721("NFTCertification", "CERT") {
        tokenCounter = 0;
    }

    struct Certificate {
        address owner;   
        uint256 tokenId;   
        string watchBrand;   
        string watchdModel;
        string watchname;      
        string rfid;           
        string serialId;       
        string watchReference; 
        string dateOfPurchase; 
        string storeName;      
        string street;         
        string cityStateZipAndcountry;   
    }

    struct Transaction {
        uint256 tokenId;       
        string brand;
        string model;
        string warrantyPeriod;
        string fromDate;
        string toDate;
    }

    struct History {
        address from; // ผู้ส่ง
        address to;   // ผู้รับ
        uint256 tokenId;
        uint256 timestamp; // เวลาที่โอน
    }

   
    function createNFT(
        address to,
        string memory watchBrand,
        string memory watchModel,
        string memory watchname,
        string memory rfid,
        string memory serialId,
        string memory watchReference,
        string memory dateOfPurchase,
        string memory storeName,
        string memory street,
        string memory cityStateZipAndcountry
    ) public {
        uint256 newTokenId = tokenCounter;
        // uint256 newTokenId = uint256(keccak256(abi.encodePacked(block.timestamp, to, tokenCounter, serialId)));

        _mint(to, newTokenId);

        certificates[newTokenId] = Certificate(
            to,
            newTokenId,
            watchBrand,
            watchModel,
            watchname,
            rfid,
            serialId,
            watchReference,
            dateOfPurchase,
            storeName,
            street,
            cityStateZipAndcountry
        );

        // บันทึกประวัติการสร้าง (Mint)
        historyRecords[newTokenId].push(
            History(address(0), to, newTokenId, block.timestamp)
        );

        tokenCounter++;
    }

    function createTransaction(
        uint256 tokenId,
        string memory brand,
        string memory model,
        string memory warrantyPeriod,
        string memory fromDate,
        string memory toDate
    ) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner of this NFT");

        transactions[tokenId].push(Transaction(
            tokenId,
            brand,
            model,
            warrantyPeriod,
            fromDate,
            toDate
        ));
    }

    function getCertificate(uint256 tokenId) public view returns (Certificate memory) {
        return certificates[tokenId];
    }

    function getTransactions(uint256 tokenId) public view returns (Transaction[] memory) {
        return transactions[tokenId];
    }

    function getHistory(uint256 tokenId) public view returns (History[] memory) {
        return historyRecords[tokenId];
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        super.transferFrom(from, to, tokenId);

        certificates[tokenId].owner = to;

        // บันทึกประวัติการโอน
        historyRecords[tokenId].push(
            History(from, to, tokenId, block.timestamp)
        );
    }
}
