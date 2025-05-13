import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET: Lấy danh sách tất cả các blog đã được công khai
export async function GET(req: NextRequest) {
  try {
    // Lấy query params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    // Tính toán phân trang
    const skip = (page - 1) * limit;

    // Xây dựng điều kiện tìm kiếm
    const where: Prisma.BlogWhereInput = {
      published: true, // Chỉ lấy những blog đã được công khai
      ...(search
        ? {
            OR: [
              {
                title: { contains: search, mode: Prisma.QueryMode.insensitive },
              },
              {
                content: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            ],
          }
        : {}),
    };

    // Lấy dữ liệu blog và tổng số bản ghi
    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          thumbnail: true,
          publishedAt: true,
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.blog.count({ where }),
    ]);

    return NextResponse.json({
      blogs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching public blogs:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
