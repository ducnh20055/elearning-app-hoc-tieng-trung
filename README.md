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

# ELearning - Tieng Viet

**Ung dung hoc tieng Trung tren di dong, uu tien luyen nghe va noi trong cac tinh huong thuc te.**

ELearning giup nguoi hoc luyen tieng Pho Thong qua cac bai hoc co cau truc, phan hoi phat am, bai tap nghe va hoi thoai voi AI. Day la du an portfolio minh hoa viec phat trien san pham di dong, xac thuc nguoi dung, luu tru local-first, xu ly am thanh va tich hop Supabase.

## Tinh nang chinh

- Bai hoc tieng Trung duoc sap xep theo cap do HSK.
- Bai tap nghe, trac nghiem va luyen noi.
- Phat am tieng Trung bang text-to-speech voi `expo-speech`.
- Thu am giong noi va chuyen am thanh thanh van ban thong qua Supabase Edge Function.
- Cham diem phat am dua tren do tuong dong voi pinyin muc tieu.
- Hoi thoai theo tinh huong, bao gom ca tinh huong tuy chinh duoc tao cho nguoi dung Premium.
- Theo doi tien do bai hoc, so sao hoan thanh, thong ke luyen noi/nghe va chuoi ngay hoc theo tung tai khoan.
- Muc tieu hoc hang ngay voi cuong do hoc tuy chon.
- On tap cau tra loi sai va cac muc on tap theo phuong phap lap lai ngat quang.
- Lich su phat am gan day kem ban ghi am va diem tuong dong.
- Luu tru hoat dong theo mo hinh offline-first, co hang doi de dong bo voi Supabase.
- Xac thuc dang nhap duoc duy tri an toan bang Supabase Auth va local storage ma hoa.

## Cac khu vuc san pham

### Bai hoc

Bai hoc ket hop gioi thieu tu vung, cau hoi am thanh, kiem tra nghe hieu, luyen phat am, phan hoi va theo doi hoan thanh. Nguoi hoc co the xem lai cau hoi da tra loi sai va cac cau hoi den han on tap.

### Hoi thoai

Nguoi hoc luyen cac tinh huong thuc te nhu chao hoi, goi mon an, nhan phong khach san va hoi duong. Ung dung ho tro ca tin nhan van ban lan tin nhan giong noi, voi phan hoi AI duoc xu ly boi Supabase Edge Functions.

### Trang ca nhan

Trang ca nhan hien thi muc tieu hang ngay, chuoi ngay hoc, so ngay hoc, so cau tra loi dung, so luot hoi thoai, lich su phat am va trang thai Premium. Muc tieu duoc luu theo tung tai khoan, vi vay cac tai khoan tren cung mot thiet bi khong dung chung tien do.

## Cong nghe su dung

- **Ung dung di dong:** React Native, Expo SDK 57, Expo Router
- **Ngon ngu:** TypeScript
- **Backend:** Supabase Auth, PostgreSQL, Edge Functions
- **Luu tru:** AsyncStorage cho du lieu hoc offline-first; SecureStore cho phien dang nhap
- **Am thanh:** `expo-audio`, `expo-speech`, Supabase transcription function
- **Giao dien:** React Native components, Expo Vector Icons, Animated APIs
- **Kiem tra chat luong:** ESLint, TypeScript diagnostics, typed Expo Router routes

## Kien truc

```text
app/                         Man hinh va tab Expo Router
components/                  Component bai hoc, hoi thoai, xac thuc va giao dien
constants/                   Kieu du lieu khoa hoc, tien ich noi dung va gia tri theme
hooks/                       Hook dung lai cho state va thong ke
lib/                         Dich vu tien do, hoat dong, on tap va kich ban
providers/ va ctx/           State xac thuc va ho so nguoi dung
supabase/functions/          Logic chat AI, tao kich ban, chuyen am thanh va trial
supabase/migrations/         Schema PostgreSQL va chinh sach Row Level Security
utils/                       Cau hinh Supabase client
```

Quy trinh hoat dong hoc tap theo mo hinh offline-first:

1. Ung dung ghi hoat dong local theo ID cua nguoi dung dang dang nhap.
2. Thong ke va trang thai on tap van co the su dung khi khong co mang.
3. Hoat dong dang cho duoc dua vao hang doi local.
4. Hang doi duoc dong bo voi Supabase khi nguoi dung dang nhap va co ket noi.
5. Row Level Security cua Supabase gioi han du lieu theo chu so huu.

## Bat dau

### Yeu cau

- Node.js 20 tro len
- Android Studio va Android emulator, hoac mot thiet bi Android that
- Mot Supabase project cho xac thuc, co so du lieu va Edge Functions

### Cai dat

```bash
git clone https://github.com/<your-username>/<your-repository>.git
cd ELearning
npm install
```

Tao file `.env` o thu muc goc cua project:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-anon-key
```

Khoi dong Expo development server:

```bash
npx expo start
```

Tao va chay ban Android native:

```bash
npx expo run:android
```

### Build APK de cai truc tiep

Project da co san profile EAS `preview` de tao file APK:

```bash
npx eas-cli@latest login
npx eas-cli@latest env:push preview --path .env --force
npx eas-cli@latest build --platform android --profile preview
```

Sau khi build xong, mo lien ket do tren dien thoai Android de tai va cai APK. Co the can bat quyen cai ung dung tu nguon khong xac dinh cho trinh duyet.

## Cai dat Supabase

Ap dung migration tu thu muc goc:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Migration learning tao cac bang hoat dong, on tap va tien do bai hoc theo nguoi dung, kem Row Level Security. Trien khai cac Edge Functions rieng theo cau hinh Supabase cua ban.

> Khong commit `.env`, service-role key hoac bat ky thong tin dang nhap rieng tu nao.

## Lenh thuong dung

```bash
npm run lint          # Chay Expo ESLint
npx tsc --noEmit      # Chay TypeScript compiler ma khong tao file
npx expo start        # Khoi dong development server
npx expo run:android  # Build va chay ung dung Android
npx supabase db push  # Ap dung migration cho Supabase project da lien ket
```

## Ghi chu ky thuat

- Noi dung khoa hoc hien duoc dong goi cung ung dung duoi dang JSON de ho tro truy cap offline on dinh.
- Tien do nguoi dung va hoat dong hoc tap local duoc phan tach theo `user.id`.
- Lich su phat am luu ban ghi va du lieu cham diem; client khong luu file am thanh goc.
- Dong bo Supabase duoc thiet ke idempotent thong qua event ID do client tao.
- Du an hien duoc cau hinh cho muc dich phat trien va portfolio; de san sang production can bo sung test tu dong, monitoring, xin consent analytics va quy trinh phat hanh chinh thuc.

## Tom tat du an cho CV

> Xay dung ung dung hoc tieng Trung da nen tang voi React Native va Expo, trien khai tien do theo nguoi dung co xac thuc, luyen phat am bang am thanh, hoi thoai AI, theo doi hoat dong offline-first, on tap lap lai ngat quang va dong bo voi Supabase kem Row Level Security.

## Lo trinh phat trien

- Them unit test va end-to-end test cho cham diem bai hoc va lich on tap.
- Them cac view tong hop phia server cho phan tich dai han.
- Them thong bao cho muc tieu hang ngay va cac muc den han on tap.
- Bo sung tai lieu trien khai production cho Edge Functions va mobile build.

## Giay phep

Du an hien duoc danh cho portfolio ca nhan. Hay them license truoc khi nhan dong gop tu ben ngoai hoac phan phoi lai noi dung khoa hoc.
