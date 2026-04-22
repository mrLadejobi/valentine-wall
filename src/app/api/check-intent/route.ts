import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ isHarmful: false, error: "API KEY MISSING" });
    }

    // We ask Gemini to act as a moderator
    const prompt = `Analyze this message for harmful intent, severe bullying, or threats. 
    If the message is harmful, reply with the word: HARMFUL. 
    If it is kind or neutral, reply with: SAFE.
    Message: "${text.slice(0, 2000)}"`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        }),
      }
    );

    const data = await response.json();
    
    // Extract Gemini's text response
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "SAFE";

    console.log("Gemini Analysis:", aiResponse);

    return NextResponse.json({ 
      isHarmful: aiResponse.toUpperCase().includes("HARMFUL") 
    });

  } catch (error: any) {
    console.error("Gemini Route Error:", error.message);
    return NextResponse.json({ isHarmful: false }); 
  }
}