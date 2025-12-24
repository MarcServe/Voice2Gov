'use client'

import { useState, useEffect, useRef } from 'react'
import { Bookmark, BookmarkCheck, Copy, Check, History, Trash2, X, Mic, MicOff, Volume2, VolumeX, MessageCircle, Loader2, AlertCircle, FileText } from 'lucide-react'
import { VoiceAssistant } from '@/components/VoiceAssistant'
import { getSTTHandler, getTTSHandler, resetSTTHandler } from '@/lib/speech'

interface Section {
  id: number
  chapter: string
  section: string
  heading: string
  content: string
  tags: string[]
}

interface ResponseBody {
  question: string
  answer: string
  sections: Section[]
}

interface SavedGuidance {
  id: string
  question: string
  answer: string
  sections: Section[]
  savedAt: string
}

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function LegalPage() {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ResponseBody | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [savedItems, setSavedItems] = useState<SavedGuidance[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false)
  
  // Voice conversation state
  const [voiceMode, setVoiceMode] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceTranscript, setVoiceTranscript] = useState('')
  const [conversation, setConversation] = useState<ConversationMessage[]>([])
  const [voiceProcessing, setVoiceProcessing] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('en-NG')
  const sttRef = useRef<ReturnType<typeof getSTTHandler> | null>(null)
  const ttsRef = useRef<ReturnType<typeof getTTSHandler> | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const conversationRef = useRef<ConversationMessage[]>([]) // Ref to track latest conversation state

  // Load saved items from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('voice2gov_saved_guidance')
    if (stored) {
      setSavedItems(JSON.parse(stored))
    }
  }, [])

  // Initialize speech handlers
  useEffect(() => {
    sttRef.current = getSTTHandler()
    ttsRef.current = getTTSHandler()
  }, [])

  // Scroll to bottom of conversation and sync ref
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    conversationRef.current = conversation // Keep ref in sync with state
  }, [conversation])

  // Save to localStorage
  const saveResult = () => {
    if (!result) return
    
    const newItem: SavedGuidance = {
      id: Date.now().toString(),
      question: result.question,
      answer: result.answer,
      sections: result.sections,
      savedAt: new Date().toISOString()
    }
    
    const updated = [newItem, ...savedItems].slice(0, 20) // Keep max 20 items
    setSavedItems(updated)
    localStorage.setItem('voice2gov_saved_guidance', JSON.stringify(updated))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Delete saved item
  const deleteSavedItem = (id: string) => {
    const updated = savedItems.filter(item => item.id !== id)
    setSavedItems(updated)
    localStorage.setItem('voice2gov_saved_guidance', JSON.stringify(updated))
  }

  // Load saved item
  const loadSavedItem = (item: SavedGuidance) => {
    setResult({
      question: item.question,
      answer: item.answer,
      sections: item.sections
    })
    setShowHistory(false)
  }

  // Copy to clipboard
  const copyToClipboard = () => {
    if (!result) return
    const text = `Question: ${result.question}\n\n${result.answer}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const askQuestion = async (questionText?: string) => {
    const questionToAsk = questionText || question
    if (!questionToAsk.trim()) {
      setError('Describe your issue or rights question first.')
      return
    }
    setError(null)
    setLoading(true)
    setResult(null)

    try {
      console.log('Sending question to API:', questionToAsk)
      const response = await fetch('/api/legal/constitution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: questionToAsk }),
      })

      console.log('API response status:', response.status)

      if (!response.ok) {
        let errorMessage = 'Unable to reach the legal assistant.'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
          console.error('API error:', errorData)
        } catch {
          const textResponse = await response.text()
          errorMessage = textResponse || errorMessage
          console.error('API error (text):', textResponse)
        }
        
        // Provide helpful error messages
        if (response.status === 503 && errorMessage.includes('OpenAI')) {
          throw new Error('OpenAI API is not configured. Please add OPENAI_API_KEY to your Vercel environment variables.')
        } else if (response.status === 503) {
          throw new Error('AI service is temporarily unavailable. Please check your API configuration.')
        } else {
          throw new Error(errorMessage)
        }
      }

      const data: ResponseBody = await response.json()
      console.log('API response received successfully')
      setResult(data)
      
      // If in voice mode, add to conversation and speak
      if (voiceMode) {
        setConversation(prev => [
          ...prev,
          { role: 'user', content: questionToAsk, timestamp: new Date() },
          { role: 'assistant', content: data.answer, timestamp: new Date() }
        ])
        speakAnswer(data.answer)
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  // Voice conversation handlers
  const startVoiceListening = async () => {
    if (!sttRef.current?.isSupported()) {
      // Detect browser for better error message
      const userAgent = navigator.userAgent.toLowerCase()
      let browserName = 'your browser'
      if (userAgent.includes('firefox')) browserName = 'Firefox'
      else if (userAgent.includes('chrome')) browserName = 'Chrome'
      else if (userAgent.includes('safari')) browserName = 'Safari'
      else if (userAgent.includes('edge')) browserName = 'Edge'
      
      setError(`Speech recognition is not supported in ${browserName}. Voice mode requires Chrome, Edge, or Safari. You can still use Text Mode to chat with the assistant.`)
      return
    }

    // Prevent starting if already listening
    if (isListening) {
      console.log('Already listening, skipping start')
      return
    }

    // Stop any ongoing speech
    stopSpeaking()

    // Request microphone permission (if not already granted)
    try {
      console.log('Requesting microphone permission in startVoiceListening...')
      await navigator.mediaDevices.getUserMedia({ audio: true })
      console.log('Microphone permission granted')
    } catch (permissionErr: any) {
      console.error('Microphone permission error:', permissionErr)
      if (permissionErr.name === 'NotAllowedError' || permissionErr.name === 'PermissionDeniedError') {
        setError('Microphone permission denied. Please allow microphone access in your browser settings.')
        setIsListening(false)
        return
      } else if (permissionErr.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone.')
        setIsListening(false)
        return
      } else {
        setError(`Microphone error: ${permissionErr.message}`)
        setIsListening(false)
        return
      }
    }

    setError(null)
    setVoiceTranscript('')
    setIsListening(true)
    console.log('Starting speech recognition...')

    try {
      console.log('Starting speech recognition with language:', selectedLanguage)
      
      // Aggressively stop and reset recognition to ensure clean state
      if (sttRef.current) {
        console.log('Stopping existing recognition...')
        try {
          sttRef.current.forceStop()
        } catch (err) {
          console.warn('Error in forceStop:', err)
        }
        // Wait longer to ensure cleanup
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Reset the singleton instance completely
        resetSTTHandler()
        await new Promise(resolve => setTimeout(resolve, 200))
        
        // Get a fresh instance
        sttRef.current = getSTTHandler()
      }
      
      // Double-check we're not already listening before starting
      if (isListening || (sttRef.current && sttRef.current.getIsListening())) {
        console.log('Still listening after reset, aborting start')
        setIsListening(false)
        return
      }
      
      // Ensure we have a fresh recognition instance
      if (!sttRef.current || !sttRef.current.isSupported()) {
        console.error('Speech recognition not available after reset')
        setError('Speech recognition is not available. Please refresh the page.')
        return
      }
      
      console.log('Starting fresh recognition instance...')
      await sttRef.current.start(
        (result) => {
          console.log('Speech recognition result:', { 
            transcript: result.transcript.substring(0, 50), 
            isFinal: result.isFinal,
            confidence: result.confidence 
          })
          
          if (result.isFinal && result.transcript.trim()) {
            const transcript = result.transcript.trim()
            console.log('Final transcript received:', transcript)
            setVoiceTranscript('')
            // Stop listening before processing
            stopVoiceListening()
            handleVoiceQuestion(transcript)
            // Don't auto-restart here - let speakAnswer handle it after TTS completes
          } else {
            // Show interim results
            setVoiceTranscript(result.transcript)
          }
        },
        (err) => {
          console.error('Speech recognition error:', err)
          setError(err.message)
          setIsListening(false)
        },
        { lang: selectedLanguage, continuous: false } // false = stops after silence, better for question-answer flow
      )
    } catch (err: any) {
      setError(err.message || 'Failed to start speech recognition')
      setIsListening(false)
    }
  }

  const stopVoiceListening = () => {
    console.log('Stopping voice listening...')
    if (sttRef.current) {
      sttRef.current.stop()
    }
    setIsListening(false)
    // Clear any pending timeouts that might restart listening
    // (This is handled by checking state before restarting)
  }

  const handleVoiceQuestion = async (questionText: string) => {
    if (!questionText || !questionText.trim()) {
      console.warn('Empty question text provided')
      return
    }

    console.log('Handling voice question:', questionText)
    setVoiceProcessing(true)
    
    const trimmedQuestion = questionText.trim()
    const userMessage: ConversationMessage = { 
      role: 'user', 
      content: trimmedQuestion, 
      timestamp: new Date() 
    }
    
    // Get current conversation from ref (always up-to-date) and add user message
    const currentConversation = conversationRef.current || []
    console.log('Current conversation length:', currentConversation.length)
    
    const updatedConversation = [...currentConversation, userMessage]
    console.log('Updated conversation length:', updatedConversation.length)
    
    // Update both state and ref immediately
    setConversation(updatedConversation)
    conversationRef.current = updatedConversation

    try {
      // Format messages for API - ensure we have valid messages
      const formattedMessages = updatedConversation
        .filter(m => m && m.role && m.content && m.content.trim())
        .map(m => ({ 
          role: m.role as 'user' | 'assistant', 
          content: m.content.trim() 
        }))
      
      if (formattedMessages.length === 0) {
        throw new Error('No valid messages to send. Please try again.')
      }
      
      console.log('Calling /api/legal/chat with messages:', formattedMessages.length)
      console.log('Conversation history:', formattedMessages.map(m => `${m.role}: ${m.content.substring(0, 50)}...`))
      
      // Use the chat API for real-time conversation
      const response = await fetch('/api/legal/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: formattedMessages,
          context: result?.answer // Include previous context if available
        }),
      })

      console.log('API response status:', response.status)

      if (!response.ok) {
        let errorText = ''
        try {
          const errorData = await response.json()
          errorText = errorData.error || errorData.message || 'Unknown error'
          console.error('API error response:', errorData)
        } catch (parseError) {
          const textResponse = await response.text()
          errorText = textResponse || `HTTP ${response.status}`
          console.error('API error (text):', textResponse)
        }
        console.error('API error details:', { status: response.status, error: errorText })
        
        // Provide user-friendly error messages
        if (response.status === 503 && errorText.includes('OpenAI')) {
          throw new Error('OpenAI service is not configured. Please check your API keys in Vercel environment variables.')
        } else if (response.status === 503) {
          throw new Error('AI service is temporarily unavailable. Please try again.')
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.')
        } else if (response.status === 500) {
          throw new Error('Server error. Please try again in a moment.')
        } else {
          throw new Error(`Failed to get response: ${errorText}`)
        }
      }

      const data = await response.json()
      console.log('API response data:', data)
      
      if (!data || !data.response) {
        console.error('API returned invalid response:', data)
        throw new Error('Invalid response from server. Please try again.')
      }
      
      console.log('Successfully received response:', data.response.substring(0, 100))

      const assistantMessage: ConversationMessage = { 
        role: 'assistant', 
        content: data.response, 
        timestamp: new Date() 
      }
      // Update both state and ref with assistant response
      const finalConversation = [...conversationRef.current, assistantMessage]
      setConversation(finalConversation)
      conversationRef.current = finalConversation
      
      // Also update result for display consistency
      if (!result) {
        setResult({
          question: questionText,
          answer: data.response,
          sections: []
        })
      }
      
      console.log('Speaking answer:', data.response.substring(0, 50))
      await speakAnswer(data.response)
    } catch (err: any) {
      console.error('Error in handleVoiceQuestion:', err)
      const errorMessage = err.message || 'Failed to get response. Please try again.'
      setError(errorMessage)
      const errorAssistantMessage: ConversationMessage = { 
        role: 'assistant', 
        content: `I'm sorry, I couldn't process that. ${errorMessage.includes('OpenAI') ? 'The AI service may not be configured.' : 'Please try again.'}`, 
        timestamp: new Date() 
      }
      const errorConversation = [...conversationRef.current, errorAssistantMessage]
      setConversation(errorConversation)
      conversationRef.current = errorConversation
      // Still try to restart listening even on error
      if (voiceMode && !isListening) {
        setTimeout(() => {
          startVoiceListening()
        }, 2000)
      }
    } finally {
      setVoiceProcessing(false)
    }
  }

  const speakAnswer = async (text: string) => {
    if (!ttsRef.current) {
      console.error('TTS handler not initialized')
      setIsSpeaking(false)
      return
    }
    
    if (!text || !text.trim()) {
      console.warn('Empty text provided to speakAnswer')
      setIsSpeaking(false)
      return
    }
    
    setIsSpeaking(true)
    console.log('Starting TTS for:', text.substring(0, 50) + '...')
    
    try {
      // Get selected voice from localStorage - prioritize user preference, then admin preference
      const userElevenLabsVoice = localStorage.getItem('voice2gov_user_voice')
      const adminElevenLabsVoice = localStorage.getItem('voice2gov_elevenlabs_voice')
      
      // Default Nigerian voices if none selected
      const DEFAULT_NIGERIAN_VOICES = [
        'JBFqnCBsd6RMkjVDRZzb', // Nigerian Voice 1
        'it5NMxoQQ2INIh4XcO44', // Nigerian Voice 2
        'ZXZq039skp0kfF9gO7Au', // Nigerian Voice 3
        '77aEIu0qStu8Jwv1EdhX'  // Nigerian Voice 4
      ]
      
      // Use user preference, then admin preference, then default to first Nigerian voice
      let savedElevenLabsVoice = userElevenLabsVoice || adminElevenLabsVoice
      
      // If no voice is set, use the first Nigerian voice as default
      if (!savedElevenLabsVoice || !DEFAULT_NIGERIAN_VOICES.includes(savedElevenLabsVoice)) {
        savedElevenLabsVoice = DEFAULT_NIGERIAN_VOICES[0]
        // Save it for future use
        if (!adminElevenLabsVoice) {
          localStorage.setItem('voice2gov_elevenlabs_voice', savedElevenLabsVoice)
        }
        console.log('Using default Nigerian voice:', savedElevenLabsVoice)
      }
      
      const savedBrowserVoice = localStorage.getItem('voice2gov_selected_voice')
      
      const onSpeechEnd = () => {
        console.log('TTS ended, preparing to restart listening...', { 
          voiceMode, 
          isListening, 
          isSpeaking: false,
          voiceProcessing 
        })
        setIsSpeaking(false)
        
        // Auto-restart listening after speaking ends
        if (voiceMode && !isListening && !voiceProcessing) {
          // Longer delay to ensure TTS is completely done and recognition can start fresh
          setTimeout(async () => {
            // Double-check state before starting
            if (voiceMode && !isListening && !isSpeaking && !voiceProcessing) {
              console.log('Starting voice listening after speech end')
              // Reset recognition to ensure clean start - this prevents "already started" errors
              try {
                if (sttRef.current) {
                  resetSTTHandler()
                  // Small delay to ensure cleanup
                  await new Promise(resolve => setTimeout(resolve, 300))
                  sttRef.current = getSTTHandler()
                }
                await startVoiceListening()
              } catch (err: any) {
                console.error('Failed to restart listening after TTS:', err)
                // If it fails, try one more time after a delay with another reset
                setTimeout(async () => {
                  if (voiceMode && !isListening && !isSpeaking && !voiceProcessing) {
                    console.log('Retrying voice listening with reset...')
                    try {
                      resetSTTHandler()
                      await new Promise(resolve => setTimeout(resolve, 300))
                      sttRef.current = getSTTHandler()
                      await startVoiceListening()
                    } catch (retryErr: any) {
                      console.error('Retry also failed:', retryErr)
                      setError(`Failed to restart voice listening: ${retryErr.message}. Please click the microphone button manually.`)
                    }
                  }
                }, 2000)
              }
            } else {
              console.log('Skipping restart - state check failed:', {
                voiceMode,
                isListening,
                isSpeaking,
                voiceProcessing
              })
            }
          }, 1500) // Longer delay to ensure everything is settled
        }
      }
      
      // Always try ElevenLabs first if voice is set, but fallback to browser TTS if it fails
      if (savedElevenLabsVoice) {
        console.log('Attempting ElevenLabs TTS with voice:', savedElevenLabsVoice)
        try {
          await ttsRef.current.speak(text, {
            lang: selectedLanguage,
            voiceId: savedElevenLabsVoice,
            useElevenLabs: true,
            onEnd: onSpeechEnd
          })
          console.log('ElevenLabs TTS completed successfully')
        } catch (elevenLabsError: any) {
          console.warn('ElevenLabs TTS failed, using browser TTS fallback:', elevenLabsError)
          // Fallback to browser TTS
          await ttsRef.current.speak(text, {
            lang: selectedLanguage,
            voice: savedBrowserVoice || undefined,
            useElevenLabs: false,
            onEnd: onSpeechEnd
          })
        }
      } else {
        console.log('Using browser TTS (no ElevenLabs voice configured)')
        await ttsRef.current.speak(text, {
          lang: selectedLanguage,
          voice: savedBrowserVoice || undefined,
          useElevenLabs: false,
          onEnd: onSpeechEnd
        })
      }
    } catch (error: any) {
      console.error('Error speaking answer:', error)
      setError(`Failed to speak response: ${error.message || 'Unknown error'}`)
      setIsSpeaking(false)
      // Still try to restart listening even if speaking failed
      if (voiceMode && !isListening && !voiceProcessing) {
        setTimeout(() => {
          if (!isListening && !isSpeaking) {
            startVoiceListening().catch(err => {
              console.error('Failed to restart listening after TTS error:', err)
            })
          }
        }, 1000)
      }
    }
  }

  const stopSpeaking = () => {
    if (ttsRef.current) {
      ttsRef.current.stop()
    }
    setIsSpeaking(false)
  }

  const clearConversation = () => {
    setConversation([])
    conversationRef.current = [] // Clear ref as well
    stopSpeaking()
    stopVoiceListening()
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl space-y-8">
        <div className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-ng-green-600">Know Your Rights</p>
          <h1 className="font-display text-4xl font-bold text-slate-900">
            Nigerian Legal Assistant
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Ask about your rights under Nigerian law. Our AI references the Constitution, Child Rights Act, 
            Labour Act, Tenancy Laws, and more — giving you comprehensive, practical guidance on what you can do.
          </p>
          
          {/* Voice/Text Mode Toggle */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => {
                setVoiceMode(false)
                stopSpeaking()
                stopVoiceListening()
              }}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                !voiceMode
                  ? 'bg-ng-green-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Text Mode
            </button>
            <button
              onClick={async () => {
                setVoiceMode(true)
                setResult(null)
                
                // Request microphone permission immediately
                try {
                  console.log('Requesting microphone permission...')
                  await navigator.mediaDevices.getUserMedia({ audio: true })
                  console.log('Microphone permission granted')
                } catch (permissionErr: any) {
                  console.error('Microphone permission error:', permissionErr)
                  if (permissionErr.name === 'NotAllowedError' || permissionErr.name === 'PermissionDeniedError') {
                    setError('Microphone permission denied. Please allow microphone access in your browser settings.')
                    return
                  } else if (permissionErr.name === 'NotFoundError') {
                    setError('No microphone found. Please connect a microphone.')
                    return
                  }
                }
                
                if (conversation.length === 0) {
                  // Start with a greeting
                  const greeting = "Hello! I'm your Nigerian legal assistant. I can help you understand your rights under Nigerian law. What would you like to know?"
                  const greetingMessage: ConversationMessage = { role: 'assistant', content: greeting, timestamp: new Date() }
                  setConversation([greetingMessage])
                  conversationRef.current = [greetingMessage] // Initialize ref
                  // Wait a bit for TTS to initialize, then speak and auto-start mic
                  setTimeout(async () => {
                    await speakAnswer(greeting)
                    // Backup: Ensure mic starts after greeting (in case onEnd doesn't fire)
                    // The onSpeechEnd callback should handle this, but this is a safety net
                    setTimeout(() => {
                      if (voiceMode && !isListening && !isSpeaking && !voiceProcessing) {
                        console.log('Backup: Starting voice listening after greeting...')
                        // Reset to ensure clean state before starting
                        if (sttRef.current) {
                          resetSTTHandler()
                          sttRef.current = getSTTHandler()
                        }
                        startVoiceListening().catch(err => {
                          console.error('Backup restart failed:', err)
                        })
                      }
                    }, 2000) // Longer delay to ensure TTS is done
                  }, 500) // Slightly longer initial delay
                } else {
                  // If conversation already exists, just start listening
                  if (!isListening && !isSpeaking) {
                    console.log('Starting voice listening (existing conversation)...')
                    startVoiceListening()
                  }
                }
              }}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                voiceMode
                  ? 'bg-ng-green-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Mic className="w-4 h-4 inline mr-2" />
              Voice Mode
            </button>
          </div>
        </div>

        {/* Voice Conversation Interface */}
        {voiceMode ? (
          <div className="card space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-ng-green-600" />
                <h2 className="font-semibold text-slate-900">Voice Conversation</h2>
                {!sttRef.current?.isSupported() && (
                  <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                    Voice input unavailable
                  </span>
                )}
              </div>
              {conversation.length > 0 && (
                <button
                  onClick={clearConversation}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  Clear Conversation
                </button>
              )}
            </div>
            
            {/* Text Input Fallback for Unsupported Browsers */}
            {!sttRef.current?.isSupported() && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-blue-800 font-medium mb-2">Voice input not available in your browser</p>
                    <p className="text-blue-700 text-sm mb-3">You can still chat with the assistant using text input below:</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && question.trim()) {
                            handleVoiceQuestion(question.trim())
                            setQuestion('')
                          }
                        }}
                        placeholder="Type your question here..."
                        className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => {
                          if (question.trim()) {
                            handleVoiceQuestion(question.trim())
                            setQuestion('')
                          }
                        }}
                        disabled={!question.trim() || voiceProcessing}
                        className="px-4 py-2 bg-ng-green-500 text-white rounded-lg hover:bg-ng-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Conversation Messages */}
            <div className="bg-slate-50 rounded-xl p-4 min-h-[300px] max-h-[500px] overflow-y-auto space-y-4">
              {conversation.length === 0 ? (
                <div className="text-center text-slate-500 py-12">
                  {sttRef.current?.isSupported() ? (
                    <>
                      <Mic className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>Tap the microphone to start asking about your rights</p>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p className="mb-2">Voice input is not available in your browser</p>
                      <p className="text-sm">Use the text input below to chat with the assistant</p>
                    </>
                  )}
                </div>
              ) : (
                conversation.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-ng-green-500 text-white rounded-br-sm'
                          : 'bg-white shadow-sm border rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}

              {voiceProcessing && (
                <div className="flex justify-start">
                  <div className="bg-white shadow-sm border p-4 rounded-2xl rounded-bl-sm">
                    <Loader2 className="w-5 h-5 animate-spin text-ng-green-500" />
                  </div>
                </div>
              )}

              {voiceTranscript && (
                <div className="flex justify-end">
                  <div className="bg-ng-green-100 text-ng-green-800 p-4 rounded-2xl rounded-br-sm max-w-[85%]">
                    <p className="text-sm italic">{voiceTranscript}...</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Voice Controls */}
            <div className="flex items-center justify-center gap-4 pt-4 border-t">
              <button
                onClick={isSpeaking ? stopSpeaking : () => {
                  const lastMessage = conversation.filter(m => m.role === 'assistant').pop()
                  if (lastMessage) speakAnswer(lastMessage.content)
                }}
                disabled={conversation.length === 0}
                className={`p-3 rounded-full transition-colors ${
                  isSpeaking
                    ? 'bg-orange-100 text-orange-600'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50'
                }`}
                title={isSpeaking ? 'Stop speaking' : 'Replay last answer'}
              >
                {isSpeaking ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>

              <button
                onClick={isListening ? stopVoiceListening : startVoiceListening}
                disabled={voiceProcessing || isSpeaking || !sttRef.current?.isSupported()}
                className={`p-6 rounded-full transition-all transform ${
                  isListening
                    ? 'bg-red-500 text-white scale-110 animate-pulse'
                    : !sttRef.current?.isSupported()
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-ng-green-500 text-white hover:bg-ng-green-600 hover:scale-105'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={
                  !sttRef.current?.isSupported()
                    ? 'Voice input not supported in this browser'
                    : isListening
                    ? 'Stop listening'
                    : 'Start listening'
                }
              >
                {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>

              {/* Text Input for Unsupported Browsers */}
              {!sttRef.current?.isSupported() && (
                <div className="flex-1 max-w-md">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && question.trim() && !voiceProcessing) {
                          handleVoiceQuestion(question.trim())
                          setQuestion('')
                        }
                      }}
                      placeholder="Type your question..."
                      disabled={voiceProcessing || isSpeaking}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ng-green-500 disabled:opacity-50"
                    />
                    <button
                      onClick={() => {
                        if (question.trim() && !voiceProcessing) {
                          handleVoiceQuestion(question.trim())
                          setQuestion('')
                        }
                      }}
                      disabled={!question.trim() || voiceProcessing || isSpeaking}
                      className="px-4 py-2 bg-ng-green-500 text-white rounded-lg hover:bg-ng-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}

              {/* Test API Button - for debugging */}
              {sttRef.current?.isSupported() && (
                <button
                  onClick={async () => {
                    const testQuestion = "What are my rights as a tenant?"
                    console.log('🧪 Testing API with question:', testQuestion)
                    await handleVoiceQuestion(testQuestion)
                  }}
                  disabled={voiceProcessing || isSpeaking}
                  className="px-4 py-2 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50"
                  title="Test API connection"
                >
                  Test API
                </button>
              )}

              <div className="w-20 text-center">
                {isListening && <span className="text-xs text-red-500 font-medium">Listening...</span>}
                {isSpeaking && <span className="text-xs text-orange-500 font-medium">Speaking...</span>}
                {voiceProcessing && <span className="text-xs text-ng-green-500 font-medium">Processing...</span>}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-800 font-medium mb-1">Browser Compatibility Issue</p>
                    <p className="text-red-600 text-sm">{error}</p>
                    {error.includes('Speech recognition is not supported') && (
                      <div className="mt-3 pt-3 border-t border-red-200">
                        <p className="text-red-700 text-sm font-medium mb-2">Quick Solutions:</p>
                        <ul className="text-red-600 text-sm space-y-1 list-disc list-inside">
                          <li>Switch to <strong>Text Mode</strong> (button above) to continue chatting</li>
                          <li>Use Chrome, Edge, or Safari for voice features</li>
                          <li>Voice mode will work once you switch browsers</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700">Ask your rights question</label>
              {savedItems.length > 0 && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-2 text-sm text-ng-green-600 hover:text-ng-green-700"
                >
                  <History className="w-4 h-4" />
                  Saved ({savedItems.length})
                </button>
              )}
            </div>
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              rows={4}
              placeholder="e.g. What are my rights as a tenant? What can I do if my employer owes me salary?"
              className="input resize-none"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end">
              <button
                onClick={() => askQuestion()}
                className="btn-primary px-6 py-3"
                disabled={loading}
              >
                {loading ? 'Researching Nigerian Laws…' : 'Get Guidance'}
              </button>
            </div>
          </div>
        )}

        {/* Saved History Panel */}
        {showHistory && savedItems.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Saved Guidance</h3>
              <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {savedItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 group">
                  <button
                    onClick={() => loadSavedItem(item)}
                    className="flex-1 text-left"
                  >
                    <p className="font-medium text-slate-800 truncate">{item.question}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(item.savedAt).toLocaleDateString('en-NG', { 
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </button>
                  <button
                    onClick={() => deleteSavedItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-ng-green-600">Question</p>
                  <p className="text-lg font-semibold text-slate-900">{result.question}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="p-2 text-slate-500 hover:text-ng-green-600 hover:bg-ng-green-50 rounded-lg transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={saveResult}
                    className="p-2 text-slate-500 hover:text-ng-green-600 hover:bg-ng-green-50 rounded-lg transition-colors"
                    title="Save for later"
                  >
                    {saved ? <BookmarkCheck className="w-5 h-5 text-green-600" /> : <Bookmark className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-ng-green-600">AI Legal Guidance</p>
                <button
                  onClick={() => setShowVoiceAssistant(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-ng-green-50 text-ng-green-700 rounded-full text-sm hover:bg-ng-green-100 transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                  Listen & Chat
                </button>
              </div>
              <div className="text-slate-700 space-y-3 leading-relaxed">
                {result.answer.split('\n').map((paragraph, idx) => {
                  const trimmed = paragraph.trim()
                  
                  // Main headers (### 1. Constitution)
                  if (trimmed.startsWith('###')) {
                    return (
                      <h3 key={idx} className="font-bold text-lg text-slate-900 mt-6 mb-2 pb-2 border-b border-slate-200">
                        {trimmed.replace(/^###\s*/, '')}
                      </h3>
                    )
                  }
                  
                  // Sub headers (**)
                  if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                    return (
                      <h4 key={idx} className="font-semibold text-slate-800 mt-4 mb-1">
                        {trimmed.replace(/\*\*/g, '')}
                      </h4>
                    )
                  }
                  
                  // Practical tips with emoji (👉)
                  if (trimmed.startsWith('👉')) {
                    return (
                      <div key={idx} className="pl-4 py-2 bg-ng-green-50 border-l-4 border-ng-green-500 rounded-r-lg">
                        <span className="font-medium">{trimmed}</span>
                      </div>
                    )
                  }
                  
                  // Warning items (⚠️)
                  if (trimmed.includes('⚠️') || trimmed.toLowerCase().includes('illegal')) {
                    return (
                      <div key={idx} className="pl-4 py-2 bg-red-50 border-l-4 border-red-400 rounded-r-lg text-red-800">
                        {trimmed}
                      </div>
                    )
                  }
                  
                  // Numbered list items
                  if (/^\d+\./.test(trimmed) && !trimmed.startsWith('###')) {
                    return (
                      <div key={idx} className="pl-4 py-1 font-medium text-slate-800">
                        {trimmed}
                      </div>
                    )
                  }
                  
                  // Bullet points with potential links
                  if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
                    const content = trimmed.replace(/^[-•*]\s*/, '').replace(/\*\*/g, '')
                    
                    // Check for contact info patterns
                    const hasWebsite = content.includes('🌐') || content.includes('www.') || content.includes('http')
                    const hasPhone = content.includes('📞') || content.includes('Phone:')
                    const hasEmail = content.includes('✉️') || content.includes('Email:') || content.includes('@')
                    
                    if (hasWebsite || hasPhone || hasEmail) {
                      return (
                        <div key={idx} className="pl-6 py-1 bg-blue-50 rounded-lg my-1">
                          <span 
                            className="text-slate-700"
                            dangerouslySetInnerHTML={{
                              __html: content
                                // Make URLs clickable
                                .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-blue-600 hover:underline">$1</a>')
                                .replace(/(www\.[^\s]+)/g, '<a href="https://$1" target="_blank" class="text-blue-600 hover:underline">$1</a>')
                                // Make emails clickable
                                .replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/g, '<a href="mailto:$1" class="text-blue-600 hover:underline">$1</a>')
                                // Make phone numbers clickable
                                .replace(/(\d{2,4}[-\s]?\d{3,4}[-\s]?\d{3,4})/g, '<a href="tel:$1" class="text-blue-600 hover:underline">$1</a>')
                            }}
                          />
                        </div>
                      )
                    }
                    
                    return (
                      <div key={idx} className="pl-6 flex gap-2 py-0.5">
                        <span className="text-ng-green-600 font-bold">•</span>
                        <span>{content}</span>
                      </div>
                    )
                  }
                  
                  // Regular paragraph
                  if (trimmed) {
                    return <p key={idx} className="py-1">{trimmed}</p>
                  }
                  return null
                })}
              </div>
            </div>

            <div className="card space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg text-slate-900">Referenced Sections</h2>
                <span className="text-slate-500 text-sm">{result.sections.length} excerpts</span>
              </div>
              {result.sections.map((section) => (
                <div key={section.id} className="border border-slate-100 rounded-2xl p-4 bg-white">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-semibold text-slate-900">
                      {section.chapter} {section.section} — {section.heading}
                    </p>
                    <div className="text-xs text-ng-green-600 font-semibold">
                      {section.tags.join(', ')}
                    </div>
                  </div>
                  <p className="text-slate-600 mt-3 leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voice Assistant Modal */}
        {showVoiceAssistant && result && (
          <VoiceAssistant
            initialContext={result.answer}
            onClose={() => setShowVoiceAssistant(false)}
          />
        )}
      </div>
    </div>
  )
}

