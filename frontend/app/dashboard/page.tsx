'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  User, Volume2, Settings, ArrowLeft, Check, Loader2,
  Mic, FileText, Users, Shield
} from 'lucide-react'

interface ElevenLabsVoice {
  id: string
  name: string
  description?: string
}

// Predefined Nigerian voices from ElevenLabs
const NIGERIAN_VOICES: ElevenLabsVoice[] = [
  {
    id: 'JBFqnCBsd6RMkjVDRZzb',
    name: 'Nigerian Voice 1',
    description: 'Natural Nigerian English accent'
  },
  {
    id: 'it5NMxoQQ2INIh4XcO44',
    name: 'Nigerian Voice 2',
    description: 'Professional Nigerian English'
  },
  {
    id: 'ZXZq039skp0kfF9gO7Au',
    name: 'Nigerian Voice 3',
    description: 'Friendly Nigerian English'
  },
  {
    id: '77aEIu0qStu8Jwv1EdhX',
    name: 'Nigerian Voice 4',
    description: 'Clear Nigerian English'
  }
]

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [selectedVoice, setSelectedVoice] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/dashboard')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      // Load saved voice preference
      const saved = localStorage.getItem('voice2gov_user_voice')
      if (saved) {
        setSelectedVoice(saved)
      } else {
        // Default to first Nigerian voice
        setSelectedVoice(NIGERIAN_VOICES[0].id)
      }
    }
  }, [user])

  const handleVoiceChange = async (voiceId: string) => {
    setSelectedVoice(voiceId)
    localStorage.setItem('voice2gov_user_voice', voiceId)
    
    // Test the voice
    setTesting(voiceId)
    try {
      const response = await fetch('/api/elevenlabs/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'This is a test of your selected Nigerian voice. How does it sound?',
          voiceId: voiceId
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const audioData = Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))
        const audioBlob = new Blob([audioData], { type: 'audio/mpeg' })
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl)
          setTesting(null)
        }
        
        await audio.play()
      }
    } catch (error) {
      console.error('Error testing voice:', error)
      setTesting(null)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-ng-green-600" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-ng-green-600 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
                <User className="w-6 h-6 text-ng-green-600" />
                My Dashboard
              </h1>
              <p className="text-slate-600 mt-1">Manage your preferences and settings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Voice Settings */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-ng-green-100 rounded-xl flex items-center justify-center">
              <Volume2 className="w-6 h-6 text-ng-green-600" />
            </div>
            <div>
              <h2 className="font-semibold text-lg text-slate-900">Voice Preferences</h2>
              <p className="text-sm text-slate-600">Choose your preferred Nigerian voice for audio responses</p>
            </div>
          </div>

          <div className="space-y-3">
            {NIGERIAN_VOICES.map((voice) => (
              <div
                key={voice.id}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedVoice === voice.id
                    ? 'border-ng-green-500 bg-ng-green-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
                onClick={() => handleVoiceChange(voice.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-slate-900">{voice.name}</h3>
                      {selectedVoice === voice.id && (
                        <Check className="w-5 h-5 text-ng-green-600" />
                      )}
                      {testing === voice.id && (
                        <Loader2 className="w-4 h-4 animate-spin text-ng-green-600" />
                      )}
                    </div>
                    {voice.description && (
                      <p className="text-sm text-slate-600">{voice.description}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">Voice ID: {voice.id}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleVoiceChange(voice.id)
                    }}
                    className="ml-4 px-4 py-2 bg-ng-green-500 text-white rounded-lg hover:bg-ng-green-600 transition-colors text-sm"
                    disabled={testing === voice.id}
                  >
                    {testing === voice.id ? 'Testing...' : 'Test'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Your voice preference will be used for all audio responses throughout the platform, 
              including legal guidance, representative information, and voice input responses.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="font-semibold text-lg text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/representatives"
              className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-3"
            >
              <Users className="w-5 h-5 text-ng-green-600" />
              <div>
                <h3 className="font-medium text-slate-900">Find Representatives</h3>
                <p className="text-sm text-slate-600">Search for your elected officials</p>
              </div>
            </Link>
            <Link
              href="/petitions/create"
              className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-3"
            >
              <FileText className="w-5 h-5 text-ng-green-600" />
              <div>
                <h3 className="font-medium text-slate-900">Create Petition</h3>
                <p className="text-sm text-slate-600">Start a new petition</p>
              </div>
            </Link>
            <Link
              href="/voice"
              className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-3"
            >
              <Mic className="w-5 h-5 text-ng-green-600" />
              <div>
                <h3 className="font-medium text-slate-900">Voice Input</h3>
                <p className="text-sm text-slate-600">Use voice to interact</p>
              </div>
            </Link>
            <Link
              href="/legal"
              className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-3"
            >
              <Shield className="w-5 h-5 text-ng-green-600" />
              <div>
                <h3 className="font-medium text-slate-900">Know Your Rights</h3>
                <p className="text-sm text-slate-600">Get legal guidance</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

