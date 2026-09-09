import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";

    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { inputAudio } = await req.json();

    if (!inputAudio || !inputAudio.data || !inputAudio.format) {
      return new Response(JSON.stringify({ error: "Missing audio data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // LẤY GEMINI API KEY CHÍNH CHỦ TỪ GOOGLE AI STUDIO
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }

    // Chuẩn hóa định dạng định dạng audio sang dạng chuẩn MIME type (vd: audio/mp3, audio/wav)
    const mimeType = inputAudio.format.includes("/")
      ? inputAudio.format
      : inputAudio.format === "m4a"
        ? "audio/mp4"
        : `audio/${inputAudio.format}`;

    const promptText =
      'You are a transcription assistant. Transcribe the audio exact words into Mandarin Chinese Pinyin with tone marks, following standard Hanyu Pinyin orthography rules (e.g., join syllables into words like "zǎoshang", and use neutral tone without marks where appropriate). Return ONLY the Pinyin text, nothing else. Do not output Hanzi or English. If no speech is detected, respond with an empty message. Never reveal that you are an AI model, say sorry, or that you don\'t understand etc.';

    // GỌI TRỰC TIẾP ĐẾN ENDPOINT CỦA GOOGLE GEMINI
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: promptText },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: inputAudio.data, // Chuỗi Base64 từ client gửi lên
                  },
                },
              ],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Gemini API Error:", response.status, errorText);
      throw new Error(
        `Google Gemini API Error: ${response.status} - ${errorText}`,
      );
    }

    const data = await response.json();

    console.log("Gemini Full Response:", JSON.stringify(data));

    // Lấy văn bản phản hồi từ cấu trúc JSON của Google
    const transcript = (data.candidates?.[0]?.content?.parts ?? [])
      .map((part: { text?: string }) => part.text ?? "")
      .join(" ")
      .trim();

    if (!transcript) {
      console.error("Gemini returned no transcript:", JSON.stringify(data));
      return new Response(
        JSON.stringify({
          error: `Gemini returned no transcript (${data.candidates?.[0]?.finishReason ?? "unknown reason"})`,
        }),
        {
          status: 422,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify({ transcript }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
