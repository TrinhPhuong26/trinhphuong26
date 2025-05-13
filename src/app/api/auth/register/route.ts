import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";

// Quy tắc kiểm tra mật khẩu mạnh
const passwordRequirements = {
  minLength: (value: string) => value.length >= 6,
  hasUpperCase: (value: string) => /[A-Z]/.test(value),
  hasLowerCase: (value: string) => /[a-z]/.test(value),
  hasNumbers: (value: string) => /[0-9]/.test(value),
  hasSpecialChar: (value: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value),
};

const registerSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
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
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate dữ liệu đầu vào
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: result.error.format() },
        { status: 400 },
      );
    }

    const { email, password, firstName, lastName } = result.data;

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
    const hashedPassword = await hashPassword(password);

    // Tạo người dùng mới
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: "USER", // Mặc định role là USER
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi đăng ký" },
      { status: 500 },
    );
  }
}
