/**
 * SpeechProcessor - Enhanced Vietnamese speech recognition and processing
 * Helps with voice command recognition in Vietnamese, handling accent issues
 */

// Common Vietnamese accent normalization map
const vietnameseAccentMap = {
  // Vowels with accents
  'ă': 'a', 'â': 'a', 'á': 'a', 'à': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
  'ắ': 'a', 'ằ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
  'ấ': 'a', 'ầ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
  'ê': 'e', 'é': 'e', 'è': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
  'ế': 'e', 'ề': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
  'ô': 'o', 'ơ': 'o', 'ó': 'o', 'ò': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
  'ố': 'o', 'ồ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
  'ớ': 'o', 'ờ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
  'ư': 'u', 'ú': 'u', 'ù': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
  'ứ': 'u', 'ừ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
  'í': 'i', 'ì': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
  'ý': 'y', 'ỳ': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
  'đ': 'd',
};

// Vietnamese common word corrections
const vietnameseCommonCorrections = {
  // Common word corrections
  'truyen': 'truyện',
  'truyn': 'truyện',
  'video': 'video',
  'bai tap': 'bài tập',
  'ba tap': 'bài tập',
  'tap': 'tập',
  'the duc': 'thể dục',
  't duc': 'thể dục',
  'mo': 'mở',
  'mo vao': 'mở',
  'tim': 'tìm',
  'tim kiem': 'tìm kiếm',
  'game': 'game',
  'tro choi': 'trò chơi',
  'tro gi': 'trò chơi',
  'thuoc': 'thuốc',
  'uong thuoc': 'uống thuốc',
  'trang chu': 'trang chủ',
  'camera': 'camera',
  'cho toi': 'cho tôi',
  'xin chao': 'xin chào',
  'xn chao': 'xin chào',
  'chao': 'chào',
};

// Common command patterns in Vietnamese with variations
const commandPatterns = {
  openScreen: [
    /mở|vào|đi đến|xem|hiển thị|chuyển đến|mở màn hình|mo|xem|vao|chuyen/i,
  ],
  searchVideo: [
    /tìm (kiếm)?\s*(video|phim|vđeo|vdeo|vdo|vidio)\s*(về|cho|liên quan đến|về chủ đề|v)?\s*(.*)/i,
    /kiếm\s*(video|phim|vđeo|vdeo|vdo|vidio)\s*(về|cho|liên quan đến|về chủ đề|v)?\s*(.*)/i,
    /tìm\s*(video|phim|vđeo|vdeo|vdo|vidio)/i,
  ],
  timeRelated: [
    /(mấy giờ|mấy h|ngày mấy|thứ mấy|ngày tháng|hôm nay|bay giờ|bây giờ)/i,
  ],
  greeting: [
    /(xin chào|chào bạn|hello|hi|hey|xinchao|chào|xchao)/i,
  ],
  askCapabilities: [
    /(có thể làm gì|làm được gì|giúp được gì|chức năng|kha năng|ung dung|app)/i,
  ],
};

// Common Vietnamese filler words to remove
const fillerWords = [
  'ơ', 'à', 'ờ', 'ừm', 'vậy thì', 'thế thì',
  'à mà', 'thì là', 'thì', 'vậy', 'ấy', 'đấy', 'thôi', 'nhé',
  'nhỉ', 'vậy nhỉ', 'đi', 'nào',
];

/**
 * Normalize a Vietnamese text by removing accents and handle common errors
 */
export const normalizeVietnameseText = (text) => {
  if (!text) return '';
  
  // Step 1: Convert to lowercase and trim
  let result = text.toLowerCase().trim();
  
  // Step 2: Remove common prefixes added by speech recognition
  result = result.replace(/đang lắng nghe|vui lòng/gi, '');
  
  // Step 3: Replace filler words
  fillerWords.forEach(word => {
    // Replace at the start of string
    const startPattern = new RegExp(`^${word}\\s+`, 'i');
    result = result.replace(startPattern, '');
    
    // Replace at the end of string
    const endPattern = new RegExp(`\\s+${word}$`, 'i');
    result = result.replace(endPattern, '');
  });
  
  // Step 4: Apply common corrections for Vietnamese words
  Object.entries(vietnameseCommonCorrections).forEach(([incorrect, correct]) => {
    const pattern = new RegExp(`\\b${incorrect}\\b`, 'gi');
    result = result.replace(pattern, correct);
  });
  
  // Step 5: Trim again and return
  return result.trim();
};

/**
 * Find command in a Vietnamese text
 * Returns the command type and details if found
 */
export const findCommand = (text) => {
  if (!text) return null;
  
  // Normalize the text first
  const normalizedText = normalizeVietnameseText(text);
  
  // Check for search video pattern
  const videoSearchMatch = normalizedText.match(commandPatterns.searchVideo[0]);
  if (videoSearchMatch && videoSearchMatch[4]) {
    return {
      type: 'videoSearch',
      query: videoSearchMatch[4].trim(),
      confidence: 0.9
    };
  }
  
  // Check for time-related queries
  if (commandPatterns.timeRelated[0].test(normalizedText)) {
    return {
      type: 'timeQuery',
      confidence: 0.9
    };
  }
  
  // Check if it's a greeting
  if (commandPatterns.greeting[0].test(normalizedText)) {
    return {
      type: 'greeting',
      confidence: 0.9
    };
  }
  
  // Check if asking about capabilities
  if (commandPatterns.askCapabilities[0].test(normalizedText)) {
    return {
      type: 'askCapabilities',
      confidence: 0.9
    };
  }
  
  // For other commands, return null for now
  return null;
};

export default {
  normalizeVietnameseText,
  findCommand
};
