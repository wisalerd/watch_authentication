// src/app/api/createUser/route.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  const { userName, walletAddress, role } = await req.json(); // Expecting role to be included

  try {
    const newUser = await prisma.user.create({
      data: {
        userName,
        walletAddress,
        role, // Store the role as well
      },
    });
    return Response.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return Response.json({ error: 'Error creating user' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

