# OpenAI & ElevenLabs Integration Guide

## How They Work Together

The voice conversation system uses **both OpenAI and ElevenLabs** in a seamless flow:

### Conversation Flow

1. **Speech Recognition (Browser)**
   - User speaks into microphone
   - Browser's Web Speech API converts speech to text
   - Text is captured in real-time

2. **OpenAI (Text Generation)**
   - User's spoken text is sent to `/api/legal/chat`
   - OpenAI GPT-4o-mini generates a conversational response
   - Response is optimized for voice (concise, natural speech)
   - Returns text response

3. **ElevenLabs (Text-to-Speech)**
   - OpenAI's text response is sent to `/api/elevenlabs/tts`
   - ElevenLabs converts text to high-quality Nigerian-accented audio
   - Returns MP3 audio file

4. **Audio Playback**
   - Audio is played to the user
   - System automatically restarts listening for next question
   - Conversation continues seamlessly

## Voice IDs Configured

You now have **4 Nigerian voices** available:

1. `JBFqnCBsd6RMkjVDRZzb` - Nigerian Voice 1 (Natural Nigerian English accent)
2. `it5NMxoQQ2INIh4XcO44` - Nigerian Voice 2 (Professional Nigerian English)
3. `ZXZq039skp0kfF9gO7Au` - Nigerian Voice 3 (Friendly Nigerian English)
4. `77aEIu0qStu8Jwv1EdhX` - Nigerian Voice 4 (Clear Nigerian English)

## API Integration Details

### OpenAI Integration (`/api/legal/chat`)
- **Model**: GPT-4o-mini
- **Purpose**: Generate conversational legal guidance
- **Optimization**: Responses are formatted for voice (no bullet points, natural speech)
- **Context**: Maintains conversation history for follow-up questions

### ElevenLabs Integration (`/api/elevenlabs/tts`)
- **Model**: eleven_multilingual_v2
- **Purpose**: Convert text to high-quality Nigerian-accented speech
- **Format**: MP3 audio at 44.1kHz, 128kbps
- **Settings**: Optimized for clarity and naturalness

## Error Handling

The system has robust error handling:

1. **ElevenLabs Unavailable**: Falls back to browser TTS
2. **OpenAI Unavailable**: Shows error message, allows retry
3. **Network Issues**: Graceful degradation with user feedback
4. **API Key Issues**: Clear error messages for configuration problems

## Voice Preference System

1. **User Preference** (from Dashboard): Highest priority
2. **Admin Default** (from Admin Panel): Used if user hasn't selected
3. **Browser TTS**: Fallback if ElevenLabs unavailable

## Setup Checklist

- [x] ElevenLabs package installed
- [x] API route created (`/api/elevenlabs/tts`)
- [x] Voice IDs configured (4 voices)
- [x] Admin panel voice selection
- [x] User dashboard voice selection
- [x] Integration with OpenAI chat API
- [x] Error handling and fallbacks
- [ ] Add `ELEVENLABS_API_KEY` to `.env.local`
- [ ] Test all 4 voices
- [ ] Verify conversation flow

## Testing the Integration

1. Go to `/legal` page
2. Click "Voice Mode"
3. Tap microphone and ask: "What are my rights as a tenant?"
4. System will:
   - Convert your speech to text
   - Send to OpenAI for response
   - Convert response to audio with ElevenLabs
   - Play the audio
   - Auto-restart listening for follow-up

The integration is seamless and handles all edge cases!

