import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Lấy thống kê người dùng
    const totalUsers = await prisma.user.count();

    // Đếm số người dùng theo role
    const usersByRole = await prisma.user.groupBy({
      by: ["role"],
      _count: {
        role: true,
      },
    });

    // Lấy thống kê CV
    const totalResumes = await prisma.resume.count();

    // Lấy số lượng người dùng và CV tạo trong tháng trước
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    // Người dùng tạo trong tháng hiện tại
    const usersCurrentMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: oneMonthAgo,
        },
      },
    });

    // Người dùng tạo trong tháng trước
    const usersPreviousMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: twoMonthsAgo,
          lt: oneMonthAgo,
        },
      },
    });

    // CV tạo trong tháng hiện tại
    const resumesCurrentMonth = await prisma.resume.count({
      where: {
        createdAt: {
          gte: oneMonthAgo,
        },
      },
    });

    // CV tạo trong tháng trước
    const resumesPreviousMonth = await prisma.resume.count({
      where: {
        createdAt: {
          gte: twoMonthsAgo,
          lt: oneMonthAgo,
        },
      },
    });

    // Tính % tăng trưởng
    const userGrowth = usersPreviousMonth > 0 
      ? ((usersCurrentMonth - usersPreviousMonth) / usersPreviousMonth) * 100
      : 0;
    
    const resumeGrowth = resumesPreviousMonth > 0
      ? ((resumesCurrentMonth - resumesPreviousMonth) / resumesPreviousMonth) * 100
      : 0;

    // Format dữ liệu role
    const adminCount =
      usersByRole.find((item) => item.role === "ADMIN")?._count.role || 0;
    const regularUserCount =
      usersByRole.find((item) => item.role === "USER")?._count.role || 0;

    return NextResponse.json({
      totalUsers,
      adminCount,
      regularUserCount,
      totalResumes,
      userGrowth: parseFloat(userGrowth.toFixed(1)),
      resumeGrowth: parseFloat(resumeGrowth.toFixed(1))
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 