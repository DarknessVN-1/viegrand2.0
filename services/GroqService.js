import Groq from "groq-sdk";

const GROQ_API_KEY = "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";
const groq = new Groq({ apiKey: GROQ_API_KEY });

export class GroqService {
  static systemPrompt = `
Bạn là trợ lý phân tích yêu cầu người dùng.
Phân tích và trả về một trong hai định dạng JSON dưới đây:

1. Nếu là LỆNH điều hướng hoặc hành động:
{
  "type": "command",
  "command": "<tên màn hình>",
  "action": "<hành động>",
  "confidence": 1.0
}

2. Nếu là CÂU HỎI hoặc TRÒ CHUYỆN:
{
  "type": "conversation", 
  "text": "<câu trả lời>"
}

CÁC MÀN HÌNH CỦA ỨNG DỤNG:
- ElderlyHome: màn hình chính
- Video: xem video
- Truyện: đọc truyện
- MiniGame: chơi game
- RadioScreen: nghe radio
- ExerciseSelection: tập thể dục

VÍ DỤ:
Input: "tôi muốn đọc truyện" 
Output: {"type": "command", "command": "Truyện", "action": "navigate", "confidence": 1.0}

Input: "tên bạn là gì"
Output: {"type": "conversation", "text": "Tôi là Viebot, trợ lý ảo của ứng dụng Viegrand."}

Input: "bạn có thể làm gì"
Output: {"type": "conversation", "text": "Tôi có thể giúp bạn xem video, đọc truyện, chơi game, nghe radio và tập thể dục. Bạn muốn làm gì?"}

CHÚ Ý: 
- LUÔN trả về JSON hợp lệ
- KHÔNG thêm text ngoài JSON
- KHÔNG thêm giải thích
- CHỈ trả về một trong hai định dạng trên`;

  static async analyzeCommand(text) {
    try {
      console.log('🔵 ==== START GROQ ANALYSIS ====');
      console.log('📝 Input:', text);

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: this.systemPrompt
          },
          {
            role: "user",
            content: text
          }
        ],
        model: "llama3-70b-8192",
        temperature: 0.1, // Reduced temperature for more consistent output
        max_tokens: 200,
        top_p: 0.9,
      });

      console.log('📡 Raw Groq Response:', JSON.stringify(chatCompletion, null, 2));

      if (!chatCompletion.choices?.[0]?.message?.content) {
        throw new Error('Invalid API response structure');
      }

      const rawContent = chatCompletion.choices[0].message.content.trim();
      console.log('📝 Raw content:', rawContent);

      try {
        const result = JSON.parse(rawContent);
        console.log('✨ Parsed Result:', JSON.stringify(result, null, 2));
        return result;
      } catch (parseError) {
        console.error('❌ JSON Parse error:', parseError);
        // If parsing fails, try to extract JSON from the string
        const jsonMatch = rawContent.match(/\{.*\}/s);
        if (jsonMatch) {
          const extractedJson = jsonMatch[0];
          console.log('🔍 Extracted JSON:', extractedJson);
          return JSON.parse(extractedJson);
        }
        throw parseError;
      }

    } catch (error) {
      console.error('❌ Groq API Error:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      return null;
    } finally {
      console.log('🔵 ==== END GROQ ANALYSIS ====');
    }
  }

  static async generateResponse(context) {
    try {
      console.log('🎯 Generating response for context:', context);

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: this.systemPrompt
          },
          {
            role: "user",
            content: `Tạo câu trả lời cho tình huống: ${JSON.stringify(context)}`
          }
        ],
        model: "llama3-70b-8192",
        temperature: 0.5,
        max_tokens: 300,
        top_p: 0.9,
      });

      const response = chatCompletion.choices[0]?.message?.content;
      console.log('📥 Generated Response:', response);
      
      return response || null;
    } catch (error) {
      console.error('❌ Response generation failed:', error);
      return null;
    }
  }

  static async handleGeneralChat(text) {
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "Bạn là Viebot - trợ lý ảo thân thiện. Hãy trả lời ngắn gọn, đơn giản và thân thiện."
          },
          {
            role: "user",
            content: text
          }
        ],
        model: "llama3-70b-8192",
        temperature: 0.7,
        max_tokens: 200,
      });

      return chatCompletion.choices[0]?.message?.content || 'Xin lỗi, tôi không hiểu. Bạn có thể nói rõ hơn được không?';
    } catch (error) {
      console.error('❌ Chat failed:', error);
      return 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.';
    }
  }

  static async cleanTranscription(text) {
    try {
      console.log('🧹 Cleaning transcription:', text);

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `Bạn là trợ lý xử lý văn bản. Hãy:
            1. Loại bỏ các từ nhiễu như "đang lận nghe", "đang lắng nghe"
            2. Sửa các lỗi chính tả nhẹ
            3. Trả về một câu hoàn chỉnh và rõ ràng
            4. KHÔNG thêm bất kỳ phân tích hay trả lời nào
            Chỉ trả về câu đã được làm sạch.`
          },
          {
            role: "user",
            content: text
          }
        ],
        model: "llama3-70b-8192",
        temperature: 0.3,
        max_tokens: 100
      });

      const cleanedText = chatCompletion.choices[0]?.message?.content;
      console.log('✨ Cleaned result:', cleanedText);
      
      return cleanedText;
    } catch (error) {
      console.error('❌ Text cleaning failed:', error);
      return text; // Return original text if cleaning fails
    }
  }
}
