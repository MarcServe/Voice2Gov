'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Volume2, VolumeX, X, MessageCircle, Loader2 } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface VoiceAssistantProps {
  initialContext?: string // The legal guidance result to summarize
  onClose: () => void
}

export function VoiceAssistant({ initialContext, onClose }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [isReady, setIsReady] = useState(false)
  
  const recognitionRef = useRef<any>(null)
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-NG'

        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex
          const result = event.results[current]
          const transcriptText = result[0].transcript
          setTranscript(transcriptText)
          
          if (result.isFinal) {
            handleUserMessage(transcriptText)
            setTranscript('')
          }
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
          if (event.error === 'not-allowed') {
            setError('Microphone access denied. Please allow microphone access.')
          }
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }

        setIsReady(true)
      } else {
        setError('Speech recognition is not supported in this browser.')
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
      window.speechSynthesis?.cancel()
    }
  }, [])

  // Auto-summarize on mount if context provided
  useEffect(() => {
    if (initialContext && isReady) {
      summarizeContext()
    }
  }, [initialContext, isReady])

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const summarizeContext = async () => {
    if (!initialContext) return
    
    setIsProcessing(true)
    try {
      const response = await fetch('/api/legal/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          context: initialContext,
          instruction: 'Provide a brief, spoken summary of this legal guidance in 3-4 sentences. Be conversational and helpful. End by asking if they have any questions.'
        }),
      })

      if (!response.ok) throw new Error('Failed to get summary')

      const data = await response.json()
      const summaryMessage: Message = { role: 'assistant', content: data.summary }
      setMessages([summaryMessage])
      speak(data.summary)
    } catch (err) {
      setError('Failed to summarize. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUserMessage = async (text: string) => {
    if (!text.trim()) return

    const userMessage: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, userMessage])
    setIsProcessing(true)

    try {
      const response = await fetch('/api/legal/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: initialContext
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      const assistantMessage: Message = { role: 'assistant', content: data.response }
      setMessages(prev => [...prev, assistantMessage])
      speak(data.response)
    } catch (err) {
      setError('Failed to get response. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      stopSpeaking()
      setTranscript('')
      recognitionRef.current?.start()
      setIsListening(true)
    }
  }

  const speak = (text: string) => {
    if (!window.speechSynthesis) return

    stopSpeaking()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-NG'
    utterance.rate = 0.95
    utterance.pitch = 1
    
    // Try to find a good voice
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(v => 
      v.lang.includes('en') && (v.name.includes('Google') || v.name.includes('Natural'))
    ) || voices.find(v => v.lang.includes('en'))
    
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    synthesisRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel()
    setIsSpeaking(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-ng-green-500 to-ng-green-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Voice Assistant</h3>
              <p className="text-sm text-white/80">Ask follow-up questions</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.length === 0 && !isProcessing && (
            <div className="text-center text-slate-500 py-8">
              <Volume2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>Preparing voice summary...</p>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-ng-green-500 text-white rounded-br-sm'
                    : 'bg-white shadow-sm border rounded-bl-sm'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-white shadow-sm border p-3 rounded-2xl rounded-bl-sm">
                <Loader2 className="w-5 h-5 animate-spin text-ng-green-500" />
              </div>
            </div>
          )}

          {transcript && (
            <div className="flex justify-end">
              <div className="bg-ng-green-100 text-ng-green-800 p-3 rounded-2xl rounded-br-sm max-w-[85%]">
                <p className="text-sm italic">{transcript}...</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-2 bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="p-4 bg-white border-t">
          <div className="flex items-center justify-center gap-4">
            {/* Mute/Unmute */}
            <button
              onClick={isSpeaking ? stopSpeaking : () => messages.length > 0 && speak(messages[messages.length - 1].content)}
              className={`p-3 rounded-full transition-colors ${
                isSpeaking 
                  ? 'bg-orange-100 text-orange-600' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title={isSpeaking ? 'Stop speaking' : 'Replay last message'}
            >
              {isSpeaking ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>

            {/* Mic Button */}
            <button
              onClick={toggleListening}
              disabled={!isReady || isProcessing}
              className={`p-5 rounded-full transition-all transform ${
                isListening
                  ? 'bg-red-500 text-white scale-110 animate-pulse'
                  : 'bg-ng-green-500 text-white hover:bg-ng-green-600 hover:scale-105'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>

            {/* Status indicator */}
            <div className="w-12 text-center">
              {isListening && (
                <span className="text-xs text-red-500 font-medium">Listening...</span>
              )}
              {isSpeaking && (
                <span className="text-xs text-orange-500 font-medium">Speaking...</span>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-slate-500 mt-3">
            {isListening ? 'Speak your question now...' : 'Tap the microphone to ask a question'}
          </p>
        </div>
      </div>
    </div>
  )
}


