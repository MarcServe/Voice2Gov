'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mic, MicOff, Volume2, FileText, Users, Search, X, Loader2, AlertCircle } from 'lucide-react'
import { getSTTHandler, getTTSHandler } from '@/lib/speech'

export default function VoicePage() {
  const router = useRouter()
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('en-NG')
  const sttRef = useRef<ReturnType<typeof getSTTHandler> | null>(null)
  const ttsRef = useRef<ReturnType<typeof getTTSHandler> | null>(null)

  useEffect(() => {
    sttRef.current = getSTTHandler()
    ttsRef.current = getTTSHandler()

    // Check if speech recognition is supported
    if (!sttRef.current.isSupported()) {
      const userAgent = navigator.userAgent.toLowerCase()
      let browserName = 'your browser'
      if (userAgent.includes('chrome')) browserName = 'Chrome'
      else if (userAgent.includes('safari')) browserName = 'Safari'
      else if (userAgent.includes('firefox')) browserName = 'Firefox'
      else if (userAgent.includes('edge')) browserName = 'Edge'
      
      setError(`Speech recognition is not supported in ${browserName}. Please use Chrome, Edge, or Safari for the best experience.`)
    }
  }, [])

  const startListening = async () => {
    console.log('Starting speech recognition...')
    
    if (!sttRef.current || !sttRef.current.isSupported()) {
      const errorMsg = 'Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.'
      console.error(errorMsg)
      setError(errorMsg)
      return
    }

    // Request microphone permission first
    try {
      console.log('Requesting microphone permission...')
      await navigator.mediaDevices.getUserMedia({ audio: true })
      console.log('Microphone permission granted')
    } catch (permissionErr: any) {
      console.error('Microphone permission error:', permissionErr)
      if (permissionErr.name === 'NotAllowedError' || permissionErr.name === 'PermissionDeniedError') {
        setError('Microphone permission denied. Please click the lock icon in your browser address bar and allow microphone access, then try again.')
        return
      } else if (permissionErr.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.')
        return
      } else {
        setError(`Microphone error: ${permissionErr.message || permissionErr.name}`)
        return
      }
    }

    setError(null)
    setTranscript('')
    setInterimTranscript('')
    setIsListening(true)

    try {
      console.log('Starting speech recognition with language:', selectedLanguage)
      sttRef.current.start(
        (result) => {
          console.log('Speech result:', result)
          if (result.isFinal) {
            setTranscript(prev => {
              const newText = prev + (prev ? ' ' : '') + result.transcript.trim()
              return newText
            })
            setInterimTranscript('')
          } else {
            setInterimTranscript(result.transcript)
          }
        },
        (err) => {
          console.error('Speech recognition error:', err)
          setError(err.message)
          setIsListening(false)
        },
        { lang: selectedLanguage, continuous: true }
      )
      console.log('Speech recognition started successfully')
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err)
      setError(err.message || 'Failed to start speech recognition')
      setIsListening(false)
    }
  }

  const stopListening = () => {
    if (sttRef.current) {
      sttRef.current.stop()
    }
    setIsListening(false)
  }

  const handleAction = async () => {
    if (!transcript.trim()) {
      setError('Please speak something first')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Analyze the transcript to determine intent
      const lowerTranscript = transcript.toLowerCase()

      // Check for petition creation intent
      if (lowerTranscript.includes('petition') || lowerTranscript.includes('complaint') || lowerTranscript.includes('issue')) {
        // Extract representative name if mentioned
        const repMatch = transcript.match(/(?:to|for|about)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i)
        if (repMatch) {
          router.push(`/petitions/create?voice=${encodeURIComponent(transcript)}`)
        } else {
          router.push(`/petitions/create?voice=${encodeURIComponent(transcript)}`)
        }
        return
      }

      // Check for representative search intent
      if (lowerTranscript.includes('representative') || lowerTranscript.includes('senator') || lowerTranscript.includes('find') || lowerTranscript.includes('search')) {
        // Extract location or name
        const searchQuery = transcript.replace(/(find|search|representative|senator|for|my)/gi, '').trim()
        router.push(`/representatives?search=${encodeURIComponent(searchQuery)}`)
        return
      }

      // Check for rights/legal questions
      if (lowerTranscript.includes('right') || lowerTranscript.includes('legal') || lowerTranscript.includes('law') || lowerTranscript.includes('constitution')) {
        router.push(`/legal?question=${encodeURIComponent(transcript)}`)
        return
      }

      // Default: show transcript and suggest actions
      setError('I understood: "' + transcript + '". Try saying "create a petition" or "find my representative"')
    } catch (err) {
      setError('Failed to process your request. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const clearTranscript = () => {
    setTranscript('')
    setInterimTranscript('')
    setError(null)
  }

  const languageOptions = [
    { code: 'en-NG', name: 'English' },
    { code: 'yo-NG', name: 'Yoruba' },
    { code: 'ha-NG', name: 'Hausa' },
    { code: 'ig-NG', name: 'Igbo' },
    { code: 'en', name: 'Pidgin' },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-ng-green-500 to-ng-green-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Voice Input
          </h1>
          <p className="text-ng-green-100 text-lg max-w-2xl mx-auto">
            Speak in English, Pidgin, Yoruba, Hausa, or Igbo. We&apos;ll transcribe and help you take action.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="card">
          {/* Language Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Language
            </label>
            <div className="flex flex-wrap gap-2">
              {languageOptions.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang.code)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedLanguage === lang.code
                      ? 'bg-ng-green-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Microphone Button */}
          <div className="text-center mb-8">
            {!sttRef.current?.isSupported() ? (
              <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-3" />
                <p className="text-amber-800 font-medium mb-2">Speech Recognition Not Available</p>
                <p className="text-sm text-amber-700 mb-4">
                  Your browser doesn&apos;t support speech recognition. Please use <strong>Chrome</strong>, <strong>Edge</strong>, or <strong>Safari</strong> for voice input.
                </p>
                <div className="bg-white rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-amber-800 mb-2">Alternative Options:</p>
                  <ul className="text-sm text-amber-700 text-left space-y-1">
                    <li>• Click the example phrases below</li>
                    <li>• Type your request in the text area</li>
                    <li>• Use Chrome/Edge/Safari for voice input</li>
                  </ul>
                </div>
                {/* Text Input Fallback */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2 text-left">
                    Or type your request:
                  </label>
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Type your request here, e.g., 'Create a petition about bad roads'"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ng-green-500 focus:border-ng-green-500"
                    rows={3}
                  />
                  {transcript && (
                    <button
                      onClick={handleAction}
                      className="btn-primary w-full mt-3"
                    >
                      <Search className="w-4 h-4" />
                      Take Action
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={isProcessing}
                  className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto transition-all shadow-lg ${
                    isListening 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                      : 'bg-ng-green-500 hover:bg-ng-green-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isProcessing ? (
                    <Loader2 className="w-16 h-16 text-white animate-spin" />
                  ) : isListening ? (
                    <MicOff className="w-16 h-16 text-white" />
                  ) : (
                    <Mic className="w-16 h-16 text-white" />
                  )}
                </button>
                <p className="mt-4 text-slate-600">
                  {isListening 
                    ? 'Listening... Speak now' 
                    : isProcessing
                    ? 'Processing your request...'
                    : 'Tap the microphone to start speaking'}
                </p>
                {!isListening && (
                  <p className="mt-2 text-xs text-slate-500">
                    You&apos;ll be asked to allow microphone access
                  </p>
                )}
              </>
            )}
          </div>

          {/* Transcript Display / Text Input */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-ng-green-600" />
                <label htmlFor="transcript-input" className="font-medium text-slate-900">
                  What you said:
                </label>
              </div>
              {transcript && (
                <button
                  onClick={clearTranscript}
                  className="p-1 text-slate-400 hover:text-slate-600"
                  title="Clear"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <textarea
              id="transcript-input"
              value={transcript + (interimTranscript ? ' ' + interimTranscript : '')}
              onChange={(e) => {
                // Only update transcript, not interim (interim is from speech recognition)
                setTranscript(e.target.value)
                setInterimTranscript('')
              }}
              placeholder="Speak using the microphone above, or type your request here..."
              className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-ng-green-500 focus:border-ng-green-500 text-slate-700 text-lg min-h-[100px] resize-y"
              rows={3}
            />
            {interimTranscript && (
              <p className="text-xs text-slate-500 mt-2">
                <span className="italic">Listening: {interimTranscript}</span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          {transcript && (
            <div className="space-y-3 mb-6">
              <button
                onClick={handleAction}
                disabled={isProcessing}
                className="btn-primary w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Take Action
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  href={`/petitions/create?voice=${encodeURIComponent(transcript)}`}
                  className="btn-secondary flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Create Petition
                </Link>
                <Link
                  href={`/representatives?search=${encodeURIComponent(transcript)}`}
                  className="btn-secondary flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Find Rep
                </Link>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="border-t pt-6">
            <h3 className="font-medium text-slate-900 mb-3">Try saying:</h3>
            <div className="space-y-2">
              {[
                'Create a petition about bad roads',
                'Find my representative in Lagos',
                'What are my rights as a citizen?',
                'I want to complain about electricity',
              ].map((example, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setTranscript(example)
                    setInterimTranscript('')
                  }}
                  className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm text-slate-700 transition-colors"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-ng-green-50 rounded-xl">
            <h3 className="font-medium text-ng-green-800 mb-2">Supported Languages</h3>
            <div className="flex flex-wrap gap-2">
              {languageOptions.map((lang) => (
                <span key={lang.code} className="badge bg-white text-ng-green-700">
                  {lang.name}
                </span>
              ))}
            </div>
            <p className="text-xs text-ng-green-700 mt-3">
              Note: Speech recognition works best in Chrome, Edge, or Safari. Make sure your microphone is enabled.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


