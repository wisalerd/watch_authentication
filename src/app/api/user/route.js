import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('walletAddress'); // Get wallet address from query parameters

  if (!walletAddress) {
    return Response.json({ error: 'walletAddress is required' }, { status: 200 }); // Handle missing wallet address
  }

  try {
    const user = await prisma.user.findFirst({
      where: { walletAddress: walletAddress}, // Find user by wallet address
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 200 }); // Handle user not found
    }

    return Response.json(user); // Return the found user as JSON
  } catch (error) {
    console.error('Error fetching user:', error);
    return Response.json({ error: 'Error fetching data' }, { status: 200 }); // Handle error
  } finally {
    await prisma.$disconnect(); // Ensure Prisma disconnects from the database
  }
}
