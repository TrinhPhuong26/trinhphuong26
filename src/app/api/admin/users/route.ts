import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();

    // Kiểm tra quyền admin
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 },
      );
    }

    // Lấy query params
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";

    // Tính toán offset cho phân trang
    const skip = (page - 1) * limit;

    // Lấy danh sách người dùng với filter
    const whereClause: Prisma.UserWhereInput = search
      ? {
          OR: [
            { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
            {
              firstName: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              lastName: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        }
      : {};

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            resumes: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    });

    // Lấy tổng số người dùng để tính phân trang
    const totalUsers = await prisma.user.count({
      where: whereClause,
    });

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit),
        totalItems: totalUsers,
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi lấy danh sách người dùng" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();

    // Kiểm tra quyền admin
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 },
      );
    }

    // Lấy dữ liệu từ request body
    const { email, password, firstName, lastName, role } = await req.json();

    // Validate dữ liệu đầu vào
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email và mật khẩu là bắt buộc" },
        { status: 400 },
      );
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email đã được sử dụng" },
        { status: 400 },
      );
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        role: role || "USER",
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            resumes: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Tạo tài khoản thành công",
      user: newUser,
    });
  } catch (error) {
    console.error("Lỗi khi tạo tài khoản:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi tạo tài khoản" },
      { status: 500 },
    );
  }
}
