"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Search,
  UserPlus,
  Loader2,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserRole } from "@prisma/client";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  role: UserRole;
  createdAt: string;
  _count: {
    resumes: number;
  };
}

interface PaginationData {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    totalPages: 0,
    totalItems: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  // Fetch users
  const fetchUsers = async (page = 1, search = searchTerm) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (search) {
        params.append("search", search);
      }

      interface UsersResponse {
        users: User[];
        pagination: PaginationData;
      }

      const data = await api.get<UsersResponse>(
        `/api/admin/users?${params.toString()}`,
      );
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải danh sách người dùng");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý thay đổi role
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await api.patch(`/api/admin/users/${userId}`, { role: newRole });

      // Cập nhật danh sách người dùng
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user,
        ),
      );

      toast.success("Cập nhật quyền thành công");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật quyền");
      console.error(error);
    }
  };

  // Xử lý xóa người dùng
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await api.delete(`/api/admin/users/${selectedUser.id}`);
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== selectedUser.id),
      );
      toast.success("Xóa người dùng thành công");
      setIsDeleteOpen(false);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa người dùng");
      console.error(error);
    }
  };

  // Xử lý tìm kiếm
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1, searchTerm);
  };

  // Xử lý phân trang
  const handlePageChange = (newPage: number) => {
    fetchUsers(newPage, searchTerm);
  };

  // Thêm xử lý tạo admin mới
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAdmin.email || !newAdmin.password) {
      toast.error("Email và mật khẩu là bắt buộc");
      return;
    }

    try {
      setIsCreatingAdmin(true);
      await api.post("/api/admin/users", {
        ...newAdmin,
        role: "ADMIN",
      });

      // Reset form và đóng dialog
      setNewAdmin({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
      });
      setIsAddAdminOpen(false);

      // Tải lại danh sách người dùng từ server thay vì cập nhật state trực tiếp
      fetchUsers(1);

      toast.success("Tạo tài khoản admin thành công");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi tạo tài khoản admin";

      toast.error(errorMessage);
      console.error(error);
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  // Xử lý chỉnh sửa thông tin người dùng
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) return;

    try {
      setIsEditing(true);
      await api.patch(`/api/admin/users/${selectedUser.id}`, editFormData);

      // Cập nhật danh sách người dùng
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === selectedUser.id
            ? {
                ...user,
                firstName: editFormData.firstName,
                lastName: editFormData.lastName,
                email: editFormData.email,
                phoneNumber: editFormData.phoneNumber,
              }
            : user,
        ),
      );

      setIsEditOpen(false);
      toast.success("Cập nhật thông tin người dùng thành công");
    } catch (error: unknown) {
      const errorMessage =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "error" in error.response.data
          ? String(error.response.data.error)
          : "Có lỗi xảy ra khi cập nhật thông tin";

      toast.error(errorMessage);
      console.error(error);
    } finally {
      setIsEditing(false);
    }
  };

  // Khởi tạo form chỉnh sửa với dữ liệu người dùng hiện tại
  const initEditForm = (user: User) => {
    setEditFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email,
      phoneNumber: user.phoneNumber || "",
    });
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Quản lý người dùng
        </h1>
        <Button
          size="sm"
          className="gap-1"
          onClick={() => setIsAddAdminOpen(true)}
        >
          <UserPlus className="h-4 w-4" />
          <span>Thêm tài khoản admin</span>
        </Button>
      </div>

      {/* Bộ lọc và tìm kiếm */}
      <div className="flex items-center gap-2">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm email, tên người dùng..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button type="submit" size="sm">
            Tìm kiếm
          </Button>
        </form>
      </div>

      {/* Bảng người dùng */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>CV đã tạo</TableHead>
              <TableHead>Quyền</TableHead>
              <TableHead className="w-[100px]">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Đang tải...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Không tìm thấy người dùng
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : "N/A"}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {format(new Date(user.createdAt), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>{user._count.resumes}</TableCell>
                  <TableCell>
                    <Select
                      defaultValue={user.role}
                      onValueChange={(value) =>
                        handleRoleChange(user.id, value as UserRole)
                      }
                    >
                      <SelectTrigger
                        className={cn(
                          "w-28 justify-center font-medium",
                          user.role === "ADMIN"
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                        )}
                      >
                        <SelectValue>
                          {user.role === "ADMIN" ? "Admin" : "User"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER" className="font-medium">
                          User
                        </SelectItem>
                        <SelectItem value="ADMIN" className="font-medium">
                          Admin
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <span className="sr-only">Thao tác</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDetailOpen(true);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          <span>Xem chi tiết</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => initEditForm(user)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Chỉnh sửa</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Xóa</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Phân trang */}
      {pagination.totalPages > 1 && (
        <Pagination className="mx-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(pagination.page - 1)}
                className={
                  pagination.page <= 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {Array.from(
              { length: Math.min(5, pagination.totalPages) },
              (_, i) => {
                const pageNumber = i + 1;
                return (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNumber)}
                      isActive={pagination.page === pageNumber}
                      className="cursor-pointer"
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              },
            )}

            {pagination.totalPages > 5 && (
              <>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    onClick={() => handlePageChange(pagination.totalPages)}
                    isActive={pagination.page === pagination.totalPages}
                    className="cursor-pointer"
                  >
                    {pagination.totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(pagination.page + 1)}
                className={
                  pagination.page >= pagination.totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Dialog xem chi tiết người dùng */}
      {selectedUser && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Chi tiết người dùng</DialogTitle>
              <DialogDescription>
                Thông tin chi tiết về người dùng
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium">ID:</span>
                <span className="col-span-2 text-sm">{selectedUser.id}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium">Email:</span>
                <span className="col-span-2 text-sm">{selectedUser.email}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium">Họ tên:</span>
                <span className="col-span-2 text-sm">
                  {selectedUser.firstName && selectedUser.lastName
                    ? `${selectedUser.firstName} ${selectedUser.lastName}`
                    : "Chưa cập nhật"}
                </span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium">Số điện thoại:</span>
                <span className="col-span-2 text-sm">
                  {selectedUser.phoneNumber || "Chưa cập nhật"}
                </span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium">Quyền:</span>
                <span className="col-span-2 text-sm">
                  {selectedUser.role === "ADMIN" ? "Admin" : "User"}
                </span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium">CV đã tạo:</span>
                <span className="col-span-2 text-sm">
                  {selectedUser._count.resumes}
                </span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium">Ngày tạo:</span>
                <span className="col-span-2 text-sm">
                  {format(
                    new Date(selectedUser.createdAt),
                    "dd/MM/yyyy HH:mm:ss",
                  )}
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsDetailOpen(false)}>Đóng</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog xác nhận xóa người dùng */}
      {selectedUser && (
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Xác nhận xóa người dùng
              </AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa người dùng{" "}
                <strong>{selectedUser.email}</strong>? Hành động này không thể
                hoàn tác và sẽ xóa tất cả dữ liệu của người dùng này, bao gồm
                tất cả CV đã tạo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Dialog thêm admin mới */}
      <Dialog open={isAddAdminOpen} onOpenChange={setIsAddAdminOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm tài khoản admin mới</DialogTitle>
            <DialogDescription>
              Điền thông tin để tạo tài khoản admin mới
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddAdmin} className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                className="col-span-3"
                value={newAdmin.email}
                onChange={(e) =>
                  setNewAdmin({ ...newAdmin, email: e.target.value })
                }
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Mật khẩu <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="col-span-3"
                value={newAdmin.password}
                onChange={(e) =>
                  setNewAdmin({ ...newAdmin, password: e.target.value })
                }
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="text-right">
                Họ
              </Label>
              <Input
                id="firstName"
                placeholder="Nguyễn"
                className="col-span-3"
                value={newAdmin.firstName}
                onChange={(e) =>
                  setNewAdmin({ ...newAdmin, firstName: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="text-right">
                Tên
              </Label>
              <Input
                id="lastName"
                placeholder="Văn A"
                className="col-span-3"
                value={newAdmin.lastName}
                onChange={(e) =>
                  setNewAdmin({ ...newAdmin, lastName: e.target.value })
                }
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddAdminOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isCreatingAdmin}>
                {isCreatingAdmin ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  "Tạo tài khoản admin"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog chỉnh sửa thông tin người dùng */}
      {selectedUser && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa thông tin người dùng</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin cho người dùng {selectedUser.email}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditUser} className="space-y-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  className="col-span-3"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-firstName" className="text-right">
                  Họ
                </Label>
                <Input
                  id="edit-firstName"
                  className="col-span-3"
                  value={editFormData.firstName}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      firstName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-lastName" className="text-right">
                  Tên
                </Label>
                <Input
                  id="edit-lastName"
                  className="col-span-3"
                  value={editFormData.lastName}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      lastName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-phoneNumber" className="text-right">
                  Số điện thoại
                </Label>
                <Input
                  id="edit-phoneNumber"
                  type="tel"
                  className="col-span-3"
                  value={editFormData.phoneNumber}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      phoneNumber: e.target.value,
                    })
                  }
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isEditing}>
                  {isEditing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang cập nhật...
                    </>
                  ) : (
                    "Lưu thay đổi"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
