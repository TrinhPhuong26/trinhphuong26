"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthContext } from "@/providers/AuthProvider";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle } from "lucide-react";

// Kiểm tra mật khẩu mạnh
const checkPasswordStrength = (password: string) => {
  const minLength = password.length >= 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  return {
    minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar,
    isStrong: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
  };
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUserProfile, deleteAvatar, changePassword } = useAuthContext();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStrength, setPasswordStrength] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumbers: false,
    hasSpecialChar: false,
    isStrong: false
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [user]);

  // Kiểm tra độ mạnh của mật khẩu khi người dùng nhập
  useEffect(() => {
    if (passwordData.newPassword) {
      setPasswordStrength(checkPasswordStrength(passwordData.newPassword));
    } else {
      setPasswordStrength({
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumbers: false,
        hasSpecialChar: false,
        isStrong: false
      });
    }
  }, [passwordData.newPassword]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Kiểm tra loại file
      if (!file.type.startsWith("image/")) {
        toast.error("File phải là hình ảnh");
        return;
      }

      // Kiểm tra kích thước file (tối đa 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Kích thước file không được vượt quá 2MB");
        return;
      }

      setAvatar(file);
      const objectUrl = URL.createObjectURL(file);
      setAvatarPreview(objectUrl);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user?.avatarUrl) {
      // Nếu chỉ đang xóa avatar trong preview
      setAvatar(null);
      setAvatarPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    try {
      setIsLoading(true);
      // Gọi API để xóa avatar
      await deleteAvatar();
      
      // Xóa avatar cục bộ
      setAvatar(null);
      setAvatarPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      toast.success("Đã xóa ảnh đại diện");
    } catch (error) {
      toast.error("Không thể xóa ảnh đại diện");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsLoading(true);
      // Chỉ gửi avatar khi có thực sự thay đổi avatar
      // Nếu avatarPreview tồn tại và avatarPreview khác với user.avatarUrl, hoặc người dùng xóa avatar
      const updateData: {
        firstName: string;
        lastName: string;
        phoneNumber: string;
        avatar?: File | null;
      } = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
      };

      // Chỉ thêm avatar vào dữ liệu cập nhật khi có thay đổi thực sự
      if (avatar !== null) {
        // Có thay đổi avatar (upload mới hoặc xóa)
        updateData.avatar = avatar;
      }

      await updateUserProfile(updateData);
      toast.success("Hồ sơ đã được cập nhật thành công");
    } catch (error) {
      toast.error("Không thể cập nhật hồ sơ");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Kiểm tra mật khẩu mới có đủ mạnh không
    if (!passwordStrength.isStrong) {
      toast.error("Mật khẩu mới không đáp ứng yêu cầu bảo mật");
      return;
    }
    
    // Kiểm tra mật khẩu xác nhận
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setIsChangingPassword(true);
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success("Đổi mật khẩu thành công");
      setPasswordDialogOpen(false);
      
      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error("Không thể đổi mật khẩu. Vui lòng kiểm tra mật khẩu hiện tại của bạn.");
      console.error(error);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Component hiển thị trạng thái yêu cầu mật khẩu
  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className="flex items-center gap-2">
      {met ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500" />
      )}
      <span className={met ? "text-green-700" : "text-muted-foreground"}>
        {text}
      </span>
    </div>
  );

  return (
    <div className="flex min-h-[calc(100vh-60px)] items-center justify-center">
      <div className="container max-w-3xl py-10">
        <h1 className="mb-6 text-center text-3xl font-bold">Hồ sơ của tôi</h1>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="mb-4 flex flex-col items-center gap-4">
                <div className="relative h-32 w-32">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Avatar preview"
                      fill
                      className="rounded-full object-cover"
                    />
                  ) : user?.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.email}
                      fill
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <Avatar className="h-32 w-32">
                      <AvatarFallback className="text-4xl">
                        {user?.firstName?.[0] || user?.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="avatar"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Chọn ảnh đại diện
                  </Button>
                  {(avatarPreview || user?.avatarUrl) && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleRemoveAvatar}
                    >
                      Xóa ảnh
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Ảnh PNG, JPG hoặc GIF (tối đa 2MB)
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Tên</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Họ</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Số điện thoại</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="Nhập số điện thoại của bạn"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="flex justify-center gap-4 pt-2">
                <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      type="button" 
                      variant="outline"
                      className="w-full max-w-[150px]"
                    >
                      Đổi mật khẩu
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Đổi mật khẩu</DialogTitle>
                      <DialogDescription>
                        Nhập mật khẩu hiện tại và mật khẩu mới của bạn.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Mật khẩu mới</Label>
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                        
                        <div className="mt-3 space-y-2 rounded-md border p-3">
                          <p className="text-sm font-medium">Mật khẩu phải:</p>
                          <div className="space-y-1 text-xs">
                            <PasswordRequirement 
                              met={passwordStrength.minLength} 
                              text="Có ít nhất 6 ký tự" 
                            />
                            <PasswordRequirement 
                              met={passwordStrength.hasLowerCase} 
                              text="Có ít nhất 1 chữ cái thường (a-z)" 
                            />
                            <PasswordRequirement 
                              met={passwordStrength.hasUpperCase} 
                              text="Có ít nhất 1 chữ cái hoa (A-Z)" 
                            />
                            <PasswordRequirement 
                              met={passwordStrength.hasNumbers} 
                              text="Có ít nhất 1 số (0-9)" 
                            />
                            <PasswordRequirement 
                              met={passwordStrength.hasSpecialChar} 
                              text="Có ít nhất 1 ký tự đặc biệt (!@#$...)" 
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                      </div>
                      <DialogFooter className="pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setPasswordDialogOpen(false)}
                        >
                          Hủy
                        </Button>
                        <Button
                          type="submit"
                          disabled={isChangingPassword || !passwordStrength.isStrong || 
                                    passwordData.newPassword !== passwordData.confirmPassword}
                        >
                          {isChangingPassword ? "Đang xử lý..." : "Lưu thay đổi"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="w-full max-w-[120px]"
                >
                  Quay lại
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full max-w-xs"
                >
                  {isLoading ? "Đang cập nhật..." : "Cập nhật hồ sơ"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
