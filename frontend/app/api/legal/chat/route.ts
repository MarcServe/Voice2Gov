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
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError)
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    
    const { messages, context } = body as { messages?: Message[], context?: string }

    // Validate messages - ensure it's an array with at least one valid message
    if (!messages) {
      console.error('Messages field is missing from request body')
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
    }
    
    if (!Array.isArray(messages)) {
      console.error('Messages is not an array:', { messages, type: typeof messages })
      return NextResponse.json({ error: 'Messages must be an array' }, { status: 400 })
    }
    
    // Filter out invalid messages and ensure we have at least one
    const validMessages = messages.filter(
      (m: any) => m && m.role && m.content && typeof m.content === 'string' && m.content.trim().length > 0
    )
    
    if (validMessages.length === 0) {
      console.error('No valid messages found:', { messages, validMessages })
      return NextResponse.json({ error: 'No valid messages provided. Each message must have role and content.' }, { status: 400 })
    }
    
    console.log(`Processing ${validMessages.length} valid messages (${messages.length} total provided)`)

    // Check OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey || apiKey.trim() === '') {
      console.error('OpenAI API key is missing or empty')
      return NextResponse.json({ 
        error: 'OpenAI API key is not configured. Please add OPENAI_API_KEY to your Vercel environment variables.' 
      }, { status: 503 })
    }

    // Validate API key format (should start with 'sk-')
    if (!apiKey.startsWith('sk-')) {
      console.error('OpenAI API key format is invalid (should start with sk-)')
      return NextResponse.json({ 
        error: 'OpenAI API key format is invalid. Please check your Vercel environment variables.' 
      }, { status: 503 })
    }

    // Build system message with context
    const systemContent = `You are a friendly, knowledgeable Nigerian legal assistant having a voice conversation with a citizen.

${context ? `CONTEXT (previous legal guidance given):
${context}

` : ''}YOUR ROLE:
- Answer questions about Nigerian law clearly and helpfully
- Reference specific laws, acts, and sections when relevant
- Keep responses conversational - they will be read aloud
- Use simple language that anyone can understand
- Be warm and reassuring, but accurate
- If you don't know something, say so honestly
- Suggest practical next steps when appropriate
- Maintain conversation context - remember what was discussed earlier in this conversation

RESPONSE FORMAT:
- Keep responses concise (2-4 sentences is ideal for voice)
- Don't use bullet points, numbers, or formatting
- Write as natural speech
- End longer explanations with a check-in like "Does that help?" or "Would you like to know more about that?"
- Reference previous parts of the conversation when relevant (e.g., "As I mentioned earlier..." or "Building on what we discussed...")

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

    // Build conversation history for OpenAI
    const openaiMessages: { role: 'system' | 'user' | 'assistant', content: string }[] = [
      {
        role: 'system',
        content: systemContent
      }
    ]

    // Add conversation history - ensure we maintain proper order
    for (const msg of validMessages) {
      openaiMessages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content.trim()
      })
    }
    
    console.log(`Sending conversation with ${openaiMessages.length} total messages (including system message)`)

    console.log(`Calling OpenAI API with ${openaiMessages.length} messages`)
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: openaiMessages,
      temperature: 0.7,
      max_tokens: 400,
    })

    const response = completion.choices[0]?.message?.content
    
    if (!response) {
      console.error('OpenAI returned empty response. Completion:', completion)
      return NextResponse.json({ error: 'Empty response from AI service' }, { status: 500 })
    }

    console.log('OpenAI response received successfully:', response.substring(0, 100))
    return NextResponse.json({ response })
  } catch (error: any) {
    console.error('Chat API error:', {
      message: error?.message,
      status: error?.status,
      code: error?.code,
      type: error?.type,
      stack: error?.stack?.substring(0, 200)
    })
    
    // Provide more specific error messages based on OpenAI API errors
    if (error?.status === 401 || error?.code === 'invalid_api_key' || error?.message?.includes('API key')) {
      return NextResponse.json({ 
        error: 'OpenAI API key is invalid or expired. Please check your OPENAI_API_KEY in Vercel environment variables.' 
      }, { status: 503 })
    } else if (error?.status === 429 || error?.code === 'rate_limit_exceeded') {
      return NextResponse.json({ 
        error: 'OpenAI rate limit exceeded. Please wait a moment and try again.' 
      }, { status: 429 })
    } else if (error?.status === 500 || error?.code === 'server_error') {
      return NextResponse.json({ 
        error: 'OpenAI service is temporarily unavailable. Please try again in a moment.' 
      }, { status: 503 })
    } else if (error?.message) {
      return NextResponse.json({ 
        error: `OpenAI API error: ${error.message}` 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      error: 'Failed to get response from AI service. Please check your OpenAI API key configuration.' 
    }, { status: 500 })
  }
}


