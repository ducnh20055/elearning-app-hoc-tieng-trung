import courseData from "@/assets/data/course_content.json";
import Ionicons from "@expo/vector-icons/Ionicons";

export interface CourseData {
  chapters: Chapter[];
  scenarios: ConversationScenario[];
}

export type HskLevel = "HSK1" | "HSK2" | "HSK3" | "HSK4" | "HSK5" | "HSK6";

export const HSK_LEVELS: HskLevel[] = [
  "HSK1",
  "HSK2",
  "HSK3",
  "HSK4",
  "HSK5",
  "HSK6",
];

export const getChapterLevel = (chapterId: number): HskLevel =>
  HSK_LEVELS[Math.min(Math.floor((chapterId - 1) / 2), HSK_LEVELS.length - 1)];

const VIETNAMESE_TEXT: Record<string, string> = {
  "Greetings & Basics": "Chào hỏi cơ bản",
  "Numbers & Time": "Số và thời gian",
  "Family & People": "Gia đình và con người",
  "Food & Drink": "Đồ ăn và thức uống",
  "Hobbies & Activities": "Sở thích và hoạt động",
  "Travel & Places": "Du lịch và địa điểm",
  "Shopping & Money": "Mua sắm và tiền bạc",
  "School & Work": "Trường học và công việc",
  "Health & Body": "Sức khỏe và cơ thể",
  "Nature & Weather": "Thiên nhiên và thời tiết",
  "Home & Living": "Nhà cửa và đời sống",
  Emergencies: "Tình huống khẩn cấp",
  "Saying Hello": "Cách chào hỏi",
  "How are you?": "Bạn khỏe không?",
  "Polite Expressions": "Cách nói lịch sự",
  Introductions: "Giới thiệu bản thân",
  "Yes & No": "Có và không",
  "Ordering Street Food": "Gọi món ăn đường phố",
  "Checking into a Hotel": "Nhận phòng khách sạn",
  "Shopping for Souvenirs": "Mua quà lưu niệm",
  "Asking for Directions": "Hỏi đường",
  "You are exploring a bustling night market and smell delicious dumplings.":
    "Bạn đang khám phá một khu chợ đêm nhộn nhịp và ngửi thấy mùi bánh bao thơm ngon.",
  "Buy dumplings": "Mua bánh bao",
  "Ask what fillings they have": "Hỏi họ có những loại nhân nào",
  "Ask for spicy sauce": "Hỏi xin thêm sốt cay",
  "Pay with cash": "Thanh toán bằng tiền mặt",
  "You have just arrived at your hotel after a long flight.":
    "Bạn vừa đến khách sạn sau một chuyến bay dài.",
  "Check in": "Nhận phòng",
  "State your name": "Nói tên của bạn",
  "Ask about breakfast": "Hỏi về bữa sáng",
  "Ask for Wi-Fi": "Hỏi mật khẩu Wi-Fi",
  "You are in a local gift shop looking for a present.":
    "Bạn đang tìm quà trong một cửa hàng địa phương.",
  "Buy a gift": "Mua một món quà",
  "Ask for a recommendation": "Hỏi xin gợi ý",
  "Ask for gift wrap": "Hỏi xin gói quà",
  "Ask for price": "Hỏi giá",
  "You are lost in the city center.": "Bạn bị lạc ở trung tâm thành phố.",
  "Find the subway": "Tìm ga tàu điện ngầm",
  "Excuse yourself": "Nói lời xin lỗi để hỏi",
  "Ask where subway is": "Hỏi ga tàu điện ngầm ở đâu",
  "Ask how far": "Hỏi khoảng cách",
  "Good morning": "Chào buổi sáng",
  "Good afternoon": "Chào buổi chiều",
  "Good evening": "Chào buổi tối",
  "Good night": "Chúc ngủ ngon",
  Goodbye: "Tạm biệt",
  "See you later": "Hẹn gặp lại",
  "See you tomorrow": "Hẹn gặp ngày mai",
  "Sweet dreams": "Chúc ngủ ngon",
  Hello: "Xin chào",
  "Hi there": "Chào bạn",
  "How are you": "Bạn khỏe không",
  "How are you?": "Bạn khỏe không?",
  "I'm very well": "Tôi rất khỏe",
  "I'm okay": "Tôi ổn",
  "I'm not well": "Tôi không khỏe",
  "Not bad": "Không tệ",
  "Really bad": "Rất tệ",
  "So-so": "Bình thường",
  Excellent: "Tuyệt vời",
  Terrible: "Tệ quá",
  "Thank you": "Cảm ơn",
  "You're welcome": "Không có gì",
  Sorry: "Xin lỗi",
  "Excuse me": "Xin lỗi, cho hỏi",
  Pardon: "Xin nhắc lại",
  Please: "Làm ơn",
  "May I": "Tôi có thể... không?",
  "Could you": "Bạn có thể... không?",
  "It's okay / No problem": "Không sao / Không có gì",
  "What's your name?": "Bạn tên gì?",
  "My name is Li Ming": "Tôi tên là Lý Minh",
  "I am Li Ming": "Tôi là Lý Minh",
  "Nice to meet you": "Rất vui được gặp bạn",
  "Where are you from?": "Bạn đến từ đâu?",
  "Yes / To be / Is": "Có / Là",
  "No / Not": "Không / Không phải",
  Maybe: "Có lẽ",
  "Correct / Right / Yes": "Đúng / Phải / Vâng",
  "Wrong / Incorrect": "Sai / Không đúng",
  "Okay / Alright": "Được / Ổn",
  "Sure / Of course": "Chắc chắn / Tất nhiên",
  "No way": "Không thể nào",
  FREE: "MIỄN PHÍ",
  CUSTOM: "TỰ TẠO",
};

export const vietnameseText = (text?: string | null) =>
  (text && VIETNAMESE_TEXT[text]) || text || "";

export interface ConversationScenario {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  isFree: boolean;
  description: string;
  goal: string;
  tasks: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  phrasebook?: PhrasebookEntry[];
}

interface PhrasebookEntry {
  hanzi: string;
  pinyin: string;
  english: string;
}

export interface Chapter {
  id: number;
  title: string;
  lessons: Lesson[];
  review?: Lesson;
}

export interface Lesson {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  completionCount: number;
  questions: Question[];
}

interface BaseQuestion {
  id: number;
}

interface MandarinPrompt {
  hanzi: string;
  pinyin: string;
}

export interface Word {
  hanzi: string;
  pinyin: string;
  english: string;
}

interface MandarinPhrase {
  hanzi: string;
  pinyin: string;
  words: Word[];
  breakdown: string;
}

export interface SpeakingOption {
  id: number;
  english: string;
  mandarin: MandarinPhrase;
}

export interface ListeningOption {
  id: number;
  english: string;
}

interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple_choice";
  mandarin: MandarinPrompt;
  options: SpeakingOption[];
}

interface SingleResponseQuestion extends BaseQuestion {
  type: "single_response";
  mandarin: MandarinPrompt;
  options: [SpeakingOption];
}

interface ListeningMultipleChoiceQuestion extends BaseQuestion {
  type: "listening_mc";
  mandarin: MandarinPrompt & {
    words: Word[];
    breakdown: string;
  };
  options: ListeningOption[];
  correctOptionId: number;
}

export type Question =
  | MultipleChoiceQuestion
  | SingleResponseQuestion
  | ListeningMultipleChoiceQuestion;

export const COURSE_DATA = courseData as unknown as CourseData;
