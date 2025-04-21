import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { GroqService } from './GroqService';
import { Platform } from 'react-native'; // Add this import

const API_KEY = "05a0abc5b742480f83e14f63361461f7";
const ASSEMBLY_AI_ENDPOINT = "https://api.assemblyai.com/v2/transcript";

export class VoiceControlService {
  static commands = {
    // Navigation commands - Expanded to cover all screens
    "trang chủ": "ElderlyHome",
    "về trang chủ": "ElderlyHome",
    "màn hình chính": "ElderlyHome",
    "trang chủ người cao tuổi": "ElderlyHome",
    "trang chủ người thân": "RelativeHome", 
    "người thân": "RelativeHome",
    "trở về": "goBack",
    "quay lại": "goBack",
    "trở lại": "goBack",

    // Main feature navigation
    "tính năng": "Features",
    "giải trí": "Entertainment",
    "cài đặt": "Settings",
    "thuốc": "Medication",
    "thuốc men": "Medication",
    "lịch uống thuốc": "Medication",
    "camera": "Camera",
    "camera giám sát": "Camera",
    "thêm camera": "AddCamera",  

    // Premium features
    "nâng cấp": "Premium",
    "premium": "Premium",
    "gói premium": "Premium",
    "chi tiết gói": "PlanDetail",
    "thanh toán": "Payment",
    
    // Account & Settings
    "đổi mật khẩu": "ChangePassword",
    "mật khẩu": "ChangePassword",
    "sinh trắc học": "Biometrics",
    "vân tay": "Biometrics",
    "face id": "Biometrics",
    "về ứng dụng": "About",
    "thông tin ứng dụng": "About",
    "trợ giúp": "Support",
    "hỗ trợ": "Support",
    "câu hỏi thường gặp": "FAQ",
    "hướng dẫn": "UserGuide",
    "hướng dẫn sử dụng": "UserGuide",
    "đăng xuất": "logout",
    
    // Video player commands
    "phát": "play",
    "dừng": "pause", 
    "tạm dừng": "pause",
    "tiếp tục": "play",
    "to lên": "volumeUp",
    "nhỏ xuống": "volumeDown",
    "tắt tiếng": "mute",
    "bật tiếng": "unmute",
    
    // Stories commands
    "chương trước": "previousChapter",
    "chương sau": "nextChapter",
    "chương tiếp": "nextChapter",
    "tăng cỡ chữ": "increaseFontSize",
    "giảm cỡ chữ": "decreaseFontSize",
    "chế độ tối": "darkMode",
    "chế độ sáng": "lightMode",

    // General commands
    "làm mới": "refresh",
    "tìm kiếm": "search",
    "đóng": "close",
    "thoát": "close",

    // Entertainment navigation commands
    "mở video": "Video",
    "xem video": "Video",
    "video": "Video",
    
    "mở truyện": "Truyện",
    "đọc truyện": "Truyện",
    "truyện": "Truyện",
    "thêm truyện": "AddStory",
    
    "chơi game": "MiniGame",
    "mini game": "MiniGame",
    "game": "MiniGame",
    
    "nghe radio": "RadioScreen",
    "radio": "RadioScreen",
    
    "tập thể dục": "ExerciseSelection",
    "thể dục": "ExerciseSelection",
    "bài tập": "ExerciseSelection",
    "danh sách khóa học": "CourseListScreen",
    "khóa học": "CourseListScreen",

    // Specific game commands
    "chơi sudoku": "Sudoku",
    "sudoku": "Sudoku",
    
    "chơi cờ": "MemoryCard",
    "trò chơi trí nhớ": "MemoryCard",
    "thẻ bài": "MemoryCard",
    "bài thẻ": "MemoryCard",
    
    "xếp số": "NumberPuzzle",
    "trò chơi xếp số": "NumberPuzzle",
    "số": "NumberPuzzle",
  };

  static intentMap = {
    // Intent đọc truyện - Enhanced with more natural phrases
    readStory: [
      'đọc truyện', 'xem truyện', 'mở truyện', 'vào truyện',
      'muốn đọc', 'đọc sách', 'xem sách', 'đi đọc', 
      'cho tôi đọc', 'tôi muốn đọc', 'đọc cho tôi',
      'đọc một chút', 'đọc cái gì đó', 'tìm truyện',
      'có truyện gì hay', 'truyện hay', 'đọc truyện hay'
    ],

    // Intent xem video - Enhanced with more phrases
    watchVideo: [
      'xem video', 'mở video', 'phát video', 'cho xem video',
      'muốn xem', 'xem phim', 'coi video', 'coi phim',
      'có video nào hay', 'phim hay', 'video vui',
      'video giải trí', 'video hài', 'video thư giãn',
      'tìm video', 'kiếm video', 'mở phim', 'xem clip'
    ],

    // Intent chơi game - Enhanced
    playGame: [
      'chơi game', 'mở game', 'vào game', 'chơi trò chơi',
      'muốn chơi', 'chơi gì đó', 'giải trí', 'chơi trò gì',
      'chơi sudoku', 'chơi xếp số', 'chơi trí nhớ',
      'chơi bài', 'chơi một chút', 'có game nào hay',
      'trò chơi vui', 'mini game', 'game giải trí'
    ],

    // Intent nghe radio - Enhanced
    listenRadio: [
      'nghe radio', 'mở radio', 'bật radio', 'phát radio',
      'nghe đài', 'mở đài', 'bật đài', 'radio',
      'nghe tin tức', 'nghe nhạc radio', 'radio giải trí',
      'đài phát thanh', 'kênh radio', 'đài radio'
    ],

    // Intent tập thể dục - Enhanced
    exercise: [
      'tập thể dục',
      'tôi muốn tập thể dục',
      'cho tôi tập thể dục',
      'muốn tập thể dục',
      'tập luyện',
      'tôi muốn tập luyện',
      'bài tập',
      'vào bài tập',
      'tập gym',
      'tập thể thao',
      'tập thể hình',
      'vận động',
      'tập thể dục buổi sáng',
      'tập thể dục nhẹ nhàng',
      'động tác thể dục',
      'các bài tập',
      'luyện tập',
      'thể dục thể thao'
    ],
    
    // Intent medication - New
    medication: [
      'thuốc', 'uống thuốc', 'lịch uống thuốc', 'nhắc uống thuốc',
      'quản lý thuốc', 'thuốc men', 'đơn thuốc', 'lịch trình thuốc',
      'thuốc hàng ngày', 'nhắc nhở thuốc', 'giờ uống thuốc',
      'xem lịch uống thuốc', 'kiểm tra thuốc', 'thuốc của tôi'
    ],
    
    // Intent camera - New
    camera: [
      'camera', 'xem camera', 'giám sát', 'camera giám sát',
      'theo dõi camera', 'kiểm tra camera', 'quan sát',
      'camera an ninh', 'thêm camera', 'camera mới',
      'camera nhà', 'hệ thống camera', 'thiết bị giám sát'
    ],
    
    // Intent settings - New
    settings: [
      'cài đặt', 'thiết lập', 'tùy chọn', 'tùy chỉnh',
      'cài đặt ứng dụng', 'thay đổi cài đặt', 'cấu hình',
      'tùy biến', 'thông số', 'đổi cài đặt',
      'xem cài đặt', 'vào cài đặt', 'quản lý cài đặt'
    ]
  };

  static assistantIntents = {
    // Lời chào
    greetings: [
      'xin chào', 'chào bạn', 'hey', 'hi', 'hello',
      'chào buổi sáng', 'chào buổi chiều', 'chào buổi tối'
    ],

    // Hỏi thăm
    howAreYou: [
      'khỏe không', 'thế nào', 'có khỏe không',
      'dạo này thế nào', 'tình hình thế nào'
    ],

    // Hỏi tên
    askName: [
      'tên gì', 'tên bạn là gì', 'bạn tên là gì',
      'cho mình hỏi tên', 'bạn là ai'
    ],

    // Hỏi chức năng
    askFeatures: [
      'có thể làm gì', 'làm được gì', 'chức năng',
      'giúp được gì', 'hướng dẫn', 'trợ giúp'
    ],

    // Khen ngợi
    compliment: [
      'giỏi quá', 'tốt lắm', 'hay quá', 'thông minh thật',
      'cảm ơn', 'thank you', 'thanks'
    ],

    // Tạm biệt 
    goodbye: [
      'tạm biệt', 'bye', 'goodbye', 'hẹn gặp lại',
      'chào tạm biệt', 'gặp lại sau'
    ],

    // Hướng dẫn chi tiết
    tutorialGeneral: [
      'hướng dẫn sử dụng', 'cách sử dụng', 'dùng như thế nào',
      'cách dùng', 'hướng dẫn cơ bản', 'cần giúp đỡ'
    ],

    tutorialVideo: [
      'hướng dẫn xem video', 'cách xem video', 'video như thế nào',
      'xem phim thế nào', 'cách điều khiển video'
    ],

    tutorialStory: [
      'hướng dẫn đọc truyện', 'cách đọc truyện', 'đọc sách thế nào',
      'cách lật trang', 'điều chỉnh cỡ chữ'
    ],

    tutorialGames: [
      'hướng dẫn chơi game', 'cách chơi game', 'chơi thế nào',
      'luật chơi', 'quy tắc chơi', 'cách điều khiển game'
    ],

    tutorialExercise: [
      'hướng dẫn tập', 'cách tập', 'tập thế nào',
      'bài tập ra sao', 'hướng dẫn động tác'
    ],

    // Tìm kiếm và gợi ý
    suggestions: [
      'có gì hay', 'gợi ý', 'đề xuất', 'recommendation',
      'nên xem gì', 'nên đọc gì', 'nên chơi gì'
    ],

    // Thông tin thời tiết
    weather: [
      'thời tiết', 'thời tiết hôm nay', 'nhiệt độ',
      'trời thế nào', 'có mưa không'
    ],

    // Tin tức
    news: [
      'tin tức', 'tin mới', 'tin thời sự', 'tin trong ngày',
      'có tin gì mới'
    ],

    // Sức khỏe
    health: [
      'tư vấn sức khỏe', 'khám bệnh', 'triệu chứng',
      'cách chăm sóc', 'dinh dưỡng', 'chế độ ăn'
    ],

    // Giải trí
    entertainment: [
      'giải trí gì', 'làm gì bây giờ', 'chán quá',
      'buồn chán', 'có trò gì vui'
    ],

    // Động viên tinh thần
    motivation: [
      'mệt quá', 'chán quá', 'buồn quá', 'khó khăn quá',
      'không làm được', 'thất vọng'
    ]
  };

  static assistantResponses = {
    greetings: [
      'Xin chào! Tôi có thể giúp gì cho bạn?',
      'Chào bạn! Rất vui được gặp bạn.',
      'Xin chào! Bạn cần giúp đỡ gì không?',
      'Chào! Tôi là trợ lý ảo. Rất vui khi được trò chuyện với bạn.',
      'Xin chào! Hôm nay tôi có thể giúp gì cho bạn nhỉ?',
      'Chào bạn! Bạn đang muốn làm gì?'
    ],

    howAreYou: [
      'Cảm ơn bạn, tôi luôn sẵn sàng phục vụ!',
      'Tôi khỏe, cảm ơn bạn đã hỏi thăm.',
      'Tôi rất tốt và sẵn sàng giúp đỡ bạn.',
      'Cảm ơn bạn đã hỏi thăm, tôi luôn ở trạng thái hoạt động tốt. Còn bạn thì sao?',
      'Tôi luôn trong tình trạng tốt để hỗ trợ bạn. Bạn muốn làm gì hôm nay?',
      'Tôi khỏe lắm! Tôi luôn vui khi được trò chuyện với bạn!'
    ],

    askName: [
      'Tôi là trợ lý ảo viebot, rất vui được gặp bạn!',
      'Bạn có thể gọi tôi là viebot.',
      'Tên tôi là viebot, tôi là trợ lý giọng nói của bạn.',
      'Tôi là trợ lý ảo được tạo ra để giúp đỡ bạn trong việc sử dụng ứng dụng này.',
      'Tôi là Viebot, trợ lý ảo thông minh! Rất vui được làm quen với bạn.',
      'Tôi là Viebot, được thiết kế để giúp người cao tuổi sử dụng ứng dụng dễ dàng hơn.'
    ],

    askFeatures: [
      'Tôi có thể giúp bạn điều hướng ứng dụng, phát video, đọc truyện, nghe radio và nhiều thứ khác.',
      'Tôi có thể giúp bạn: Xem video, đọc truyện, chơi game, nghe radio và tập thể dục. Bạn muốn thử cái nào?',
      'Hãy thử nói "mở video", "đọc truyện", "chơi game", "nghe radio" hoặc "tập thể dục".',
      'Tôi có thể giúp bạn di chuyển giữa các màn hình, tìm kiếm nội dung, và sử dụng các tính năng của ứng dụng. Bạn muốn làm gì?',
      'Tôi có nhiều tính năng hữu ích! Từ quản lý thuốc men, xem video giải trí, đọc truyện, chơi game rèn luyện trí nhớ đến tập thể dục. Hãy thử nói "mở tính năng..." bạn muốn!',
      'Tôi có thể giúp bạn điều khiển ứng dụng bằng giọng nói để bạn không cần chạm vào màn hình. Bạn muốn truy cập tính năng nào?'
    ],

    compliment: [
      'Cảm ơn bạn! Tôi rất vui khi giúp được bạn.',
      'Rất vui vì bạn hài lòng! Tôi sẽ cố gắng hơn nữa.',
      'Cảm ơn lời khen của bạn!',
      'Cảm ơn bạn rất nhiều! Tôi luôn cố gắng hỗ trợ tốt nhất.',
      'Rất vui khi biết bạn thích tương tác với tôi!',
      'Tôi rất vui khi nghe điều đó. Có gì khác tôi có thể giúp bạn không?'
    ],

    goodbye: [
      'Tạm biệt bạn! Hẹn gặp lại.',
      'Chào tạm biệt! Chúc bạn một ngày tốt lành.',
      'Goodbye! Rất vui được giúp đỡ bạn.',
      'Tạm biệt! Khi nào cần giúp đỡ, hãy gọi tôi nhé!',
      'Hẹn gặp lại bạn sớm! Chúc bạn có một ngày tuyệt vời!',
      'Tạm biệt! Tôi sẽ luôn ở đây khi bạn cần.'
    ],
    
    weather: [
      'Để tra cứu thời tiết, bạn có thể vào phần "Thông tin" trong ứng dụng. Hiện tại, tôi không có khả năng kết nối trực tiếp đến dịch vụ thời tiết.',
      'Tôi không thể kiểm tra thời tiết trực tiếp, nhưng tôi có thể giúp bạn tìm video về dự báo thời tiết hôm nay. Bạn có muốn xem không?',
      'Rất tiếc, tôi không thể cung cấp thông tin thời tiết. Nhưng tôi có thể giúp bạn mở các tính năng khác trong ứng dụng.'
    ],
    
    timeDate: [
      'Hôm nay là ' + new Date().toLocaleDateString('vi-VN', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'}) + ', thời gian hiện tại là ' + new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}),
      'Bây giờ là ' + new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) + ' ngày ' + new Date().toLocaleDateString('vi-VN'),
      'Thời gian hiện tại là ' + new Date().toLocaleTimeString('vi-VN') + ' ngày ' + new Date().toLocaleDateString('vi-VN')
    ],
    
    jokes: [
      'Bác sĩ hỏi bệnh nhân: "Ông có uống rượu không?" Bệnh nhân: "Thưa bác sĩ, có!" "Thuốc lá?" "Có ạ!" "Cà phê?" "Dạ có!" "Thức khuya?" "Có luôn!" "Ông có biết tất cả những thứ đó giết ông dần dần không?" "Thưa bác sĩ, tôi không vội đâu ạ!"',
      'Hai người bạn gặp nhau. Một người hỏi: "Dạo này bạn làm gì?" Người kia trả lời: "Mình làm cố vấn cho một công ty lớn" "Công ty nào thế?" "Công ty điện lực đấy, mỗi tối mình đều cố vấn họ xem có nên cúp điện hay không!"',
      'Có một anh đi xem bói. Thầy bói xem xong và nói: "Số anh không có vợ". Anh kia kinh ngạc hỏi: "Tại sao?" Thầy bói: "Vì anh là phụ nữ!"',
      'Trong lớp học, cô giáo hỏi: "Nếu có 5 con chim đậu trên cây và bạn bắn hạ 2 con, còn lại bao nhiêu con?" Học sinh giơ tay: "Thưa cô, còn lại 0 con ạ!" Cô giáo: "Sao lại 0 con?" Học sinh: "Vì những con còn lại sẽ bay đi hết sau khi nghe tiếng súng ạ!"'
    ],
    
    healthWellness: [
      'Để giữ gìn sức khỏe tốt ở tuổi cao, hãy duy trì chế độ ăn cân bằng, tập thể dục nhẹ nhàng đều đặn và uống đủ nước. Bạn muốn xem một số bài tập thể dục nhẹ nhàng trong ứng dụng của chúng tôi không?',
      'Sức khỏe tốt bắt đầu từ những thói quen nhỏ: ăn nhiều rau củ quả, đi bộ 30 phút mỗi ngày, ngủ đủ 7-8 giờ, và duy trì các mối quan hệ xã hội tích cực. Bạn có muốn tôi mở phần tập thể dục không?',
      'Một số lời khuyên cho sức khỏe tốt: Hãy kiểm tra sức khỏe định kỳ, uống thuốc đúng giờ, tập thể dục đều đặn và giữ tinh thần lạc quan. Bạn có thể sử dụng tính năng "Thuốc" trong ứng dụng để quản lý lịch uống thuốc.'
    ],
    
    memory: [
      'Để cải thiện trí nhớ, bạn nên chơi các trò chơi rèn luyện não bộ, học những điều mới, đọc sách và duy trì các hoạt động xã hội. Tôi có thể mở phần trò chơi trí nhớ cho bạn ngay bây giờ!',
      'Trí nhớ giảm sút là điều bình thường khi tuổi cao, nhưng bạn có thể làm chậm quá trình này với các hoạt động kích thích trí não. Ứng dụng của chúng tôi có các trò chơi như Sudoku và Memory Card giúp rèn luyện trí nhớ.',
      'Để giữ trí nhớ tốt, hãy tập trung khi cần ghi nhớ, tạo các mối liên kết, ghi chép và duy trì thói quen luyện trí não. Bạn muốn thử chơi game Sudoku không?'
    ],
    
    lifeAdvice: [
      'Cuộc sống là một hành trình, không phải đích đến. Hãy sống trọn vẹn từng khoảnh khắc và đừng ngừng học hỏi những điều mới mẻ, dù ở bất kỳ độ tuổi nào.',
      'Tuổi tác chỉ là con số. Điều quan trọng là giữ tinh thần lạc quan, duy trì các mối quan hệ xã hội và không ngừng khám phá những điều mới mẻ trong cuộc sống.',
      'Trong cuộc sống, đôi khi chúng ta cần dừng lại, nghỉ ngơi và ngắm nhìn những điều đẹp đẽ xung quanh. Hãy trân trọng những điều nhỏ nhặt mỗi ngày.'
    ],
    
    entertainment: [
      'Bạn có thể thử những hoạt động giải trí sau trong ứng dụng của chúng tôi: Xem video, đọc truyện, nghe radio, chơi game trí nhớ hoặc tham gia các bài tập thể dục nhẹ nhàng. Bạn muốn thử gì trước?',
      'Để giải trí, ứng dụng này có nhiều tính năng thú vị như: Video với nhiều thể loại khác nhau, truyện đọc với font chữ lớn, các trò chơi rèn luyện trí nhớ và nhiều nội dung khác. Bạn thích gì nhất?',
      'Trong thời gian rảnh, bạn có thể thư giãn với những video hài hước, đọc truyện hay, chơi các trò chơi nhẹ nhàng rèn luyện trí nhớ, hoặc nghe radio. Bạn muốn tôi mở tính năng nào?'
    ],
    
    unknown: [
      'Xin lỗi, tôi không hiểu yêu cầu của bạn. Bạn có thể nói rõ hơn được không?',
      'Tôi chưa hiểu ý bạn. Bạn có thể diễn đạt theo cách khác không?',
      'Tôi không chắc mình hiểu đúng ý bạn. Bạn cần giúp đỡ về điều gì?',
      'Xin lỗi, tôi không hiểu. Bạn có thể thử hỏi cách khác được không?',
      'Tôi không thể hiểu yêu cầu đó. Bạn có thể giải thích rõ hơn?'
    ],
    
    // Hướng dẫn chi tiết về các tính năng
    tutorialVideo: [
      'Để xem video, hãy vào mục Video từ màn hình Giải trí. Tại đây, bạn có thể chọn một video từ danh sách hoặc tìm kiếm bằng cách nói "Tìm video về..." và chủ đề bạn muốn.',
      'Khi đang xem video, bạn có thể sử dụng các lệnh giọng nói như "phát", "tạm dừng", "to lên", "nhỏ xuống" để điều khiển. Bạn muốn xem thể loại video nào?'
    ],
    
    tutorialStory: [
      'Để đọc truyện, hãy vào mục Truyện từ màn hình Giải trí. Bạn có thể điều chỉnh cỡ chữ bằng cách nói "tăng cỡ chữ" hoặc "giảm cỡ chữ", và chuyển chương bằng cách nói "chương tiếp" hoặc "chương trước".',
      'Khi đọc truyện, bạn có thể chuyển sang chế độ nền tối bằng cách nói "chế độ tối" để dễ đọc hơn trong điều kiện ánh sáng yếu. Bạn muốn đọc thể loại truyện nào?'
    ],
    
    tutorialGame: [
      'Ứng dụng có nhiều trò chơi giúp rèn luyện trí nhớ và tư duy. Bạn có thể chơi Sudoku, Xếp hình, hoặc Trò chơi trí nhớ. Hãy vào mục MiniGame từ màn hình Giải trí để bắt đầu.',
      'Các trò chơi được thiết kế phù hợp cho người cao tuổi, với giao diện đơn giản và dễ sử dụng. Bạn muốn thử trò chơi nào?'
    ],
    
    medication: [
      'Tính năng Thuốc giúp bạn quản lý lịch uống thuốc. Bạn có thể thêm thuốc mới, đặt lời nhắc, và xem lịch sử uống thuốc. Bạn muốn tôi mở tính năng này không?',
      'Để không quên uống thuốc, hãy sử dụng tính năng Thuốc trong ứng dụng. Tôi có thể giúp bạn thiết lập lời nhắc uống thuốc đúng giờ.',
      'Quản lý thuốc là rất quan trọng. Ứng dụng này có thể giúp bạn theo dõi việc uống thuốc và nhắc nhở khi đến giờ. Bạn muốn thiết lập lịch uống thuốc không?'
    ],
    
    exerciseTutorial: [
      'Để bắt đầu tập thể dục, hãy vào mục Thể dục từ màn hình Giải trí. Có nhiều bài tập nhẹ nhàng phù hợp với người cao tuổi như duỗi cơ, yoga đơn giản và các bài tập cải thiện thăng bằng.',
      'Các bài tập được thiết kế đặc biệt cho người cao tuổi, với hướng dẫn chi tiết và dễ theo dõi. Bạn nên bắt đầu với các bài tập nhẹ nhàng trước khi chuyển sang các bài tập phức tạp hơn.',
      'Trước khi tập, hãy đảm bảo không gian xung quanh bạn an toàn và thoáng. Luôn có một chiếc ghế gần đó để đỡ nếu cần. Nếu cảm thấy không thoải mái, hãy dừng lại ngay.'
    ],
    
    cameraHelp: [
      'Tính năng Camera giúp người thân có thể quan sát để đảm bảo an toàn cho bạn. Bạn có thể xem video trực tiếp từ các camera được cài đặt trong nhà.',
      'Camera giám sát giúp người thân có thể nhanh chóng phát hiện nếu có vấn đề xảy ra. Tất cả dữ liệu đều được bảo mật và chỉ những người được ủy quyền mới có thể xem.',
      'Để thêm camera mới, người thân của bạn cần vào mục Camera, sau đó nhấn nút "Thêm camera". Quá trình cài đặt rất đơn giản và có hướng dẫn chi tiết.'
    ]
  };

  static getRandomResponse(type) {
    const responses = this.assistantResponses[type] || this.assistantResponses.unknown;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  static async handleAssistantResponse(text) {
    if (!text) return null;
    
    try {
      // Clean text and remove unwanted phrases
      const cleanedText = text
        .toLowerCase()
        .trim()
        .replace(/[!?.,]/g, '')
        .replace(/đang lận nghe|đang lắng nghe|vui lòng/gi, '')
        .replace(/^\s*xin\s+chào\s*$/i, 'xin chào')
        .trim();

      console.log('🎤 Processing:', cleanedText);
      
      // Fix: Use direct call to analyzeIntent function instead of this.analyzeIntent
      const analysis = VoiceControlService.analyzeIntent(cleanedText);
      console.log('🧠 Phân tích ý định:', analysis);
      
      if (analysis) {
        // Xử lý lệnh
        if (analysis.type === 'command' && analysis.value) {
          console.log('⚙️ Thực hiện lệnh:', analysis.value);
          
          // Đọc thông báo thực hiện lệnh
          const response = `Đang mở ${analysis.value}`;
          this.speak(response);
          
          return {
            type: 'command',
            value: { screen: analysis.value },
            response: response,
            spoken: true  // Đánh dấu đã phát âm
          };
        }
        
        // Xử lý câu hỏi về khả năng
        if (analysis.type === 'question' && analysis.action === 'capabilities') {
          console.log('❓ Trả lời câu hỏi về khả năng');
          const response = this.getRandomResponse('askFeatures');
          this.speak(response);
          
          return {
            type: 'conversation',
            intent: 'askFeatures',
            response: response,
            spoken: true
          };
        }
        
        // Xử lý hội thoại thông thường
        if (analysis.type === 'conversation') {
          const response = this.getRandomResponse(analysis.intent || 'unknown');
          this.speak(response);
          
          return {
            type: 'conversation',
            intent: analysis.intent || 'unknown',
            response: response,
            spoken: true
          };
        }
      }
      
      // Nếu không phân tích được, thử dùng Groq
      console.log('🤖 Sử dụng Groq AI');
      const aiAnalysis = await GroqService.analyzeCommand(cleanedText);
      
      if (aiAnalysis?.command) {
        const response = await this.handleAIResponse(aiAnalysis);
        if (response) return response;
      }
      
      // Cuối cùng thử tìm lệnh trực tiếp
      const command = this.parseCommand(cleanedText);
      if (command) {
        return {
          type: 'command',
          value: typeof command === 'string' ? { screen: command } : command,
          response: 'Đang thực hiện lệnh của bạn...'
        };
      }
      
      // Nếu tất cả đều thất bại, trả về unknown
      const unknownResponse = this.getRandomResponse('unknown');
      return {
        type: 'unknown',
        response: unknownResponse,
        spoken: false
      };
    } catch (error) {
      console.error('❌ Error:', error);
      const errorResponse = 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.';
      return {
        type: 'error',
        response: errorResponse,
        spoken: false
      };
    }
  }

  static async handleAIResponse(analysis) {
    if (!analysis) return null;

    try {
      console.log('🔍 Processing AI analysis:', analysis);
      
      // Don't generate AI response for greetings
      if (analysis.intent === 'greet') {
        const response = this.getRandomResponse('greetings');
        return {
          type: 'conversation',
          intent: 'greet',
          response
        };
      }

      // Generate AI response
      try {
        const aiResponse = await GroqService.generateResponse({
          intent: analysis.intent,
          command: analysis.command,
          action: analysis.action,
          confidence: analysis.confidence,
          requires_clarification: analysis.requires_clarification
        });

        console.log('💬 AI Generated Response:', aiResponse);
        
        // Clean up AI response if it's in JSON format
        let cleanResponse = aiResponse;
        if (typeof aiResponse === 'string' && (aiResponse.startsWith('Input:') || aiResponse.includes('Output:'))) {
          cleanResponse = "Tôi hiểu yêu cầu của bạn. Đang xử lý...";
        }

        // Handle high confidence commands
        if (analysis.command && analysis.confidence > 0.5) {
          return {
            type: 'command',
            value: { screen: analysis.command }, // Use proper object format
            action: analysis.action,
            response: cleanResponse
          };
        }

        // Handle clarification needed
        if (analysis.requires_clarification) {
          return {
            type: 'clarification',
            intent: analysis.intent,
            response: cleanResponse || analysis.suggested_response || "Bạn có thể nói rõ hơn không?"
          };
        }

        // Handle general conversation
        return {
          type: 'conversation',
          intent: analysis.intent,
          response: cleanResponse || analysis.suggested_response || "Tôi hiểu rồi."
        };
      } catch (aiError) {
        console.error('❌ AI response generation error:', aiError);
        // Provide a friendly fallback response instead of error
        return {
          type: 'conversation',
          intent: 'fallback',
          response: "Tôi đã hiểu yêu cầu của bạn, nhưng đang gặp vấn đề khi xử lý. Hãy thử lại sau nhé."
        };
      }
    } catch (error) {
      console.error('❌ Error handling AI response:', error);
      return {
        type: 'conversation',
        intent: 'error',
        response: "Xin lỗi, tôi không thể xử lý yêu cầu lúc này. Hãy thử lại."
      };
    }
  }

  static async handleLocalParsing(text, isFallback = false) {
    if (!text) return null;
    
    try {
      const cleanedText = text
        .toLowerCase()
        .trim()
        .replace(/đâm lặng nghe|đang lắng nghe|xin chào|vui lòng/gi, '')
        .trim();

      console.log('🎤 Processing text (fallback? ' + isFallback + '):', cleanedText);

      // Kiểm tra câu hỏi về khả năng trước
      if (cleanedText.includes('bạn có thể làm gì') || 
          cleanedText.includes('có thể làm gì') ||
          cleanedText.includes('giúp được gì')) {
        console.log('❓ Capabilities question detected');
        const response = this.getRandomResponse('askFeatures');
        return {
          type: 'conversation',
          intent: 'askFeatures',
          response: response
        };
      }

      // Step 1: Try Groq AI analysis
      const analysis = await GroqService.analyzeCommand(cleanedText);
      console.log('🤖 AI Analysis result:', analysis);

      if (analysis) {
        // High confidence direct command
        if (analysis.command && analysis.confidence > 0.8) {
          console.log('✅ High confidence command detected:', analysis.command);
          
          // Get AI response
          const aiResponse = await GroqService.generateResponse({
            command: analysis.command,
            action: analysis.action,
            intent: analysis.intent,
            confidence: analysis.confidence
          });

          return {
            type: 'command',
            value: analysis.command,
            action: analysis.action,
            response: aiResponse || analysis.suggested_response
          };
        }

        // Need clarification
        if (analysis.requires_clarification) {
          console.log('❓ Clarification needed');
          return {
            type: 'clarification',
            intent: analysis.intent,
            response: analysis.suggested_response
          };
        }

        // General conversation
        if (analysis.intent === 'chat' || analysis.intent === 'greet') {
          console.log('💬 Conversation detected');
          return {
            type: 'conversation',
            intent: analysis.intent,
            response: analysis.suggested_response
          };
        }
      }

      // Step 2: Fallback to regular command parsing
      if (!isFallback) {
        console.log('⚡ Trying regular command parsing');
        const command = this.parseCommand(cleanedText);
        
        if (command) {
          return {
            type: 'command',
            value: typeof command === 'string' ? { screen: command } : command,
            response: 'Đang thực hiện lệnh của bạn...'
          };
        }
      }

      // Step 3: Check conversation intents
      for (const [intent, patterns] of Object.entries(this.assistantIntents)) {
        if (patterns.some(pattern => cleanedText.includes(pattern))) {
          const response = this.getRandomResponse(intent);
          return {
            type: 'conversation',
            intent: intent,
            response: response
          };
        }
      }

      // Final fallback
      if (!isFallback) {
        console.log('❌ No matching intent or command found, speak unknown');
        const unknownResponse = this.getRandomResponse('unknown');
        return {
          type: 'unknown',
          response: unknownResponse
        };
      } else {
        console.log('❌ No matching intent or command found, but skipping unknown response in fallback');
        return {
          type: 'unknown',
          response: null
        };
      }

    } catch (error) {
      console.error('❌ AI processing error:', error);
      const errorResponse = 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.';
      return {
        type: 'error',
        response: errorResponse
      };
    }
  }

  static async handleBasicConversation(text) {
    // Handle greetings
    if (this.assistantIntents.greetings.some(greeting => text.includes(greeting))) {
      const response = this.getRandomResponse('greetings');
      return {
        type: 'conversation',
        intent: 'greet',
        response: response
      };
    }

    // Handle name questions
    if (text.includes('tên là gì') || text.includes('tên gì') || text.includes('bạn là ai')) {
      const response = this.getRandomResponse('askName');
      return {
        type: 'conversation',
        intent: 'askName',
        response: response
      };
    }

    // Handle capability questions
    if (text.includes('có thể làm gì') || text.includes('giúp được gì')) {
      const response = this.getRandomResponse('askFeatures');
      return {
        type: 'conversation',
        intent: 'askFeatures',
        response: response
      };
    }

    // Handle health questions
    if (text.includes('khỏe không') || text.includes('thế nào')) {
      const response = this.getRandomResponse('howAreYou');
      return {
        type: 'conversation',
        intent: 'howAreYou',
        response: response
      };
    }

    // Handle thanks/compliments
    if (text.includes('cảm ơn') || text.includes('giỏi quá') || text.includes('tốt lắm')) {
      const response = this.getRandomResponse('compliment');
      return {
        type: 'conversation',
        intent: 'compliment',
        response: response
      };
    }

    return null;
  }

  static executeCommand(analysis) {
    const { command, action, parameters } = analysis;
    // Thực hiện lệnh dựa trên kết quả phân tích
    // Trả về kết quả thực hiện
    return {
      success: true,
      command,
      action,
      parameters
    };
  }

  static async startRecording() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      
      return recording;
    } catch (err) {
      console.error('Failed to start recording', err);
      throw err;
    }
  }

  static async stopRecording(recording) {
    try {
      await recording.stopAndUnloadAsync();
      return recording.getURI();
    } catch (err) {
      console.error('Failed to stop recording', err);
      throw err;
    }
  }

  static async transcribeAudio(audioUri) {
    try {
      console.log('Starting transcription with audio file:', audioUri);
      
      const MAX_QUEUE_TIME = 15000; // 15 seconds max for queued status
      const MAX_ATTEMPTS = 20;
      const POLLING_INTERVAL = 2000;
      
      // Add timeout for fetch requests
      const fetchWithTimeout = async (url, options, timeout = 10000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        const startTime = Date.now();
        
        try {
          const response = await fetch(url, {
            ...options,
            signal: controller.signal
          });
          clearTimeout(id);
          return response;
        } catch (error) {
          clearTimeout(id);
          const duration = Date.now() - startTime;
          console.log(`Request duration: ${duration}ms before ${error.name}`);
          throw error;
        }
      };

      // Upload audio file
      const uploadResponse = await fetchWithTimeout(
        'https://api.assemblyai.com/v2/upload',
        {
          method: 'POST',
          headers: { 'authorization': API_KEY },
          body: await (async () => {
            const response = await fetch(audioUri);
            const blob = await response.blob();
            return blob;
          })()
        },
        15000 // 15s timeout for upload
      );

      const uploadData = await uploadResponse.json();
      if (!uploadData.upload_url) {
        throw new Error('Upload failed: No upload URL received');
      }

      // Submit transcription request
      const transcriptResponse = await fetchWithTimeout(
        ASSEMBLY_AI_ENDPOINT,
        {
          method: 'POST',
          headers: {
            'authorization': API_KEY,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            audio_url: uploadData.upload_url,
            language_code: 'vi',
            webhook_url: null // Disable webhooks
          })
        },
        10000
      );

      const transcriptData = await transcriptResponse.json();
      if (!transcriptData.id) {
        throw new Error('Transcription request failed: No ID received');
      }

      console.log('Transcription request submitted:', transcriptData.id);

      // Poll for results with queue timeout
      let attempts = 0;
      let queueStartTime = null;

      while (attempts < MAX_ATTEMPTS) {
        try {
          const result = await fetchWithTimeout(
            `${ASSEMBLY_AI_ENDPOINT}/${transcriptData.id}`,
            { headers: { 'authorization': API_KEY } },
            5000
          );
          
          if (!result.ok) {
            throw new Error(`Polling failed with status: ${result.status}`);
          }

          const transcription = await result.json();
          console.log(`Polling attempt ${attempts + 1}/${MAX_ATTEMPTS}, status:`, transcription.status);
          
          switch (transcription.status) {
            case 'completed':
              if (!transcription.text) {
                throw new Error('No transcription text received');
              }
              const cleanedText = transcription.text
                .replace(/[!?.,]/g, '')
                .replace(/đang lặng nghe|đang lắng nghe|vui lòng/gi, '')
                .replace(/^\s*xin\s+chào\s*$/i, 'xin chào')
                .trim();
              
              return cleanedText || transcription.text;
              
            case 'error':
              throw new Error(`Transcription error: ${transcription.error}`);
              
            case 'queued':
              if (!queueStartTime) {
                queueStartTime = Date.now();
              } else if (Date.now() - queueStartTime > MAX_QUEUE_TIME) {
                throw new Error('Queue timeout exceeded');
              }
              break;
              
            case 'processing':
              queueStartTime = null; // Reset queue timer if processing starts
              break;
          }

          attempts++;
          await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
          
        } catch (error) {
          console.error(`Polling attempt ${attempts + 1} failed:`, error);
          
          if (error.message.includes('Queue timeout')) {
            throw new Error('Transcription queued for too long, please try again');
          }
          
          if (error.name === 'AbortError') {
            throw new Error('Network timeout');
          }
          
          attempts++;
          await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
        }
      }
      
      throw new Error('Maximum polling attempts reached');
      
    } catch (err) {
      console.error('Transcription failed:', err);
      // Thông báo người dùng
      let userMessage = 'Xin lỗi, không thể nhận dạng giọng nói.';
      
      if (err.message.includes('Queue timeout')) {
        userMessage = 'Hệ thống đang bận, vui lòng thử lại sau.';
      } else if (err.message.includes('Network timeout')) {
        userMessage = 'Kết nối không ổn định, vui lòng thử lại.';
      } else if (err.message.includes('Maximum polling')) {
        userMessage = 'Quá thời gian xử lý, vui lòng thử lại.';
      }
      
      throw err;
    }
  }

  static keywordMap = {
    // Từ khóa điều hướng
    "về": "goBack",
    "trở về": "goBack", 
    "quay lại": "goBack",
    "trang chủ": "ElderlyHome",
    "tính năng": "Features",
    "giải trí": "Entertainment",
    "cài đặt": "Settings",

    // Từ khóa chức năng giải trí
    "truyện": "Truyện",
    "đọc truyện": "Truyện",
    "video": "Video", 
    "xem video": "Video",
    "game": "MiniGame",
    "chơi game": "MiniGame",
    "radio": "RadioScreen",
    "nghe radio": "RadioScreen",
    "thể dục": "ExerciseSelection",
    "tập thể dục": "ExerciseSelection",

    // Từ khóa điều khiển media
    "phát": "play",
    "dừng": "pause", 
    "tạm dừng": "pause",
    "tiếp tục": "play",
    "to lên": "volumeUp",
    "nhỏ xuống": "volumeDown",
    "tắt tiếng": "mute",
    "bật tiếng": "unmute",
  };

  static parseCommand(text) {
    if (!text) return null;
    const normalizedText = text.toLowerCase().trim();
    console.log('🔍 Parsing command:', normalizedText);

    // Handle direct navigation commands first
    const navigationCommand = this.getNavigationCommand(normalizedText);
    if (navigationCommand) {
      return navigationCommand;
    }

    // Check for capabilities question
    if (normalizedText.includes('bạn có thể làm gì') || 
        normalizedText.includes('có thể làm gì') ||
        normalizedText.includes('giúp được gì')) {
      console.log('❓ Capabilities question detected');
      // Return null to let handleAssistantResponse handle it
      return null;
    }

    // Kiểm tra xem có phải câu chào không
    if (this.assistantIntents.greetings.some(greeting => 
      normalizedText.includes(greeting))) {
      // Xử lý lời chào
      this.speak(this.getRandomResponse('greetings'));
      return null;
    }

    // Kiểm tra mong muốn chơi game
    if (normalizedText.includes('muốn chơi game') || 
        normalizedText.includes('chơi game') || 
        normalizedText.includes('muốn chơi trò chơi')) {
      return 'MiniGame';
    }

    // Kiểm tra từng loại game cụ thể
    if (normalizedText.includes('sudoku')) {
      return 'Sudoku';
    }
    if (normalizedText.includes('xếp số')) {
      return 'NumberPuzzle';
    }
    if (normalizedText.includes('trò chơi trí nhớ') || normalizedText.includes('chơi cờ')) {
      return 'MemoryCard';
    }

    // Kiểm tra các mong muốn khác
    if (normalizedText.includes('muốn') || normalizedText.includes('cho tôi')) {
      if (normalizedText.includes('đọc') || normalizedText.includes('truyện')) {
        return 'Truyện';
      }
      if (normalizedText.includes('xem') || normalizedText.includes('video')) {
        return 'Video';
      }
      if (normalizedText.includes('nghe') || normalizedText.includes('radio')) {
        return 'RadioScreen';
      }
      if (normalizedText.includes('tập') || normalizedText.includes('thể dục')) {
        return 'ExerciseSelection';
      }
    }

    // Kiểm tra từ khóa trực tiếp
    for (const [keyword, action] of Object.entries(this.keywordMap)) {
      // Cho phép một số lỗi nhỏ trong phát âm
      const variants = [
        keyword,
        keyword.replace(/a/g, 'ă'),
        keyword.replace(/ă/g, 'a'),
        keyword.replace(/â/g, 'ă'),
        keyword.replace(/ă/g, 'â')
      ];
      
      if (variants.some(variant => normalizedText.includes(variant))) {
        console.log(`Found keyword variant "${keyword}" -> returning action:`, action);
        return action;
      }
    }

    console.log('No local command matched, fallback to Groq.');
    return null;
  }

  static getNavigationCommand(text) {
    const navigationCommands = {
      'trang chủ': 'ElderlyHome',
      'về trang chủ': 'ElderlyHome',
      'tính năng': 'Features',
      'giải trí': 'Entertainment',
      'cài đặt': 'Settings',
      'truyện': 'Truyện',
      'video': 'Video',
      'radio': 'RadioScreen',
      'thể dục': 'ExerciseSelection',
      'game': 'MiniGame',
      'sudoku': 'Sudoku',
      'xếp số': 'NumberPuzzle',
      'trò chơi trí nhớ': 'MemoryCard'
    };

    for (const [command, screen] of Object.entries(navigationCommands)) {
      if (text.includes(command)) {
        console.log(`🎯 Found navigation command: ${command} -> ${screen}`);
        return screen; // Return string instead of object
      }
    }

    return null;
  }

  // Cập nhật phương thức speak để thực sự phát âm
  static async speak(text, options = {}) {
    try {
      console.log('🎙️ Đang phát âm:', text);
      
      // Kiểm tra giọng tiếng Việt nếu chưa có giọng được chọn
      if (!this._bestVietnameseVoice) {
        const voiceCheck = await this.checkVietnameseVoices();
        this._bestVietnameseVoice = voiceCheck.bestVoice;
      }
      
      // Thiết lập tùy chọn với giọng nói tốt nhất
      const speechOptions = {
        language: 'vi-VN',
        pitch: 1.0,
        rate: 0.75,
        ...options
      };
      
      // Sử dụng giọng tốt nhất nếu có
      if (this._bestVietnameseVoice) {
        speechOptions.voice = this._bestVietnameseVoice.identifier;
      }
      
      // Thực hiện phát âm
      await Speech.speak(text, speechOptions);
      return true;
    } catch (error) {
      console.error('❌ Lỗi khi phát âm:', error);
      
      // Thử lại với cấu hình đơn giản hơn nếu lỗi
      try {
        await Speech.speak(text, { language: 'vi-VN', rate: 0.5 });
        return true;
      } catch (retryError) {
        console.error('💥 Phát âm dự phòng cũng thất bại:', retryError);
        // Gọi callback onDone nếu có
        if (options.onDone) {
          setTimeout(options.onDone, 100);
        }
        return false;
      }
    }
  }

  static async processVoiceInput(text) {
    try {
      console.log('🚀 ==== BẮT ĐẦU XỬ LÝ GIỌNG NÓI ====');
      console.log('📝 Raw input:', text);

      // Clean input
      const cleanInput = text
        .toLowerCase()
        .replace(/đang lận nghe|đang lắng nghe|vui lòng/gi, '')
        .trim();
      console.log('🧹 Cleaned input:', cleanInput);
      
      // Phân tích ý định
      const analysis = this.analyzeIntent(cleanInput);
      console.log('🧠 Kết quả phân tích ý định:', analysis);
      
      if (analysis) {
        if (analysis.type === 'command' && analysis.value) {
          return {
            type: 'command',
            value: analysis.value
          };
        }
        
        if (analysis.type === 'question' && analysis.action === 'capabilities') {
          const response = this.getRandomResponse('askFeatures');
          return {
            type: 'chat',
            value: response
          };
        }
        
        if (analysis.type === 'conversation') {
          const response = this.getRandomResponse(analysis.intent || 'unknown');
          return {
            type: 'chat',
            value: response
          };
        }
      }

      // Fallback to Groq
      console.log('🤖 Chuyển sang dùng Groq AI');
      const groqResult = await GroqService.analyzeCommand(cleanInput);
      console.log('🔍 Kết quả Groq:', groqResult);
      
      if (groqResult) {
        if (groqResult.type === 'command' && groqResult.command) {
          return {
            type: 'command',
            value: groqResult.command
          };
        }
        
        if (groqResult.type === 'conversation' && groqResult.text) {
          return {
            type: 'chat',
            value: groqResult.text
          };
        }
      }
      
      // Cuối cùng dùng local parsing
      const localCommand = this.parseCommand(cleanInput);
      if (localCommand) {
        return {
          type: 'command',
          value: localCommand
        };
      }
      
      // Không hiểu được yêu cầu
      const unknownResponse = this.getRandomResponse('unknown');
      return {
        type: 'chat',
        value: unknownResponse
      };
    } catch (error) {
      console.error('❌ Lỗi xử lý giọng nói:', error);
      const errorMessage = 'Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại.';
      return {
        type: 'error',
        value: errorMessage
      };
    } finally {
      console.log('🏁 ==== KẾT THÚC XỬ LÝ GIỌNG NÓI ====');
    }
  }

  static calculateSimilarity(text, keyword) {
    // Thuật toán đơn giản để tính độ tương đồng giữa text và keyword
    const words1 = text.split(' ');
    const words2 = keyword.split(' ');
    
    let commonWords = 0;
    words1.forEach(word => {
      if (words2.includes(word)) commonWords++;
    });
    
    return commonWords / Math.max(words1.length, words2.length);
  }
  
  static isGreeting(text) {
    return this.assistantIntents.greetings.some(greeting => text.includes(greeting));
  }
  
  static getScreenNameFromIntent(intent) {
    switch (intent) {
      case 'readStory': return 'Truyện';
      case 'watchVideo': return 'Video';
      case 'playGame': return 'MiniGame';
      case 'listenRadio': return 'RadioScreen';
      case 'exercise': return 'ExerciseSelection';
      default: return null;
    }
  }

  static analyzeIntent(text) {
    if (!text) return null;
    
    const cleanText = text.toLowerCase().trim();
    
    // Tách câu nếu có nhiều câu được nói cùng lúc
    const sentences = cleanText.split(/[.!?]|\s+và\s+/).filter(s => s.trim().length > 0);
    console.log('📝 Tách câu:', sentences);
    
    // Xử lý từng câu riêng biệt
    const results = sentences.map(sentence => this.analyzeSingleSentence(sentence.trim()));
    
    // Trả về kết quả có độ ưu tiên cao nhất
    // Thứ tự ưu tiên: command > question > conversation
    const commandResult = results.find(r => r && r.type === 'command');
    if (commandResult) return commandResult;
    
    const questionResult = results.find(r => r && r.type === 'question');
    if (questionResult) return questionResult;
    
    return results.find(r => r) || { type: 'unknown', confidence: 0 };
  }

  static analyzeSingleSentence(text) {
    console.log('🔍 Phân tích câu đơn:', text);
    
    // Kiểm tra lệnh điều hướng trực tiếp
    const navigationCommand = this.getNavigationCommand(text);
    if (navigationCommand) {
      return {
        type: 'command',
        action: 'navigate',
        value: navigationCommand,
        confidence: 0.95
      };
    }
    
    // Kiểm tra câu hỏi về khả năng
    if (text.includes('có thể làm gì') || 
        text.includes('làm được gì') ||
        text.includes('giúp được gì') ||
        text.includes('chức năng') ||
        text.includes('hướng dẫn')) {
      return {
        type: 'question',
        action: 'capabilities',
        confidence: 0.9
      };
    }
    
    // Phân tích mong muốn và ý định
    const intentScore = this.calculateIntentScores(text);
    const strongestIntent = Object.keys(intentScore).reduce((a, b) => 
      intentScore[a] > intentScore[b] ? a : b, Object.keys(intentScore)[0]);
    
    console.log('💡 Ý định chính:', strongestIntent, 'với điểm:', intentScore[strongestIntent]);
    
    // Trả về kết quả phân tích
    if (intentScore[strongestIntent] > 0.6) {
      if (this.intentMap[strongestIntent]) {
        // Đây là ý định dẫn đến lệnh
        const screenName = this.getScreenNameFromIntent(strongestIntent);
        return {
          type: 'command',
          action: 'navigate',
          intent: strongestIntent,
          value: screenName,
          confidence: intentScore[strongestIntent]
        };
      } else if (this.assistantIntents[strongestIntent]) {
        // Đây là ý định dẫn đến hội thoại
        return {
          type: 'conversation',
          intent: strongestIntent,
          confidence: intentScore[strongestIntent]
        };
      }
    }
    
    // Xử lý lời chào
    if (this.isGreeting(text)) {
      return {
        type: 'conversation',
        intent: 'greet',
        confidence: 0.8
      };
    }
    
    return null;
  }

  static calculateIntentScores(text) {
    const scores = {};
    
    // Tính điểm cho các intent liên quan đến navigation
    for (const [intent, keywords] of Object.entries(this.intentMap)) {
      scores[intent] = this.calculateKeywordMatch(text, keywords);
    }
    
    // Tính điểm cho các intent liên quan đến hội thoại
    for (const [intent, keywords] of Object.entries(this.assistantIntents)) {
      scores[intent] = this.calculateKeywordMatch(text, keywords);
    }
    
    return scores;
  }
  
  static calculateKeywordMatch(text, keywords) {
    // Tính điểm dựa trên mức độ trùng khớp với keywords
    let score = 0;
    let maxMatchLength = 0;
    
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        const matchScore = keyword.length / text.length;
        score += matchScore;
        maxMatchLength = Math.max(maxMatchLength, keyword.length);
      } else {
        // Kiểm tra trường hợp gần giống
        const similarityScore = this.calculateSimilarity(text, keyword);
        if (similarityScore > 0.8) {
          score += similarityScore * 0.8;
        }
      }
    });
    
    // Điều chỉnh điểm dựa trên độ dài của từ khóa trùng khớp
    if (maxMatchLength > 10) {
      score *= 1.5; // Ưu tiên các từ khóa dài
    }
    
    return Math.min(score, 1); // Giới hạn điểm tối đa là 1
  }

  // Thêm phương thức mới để kiểm tra giọng nói tiếng Việt
  static async checkVietnameseVoices() {
    try {
      // Lấy danh sách tất cả các giọng nói có sẵn
      const availableVoices = await Speech.getAvailableVoicesAsync();
      
      // Lọc các giọng nói tiếng Việt
      const vietnameseVoices = availableVoices.filter(
        voice => voice.language && (voice.language.startsWith('vi') || voice.language === 'vi-VN')
      );
      
      console.log('📢 Tất cả các giọng nói:', availableVoices.length);
      console.log('🇻🇳 Giọng nói tiếng Việt:', vietnameseVoices.length);
      
      // Nếu có các giọng tiếng Việt, chọn giọng tốt nhất (ưu tiên giọng nữ trừ khi chỉ có giọng nam)
      let bestVoice = null;
      if (vietnameseVoices.length > 0) {
        // Tìm giọng nữ trước
        const femaleVoice = vietnameseVoices.find(
          voice => voice.name && (voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('nữ'))
        );
        
        bestVoice = femaleVoice || vietnameseVoices[0]; // Dùng giọng nữ nếu có, không thì dùng giọng đầu tiên
      }
      
      return {
        hasVietnameseVoice: vietnameseVoices.length > 0,
        vietnameseVoices: vietnameseVoices,
        bestVoice: bestVoice,
        allVoices: availableVoices
      };
    } catch (error) {
      console.error('Lỗi khi kiểm tra giọng nói:', error);
      return {
        hasVietnameseVoice: false,
        vietnameseVoices: [],
        bestVoice: null,
        error: error.message
      };
    }
  }
  
  // Thêm phương thức kiểm tra và phát âm thử
  static async testVoice() {
    try {
      // Kiểm tra giọng nói
      const voiceCheck = await this.checkVietnameseVoices();
      
      // Log kết quả
      console.log('Kết quả kiểm tra giọng nói:');
      console.log(`- Có giọng tiếng Việt: ${voiceCheck.hasVietnameseVoice}`);
      console.log(`- Số lượng giọng tiếng Việt: ${voiceCheck.vietnameseVoices.length}`);
      if (voiceCheck.bestVoice) {
        console.log(`- Giọng tốt nhất: ${voiceCheck.bestVoice.name}`);
      }
      
      // Phát âm thử nếu có giọng tiếng Việt
      if (voiceCheck.hasVietnameseVoice) {
        const testText = "Xin chào, đây là bài kiểm tra giọng nói tiếng Việt.";
        
        // Sử dụng giọng tốt nhất
        if (voiceCheck.bestVoice) {
          await Speech.speak(testText, {
            language: 'vi-VN',
            voice: voiceCheck.bestVoice.identifier,
            rate: 0.75
          });
        } else {
          await Speech.speak(testText, { language: 'vi-VN', rate: 0.75 });
        }
        
        return {
          success: true,
          message: "Kiểm tra thành công, đã phát âm tiếng Việt",
          voice: voiceCheck.bestVoice
        };
      }
      
      return {
        success: false,
        message: "Không tìm thấy giọng tiếng Việt trên thiết bị",
        voiceCheck
      };
    } catch (error) {
      console.error('Lỗi khi kiểm tra giọng nói:', error);
      return {
        success: false,
        message: "Đã xảy ra lỗi khi kiểm tra giọng nói",
        error: error.message
      };
    }
  }

  // Enhanced method for analyzing commands with more context awareness
  static analyzeCommand(text, previousContext = null) {
    if (!text) return null;
    
    const cleanText = text.toLowerCase().trim();
    console.log('📝 Analyzing command:', cleanText);
    
    // Track command confidence and details
    let highestConfidence = 0;
    let bestMatch = null;
    
    // Step 1: Check for direct navigation commands (highest priority)
    for (const [command, screen] of Object.entries(this.commands)) {
      if (cleanText.includes(command)) {
        const matchConfidence = command.length / cleanText.length;
        if (matchConfidence > highestConfidence) {
          highestConfidence = matchConfidence;
          bestMatch = {
            type: 'command',
            confidence: matchConfidence,
            value: { screen },
            action: 'navigate'
          };
        }
      }
    }
    
    // Step 2: Check for intent-based commands (like reading stories, watching videos)
    for (const [intent, patterns] of Object.entries(this.intentMap)) {
      for (const pattern of patterns) {
        if (cleanText.includes(pattern)) {
          const screenName = this.getScreenNameFromIntent(intent);
          if (screenName) {
            const matchConfidence = pattern.length / cleanText.length;
            if (matchConfidence > highestConfidence) {
              highestConfidence = matchConfidence;
              bestMatch = {
                type: 'command',
                confidence: matchConfidence,
                value: { screen: screenName },
                intent,
                action: 'navigate'
              };
            }
          }
        }
      }
    }
    
    // Step 3: Check for conversational intents
    for (const [intent, patterns] of Object.entries(this.assistantIntents)) {
      for (const pattern of patterns) {
        if (cleanText.includes(pattern)) {
          const matchConfidence = pattern.length / cleanText.length;
          if (matchConfidence > highestConfidence) {
            highestConfidence = matchConfidence;
            bestMatch = {
              type: 'conversation',
              confidence: matchConfidence,
              intent,
              response: this.getRandomResponse(intent)
            };
          }
        }
      }
    }
    
    // Step 4: Check for video search commands
    if (cleanText.includes('tìm video') || cleanText.includes('tìm kiếm video')) {
      const query = cleanText.replace(/tìm (kiếm)?\s*video\s*/i, '').trim();
      if (query) {
        return {
          type: 'search',
          confidence: 0.95,
          value: { query, type: 'video' },
          action: 'search'
        };
      }
    }
    
    // Step 5: Handle time and date queries specifically
    if (cleanText.includes('mấy giờ') || 
        cleanText.includes('ngày mấy') || 
        cleanText.includes('ngày tháng') ||
        cleanText.includes('thứ mấy')) {
      return {
        type: 'conversation',
        confidence: 0.9,
        intent: 'timeDate',
        response: this.getRandomResponse('timeDate')
      };
    }
    
    // If we have a good match with high confidence, return it
    if (bestMatch && highestConfidence > 0.4) {
      return bestMatch;
    }
    
    // If no good match, return unknown
    return {
      type: 'unknown',
      confidence: 0.1,
      response: this.getRandomResponse('unknown')
    };
  }

  // Add new method for better context-aware responses
  static generateContextAwareResponse(input, context = null) {
    const analysis = this.analyzeCommand(input, context);
    
    if (!analysis) return this.getRandomResponse('unknown');
    
    if (analysis.type === 'conversation' && analysis.intent) {
      return this.getRandomResponse(analysis.intent);
    }
    
    if (analysis.type === 'command') {
      if (analysis.action === 'navigate') {
        return `Đang mở ${analysis.value.screen}`;
      } else if (analysis.action === 'search') {
        return `Đang tìm kiếm ${analysis.value.type} về "${analysis.value.query}"`;
      }
    }
    
    if (analysis.type === 'search') {
      return `Đang tìm kiếm ${analysis.value.type} về "${analysis.value.query}"`;
    }
    
    return analysis.response || this.getRandomResponse('unknown');
  }
}
