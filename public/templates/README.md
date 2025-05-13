# Thư mục Template Images

Thư mục này chứa các hình ảnh mẫu cho các template CV. Để thêm hình ảnh mới, hãy làm theo các bước sau:

1. Đặt tên file theo định dạng: `[template_id].png` (ví dụ: `professional.png`, `creative.png`, `minimal.png`)
2. Đảm bảo hình ảnh có tỷ lệ 3:4 (tương tự như tỷ lệ của CV thực)
3. Khuyến nghị kích thước khoảng 300x400px để tối ưu hiệu suất tải trang
4. Định dạng hình ảnh nên là PNG hoặc JPEG

Các hình ảnh mẫu cần phản ánh đúng thiết kế và bố cục của template tương ứng để người dùng có thể hình dung được CV cuối cùng sẽ trông như thế nào.

## Phần kỹ thuật

Các hình ảnh này được sử dụng trong component `TemplatesDialog.tsx` để hiển thị danh sách template cho người dùng lựa chọn. Đường dẫn đến hình ảnh được xác định trong file `src/lib/templates.ts` thông qua thuộc tính `thumbnail` của mỗi template.
