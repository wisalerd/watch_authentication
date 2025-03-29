import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

export const POST = async (req, res) => {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  }
  const formData = await req.formData();
  // Extract all files from the form data
  const tokenId = formData.get("tokenId");

  if (!tokenId) {
    return NextResponse.json({ error: "TokenId is required" }, { status: 400 });
  }

  try {
    const folderPath = path.join(process.cwd(), `public/uploads/NFT/TokenId_${tokenId}`);

    //return NextResponse.json({ folderPath: folderPath, status: 200 });
    if (!fs.existsSync(folderPath)) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const files = fs.readdirSync(folderPath);
    const imageFiles = files.filter((file) => /\.(png|jpg|jpeg|gif)$/.test(file));

    return NextResponse.json({ images: imageFiles, status: 200 });

  } catch (error) {
    console.error("Error reading folder:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });

  }
};
