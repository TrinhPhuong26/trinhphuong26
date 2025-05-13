import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// Validate dữ liệu đầu vào cho blog
const blogSchema = z.object({
  title: z.string().min(1, { message: "Tiêu đề không được để trống" }),
  content: z.string(),
  excerpt: z.string().optional(),
  thumbnail: z.string().nullish(),
  slug: z.string().min(1, { message: "Slug không được để trống" }),
  published: z.boolean().default(false),
});

// GET: Lấy danh sách tất cả các blog
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();

    // Kiểm tra quyền admin
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Lấy query params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    // Tính toán phân trang
    const skip = (page - 1) * limit;

    // Xây dựng điều kiện tìm kiếm
    const where: Prisma.BlogWhereInput = search
      ? {
          OR: [
            { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
            {
              content: { contains: search, mode: Prisma.QueryMode.insensitive },
            },
          ],
        }
      : {};

    // Lấy dữ liệu blog và tổng số bản ghi
    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              email: true,
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
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST: Tạo một blog mới
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();

    // Kiểm tra quyền admin
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Lấy dữ liệu từ request
    const body = await req.json();
    // console.log("Blog data received:", body);

    // Validate dữ liệu đầu vào
    const validationResult = blogSchema.safeParse(body);
    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error.format());
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.format() },
        { status: 400 },
      );
    }

    const { title, content, excerpt, thumbnail, slug, published } =
      validationResult.data;

    // Kiểm tra xem slug đã tồn tại chưa
    const existingBlog = await prisma.blog.findUnique({
      where: { slug },
    });

    if (existingBlog) {
      return NextResponse.json({ error: "Slug đã tồn tại" }, { status: 400 });
    }

    // Kiểm tra URL hình ảnh nếu có
    if (thumbnail && !isValidUrl(thumbnail)) {
      return NextResponse.json(
        { error: "URL hình ảnh không hợp lệ" },
        { status: 400 },
      );
    }

    try {
      // Tạo blog mới
      const newBlog = await prisma.blog.create({
        data: {
          title,
          content,
          excerpt: excerpt || null,
          thumbnail: thumbnail || null,
          slug,
          published,
          publishedAt: published ? new Date() : null,
          authorId: session.id,
        },
      });

      return NextResponse.json(newBlog, { status: 201 });
    } catch (dbError) {
      console.error("Database error creating blog:", dbError);
      return NextResponse.json(
        { error: "Lỗi cơ sở dữ liệu", details: String(dbError) },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error creating blog:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 },
    );
  }
}
// Hàm kiểm tra URL hợp lệ
function isValidUrl(urlString: string) {
  // Nếu là đường dẫn tương đối (bắt đầu bằng /)
  if (urlString.startsWith("/")) {
    return true;
  }

  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    return false;
  }
}
