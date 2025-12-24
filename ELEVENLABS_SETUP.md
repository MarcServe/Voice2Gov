# ElevenLabs Voice Setup Guide

## Setup Instructions

1. **Add your ElevenLabs API Key**
   - Add `ELEVENLABS_API_KEY=your_api_key_here` to your `.env.local` file in the `frontend` directory

2. **Add Your Voice IDs**
   - Open `frontend/app/admin/page.tsx` and `frontend/app/dashboard/page.tsx`
   - Replace `VOICE_ID_2` and `VOICE_ID_3` with your actual ElevenLabs voice IDs
   - You currently have one voice ID: `JBFqnCBsd6RMkjVDRZzb`

3. **Voice IDs Location**
   - Admin Panel: `frontend/app/admin/page.tsx` (line ~18-35)
   - User Dashboard: `frontend/app/dashboard/page.tsx` (line ~20-35)

## How It Works

- **Admin Panel**: Admins can select the default voice for the platform
- **User Dashboard**: Users can select their preferred voice from the 3 Nigerian voices
- **Automatic Fallback**: If ElevenLabs is unavailable, the system falls back to browser TTS
- **Voice Preference**: User preferences override admin defaults

## Testing

1. Go to Admin Panel → Voice Settings
2. Select a Nigerian voice
3. Click "Test" to hear the voice
4. Users can do the same from their Dashboard

## API Route

The ElevenLabs TTS API route is located at:
- `frontend/app/api/elevenlabs/tts/route.ts`

This route handles the conversion of text to speech using your ElevenLabs API key.

