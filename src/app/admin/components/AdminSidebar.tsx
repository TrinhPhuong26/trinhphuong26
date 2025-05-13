"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut,
  FileText,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, createContext, useContext } from "react";
import { useAuthContext } from "@/providers/AuthProvider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Tạo context để thông báo trạng thái sidebar
export const SidebarContext = createContext({
  isCollapsed: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setIsCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

const navItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Quản lý người dùng",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Quản lý Blog",
    href: "/admin/blogs",
    icon: FileText,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useAuthContext();
  const router = useRouter();

  // Emit trạng thái sidebar ra bên ngoài thông qua localStorage
  useEffect(() => {
    localStorage.setItem("admin-sidebar-collapsed", String(isCollapsed));
    // Trigger custom event để layout có thể lắng nghe
    const event = new CustomEvent("sidebar-collapse-changed", {
      detail: { isCollapsed },
    });
    document.dispatchEvent(event);
  }, [isCollapsed]);

  // Khôi phục trạng thái sidebar từ localStorage khi component mount
  useEffect(() => {
    const savedState = localStorage.getItem("admin-sidebar-collapsed");
    if (savedState !== null) {
      setIsCollapsed(savedState === "true");
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-10 flex h-screen flex-col border-r bg-background transition-all duration-300",
        isCollapsed ? "w-[70px]" : "w-[250px]",
      )}
    >
      <div className="flex h-16 items-center justify-center gap-2 border-b">
        {!isCollapsed && (
          <>
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="relative h-8 w-8">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="text-lg font-semibold">Admin Panel</span>
            </Link>
          </>
        )}
        {isCollapsed && (
          <Link
            href="/admin/dashboard"
            className="flex items-center justify-center"
          >
            <div className="relative h-8 w-8">
              <Image
                src="/logo.png"
                alt="Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
          </Link>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-20 z-10 h-8 w-8 rounded-full border bg-background"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
      <nav className="flex-1 space-y-1 p-2 pt-4">
        <TooltipProvider>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "flex w-full justify-start",
                      isCollapsed ? "px-2" : "px-4",
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon
                        className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")}
                      />
                      {!isCollapsed && <span>{item.title}</span>}
                    </Link>
                  </Button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">{item.title}</TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </nav>
      <div className="border-t p-2">
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "flex w-full justify-start text-destructive hover:text-destructive",
                  isCollapsed ? "px-2" : "px-4",
                )}
                onClick={handleLogout}
              >
                <LogOut
                  className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")}
                />
                {!isCollapsed && <span>Đăng xuất</span>}
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">Đăng xuất</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
