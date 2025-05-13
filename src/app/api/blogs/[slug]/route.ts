import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Lấy chi tiết một blog công khai theo slug
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const slug = params.slug;

    // Lấy thông tin blog
    const blog = await prisma.blog.findUnique({
      where: {
        slug,
        published: true, // Chỉ lấy blog đã công khai
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
