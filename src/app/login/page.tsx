"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuthContext } from "@/providers/AuthProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Key, Loader2, Eye, EyeOff, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
});

type LoginValues = z.infer<typeof loginSchema>;

// Các loại lỗi đăng nhập thường gặp và thông báo hữu ích cho người dùng
const LOGIN_ERROR_MESSAGES = {
  "Email hoặc mật khẩu không đúng": {
    title: "Đăng nhập thất bại",
    description: "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại thông tin đăng nhập.",
    icon: <AlertTriangle className="h-5 w-5 text-destructive" />,
  },
  "Tài khoản không tồn tại": {
    title: "Tài khoản không tồn tại",
    description: "Email này chưa được đăng ký. Vui lòng kiểm tra lại hoặc tạo tài khoản mới.",
    icon: <AlertTriangle className="h-5 w-5 text-destructive" />,
  },
  "Có lỗi xảy ra khi đăng nhập": {
    title: "Lỗi hệ thống",
    description: "Có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại sau.",
    icon: <AlertTriangle className="h-5 w-5 text-destructive" />,
  },
  "default": {
    title: "Đăng nhập thất bại",
    description: "Không thể đăng nhập vào hệ thống. Vui lòng thử lại sau.",
    icon: <AlertTriangle className="h-5 w-5 text-destructive" />,
  }
};

export default function LoginPage() {
  const { login, error, loading } = useAuthContext();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (error) {
      // Tìm thông báo lỗi phù hợp dựa trên mã lỗi
      const errorMessage = LOGIN_ERROR_MESSAGES[error.error as keyof typeof LOGIN_ERROR_MESSAGES] || 
                          LOGIN_ERROR_MESSAGES.default;
      
      // Sử dụng message từ API nếu có
      const description = error.message || errorMessage.description;
      
      // Hiển thị thông báo lỗi chi tiết với Sonner
      toast.error(errorMessage.title, {
        description: description,
        icon: errorMessage.icon,
        duration: 5000, // Hiển thị lâu hơn để người dùng có thể đọc
        position: "top-center",
      });
      
      // Tự động focus vào trường email để người dùng có thể nhập lại
      form.setFocus("email");
    }
  }, [error, form]);

  const onSubmit = async (values: LoginValues) => {
    await login(values);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl">Đăng nhập</CardTitle>
          <CardDescription>
            Nhập thông tin đăng nhập của bạn để truy cập tài khoản
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="flex items-center rounded-md border border-input ring-offset-background focus-within:ring-2 focus-within:ring-ring">
                        <Mail className="ml-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="email@example.com"
                          className="border-0 focus-visible:ring-0"
                          {...field}
                          disabled={loading}
                          autoComplete="email"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu</FormLabel>
                    <FormControl>
                      <div className="flex items-center rounded-md border border-input ring-offset-background focus-within:ring-2 focus-within:ring-ring">
                        <Key className="ml-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="******"
                          className="border-0 focus-visible:ring-0"
                          {...field}
                          disabled={loading}
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="mr-3 hover:text-primary"
                          aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                          disabled={loading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <div className="text-center text-sm">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Đăng ký
            </Link>
          </div>
          <Link
            href="/"
            className="text-center text-sm text-muted-foreground hover:underline"
          >
            Quay lại trang chủ
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
