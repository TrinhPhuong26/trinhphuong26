import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  avatarUrl: z.string().nullable().optional(),
});

export async function PUT(req: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const body = await req.json();
    const result = updateProfileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: result.error.format() },
        { status: 400 },
      );
    }

    const { firstName, lastName, phoneNumber, avatarUrl } = result.data;

    // Tạo object data chỉ với các trường được cung cấp
    const updateData: {
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      avatarUrl?: string | null;
    } = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    // Cập nhật thông tin người dùng
    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json({
      user: updatedUser,
      message: "Cập nhật thông tin thành công",
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi cập nhật thông tin" },
      { status: 500 },
    );
  }
}
