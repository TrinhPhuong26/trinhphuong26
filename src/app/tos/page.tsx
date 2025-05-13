import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function Page() {
  return (
    <main className="prose dark:prose-invert mx-auto max-w-3xl px-3 py-6">
      <h1>Điều khoản dịch vụ</h1>
      <p>
        Chào mừng bạn đến với Quick CV! Các Điều khoản dịch vụ này (&quot;Điều
        khoản&quot;) điều chỉnh việc bạn sử dụng trang web và dịch vụ của chúng
        tôi. Bằng cách truy cập hoặc sử dụng trang web và dịch vụ của chúng tôi,
        bạn đồng ý bị ràng buộc bởi các Điều khoản này.
      </p>
      <h2 className="text-xl font-semibold">1. Định nghĩa</h2>
      <p>
        <strong>Dịch vụ:</strong> Nền tảng trang web Quick CV và các dịch vụ
        liên quan.
        <br />
        <strong>Người dùng:</strong> Bất kỳ cá nhân nào truy cập hoặc sử dụng
        Dịch vụ.
        <br />
        <strong>Nội dung:</strong> Bất kỳ thông tin, dữ liệu, văn bản hoặc tài
        liệu khác nào được tải lên, tạo ra hoặc truyền đi theo cách khác thông
        qua Dịch vụ.
      </p>
      <h2 className="text-xl font-semibold">2. Đăng ký tài khoản</h2>
      <p>
        Để sử dụng một số tính năng nhất định của Dịch vụ, bạn có thể cần phải
        đăng ký một tài khoản. Bạn đồng ý cung cấp thông tin chính xác và đầy đủ
        trong quá trình đăng ký và giữ thông tin đăng nhập tài khoản của bạn an
        toàn.
      </p>
      <h2 className="text-xl font-semibold">3. Hành vi của người dùng</h2>
      <p>
        Bạn đồng ý không sử dụng Dịch vụ cho bất kỳ mục đích bất hợp pháp nào
        hoặc theo bất kỳ cách nào có thể gây hư hỏng, vô hiệu hóa hoặc làm suy
        yếu Dịch vụ. Bạn hoàn toàn chịu trách nhiệm về mọi Nội dung mà bạn tải
        lên hoặc tạo ra thông qua Dịch vụ.
      </p>
      <h2 className="text-xl font-semibold">4. Tính năng dịch vụ</h2>
      <p>
        Quick CV cung cấp các công cụ để tạo sơ yếu lý lịch chuyên nghiệp với sự
        hỗ trợ của AI . Tất cả các tính năng đều khả dụng cho tất cả người dùng
        mà không có bất kỳ hạn chế nào.
      </p>
      <h2 className="text-xl font-semibold">5. Quyền riêng tư</h2>
      <p>
        Chúng tôi thu thập và xử lý thông tin cá nhân theo Chính sách quyền
        riêng tư của chúng tôi. Bằng cách sử dụng Dịch vụ, bạn đồng ý với việc
        chúng tôi thu thập và xử lý thông tin cá nhân của bạn như đã mô tả.
      </p>
      <h2 className="text-xl font-semibold">6. Sở hữu trí tuệ</h2>
      <p>
        Dịch vụ và nội dung, tính năng và chức năng của nó thuộc sở hữu của AI
        Resume Builder và được bảo vệ bởi bản quyền, nhãn hiệu và các luật sở
        hữu trí tuệ khác. Bạn vẫn giữ quyền sở hữu đối với bất kỳ Nội dung nào
        bạn tạo hoặc tải lên Dịch vụ.
      </p>
      <h2 className="text-xl font-semibold">7. Tuyên bố từ chối bảo hành</h2>
      <p>
        DỊCH VỤ ĐƯỢC CUNG CẤP &quot;THEO NGUYÊN TRẠNG&quot; VÀ &quot;THEO SẴN
        CÓ&quot; KHÔNG CÓ BẤT KỲ BẢO HÀNH NÀO, DÙ RÕ RÀNG HAY NGỤ Ý.
      </p>
      <h2 className="text-xl font-semibold">8. Giới hạn trách nhiệm pháp lý</h2>
      <p>
        TRONG MỌI TRƯỜNG HỢP, Quick CV SẼ KHÔNG CHỊU TRÁCH NHIỆM PHÁP LÝ ĐỐI VỚI
        BẤT KỲ THIỆT HẠI GIÁN TIẾP, NGẪU NHIÊN, ĐẶC BIỆT, HẬU QUẢ HOẶC TRỪNG
        PHẠT NÀO.
      </p>
      <h2 className="text-xl font-semibold">9. Thay đổi Điều khoản</h2>
      <p>
        Chúng tôi có quyền sửa đổi các Điều khoản này bất kỳ lúc nào. Việc bạn
        tiếp tục sử dụng Dịch vụ sau bất kỳ thay đổi nào như vậy cấu thành sự
        chấp nhận của bạn đối với các Điều khoản mới.
      </p>
      <h2 className="text-xl font-semibold">10. Thông tin liên hệ</h2>
      <p>
        Nếu bạn có bất kỳ câu hỏi nào về các Điều khoản này, vui lòng liên hệ
        với chúng tôi theo địa chỉ support@quickcv.com.
      </p>
      <p className="text-sm text-muted-foreground">
        Cập nhật lần cuối: 14 tháng 01 năm 2025
      </p>
    </main>
  );
}
