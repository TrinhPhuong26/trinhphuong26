import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { comparePassword, signToken, setAuthCookie } from "@/lib/auth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate dữ liệu đầu vào
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { 
          error: "Dữ liệu không hợp lệ", 
          details: result.error.format(),
          message: "Thông tin đăng nhập không hợp lệ. Vui lòng kiểm tra lại email và mật khẩu."
        },
        { status: 400 },
      );
    }

    const { email, password } = result.data;

    // Tìm người dùng theo email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Kiểm tra xem người dùng có tồn tại không
    if (!user) {
      return NextResponse.json(
        { 
          error: "Tài khoản không tồn tại", 
          message: "Email này chưa được đăng ký trong hệ thống. Vui lòng kiểm tra lại hoặc đăng ký tài khoản mới."
        },
        { status: 400 },
      );
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { 
          error: "Email hoặc mật khẩu không đúng",
          message: "Mật khẩu không chính xác. Vui lòng kiểm tra lại thông tin đăng nhập của bạn."
        },
        { status: 400 },
      );
    }

    // Tạo token JWT
    const token = await signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Tạo response với thông tin người dùng
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      message: "Đăng nhập thành công"
    });

    // Lưu token vào cookie
    await setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return NextResponse.json(
      { 
        error: "Có lỗi xảy ra khi đăng nhập", 
        message: "Có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại sau hoặc liên hệ hỗ trợ."
      },
      { status: 500 },
    );
  }
}
