import { NextResponse } from "next/server";
import { deleteAuthCookie } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Đăng xuất thành công",
  });

  // Xóa cookie xác thực
  await deleteAuthCookie(response);

  return response;
}
