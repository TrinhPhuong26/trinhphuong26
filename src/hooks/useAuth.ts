import { useCallback, useEffect, useState } from "react";
import { UserRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import {
  STORAGE_KEYS,
  getStoredData,
  storeData,
  safeLocalStorage,
  isDataStale,
} from "@/lib/localStorage";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role: UserRole;
  avatarUrl?: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthError {
  error: string;
  message?: string;
  details?: Record<string, unknown>;
}

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatar?: File | null;
}

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: UpdateProfileData) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  deleteAvatar: () => Promise<void>;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<AuthError | null>(null);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check localStorage for cached user data first
      const cachedUser = getStoredData<User>(STORAGE_KEYS.USER_PROFILE);

      // Use cached data if it exists and is not stale (30 minutes)
      if (cachedUser && !isDataStale(cachedUser.timestamp)) {
        setUser(cachedUser.data);
        
        // Preload avatar if available from cache for faster rendering
        if (cachedUser.data?.avatarUrl) {
          const cachedAvatarKey = `avatar_cache_${cachedUser.data.id}`;
          try {
            // Save avatar URL in dedicated avatar cache
            safeLocalStorage.setItem(cachedAvatarKey, cachedUser.data.avatarUrl);
            
            // Preload avatar image to browser cache
            const img = new window.Image();
            img.src = cachedUser.data.avatarUrl;
          } catch (err) {
            console.error("Error preloading cached avatar:", err);
          }
        }
        
        setLoading(false);
        return;
      }

      // Thêm Cache-Control vào header để cải thiện hiệu suất
      const response = await fetch("/api/auth/me", {
        next: { revalidate: 300 }, // Revalidate every 5 minutes
        cache: "force-cache", // Sử dụng cơ chế cache của Next.js 
        headers: {
          "Cache-Control": "max-age=300", // Cache trong 5 phút
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);

        // Store user data in localStorage with timestamp
        storeData(STORAGE_KEYS.USER_PROFILE, data.user);
        
        // Preload and cache avatar if available
        if (data.user?.avatarUrl) {
          const cachedAvatarKey = `avatar_cache_${data.user.id}`;
          try {
            safeLocalStorage.setItem(cachedAvatarKey, data.user.avatarUrl);
            
            // Preload avatar image to browser cache
            const img = new window.Image();
            img.src = data.user.avatarUrl;
          } catch (err) {
            console.error("Error preloading avatar:", err);
          }
        }
      } else {
        setUser(null);
        // Clear stored data if no user is authenticated
        safeLocalStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
      }
    } catch (err) {
      console.error("Lỗi khi lấy thông tin người dùng:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError({ error: result.error, details: result.details });
        setLoading(false);
        return;
      }

      // Thay vì gọi login, ta sẽ trực tiếp đăng nhập với dữ liệu đã đăng ký
      // qua API login và xử lý chuyển trang
      const loginResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const loginResult = await loginResponse.json();

      if (!loginResponse.ok) {
        setError({ 
          error: loginResult.error, 
          message: loginResult.message,
          details: loginResult.details 
        });
        setLoading(false);
        return;
      }

      // Cập nhật state và localStorage
      setUser(loginResult.user);
      storeData(STORAGE_KEYS.USER_PROFILE, loginResult.user);

      // Chuyển trang sau khi đăng ký và đăng nhập thành công
      setTimeout(() => {
        window.location.href = "/resumes";
      }, 100);
    } catch (err) {
      console.error("Lỗi khi đăng ký:", err);
      setError({ error: "Có lỗi xảy ra khi đăng ký" });
      setLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError({ 
          error: result.error, 
          message: result.message,
          details: result.details 
        });
        setLoading(false);
        return;
      }

      // Lưu thông tin user vào state
      setUser(result.user);

      // Lưu thông tin user vào localStorage
      storeData(STORAGE_KEYS.USER_PROFILE, result.user);

      // Preload avatar image nếu có
      if (result.user?.avatarUrl) {
        try {
          const cachedAvatarKey = `avatar_cache_${result.user.id}`;
          safeLocalStorage.setItem(cachedAvatarKey, result.user.avatarUrl);
          
          // Preload image
          const img = new window.Image();
          img.src = result.user.avatarUrl;
        } catch (err) {
          console.error("Error preloading avatar:", err);
        }
      }

      // Lấy redirect URL từ query param nếu có
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('redirect');
      
      // Chọn URL đích dựa trên redirect param hoặc vai trò người dùng
      const targetUrl = redirectUrl || 
        (result.user.role === UserRole.ADMIN ? "/admin/dashboard" : "/resumes");
      
      // Đợi một khoảng thời gian ngắn để đảm bảo dữ liệu đã được lưu trữ
      // và giao diện đã được cập nhật trước khi chuyển trang
      setTimeout(() => {
        // Chuyển trang bằng window.location.href
        window.location.href = targetUrl;
      }, 100);
      
    } catch (err) {
      console.error("Lỗi khi đăng nhập:", err);
      setError({ error: "Có lỗi xảy ra khi đăng nhập" });
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);

      await fetch("/api/auth/logout", {
        method: "POST",
      });

      setUser(null);

      // Remove user data from localStorage on logout
      safeLocalStorage.removeItem(STORAGE_KEYS.USER_PROFILE);

      // Chuyển hướng về trang chủ
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Lỗi khi đăng xuất:", err);
      setError({ error: "Có lỗi xảy ra khi đăng xuất" });
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (data: UpdateProfileData) => {
    try {
      setLoading(true);
      setError(null);

      // Xử lý upload avatar nếu có
      let avatarUrl;
      if (data.avatar instanceof File) {
        const formData = new FormData();
        formData.append("avatar", data.avatar);

        const uploadResponse = await fetch("/api/auth/upload-avatar", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json();
          setError({ error: uploadError.error || "Lỗi khi tải lên avatar" });
          throw new Error("Lỗi khi tải lên avatar");
        }

        const uploadResult = await uploadResponse.json();
        avatarUrl = uploadResult.avatarUrl;
      }

      // Tạo body cập nhật profile
      const updateData: {
        firstName?: string;
        lastName?: string;
        phoneNumber?: string;
        avatarUrl?: string | null;
      } = {};
      
      // Chỉ thêm các trường có giá trị đã được cung cấp
      if (data.firstName !== undefined) updateData.firstName = data.firstName;
      if (data.lastName !== undefined) updateData.lastName = data.lastName;
      if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;
      
      // Chỉ thêm avatarUrl vào updateData khi:
      // 1. Đã upload ảnh mới (avatar là File)
      // 2. Hoặc người dùng đã chủ động xóa ảnh (avatar là null)
      if (data.avatar instanceof File && avatarUrl) {
        updateData.avatarUrl = avatarUrl;
      } else if (data.avatar === null) {
        updateData.avatarUrl = null;
      }
      // Nếu data.avatar là undefined, không thêm trường avatarUrl vào updateData, giữ nguyên avatar cũ

      const response = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        setError({ error: result.error, details: result.details });
        return;
      }

      // Cập nhật thông tin người dùng trong state và localStorage
      setUser((prevUser) => {
        const updatedUser = prevUser ? { ...prevUser, ...result.user } : null;

        // Update localStorage if user data was successfully updated
        if (updatedUser) {
          storeData(STORAGE_KEYS.USER_PROFILE, updatedUser);
        }

        return updatedUser;
      });
    } catch (err) {
      console.error("Lỗi khi cập nhật hồ sơ:", err);
      setError({ error: "Có lỗi xảy ra khi cập nhật hồ sơ" });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError({ error: result.error, details: result.details });
        throw new Error(result.error);
      }
    } catch (err) {
      console.error("Lỗi khi đổi mật khẩu:", err);
      setError({ error: "Có lỗi xảy ra khi đổi mật khẩu" });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAvatar = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/auth/delete-avatar", {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        setError({ error: result.error, details: result.details });
        return;
      }

      // Cập nhật thông tin người dùng trong state
      if (user) {
        const updatedUser = {
          ...user,
          avatarUrl: undefined
        };
        setUser(updatedUser);

        // Cập nhật localStorage
        storeData(STORAGE_KEYS.USER_PROFILE, updatedUser);
      }
    } catch (err) {
      console.error("Lỗi khi xóa avatar:", err);
      setError({ error: "Có lỗi xảy ra khi xóa avatar" });
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role === "ADMIN";
  const isAuthenticated = !!user;

  return {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateUserProfile,
    changePassword,
    deleteAvatar,
    isAdmin,
    isAuthenticated,
  };
}
