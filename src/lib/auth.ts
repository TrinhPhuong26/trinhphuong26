import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "./prisma";
import { UserRole } from "@prisma/client";
import bcryptjs from "bcryptjs";

export const COOKIE_NAME = "auth_token";
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_jwt_secret_you_must_change_this",
);
const TOKEN_EXPIRY = "24h";

export interface UserSession {
  id: string;
  email: string;
  role: UserRole;
}

// Hàm xử lý mật khẩu
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcryptjs.hash(password, saltRounds);
}

export async function comparePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcryptjs.compare(password, hashedPassword);
}

// Hàm xử lý token
export async function signToken(payload: UserSession): Promise<string> {
  const token = await new SignJWT({ sub: payload.id, ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(SECRET_KEY);

  return token;
}

export async function verifyToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return {
      id: payload.sub as string,
      email: payload.email as string,
      role: payload.role as UserRole,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}

// Hàm xử lý cookie
export async function setAuthCookie(
  response: NextResponse,
  token: string,
): Promise<void> {
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60, // 24 hours
  });
}

export async function getAuthSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  return verifyToken(token);
}

export async function deleteAuthCookie(response: NextResponse): Promise<void> {
  response.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

// Hàm truy vấn người dùng
export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}
