"use client";

import ThemeToggle from "@/components/ThemeToggle";
import { useAuthContext } from "@/providers/AuthProvider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { STORAGE_KEYS, safeLocalStorage } from "@/lib/localStorage";
import { useAvatar } from "@/hooks/useAvatar";

export default function Navbar() {
  const { user, logout, isAdmin, loading } = useAuthContext();
  // Use the new useAvatar hook for optimal avatar loading
  const { avatarSrc, isLoading: isAvatarLoading } = useAvatar(
    user?.id, 
    user?.avatarUrl,
    { priority: true }
  );

  const handleLogout = async () => {
    await logout();
  };

  // Tạo fallback text từ username
  const getFallbackText = () => {
    if (!user) return "";
    if (user.firstName) return user.firstName[0].toUpperCase();
    return user.email[0].toUpperCase();
  };

  return (
    <header className="border-b">
      <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6 md:px-8 lg:px-24 xl:px-52">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Logo"
            width={50}
            height={50}
            className="rounded-full"
            priority
          />
          <span className="text-2xl font-bold tracking-tight text-[#7129be]">
            Quick CV
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />

          {loading ? (
            // Skeleton loader for avatar when loading
            <Skeleton className="h-10 w-10 rounded-full" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full p-0"
                >
                  <Avatar className="h-10 w-10">
                    {avatarSrc && !isAvatarLoading ? (
                      <Image
                        src={avatarSrc}
                      alt={user.email}
                        fill
                        sizes="40px"
                      className="object-cover"
                        priority
                        loading="eager"
                    />
                    ) : (
                    <AvatarFallback className="bg-primary text-primary-foreground">
                        {getFallbackText()}
                    </AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Hồ sơ</span>
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Quản trị</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-3">
              <Link
                href="/login"
                className="rounded-lg border px-4 py-2 font-medium text-[#7129be] shadow-lg"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-[#7129be] px-4 py-2 font-medium text-white shadow-lg hover:bg-[#5f21a5]"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
