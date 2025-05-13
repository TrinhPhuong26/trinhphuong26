import { getAuthSession, getUserById } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminClientLayout from "./components/AdminClientLayout";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();

  // Kiểm tra người dùng đã đăng nhập và có quyền admin
  if (!session) {
    redirect("/login");
  }

  if (session.role !== "ADMIN") {
    redirect("/");
  }

  // Lấy thông tin đầy đủ của người dùng
  const user = await getUserById(session.id);
  
  if (!user) {
    redirect("/login");
  }

  // Format user data for the header component
  const userData = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    // Use a type assertion to handle potential avatarUrl property
    avatarUrl: null // Safely provide null as the default since we don't know if avatarUrl exists
  };

  return (
    <AdminClientLayout user={userData}>
      {children}
    </AdminClientLayout>
  );
}
