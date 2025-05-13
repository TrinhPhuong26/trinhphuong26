import { NextRequest, NextResponse } from "next/server";
import { getAuthSession, comparePassword, hashPassword } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Quy tắc kiểm tra mật khẩu mạnh
const passwordRequirements = {
  minLength: (value: string) => value.length >= 6,
  hasUpperCase: (value: string) => /[A-Z]/.test(value),
  hasLowerCase: (value: string) => /[a-z]/.test(value),
  hasNumbers: (value: string) => /[0-9]/.test(value),
  hasSpecialChar: (value: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value),
};

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  newPassword: z
    .string()
    .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự")
    .refine(passwordRequirements.hasUpperCase, {
      message: "Mật khẩu phải có ít nhất 1 chữ cái hoa (A-Z)",
    })
    .refine(passwordRequirements.hasLowerCase, {
      message: "Mật khẩu phải có ít nhất 1 chữ cái thường (a-z)",
    })
    .refine(passwordRequirements.hasNumbers, {
      message: "Mật khẩu phải có ít nhất 1 số (0-9)",
    })
    .refine(passwordRequirements.hasSpecialChar, {
      message: "Mật khẩu phải có ít nhất 1 ký tự đặc biệt",
    }),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const body = await req.json();
    const result = changePasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: result.error.format() },
        { status: 400 },
      );
    }

    const { currentPassword, newPassword } = result.data;

    // Lấy thông tin người dùng hiện tại
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { password: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Không tìm thấy người dùng" },
        { status: 404 },
      );
    }

    // Kiểm tra mật khẩu hiện tại
    const isPasswordValid = await comparePassword(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Mật khẩu hiện tại không đúng" },
        { status: 400 },
      );
    }

    // Hash mật khẩu mới
    const hashedPassword = await hashPassword(newPassword);

    // Cập nhật mật khẩu mới
    await prisma.user.update({
      where: { id: session.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      message: "Đổi mật khẩu thành công",
    });
  } catch (error) {
    console.error("Lỗi khi đổi mật khẩu:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi đổi mật khẩu" },
      { status: 500 },
    );
  }
}
