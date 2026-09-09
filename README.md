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
