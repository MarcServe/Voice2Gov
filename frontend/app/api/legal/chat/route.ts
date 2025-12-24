import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, context } = body as { messages: Message[], context?: string }

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI not configured' }, { status: 503 })
    }

    // Build conversation history for OpenAI
    const openaiMessages: { role: 'system' | 'user' | 'assistant', content: string }[] = [
      {
        role: 'system',
        content: `You are a friendly, knowledgeable Nigerian legal assistant having a voice conversation with a citizen.

CONTEXT (previous legal guidance given):
${context || 'No previous context'}

YOUR ROLE:
- Answer questions about Nigerian law clearly and helpfully
- Reference specific laws, acts, and sections when relevant
- Keep responses conversational - they will be read aloud
- Use simple language that anyone can understand
- Be warm and reassuring, but accurate
- If you don't know something, say so honestly
- Suggest practical next steps when appropriate

RESPONSE FORMAT:
- Keep responses concise (2-4 sentences is ideal for voice)
- Don't use bullet points, numbers, or formatting
- Write as natural speech
- End longer explanations with a check-in like "Does that help?" or "Would you like to know more about that?"

TOPICS YOU CAN HELP WITH:
- Tenant/landlord rights
- Employment and labor rights
- Education rights
- Property rights
- Family and marriage law
- Consumer protection
- Criminal justice rights
- Human rights
- Business and contract law`
      }
    ]

    // Add conversation history
    for (const msg of messages) {
      openaiMessages.push({
        role: msg.role,
        content: msg.content
      })
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: openaiMessages,
      temperature: 0.7,
      max_tokens: 400,
    })

    const response = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process that. Could you try asking again?"

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 })
  }
}


