import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    // 1. Send the text to the AI model
    const response = await fetch(
      "https://api-inference.huggingface.co/models/unitary/toxic-bert",
      {
        headers: { 
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: text.slice(0, 1000) }), // AI limit check
      }
    );

    const result = await response.json();

    // Hugging Face sometimes returns a simple error if the model is "warming up"
    if (result.error) {
       console.log("AI Warming up...");
       return NextResponse.json({ isHarmful: false }); 
    }

    // 2. Parse the AI's categories
    // Labels are: toxic, severe_toxic, obscene, threat, insult, identity_hate
    const labels = result[0] || [];
    
    // We flag the message if toxicity, insults, or threats are above 80%
    const isHarmful = labels.some((item: any) => 
      ['toxic', 'insult', 'threat', 'identity_hate'].includes(item.label) && item.score > 0.8
    );

    return NextResponse.json({ isHarmful });
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ isHarmful: false }); // Safe fallback
  }
}