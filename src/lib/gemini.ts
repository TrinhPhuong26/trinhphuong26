import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/env";

// Khởi tạo Gemini API
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

// Hàm phát hiện ngôn ngữ từ văn bản người dùng nhập
export async function detectLanguage(text: string): Promise<string> {
  try {
    if (!text || text.trim().length < 5) return "en"; // Mặc định là tiếng Anh nếu text quá ngắn
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Identify the language of this text and respond with ONLY the ISO language code (e.g., "en" for English, "vi" for Vietnamese, etc.) without ANY additional text:
    
    "${text}"`;

    const result = await model.generateContent(prompt);
    const langCode = result.response.text().trim().toLowerCase();
    
    // Chấp nhận một số định dạng phổ biến và chuẩn hóa
    if (langCode.includes("vi") || langCode.includes("viet")) return "vi";
    if (langCode.includes("en") || langCode.includes("eng")) return "en";
    
    return langCode.substring(0, 2); // Lấy 2 ký tự đầu tiên làm mã ngôn ngữ chuẩn
  } catch (error) {
    console.error("Lỗi khi phát hiện ngôn ngữ:", error);
    return "en"; // Mặc định là tiếng Anh nếu có lỗi
  }
}

// Tạo hàm tương thích với giao diện của OpenAI
export const geminiModel = {
  chat: {
    completions: {
      create: async ({
        messages,
        model,
        language,
      }: {
        messages: { role: string; content: string }[];
        model: string;
        language?: string;
      }) => {
        try {
          // Lấy model Gemini thích hợp (gemini-1.5-pro hoặc gemini-1.5-flash)
          const usedModel =
            model === "gpt-4o-mini" ? "gemini-1.5-flash" : "gemini-1.5-pro";
          const geminiModel = genAI.getGenerativeModel({ model: usedModel });

          // Tìm tin nhắn từ người dùng để phát hiện ngôn ngữ
          const userMessage = messages.find(msg => msg.role === "user")?.content || "";
          
          // Phát hiện ngôn ngữ nếu không có tham số language
          const detectedLang = language || await detectLanguage(userMessage);
          
          // Nếu là tin nhắn hệ thống, thêm hướng dẫn về ngôn ngữ
          const systemMessage = messages.find(msg => msg.role === "system");
          if (systemMessage) {
            if (detectedLang === "vi") {
              systemMessage.content = `${systemMessage.content}\nHãy phản hồi bằng tiếng Việt. Đảm bảo nội dung chuyên nghiệp và phù hợp với văn hóa Việt Nam.`;
            } else {
              systemMessage.content = `${systemMessage.content}\nPlease respond in ${detectedLang === "en" ? "English" : `the same language as the user's input (detected as: ${detectedLang})`}.`;
            }
          }

          // Chuyển đổi định dạng tin nhắn từ OpenAI sang Gemini
          const prompt = messages
            .map((msg) => {
              const role = msg.role === "system" ? "user" : msg.role;
              return `${role}: ${msg.content}`;
            })
            .join("\n\n");

          // Gọi API Gemini
          const result = await geminiModel.generateContent(prompt);
          const response = result.response.text();

          // Trả về định dạng tương tự như OpenAI để không phải thay đổi code nhiều
          return {
            choices: [
              {
                message: {
                  content: response,
                },
              },
            ],
          };
        } catch (error) {
          console.error("Gemini API error:", error);
          throw error;
        }
      },
    },
  },
};

export default geminiModel;
