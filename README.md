# Next.js 15 Quick CV

Build and deploy a professional **full-stack** application with the **ChatGPT API** for AI-powered resume building.

Features:

- Multi-step form using React Hook Form
- Dynamic form arrays with useFieldArray
- Drag-and-drop with dnd-kit
- AI auto-fill for all users
- Mobile responsive design with Tailwind CSS and Shadcn UI components
- Print or save as PDF using react-to-print
- URL state management
- Postgres DB and file uploads to Vercel Blob
- Auto-save hook
- & more

Watch the free **11-hour** tutorial on YouTube: https://www.youtube.com/watch?v=ySqesLjz6K0

![thumbnail](https://github.com/user-attachments/assets/f3eaef96-9674-4201-afeb-4deb3500ab6d)

## Cấu hình cơ sở dữ liệu

Dự án sử dụng Prisma ORM với PostgreSQL. Để thiết lập cơ sở dữ liệu:

1. Tạo file `.env` từ `.env.example` và cập nhật thông tin kết nối cơ sở dữ liệu.

2. Đồng bộ hóa Prisma schema với cơ sở dữ liệu:

```bash
# Đồng bộ hóa schema
npm run db:push

# Khởi chạy Prisma Studio để quản lý dữ liệu
npm run db:studio
```

3. (Tùy chọn) Để seed dữ liệu mẫu:

```bash
npm run seed
```

## Cấu hình Vercel Blob

Dự án sử dụng Vercel Blob để lưu trữ hình ảnh. Để thiết lập:

1. Cài đặt thư viện Vercel Blob:
```bash
npm install @vercel/blob
```

2. Cấu hình Vercel Blob trên dashboard Vercel:
   - Truy cập dự án của bạn trên Vercel Dashboard
   - Chọn tab "Storage"
   - Chọn "Connect Database" và chọn "Blob"
   - Tạo Blob store mới với tên "Images"
   - Chọn các môi trường cần sử dụng token (thường là "Production", "Preview", "Development")
   - Hoàn tất quá trình tạo

3. Sau khi tạo Blob store, Vercel sẽ tự động thêm biến môi trường `BLOB_READ_WRITE_TOKEN` vào dự án

4. Để sử dụng trong môi trường phát triển local, tải biến môi trường từ Vercel:
```bash
npx vercel env pull
```

## Phát triển

```bash
# Cài đặt dependencies
npm install

# Chạy môi trường phát triển
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem kết quả.

## Deployment

```bash
# Build cho production
npm run build:prod

# Start server production
npm run start
```

## Quản lý schema cơ sở dữ liệu

Dự án sử dụng `prisma db push` thay vì migrations để đơn giản hóa quy trình làm việc với cơ sở dữ liệu.

Khi cần thay đổi schema:

1. Chỉnh sửa file `prisma/schema.prisma`
2. Chạy lệnh `npm run db:push` để áp dụng thay đổi
3. Nếu có cảnh báo về mất dữ liệu, hãy sao lưu trước khi chấp nhận thay đổi

```bash
# Cho các thay đổi có thể gây mất dữ liệu
npx prisma db push --accept-data-loss
```
