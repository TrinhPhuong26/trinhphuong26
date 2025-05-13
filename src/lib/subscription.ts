// Đã đơn giản hóa để bỏ qua thanh toán
import { cache } from "react";

export type SubscriptionLevel = "free" | "pro" | "pro_plus";

export const getUserSubscriptionLevel = cache(
  async (): Promise<SubscriptionLevel> => {
    // Luôn trả về cấp độ cao nhất cho tất cả người dùng
    return "pro_plus";
  },
);
