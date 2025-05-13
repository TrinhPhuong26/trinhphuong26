import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Lấy dữ liệu thống kê 6 tháng gần nhất
    const monthlyData = [];
    const currentDate = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = subMonths(currentDate, i);
      const startDate = startOfMonth(date);
      const endDate = endOfMonth(date);
      
      // Đếm số người dùng mới trong tháng
      const newUsers = await prisma.user.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      // Đếm số CV mới trong tháng
      const newResumes = await prisma.resume.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      monthlyData.push({
        name: `Tháng ${format(date, 'M')}`,
        users: newUsers,
        resumes: newResumes,
      });
    }

    // Lấy thống kê sử dụng template
    const resumeTemplates = await prisma.resume.groupBy({
      by: ['templateType'],
      _count: {
        id: true,
      },
    });

    const templateUsage = resumeTemplates.map(template => ({
      name: template.templateType.charAt(0).toUpperCase() + template.templateType.slice(1),
      value: template._count.id,
    }));

    return NextResponse.json({
      monthlyData,
      templateUsage: templateUsage.length > 0 ? templateUsage : [
        { name: 'Blank', value: 35 },
        { name: 'Professional', value: 40 },
        { name: 'Creative', value: 15 },
        { name: 'Minimal', value: 10 },
      ]
    });
  } catch (error) {
    console.error("Monthly Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 