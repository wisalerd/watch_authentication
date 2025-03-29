// src/app/api/users/route.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = await prisma.user.findMany(); // Fetch all users from the database
   
    return Response.json(users); // Return users as JSON
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json({ error: 'Error fetching data' }, { status: 500 }); // Ensure valid JSON is returned on error
  } finally {
    await prisma.$disconnect(); // Ensure Prisma disconnects from the database
  }
}

