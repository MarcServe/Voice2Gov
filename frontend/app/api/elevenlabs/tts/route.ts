import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, voiceId } = body as { text: string; voiceId: string }

    if (!text || !voiceId) {
      return NextResponse.json(
        { error: 'Text and voiceId are required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 503 }
      )
    }

    // Call ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('ElevenLabs API error:', response.status, errorText)
      
      // Provide more specific error messages
      let errorMessage = 'Failed to generate speech'
      if (response.status === 401) {
        errorMessage = 'ElevenLabs API key is invalid or missing'
      } else if (response.status === 400) {
        errorMessage = 'Invalid voice ID or request format'
      } else if (response.status === 429) {
        errorMessage = 'ElevenLabs API rate limit exceeded'
      }
      
      return NextResponse.json(
        { error: errorMessage, details: errorText },
        { status: response.status }
      )
    }

    // Get audio as ArrayBuffer
    const audioBuffer = await response.arrayBuffer()

    // Return audio as base64 or stream
    const base64Audio = Buffer.from(audioBuffer).toString('base64')

    return NextResponse.json({
      audio: base64Audio,
      format: 'mp3',
    })
  } catch (error) {
    console.error('ElevenLabs TTS error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

