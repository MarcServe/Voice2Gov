import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { context, instruction } = body

    if (!context) {
      return NextResponse.json({ error: 'No context provided' }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI not configured' }, { status: 503 })
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a friendly Nigerian legal assistant helping citizens understand their rights. 
          
Your task is to provide a SPOKEN summary - write as if you're speaking to someone.

IMPORTANT:
- Keep it brief (3-4 sentences max)
- Use simple, conversational language
- Don't use bullet points or formatting - this will be read aloud
- Be warm and helpful
- End with an invitation to ask questions

Example tone: "Based on what I found, you have several important rights as a tenant in Nigeria. The law says your landlord cannot evict you without going to court first, and you're entitled to a written agreement. Would you like me to explain any of these rights in more detail?"`
        },
        {
          role: 'user',
          content: `${instruction || 'Summarize this legal guidance in a conversational way for voice output:'}\n\n${context}`
        }
      ],
      temperature: 0.7,
      max_tokens: 300,
    })

    const summary = completion.choices[0]?.message?.content || 'I found some information about your rights, but had trouble summarizing it. Would you like to ask a specific question?'

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Summarize error:', error)
    return NextResponse.json({ error: 'Failed to summarize' }, { status: 500 })
  }
}


