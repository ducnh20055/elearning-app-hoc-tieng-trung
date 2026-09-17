# ELearning

**A mobile-first Chinese language learning app focused on practical listening and speaking.**

ELearning helps learners practise Mandarin through structured lessons, pronunciation feedback, listening exercises, and AI-powered conversations. It is built as a portfolio project to demonstrate mobile product development, authentication, local-first data handling, audio workflows, and Supabase integration.

## Highlights

- Structured Mandarin lessons organised by HSK level.
- Listening, multiple-choice, and speaking exercises.
- Mandarin text-to-speech playback with `expo-speech`.
- Voice recording and pronunciation transcription through a Supabase Edge Function.
- Similarity-based pronunciation scoring against expected pinyin.
- AI conversation scenarios, including generated custom scenarios for Premium users.
- Per-user lesson progress, completion stars, speaking/listening statistics, and streaks.
- Daily learning goals with selectable study intensity.
- Wrong-answer review and spaced-repetition review items.
- Recent pronunciation history with transcript and similarity score.
- Offline-first activity storage with an outbox for Supabase synchronisation.
- Secure persisted authentication using Supabase Auth and encrypted local storage.

## Product Areas

### Lessons

Lessons combine vocabulary introduction, audio prompts, listening comprehension, pronunciation practice, feedback, and completion tracking. Learners can review questions they answered incorrectly and see questions that are due for spaced repetition.

### Conversations

Learners practise realistic scenarios such as greetings, ordering food, checking into a hotel, and asking for directions. The app supports both typed and voice messages, with AI-generated responses handled by Supabase Edge Functions.

### Personal Dashboard

The profile screen includes daily goals, current streak, study days, correct answers, conversation turns, pronunciation history, and Premium status. Goals are stored per authenticated user so accounts on the same device do not share progress.

## Tech Stack

- **Mobile:** React Native, Expo SDK 57, Expo Router
- **Language:** TypeScript
- **Backend:** Supabase Auth, PostgreSQL, Edge Functions
- **Storage:** AsyncStorage for local-first learning data; SecureStore-backed session persistence
- **Audio:** `expo-audio`, `expo-speech`, Supabase transcription function
- **UI:** React Native components, Expo Vector Icons, Animated APIs
- **Quality:** ESLint, TypeScript diagnostics, typed Expo Router routes

## Architecture

```text
app/                         Expo Router screens and tabs
components/                  Reusable lesson, conversation, auth, and UI components
constants/                   Course types, lesson content helpers, and theme values
hooks/                       Reusable state and statistics hooks
lib/                         Local progress, activity, review, and scenario services
providers/ and ctx/          Authentication and profile state
supabase/functions/          AI chat, scenario generation, transcription, and trial logic
supabase/migrations/         PostgreSQL schema and Row Level Security policies
utils/                       Supabase client configuration
```

Learning activity follows an offline-first flow:

1. The app records activity locally under the authenticated user's ID.
2. Statistics and review state remain available without a network connection.
3. Pending activity is placed in a local outbox.
4. The outbox is synchronised to Supabase when the user is signed in and connectivity is available.
5. Supabase Row Level Security limits records to their owner.

## Getting Started

### Requirements

- Node.js 20 or newer
- Android Studio and an Android emulator, or a physical Android device
- A Supabase project for authentication, database, and Edge Functions

### Installation

```bash
git clone https://github.com/<your-username>/<your-repository>.git
cd ELearning
npm install
```

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-anon-key
```

Start the Expo development server:

```bash
npx expo start
```

For a native Android development build:

```bash
npx expo run:android
```

## Supabase Setup

Apply the database migrations from the project root:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

The learning migration creates user-scoped activity, review, and lesson-progress tables with Row Level Security. Deploy the Edge Functions separately according to your Supabase project setup.

> Never commit `.env`, service-role keys, or other private credentials.

## Useful Commands

```bash
npm run lint          # Run Expo ESLint
npx tsc --noEmit      # Run the TypeScript compiler without emitting files
npx expo start        # Start the development server
npx expo run:android  # Build and run the Android app
npx supabase db push  # Apply migrations to the linked Supabase project
```

## Engineering Notes

- Course content is currently bundled with the app as JSON for predictable offline access.
- User progress and local learning activity are partitioned by `user.id`.
- Pronunciation history stores transcript and scoring data; raw audio files are not persisted by the client.
- Supabase synchronisation is designed to be idempotent through client-generated event IDs.
- The project is currently configured for development and portfolio demonstration; production hardening would include automated tests, monitoring, analytics consent, and a formal release pipeline.

## CV Project Summary

> Built a cross-platform Mandarin learning app with React Native and Expo, implementing authenticated user-scoped progress, audio-based pronunciation practice, AI conversation scenarios, offline-first activity tracking, spaced-repetition review, and Supabase-backed synchronisation with Row Level Security.

## Roadmap

- Add automated unit and end-to-end tests for lesson scoring and review scheduling.
- Add server-side aggregate views for long-term analytics.
- Add notifications for daily goals and review items.
- Add production deployment documentation for Edge Functions and mobile builds.

## License

This project is currently intended as a personal portfolio project. Add a license before accepting external contributions or redistributing the course content.

---

# ELearning - Tiếng Việt

**Ứng dụng học tiếng Trung trên di động, ưu tiên luyện nghe và nói trong các tình huống thực tế.**

ELearning giúp người học luyện tiếng Phổ Thông qua các bài học có cấu trúc, phản hồi phát âm, bài tập nghe và hội thoại với AI. Đây là dự án portfolio minh họa việc phát triển sản phẩm di động, xác thực người dùng, lưu trữ local-first, xử lý âm thanh và tích hợp Supabase.

## Tính năng chính

- Bài học tiếng Trung được sắp xếp theo cấp độ HSK.
- Bài tập nghe, trắc nghiệm và luyện nói.
- Phát âm tiếng Trung bằng text-to-speech với `expo-speech`.
- Thu âm giọng nói và chuyển âm thanh thành văn bản thông qua Supabase Edge Function.
- Chấm điểm phát âm dựa trên độ tương đồng với pinyin mục tiêu.
- Hội thoại theo tình huống, bao gồm cả tình huống tùy chỉnh được tạo cho người dùng Premium.
- Theo dõi tiến độ bài học, số sao hoàn thành, thống kê luyện nói/nghe và chuỗi ngày học theo từng tài khoản.
- Mục tiêu học hằng ngày với cường độ học tùy chọn.
- Ôn tập câu trả lời sai và các mục ôn tập theo phương pháp lặp lại ngắt quãng.
- Lịch sử phát âm gần đây kèm bản ghi âm và điểm tương đồng.
- Lưu trữ hoạt động theo mô hình offline-first, có hàng đợi để đồng bộ với Supabase.
- Xác thực đăng nhập được duy trì an toàn bằng Supabase Auth và local storage mã hóa.

## Các khu vực sản phẩm

### Bài học

Bài học kết hợp giới thiệu từ vựng, câu hỏi âm thanh, kiểm tra nghe hiểu, luyện phát âm, phản hồi và theo dõi hoàn thành. Người học có thể xem lại câu hỏi đã trả lời sai và các câu hỏi đến hạn ôn tập.

### Hội thoại

Người học luyện các tình huống thực tế như chào hỏi, gọi món ăn, nhận phòng khách sạn và hỏi đường. Ứng dụng hỗ trợ cả tin nhắn văn bản lẫn tin nhắn giọng nói, với phản hồi AI được xử lý bởi Supabase Edge Functions.

### Trang cá nhân

Trang cá nhân hiển thị mục tiêu hằng ngày, chuỗi ngày học, số ngày học, số câu trả lời đúng, số lượt hội thoại, lịch sử phát âm và trạng thái Premium. Mục tiêu được lưu theo từng tài khoản, vì vậy các tài khoản trên cùng một thiết bị không dùng chung tiến độ.

## Công nghệ sử dụng

- **Ứng dụng di động:** React Native, Expo SDK 57, Expo Router
- **Ngôn ngữ:** TypeScript
- **Backend:** Supabase Auth, PostgreSQL, Edge Functions
- **Lưu trữ:** AsyncStorage cho dữ liệu học offline-first; SecureStore cho phiên đăng nhập
- **Âm thanh:** `expo-audio`, `expo-speech`, Supabase transcription function
- **Giao diện:** React Native components, Expo Vector Icons, Animated APIs
- **Kiểm tra chất lượng:** ESLint, TypeScript diagnostics, typed Expo Router routes

## Kiến trúc

```text
app/                         Màn hình và tab Expo Router
components/                  Component bài học, hội thoại, xác thực và giao diện
constants/                   Kiểu dữ liệu khóa học, tiện ích nội dung và giá trị theme
hooks/                       Hook dùng lại cho state và thống kê
lib/                         Dịch vụ tiến độ, hoạt động, ôn tập và kịch bản
providers/ và ctx/           State xác thực và hồ sơ người dùng
supabase/functions/          Logic chat AI, tạo kịch bản, chuyển âm thanh và trial
supabase/migrations/         Schema PostgreSQL và chính sách Row Level Security
utils/                       Cấu hình Supabase client
```

Quy trình hoạt động học tập theo mô hình offline-first:

1. Ứng dụng ghi hoạt động local theo ID của người dùng đang đăng nhập.
2. Thống kê và trạng thái ôn tập vẫn có thể sử dụng khi không có mạng.
3. Hoạt động đang chờ được đưa vào hàng đợi local.
4. Hàng đợi được đồng bộ với Supabase khi người dùng đăng nhập và có kết nối.
5. Row Level Security của Supabase giới hạn dữ liệu theo chủ sở hữu.

## Bắt đầu

### Yêu cầu

- Node.js 20 trở lên
- Android Studio và Android emulator, hoặc một thiết bị Android thật
- Một Supabase project cho xác thực, cơ sở dữ liệu và Edge Functions

### Cài đặt

```bash
git clone https://github.com/<your-username>/<your-repository>.git
cd ELearning
npm install
```

Tạo file `.env` ở thư mục gốc của project:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-anon-key
```

Khởi động Expo development server:

```bash
npx expo start
```

Tạo và chạy bản Android native:

```bash
npx expo run:android
```

### Build APK để cài trực tiếp

Project đã có sẵn profile EAS `preview` để tạo file APK:

```bash
npx eas-cli@latest login
npx eas-cli@latest env:push preview --path .env --force
npx eas-cli@latest build --platform android --profile preview
```

Sau khi build xong, mở liên kết đó trên điện thoại Android để tải và cài APK. Có thể cần bật quyền cài ứng dụng từ nguồn không xác định cho trình duyệt.

## Cài đặt Supabase

Áp dụng migration từ thư mục gốc:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Migration learning tạo các bảng hoạt động, ôn tập và tiến độ bài học theo người dùng, kèm Row Level Security. Triển khai các Edge Functions riêng theo cấu hình Supabase của bạn.

> Không commit `.env`, service-role key hoặc bất kỳ thông tin đăng nhập riêng tư nào.

## Lệnh thường dùng

```bash
npm run lint          # Chạy Expo ESLint
npx tsc --noEmit      # Chạy TypeScript compiler mà không tạo file
npx expo start        # Khởi động development server
npx expo run:android  # Build và chạy ứng dụng Android
npx supabase db push  # Áp dụng migration cho Supabase project đã liên kết
```

## Ghi chú kỹ thuật

- Nội dung khóa học hiện được đóng gói cùng ứng dụng dưới dạng JSON để hỗ trợ truy cập offline ổn định.
- Tiến độ người dùng và hoạt động học tập local được phân tách theo `user.id`.
- Lịch sử phát âm lưu bản ghi và dữ liệu chấm điểm; client không lưu file âm thanh gốc.
- Đồng bộ Supabase được thiết kế idempotent thông qua event ID do client tạo.
- Dự án hiện được cấu hình cho mục đích phát triển và portfolio; để sẵn sàng production cần bổ sung test tự động, monitoring, xin consent analytics và quy trình phát hành chính thức.

## Tóm tắt dự án cho CV

> Xây dựng ứng dụng học tiếng Trung đa nền tảng với React Native và Expo, triển khai tiến độ theo người dùng có xác thực, luyện phát âm bằng âm thanh, hội thoại AI, theo dõi hoạt động offline-first, ôn tập lặp lại ngắt quãng và đồng bộ với Supabase kèm Row Level Security.

## Lộ trình phát triển

- Thêm unit test và end-to-end test cho chấm điểm bài học và lịch ôn tập.
- Thêm các view tổng hợp phía server cho phân tích dài hạn.
- Thêm thông báo cho mục tiêu hằng ngày và các mục đến hạn ôn tập.
- Bổ sung tài liệu triển khai production cho Edge Functions và mobile build.

## Giấy phép

Dự án hiện được dành cho portfolio cá nhân. Hãy thêm license trước khi nhận đóng góp từ bên ngoài hoặc phân phối lại nội dung khóa học.
