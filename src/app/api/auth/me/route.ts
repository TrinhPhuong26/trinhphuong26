import { NextResponse } from "next/server";
import { getAuthSession, getUserById } from "@/lib/auth";

export async function GET() {
  try {
    // Lấy session từ cookie
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { 
        status: 401,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
        }
      });
    }

    // Lấy thông tin người dùng từ database
    const user = await getUserById(session.id);

    if (!user) {
      return NextResponse.json(
        { error: "Không tìm thấy người dùng" },
        { 
          status: 404,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
          }
        },
      );
    }

    // Return response with caching headers
    return NextResponse.json({ user }, {
      headers: {
        // Cache for 5 minutes to reduce database load
        'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
        // Allow cross-origin requests (useful for avatar loading)
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      }
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi lấy thông tin người dùng" },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
        }
      },
    );
  }
}
