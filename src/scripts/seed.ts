import { PrismaClient, UserRole } from "@prisma/client";
import { hashPassword } from "@/lib/auth";

const prisma = new PrismaClient();

async function main() {
  console.log("Bắt đầu seeding database...");

  // Tai khoan user admin mặc định
  const adminEmail = "admin@example.com";
  const adminPassword = "Trinhphuong123@";
  const hashedPassword = await hashPassword(adminPassword);

  // Kiểm tra xem admin đã tồn tại chưa
  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: adminEmail,
    },
  });

  if (!existingAdmin) {
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        role: UserRole.ADMIN,
      },
    });

    // console.log(`Đã tạo user admin: ${admin.email}`);
  } else {
    // console.log("User admin đã tồn tại, bỏ qua bước tạo admin.");
  }

  // Tạo user thường để test
  const userEmail = "user@example.com";
  const userPassword = "user123";
  const userHashedPassword = await hashPassword(userPassword);

  const existingUser = await prisma.user.findUnique({
    where: {
      email: userEmail,
    },
  });

  if (!existingUser) {
    const user = await prisma.user.create({
      data: {
        email: userEmail,
        password: userHashedPassword,
        firstName: "Regular",
        lastName: "User",
        role: UserRole.USER,
      },
    });

    // console.log(`Đã tạo user thường: ${user.email}`);
  } else {
    // console.log("User thường đã tồn tại, bỏ qua bước tạo user.");
  }

  // console.log("Seeding database hoàn tất!");
}

main()
  .catch((e) => {
    console.error("Lỗi trong quá trình seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
