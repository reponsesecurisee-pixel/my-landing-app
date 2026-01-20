import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { systemPrompt, userMessage } = await req.json();

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      model: "gpt-4o-mini",
    });

    const result = completion.choices[0].message.content;
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 });
  }
}
