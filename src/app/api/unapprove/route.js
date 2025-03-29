import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400 }
      );
    }

    // อัปเดตสถานะ approve ของผู้ใช้ในฐานข้อมูล
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { approve: false },
    });

    return new Response(JSON.stringify(updatedUser), { status: 200 });
  } catch (error) {
    console.error("Error unapproving user:", error);
    return new Response(
      JSON.stringify({ error: "Error unapproving user" }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
