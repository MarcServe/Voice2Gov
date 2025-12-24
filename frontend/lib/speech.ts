// Web Speech API wrapper for voice input/output

export interface SpeechRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

export interface TTSOptions {
  rate?: number
  pitch?: number
  volume?: number
  lang?: string
  voice?: string // Voice name or identifier (for browser TTS) or voiceId (for ElevenLabs)
  voiceId?: string // ElevenLabs voice ID
  useElevenLabs?: boolean // Whether to use ElevenLabs instead of browser TTS
  onEnd?: () => void
}

export interface ElevenLabsVoice {
  id: string
  name: string
  description?: string
  category?: string
}

export interface VoiceInfo {
  name: string
  lang: string
  localService: boolean
  default?: boolean
  gender?: string
}

class TextToSpeech {
  private synth: SpeechSynthesis | null = null
  private utterance: SpeechSynthesisUtterance | null = null
  private voices: SpeechSynthesisVoice[] = []
  private voicesLoaded: boolean = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis
      this.loadVoices()
      
      // Some browsers load voices asynchronously
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices()
      }
    }
  }

  private loadVoices() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      this.voices = window.speechSynthesis.getVoices()
      this.voicesLoaded = true
    }
  }

  getAvailableVoices(): VoiceInfo[] {
    if (!this.voicesLoaded) {
      this.loadVoices()
    }
    
    return this.voices.map(voice => ({
      name: voice.name,
      lang: voice.lang,
      localService: voice.localService,
      default: voice.default || false,
      gender: (voice as any).gender || undefined
    }))
  }

  findNigerianVoice(): SpeechSynthesisVoice | null {
    if (!this.voicesLoaded) {
      this.loadVoices()
    }

    // Priority order for Nigerian-sounding voices
    const preferredPatterns = [
      /en-NG/i,           // Nigerian English
      /en-GB/i,           // British English (closer to Nigerian accent)
      /en-AU/i,           // Australian English (similar intonation)
      /en-ZA/i,           // South African English
      /en-IE/i,           // Irish English
      /Google.*English/i, // Google voices often have better accents
      /Microsoft.*English/i,
      /Natural.*English/i
    ]

    // Try to find a voice matching preferred patterns
    for (const pattern of preferredPatterns) {
      const voice = this.voices.find(v => pattern.test(v.lang) || pattern.test(v.name))
      if (voice) return voice
    }

    // Fallback to any English voice
    const englishVoice = this.voices.find(v => /^en/.test(v.lang))
    if (englishVoice) return englishVoice

    // Last resort: default voice
    return this.voices.find(v => v.default) || this.voices[0] || null
  }

  findVoiceByName(name: string): SpeechSynthesisVoice | null {
    if (!this.voicesLoaded) {
      this.loadVoices()
    }
    return this.voices.find(v => v.name === name) || null
  }

  async speak(text: string, options: TTSOptions = {}) {
    // Use ElevenLabs if specified or if voiceId is provided
    if (options.useElevenLabs || options.voiceId) {
      await this.speakWithElevenLabs(text, options)
      return
    }

    // Fallback to browser TTS
    if (!this.synth) return Promise.resolve()

    // Cancel any ongoing speech
    this.synth.cancel()

    return new Promise<void>((resolve) => {
      this.utterance = new SpeechSynthesisUtterance(text)
      this.utterance.rate = options.rate || 0.9
      this.utterance.pitch = options.pitch || 1
      this.utterance.volume = options.volume || 1
      this.utterance.lang = options.lang || 'en-NG'

      // Select voice
      if (options.voice) {
        const selectedVoice = this.findVoiceByName(options.voice)
        if (selectedVoice) {
          this.utterance.voice = selectedVoice
        }
      } else {
        // Use Nigerian voice by default
        const nigerianVoice = this.findNigerianVoice()
        if (nigerianVoice) {
          this.utterance.voice = nigerianVoice
        }
      }

      // Handle end callback
      this.utterance.onend = () => {
        if (options.onEnd) {
          options.onEnd()
        }
        resolve()
      }

      this.utterance.onerror = () => {
        resolve()
      }

      if (this.synth && this.utterance) {
        this.synth.speak(this.utterance)
      } else {
        resolve()
      }
    })
  }

  private async speakWithElevenLabs(text: string, options: TTSOptions): Promise<void> {
    const voiceId = options.voiceId || options.voice
    
    if (!voiceId) {
      console.warn('ElevenLabs voiceId not provided, falling back to browser TTS')
      // Fallback to browser TTS
      if (this.synth) {
        return this.speak(text, { ...options, useElevenLabs: false })
      }
      if (options.onEnd) {
        options.onEnd()
      }
      return Promise.resolve()
    }

    console.log('Attempting ElevenLabs TTS with voice:', voiceId)
    
    try {
      const response = await fetch('/api/elevenlabs/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.warn('ElevenLabs API failed:', response.status, errorData)
        // Fallback to browser TTS
        if (this.synth) {
          console.log('Falling back to browser TTS')
          return this.speak(text, { ...options, useElevenLabs: false })
        }
        if (options.onEnd) {
          options.onEnd()
        }
        return Promise.resolve()
      }

      const data = await response.json()
      
      if (!data.audio) {
        console.warn('ElevenLabs returned no audio data, falling back to browser TTS')
        if (this.synth) {
          return this.speak(text, { ...options, useElevenLabs: false })
        }
        if (options.onEnd) {
          options.onEnd()
        }
        return Promise.resolve()
      }
      
      const audioData = Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))
      
      // Create audio element and play
      const audioBlob = new Blob([audioData], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      
      console.log('Playing ElevenLabs audio...')
      
      return new Promise<void>((resolve) => {
        let resolved = false
        
        const cleanup = () => {
          if (!resolved) {
            resolved = true
            URL.revokeObjectURL(audioUrl)
            if (options.onEnd) {
              options.onEnd()
            }
            resolve()
          }
        }
        
        audio.onended = () => {
          console.log('ElevenLabs audio playback ended')
          cleanup()
        }
        
        audio.onerror = (err) => {
          console.error('Error playing ElevenLabs audio:', err)
          cleanup()
        }

        audio.play().catch((err) => {
          console.error('Error playing audio, falling back to browser TTS:', err)
          URL.revokeObjectURL(audioUrl)
          // Fallback to browser TTS
          if (this.synth) {
            this.speak(text, { ...options, useElevenLabs: false }).then(() => {
              if (!resolved) {
                resolved = true
                resolve()
              }
            })
          } else {
            cleanup()
          }
        })
      })
    } catch (error: any) {
      console.error('ElevenLabs TTS error, falling back to browser TTS:', error)
      // Always fallback to browser TTS
      if (this.synth) {
        return this.speak(text, { ...options, useElevenLabs: false })
      }
      // If no fallback, still call onEnd to continue flow
      if (options.onEnd) {
        options.onEnd()
      }
      return Promise.resolve()
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel()
    }
  }

  isSpeaking(): boolean {
    return this.synth?.speaking || false
  }
}

class SpeechRecognition {
  private recognition: any = null
  private isListening: boolean = false
  private onResultCallback: ((result: SpeechRecognitionResult) => void) | null = null
  private onErrorCallback: ((error: Error) => void) | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      // Try to get SpeechRecognition API (Chrome) or webkitSpeechRecognition (Safari)
      const SpeechRecognitionAPI = 
        (window as any).SpeechRecognition || 
        (window as any).webkitSpeechRecognition
      
      if (SpeechRecognitionAPI) {
        try {
          this.recognition = new SpeechRecognitionAPI()
        } catch (err) {
          console.error('Failed to initialize Speech Recognition:', err)
        }
      }
    }
  }

  isSupported(): boolean {
    return this.recognition !== null
  }

  async start(
    onResult: (result: SpeechRecognitionResult) => void,
    onError?: (error: Error) => void,
    options: { lang?: string; continuous?: boolean } = {}
  ) {
    if (!this.recognition) {
      const error = new Error('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.')
      onError?.(error)
      return
    }

    // Prevent starting if already listening
    if (this.isListening) {
      console.log('Speech recognition already listening, skipping start')
      return
    }

    this.onResultCallback = onResult
    this.onErrorCallback = onError || null

    try {
      // Configure recognition
      this.recognition.lang = options.lang || 'en-NG'
      this.recognition.continuous = options.continuous ?? false // Changed to false - stops after silence
      this.recognition.interimResults = true
      
      // Set a timeout for silence detection (stops listening after user stops speaking)
      // This helps detect when user finishes their question
      
      // Handle when recognition starts
      this.recognition.onstart = () => {
        console.log('Speech recognition started')
        this.isListening = true
      }
      
      // Handle when recognition ends (user stopped speaking or timeout)
      this.recognition.onend = () => {
        console.log('Speech recognition ended')
        this.isListening = false
        
        // Clear callbacks to prevent restart loops
        // Parent component will restart when ready
        // Don't auto-restart here - let parent control it
      }

      // Handle results
      this.recognition.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }

        if (finalTranscript || interimTranscript) {
          this.onResultCallback?.({
            transcript: finalTranscript.trim() || interimTranscript,
            confidence: event.results[event.resultIndex]?.[0]?.confidence || 0.8,
            isFinal: !!finalTranscript
          })
        }
      }

      // Handle errors
      this.recognition.onerror = (event: any) => {
        let errorMessage = 'Speech recognition error'
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.'
            break
          case 'audio-capture':
            errorMessage = 'No microphone found. Please check your microphone settings.'
            break
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please allow microphone access in your browser settings.'
            break
          case 'aborted':
            errorMessage = 'Speech recognition was aborted.'
            break
          case 'network':
            errorMessage = 'Network error. Please check your internet connection.'
            break
          default:
            errorMessage = `Speech recognition error: ${event.error}`
        }

        this.onErrorCallback?.(new Error(errorMessage))
        this.isListening = false
      }

      // Start recognition - handle "already started" errors with reset
      try {
        // Always try to stop first if we think we're listening
        if (this.isListening) {
          console.log('Recognition state says listening, stopping first...')
          try {
            this.recognition.stop()
          } catch (stopErr) {
            // Ignore stop errors - might already be stopped
          }
          // Reset state
          this.isListening = false
          // Small delay to ensure cleanup
          await new Promise(resolve => setTimeout(resolve, 200))
        }
        
        this.recognition.start()
        this.isListening = true
        console.log('Speech recognition started successfully')
      } catch (startErr: any) {
        // Check if error is because recognition is already started
        if (startErr.message && startErr.message.includes('already started')) {
          console.log('Recognition already started error, resetting recognition instance...')
          try {
            // Force stop and reset
            this.forceStop()
            await new Promise(resolve => setTimeout(resolve, 300))
            
            // Create a completely new recognition instance
            this.reset()
            await new Promise(resolve => setTimeout(resolve, 200))
            
            // Reconfigure the new instance
            this.recognition.lang = options.lang || 'en-NG'
            this.recognition.continuous = options.continuous ?? false
            this.recognition.interimResults = true
            
            // Re-attach event handlers
            this.recognition.onstart = () => {
              console.log('Speech recognition started (after reset)')
              this.isListening = true
            }
            
            this.recognition.onend = () => {
              console.log('Speech recognition ended')
              this.isListening = false
            }
            
            this.recognition.onresult = (event: any) => {
              let finalTranscript = ''
              let interimTranscript = ''

              for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript
                if (event.results[i].isFinal) {
                  finalTranscript += transcript + ' '
                } else {
                  interimTranscript += transcript
                }
              }

              if (finalTranscript || interimTranscript) {
                this.onResultCallback?.({
                  transcript: finalTranscript.trim() || interimTranscript,
                  confidence: event.results[event.resultIndex]?.[0]?.confidence || 0.8,
                  isFinal: !!finalTranscript
                })
              }
            }
            
            this.recognition.onerror = (event: any) => {
              let errorMessage = 'Speech recognition error'
              switch (event.error) {
                case 'no-speech': errorMessage = 'No speech detected. Please try again.'; break
                case 'audio-capture': errorMessage = 'No microphone found.'; break
                case 'not-allowed': errorMessage = 'Microphone permission denied.'; break
                case 'aborted': errorMessage = 'Speech recognition was aborted.'; break
                case 'network': errorMessage = 'Network error.'; break
                default: errorMessage = `Speech recognition error: ${event.error}`
              }
              this.onErrorCallback?.(new Error(errorMessage))
              this.isListening = false
            }
            
            // Now try starting the new instance
            this.recognition.start()
            this.isListening = true
            console.log('Speech recognition reset and started successfully')
          } catch (retryErr: any) {
            console.error('Failed to reset recognition:', retryErr)
            this.onErrorCallback?.(new Error(`Failed to start speech recognition: ${retryErr.message}`))
            this.isListening = false
          }
          return
        }
        throw startErr
      }
    } catch (err: any) {
      console.error('Speech recognition start error:', err)
      this.onErrorCallback?.(new Error(`Failed to start speech recognition: ${err.message}`))
      this.isListening = false
    }
  }

  stop() {
    if (this.recognition) {
      try {
        // Always try to stop, even if we think it's not listening
        // This handles cases where state is out of sync
        this.recognition.stop()
      } catch (err: any) {
        // Ignore errors if recognition is already stopped or not started
        const errorMsg = err?.message || ''
        if (!errorMsg.includes('not started') && !errorMsg.includes('already stopped')) {
          console.error('Error stopping recognition:', err)
        }
      }
      
      // Also try abort as a more aggressive stop
      try {
        this.recognition.abort()
      } catch (abortErr) {
        // Ignore abort errors
      }
      
      this.isListening = false
    }
  }

  getIsListening(): boolean {
    // Check both our internal state and the actual recognition state
    if (this.recognition) {
      // The recognition object doesn't expose a direct "isListening" property,
      // but we can check if it's in a started state by checking if it has handlers
      return this.isListening && this.onResultCallback !== null
    }
    return false
  }

  // Force stop and reset - useful for cleanup
  forceStop() {
    if (this.recognition) {
      try {
        // Remove all event listeners first
        this.recognition.onstart = null
        this.recognition.onend = null
        this.recognition.onresult = null
        this.recognition.onerror = null
        
        // Then stop/abort
        this.recognition.stop()
      } catch (err) {
        // Ignore errors
      }
      
      try {
        this.recognition.abort()
      } catch (err) {
        // Ignore errors
      }
    }
    this.isListening = false
    this.onResultCallback = null
    this.onErrorCallback = null
  }
  
  // Reset recognition - creates a new instance
  reset() {
    this.forceStop()
    
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = 
        (window as any).SpeechRecognition || 
        (window as any).webkitSpeechRecognition
      
      if (SpeechRecognitionAPI) {
        try {
          this.recognition = new SpeechRecognitionAPI()
          console.log('Speech recognition reset successfully')
        } catch (err) {
          console.error('Failed to reset Speech Recognition:', err)
        }
      }
    }
  }
}

// Singleton instances
let ttsInstance: TextToSpeech | null = null
let sttInstance: SpeechRecognition | null = null

export function getTTSHandler(): TextToSpeech {
  if (!ttsInstance) {
    ttsInstance = new TextToSpeech()
  }
  return ttsInstance
}

export function getSTTHandler(): SpeechRecognition {
  if (!sttInstance) {
    sttInstance = new SpeechRecognition()
  }
  return sttInstance
}

// Reset the singleton instance - useful for recovery
export function resetSTTHandler(): void {
  if (sttInstance) {
    sttInstance.forceStop()
    sttInstance = null
  }
}


