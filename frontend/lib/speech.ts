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
      console.error('ElevenLabs voiceId is required')
      // Fallback to browser TTS
      if (this.synth) {
        return this.speak(text, { ...options, useElevenLabs: false })
      }
      return Promise.resolve()
    }

    try {
      const response = await fetch('/api/elevenlabs/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate speech')
      }

      const data = await response.json()
      const audioData = Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))
      
      // Create audio element and play
      const audioBlob = new Blob([audioData], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      
      return new Promise<void>((resolve) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl)
          if (options.onEnd) {
            options.onEnd()
          }
          resolve()
        }
        
        audio.onerror = (err) => {
          URL.revokeObjectURL(audioUrl)
          console.error('Error playing ElevenLabs audio:', err)
          // Still call onEnd to continue conversation flow
          if (options.onEnd) {
            options.onEnd()
          }
          resolve()
        }

        audio.play().catch((err) => {
          console.error('Error playing audio:', err)
          URL.revokeObjectURL(audioUrl)
          // Fallback to browser TTS
          if (this.synth) {
            this.speak(text, { ...options, useElevenLabs: false }).then(resolve)
          } else {
            if (options.onEnd) {
              options.onEnd()
            }
            resolve()
          }
        })
      })
    } catch (error) {
      console.error('ElevenLabs TTS error:', error)
      // Fallback to browser TTS
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

  start(
    onResult: (result: SpeechRecognitionResult) => void,
    onError?: (error: Error) => void,
    options: { lang?: string; continuous?: boolean } = {}
  ) {
    if (!this.recognition) {
      const error = new Error('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.')
      onError?.(error)
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
      
      // Handle when recognition ends (user stopped speaking)
      this.recognition.onend = () => {
        console.log('Speech recognition ended')
        this.isListening = false
        
        // If we're supposed to be listening continuously, restart
        if (options.continuous && this.onResultCallback) {
          setTimeout(() => {
            if (this.isListening) {
              console.log('Restarting continuous speech recognition...')
              this.start(this.onResultCallback!, this.onErrorCallback || undefined, options)
            }
          }, 500)
        }
      }
      
      // Handle when recognition starts
      this.recognition.onstart = () => {
        console.log('Speech recognition started')
        this.isListening = true
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

      // Handle end - remove duplicate, already set above
      // Start recognition
      this.recognition.start()
      this.isListening = true
      console.log('Speech recognition started successfully')
    } catch (err: any) {
      this.onErrorCallback?.(new Error(`Failed to start speech recognition: ${err.message}`))
      this.isListening = false
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop()
      } catch (err) {
        console.error('Error stopping recognition:', err)
      }
      this.isListening = false
    }
  }

  getIsListening(): boolean {
    return this.isListening
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


