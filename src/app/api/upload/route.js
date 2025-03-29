// Import necessary modules
import { NextResponse } from "next/server";
import path from "path";
import { writeFile } from "fs/promises";
const fs = require("fs");

// Define the POST handler for the file upload
export const POST = async (req, res) => {

  try {
    // Parse the incoming form data
    const formData = await req.formData();

    // Extract all files from the form data
    const files = formData.getAll("files");
    const tokenIds = formData.getAll("tokenId");
    const tokenId = tokenIds[0];
   
    // Check if files are received
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files received." }, { status: 400 });
    }
   
    // Define the directory where files will be saved
    const uploadDir = path.join(process.cwd(), "public/uploads/NFT/TokenId_"+ tokenId);


    // Ensure the upload directory exists, create if it doesn't
    //await mkdir(uploadDir, { recursive: true });
    fs.mkdirSync(uploadDir, { recursive: true });

    const uploadPromises = files.map(async (file) => {
      // Convert the file data to a Buffer
      const buffer = Buffer.from(await file.arrayBuffer());

      // Replace spaces in the file name with underscores
      const filename = file.name.replaceAll(" ", "_");
      console.log(uploadDir + "/" + filename);

      // Write each file to the specified directory (public/assets)
      await writeFile(
        path.join(uploadDir + "/" + filename),
        buffer
      );
    });



    // Wait for all files to be written
    await Promise.all(uploadPromises);

    // Return a JSON response with a success message and a 201 status code
    return NextResponse.json({ Message: "Success", status: 201 });

  } catch (error) {
    console.log("Error occurred ", error); 
    return NextResponse.json({ Message: "Failed", status: 500, details:error });
  } 
  
  /*
  // Parse the incoming form data
  const formData = await req.formData();
 
  // Get the file from the form data
  const file = formData.get("file");

  // Check if a file is received
  if (!file) {
    // If no file is received, return a JSON response with an error and a 400 status code
    return NextResponse.json({ error: "No files received." }, { status: 400 });
  }

  // Convert the file data to a Buffer
  const buffer = Buffer.from(await file.arrayBuffer());

  // Replace spaces in the file name with underscores
  const filename = file.name.replaceAll(" ", "_");
  console.log(filename);

  try {
    // Write the file to the specified directory (public/assets) with the modified filename
    await writeFile(
      path.join(process.cwd(), "public/assets/" + filename),
      buffer
    );

    // Return a JSON response with a success message and a 201 status code
    return NextResponse.json({ Message: "Success", status: 201 });
  } catch (error) {
    // If an error occurs during file writing, log the error and return a JSON response with a failure message and a 500 status code
    console.log("Error occurred ", error);
    return NextResponse.json({ Message: "Failed", status: 500 });
  }
    */
};