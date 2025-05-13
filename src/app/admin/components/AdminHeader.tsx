"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthContext } from "@/providers/AuthProvider";
import { LogOut, User, Settings } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import Image from "next/image";

interface AdminHeaderProps {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    avatarUrl?: string | null;
  };
  loading?: boolean;
}

export default function AdminHeader({
  user,
  loading = false,
}: AdminHeaderProps) {
  const { logout } = useAuthContext();
  const router = useRouter();
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);

  // Preload user avatar as soon as user data is available
  useEffect(() => {
    if (user?.avatarUrl) {
      const img = new window.Image();
      img.src = user.avatarUrl;
      img.onload = () => setAvatarSrc(user.avatarUrl || null);
    } else {
      setAvatarSrc(null);
    }
  }, [user?.avatarUrl]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Tạo fallback text từ username
  const getFallbackText = () => {
    const firstInitial = user.firstName?.[0] || user.email[0].toUpperCase();
    const lastInitial = user.lastName?.[0] || "";
    return `${firstInitial}${lastInitial}`;
  };

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <h1 className="font-bold tracking-tight">
            <span className="hidden sm:inline">Quick CV</span> Admin
          </h1>
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {loading ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                  <Avatar className="h-8 w-8">
                    {avatarSrc ? (
                      <Image
                        src={avatarSrc}
                        alt={user.email}
                        fill
                        sizes="32px"
                        className="object-cover"
                        priority
                      />
                    ) : (
                    <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                        {getFallbackText()}
                    </AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">
                      {user.firstName
                        ? `${user.firstName} ${user.lastName || ""}`
                        : user.email.split("@")[0]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user.email}
                    </span>
                    <Badge
                      className="mt-1 w-fit text-[10px]"
                      variant={user.role === "ADMIN" ? "default" : "secondary"}
                    >
                      {user.role === "ADMIN" ? "Admin" : "User"}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/admin/profile"
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    <span>Hồ sơ của tôi</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/admin/settings"
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Cài đặt tài khoản</span>
                  </Link>
                </DropdownMenuItem>
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
          )}
        </div>
      </div>
    </header>
  );
}
