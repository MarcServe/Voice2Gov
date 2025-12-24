'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Users, Plus, Search, Edit2, Trash2, 
  Phone, Mail, Loader2, Shield,
  ChevronLeft, ChevronRight, Upload, User, Volume2, Settings, X, Check
} from 'lucide-react'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { getTTSHandler, VoiceInfo } from '@/lib/speech'

// Predefined Nigerian voices from ElevenLabs
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
    description: 'Natural Nigerian English accent (Default)'
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

interface Representative {
  id: number
  name: string
  title: string
  chamber: string
  party: string
  state_id: number
  lga_id: number | null
  constituency: string | null
  senatorial_district: string | null
  bio: string | null
  photo_url: string | null
  is_active: boolean
  states: { name: string } | null
  lgas: { name: string } | null
  contact_info: { contact_type: string; value: string }[]
}

interface Stats {
  total: number
  senators: number
  houseReps: number
  lgaChairmen: number
  lgaCouncillors: number
  stateAssembly: number
  governors: number
}

export default function AdminPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  const [representatives, setRepresentatives] = useState<Representative[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, senators: 0, houseReps: 0, lgaChairmen: 0, lgaCouncillors: 0, stateAssembly: 0, governors: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [chamberFilter, setChamberFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 20
  const [showVoiceSettings, setShowVoiceSettings] = useState(false)
  const [availableVoices, setAvailableVoices] = useState<VoiceInfo[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>('')
  const [selectedElevenLabsVoice, setSelectedElevenLabsVoice] = useState<string>('')
  const [testingVoice, setTestingVoice] = useState<string | null>(null)

  // Check if user is admin (you can customize this logic)
  const isAdmin = true // For development, allow all users

  // Removed auth redirect for development - uncomment below for production
  // useEffect(() => {
  //   if (!authLoading && !user) {
  //     router.push('/auth/login?redirect=/admin')
  //   }
  // }, [user, authLoading, router])

  useEffect(() => {
    fetchRepresentatives()
    fetchStats()
    loadVoiceSettings()
  }, [page, search, chamberFilter])

  const loadVoiceSettings = () => {
    if (typeof window !== 'undefined') {
      const tts = getTTSHandler()
      const voices = tts.getAvailableVoices()
      setAvailableVoices(voices)
      
      // Load browser TTS voice
      const saved = localStorage.getItem('voice2gov_selected_voice')
      if (saved) {
        setSelectedVoice(saved)
      } else {
        // Set default to first Nigerian-sounding voice
        const nigerianVoice = voices.find(v => 
          /en-NG|en-GB|en-AU|en-ZA/i.test(v.lang) || 
          /Google|Natural/i.test(v.name)
        )
        if (nigerianVoice) {
          setSelectedVoice(nigerianVoice.name)
          localStorage.setItem('voice2gov_selected_voice', nigerianVoice.name)
        }
      }

      // Load ElevenLabs voice - always default to first Nigerian voice if not set
      const savedElevenLabs = localStorage.getItem('voice2gov_elevenlabs_voice')
      if (savedElevenLabs && NIGERIAN_VOICES.find(v => v.id === savedElevenLabs)) {
        setSelectedElevenLabsVoice(savedElevenLabs)
      } else {
        // Default to first Nigerian voice (Nigerian Voice 1) - Natural Nigerian English accent
        const defaultVoiceId = NIGERIAN_VOICES[0].id
        setSelectedElevenLabsVoice(defaultVoiceId)
        localStorage.setItem('voice2gov_elevenlabs_voice', defaultVoiceId)
        console.log('Set default Nigerian voice:', NIGERIAN_VOICES[0].name, defaultVoiceId)
      }
    }
  }

  const handleVoiceChange = async (voiceName: string) => {
    setSelectedVoice(voiceName)
    localStorage.setItem('voice2gov_selected_voice', voiceName)
    
    // Test the voice
    if (typeof window !== 'undefined') {
      const tts = getTTSHandler()
      await tts.speak('This is a test of the selected voice. How does it sound?', {
        voice: voiceName,
        rate: 0.9
      })
    }
  }

  const handleElevenLabsVoiceChange = async (voiceId: string) => {
    setSelectedElevenLabsVoice(voiceId)
    localStorage.setItem('voice2gov_elevenlabs_voice', voiceId)
    
    // Test the voice
    setTestingVoice(voiceId)
    try {
      const response = await fetch('/api/elevenlabs/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'This is a test of the selected Nigerian voice. How does it sound?',
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
          setTestingVoice(null)
        }
        
        await audio.play()
      }
    } catch (error) {
      console.error('Error testing voice:', error)
      setTestingVoice(null)
    }
  }

  const fetchStats = async () => {
    const { data } = await supabase
      .from('representatives')
      .select('chamber')
    
    if (data) {
      setStats({
        total: data.length,
        senators: data.filter(r => r.chamber === 'SENATE').length,
        houseReps: data.filter(r => r.chamber === 'HOUSE_OF_REPS').length,
        lgaChairmen: data.filter(r => r.chamber === 'LGA_CHAIRMAN').length,
        lgaCouncillors: data.filter(r => r.chamber === 'LGA_COUNCILLOR').length,
        stateAssembly: data.filter(r => r.chamber === 'STATE_ASSEMBLY').length,
        governors: data.filter(r => r.chamber === 'GOVERNOR').length,
      })
    }
  }

  const fetchRepresentatives = async () => {
    setLoading(true)
    
    let query = supabase
      .from('representatives')
      .select(`
        *,
        states (name),
        lgas (name),
        contact_info (contact_type, value)
      `, { count: 'exact' })
      .order('name')
      .range((page - 1) * pageSize, page * pageSize - 1)

    if (chamberFilter) {
      query = query.eq('chamber', chamberFilter)
    }

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data, count, error } = await query

    if (!error && data) {
      setRepresentatives(data as Representative[])
      setTotalPages(Math.ceil((count || 0) / pageSize))
    }
    
    setLoading(false)
  }

  const deleteRepresentative = async (id: number) => {
    if (!confirm('Are you sure you want to delete this representative?')) return
    
    const { error } = await supabase
      .from('representatives')
      .delete()
      .eq('id', id)

    if (!error) {
      fetchRepresentatives()
      fetchStats()
    }
  }

  // Removed auth loading check for development
  // if (authLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <Loader2 className="w-8 h-8 animate-spin text-ng-green-600" />
  //     </div>
  //   )
  // }

  // if (!user) {
  //   return null
  // }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-6 h-6 text-ng-green-600" />
                Admin Panel
              </h1>
              <p className="text-slate-600 mt-1">Manage representatives and their contact information</p>
            </div>
            <Link href="/admin/representatives/new" className="btn-primary">
              <Plus className="w-5 h-5" />
              Add Representative
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
          <div 
            className={`card text-center cursor-pointer transition-all hover:shadow-md ${
              chamberFilter === '' ? 'ring-2 ring-ng-green-500 bg-ng-green-50' : 'hover:bg-slate-50'
            }`}
            onClick={() => {
              setChamberFilter('')
              setPage(1)
            }}
          >
            <div className={`text-3xl font-bold ${chamberFilter === '' ? 'text-ng-green-700' : 'text-slate-900'}`}>{stats.total}</div>
            <div className="text-sm text-slate-600">Total</div>
          </div>
          <div 
            className={`card text-center border-l-4 border-purple-500 cursor-pointer transition-all hover:shadow-md ${
              chamberFilter === 'SENATE' ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-purple-50/30'
            }`}
            onClick={() => {
              setChamberFilter('SENATE')
              setPage(1)
            }}
          >
            <div className="text-3xl font-bold text-purple-600">{stats.senators}</div>
            <div className="text-sm text-slate-600">Senators</div>
          </div>
          <div 
            className={`card text-center border-l-4 border-blue-500 cursor-pointer transition-all hover:shadow-md ${
              chamberFilter === 'HOUSE_OF_REPS' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-blue-50/30'
            }`}
            onClick={() => {
              setChamberFilter('HOUSE_OF_REPS')
              setPage(1)
            }}
          >
            <div className="text-3xl font-bold text-blue-600">{stats.houseReps}</div>
            <div className="text-sm text-slate-600">House of Reps</div>
          </div>
          <div 
            className={`card text-center border-l-4 border-red-500 cursor-pointer transition-all hover:shadow-md ${
              chamberFilter === 'GOVERNOR' ? 'ring-2 ring-red-500 bg-red-50' : 'hover:bg-red-50/30'
            }`}
            onClick={() => {
              setChamberFilter('GOVERNOR')
              setPage(1)
            }}
          >
            <div className="text-3xl font-bold text-red-600">{stats.governors}</div>
            <div className="text-sm text-slate-600">Governors</div>
          </div>
          <div 
            className={`card text-center border-l-4 border-ng-green-500 cursor-pointer transition-all hover:shadow-md ${
              chamberFilter === 'LGA_CHAIRMAN' ? 'ring-2 ring-ng-green-500 bg-ng-green-50' : 'hover:bg-ng-green-50/30'
            }`}
            onClick={() => {
              setChamberFilter('LGA_CHAIRMAN')
              setPage(1)
            }}
          >
            <div className="text-3xl font-bold text-ng-green-600">{stats.lgaChairmen}</div>
            <div className="text-sm text-slate-600">LGA Chairmen</div>
          </div>
          <div 
            className={`card text-center border-l-4 border-emerald-500 cursor-pointer transition-all hover:shadow-md ${
              chamberFilter === 'LGA_COUNCILLOR' ? 'ring-2 ring-emerald-500 bg-emerald-50' : 'hover:bg-emerald-50/30'
            }`}
            onClick={() => {
              setChamberFilter('LGA_COUNCILLOR')
              setPage(1)
            }}
          >
            <div className="text-3xl font-bold text-emerald-600">{stats.lgaCouncillors}</div>
            <div className="text-sm text-slate-600">LGA Councillors</div>
          </div>
          <div 
            className={`card text-center border-l-4 border-amber-500 cursor-pointer transition-all hover:shadow-md ${
              chamberFilter === 'STATE_ASSEMBLY' ? 'ring-2 ring-amber-500 bg-amber-50' : 'hover:bg-amber-50/30'
            }`}
            onClick={() => {
              setChamberFilter('STATE_ASSEMBLY')
              setPage(1)
            }}
          >
            <div className="text-3xl font-bold text-amber-600">{stats.stateAssembly}</div>
            <div className="text-sm text-slate-600">State Assembly</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Link href="/admin/representatives/new?chamber=SENATE" className="btn-ghost bg-purple-50 text-purple-700 hover:bg-purple-100">
            <Plus className="w-4 h-4" /> Add Senator
          </Link>
          <Link href="/admin/representatives/new?chamber=HOUSE_OF_REPS" className="btn-ghost bg-blue-50 text-blue-700 hover:bg-blue-100">
            <Plus className="w-4 h-4" /> Add House Rep
          </Link>
          <Link href="/admin/representatives/new?chamber=GOVERNOR" className="btn-ghost bg-red-50 text-red-700 hover:bg-red-100">
            <Plus className="w-4 h-4" /> Add Governor
          </Link>
          <Link href="/admin/representatives/new?chamber=LGA_CHAIRMAN" className="btn-ghost bg-ng-green-50 text-ng-green-700 hover:bg-ng-green-100">
            <Plus className="w-4 h-4" /> Add LGA Chairman
          </Link>
          <Link href="/admin/representatives/new?chamber=LGA_COUNCILLOR" className="btn-ghost bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
            <Plus className="w-4 h-4" /> Add LGA Councillor
          </Link>
          <Link href="/admin/import" className="btn-ghost bg-slate-100 text-slate-700 hover:bg-slate-200">
            <Upload className="w-4 h-4" /> Bulk Import
          </Link>
          <button
            onClick={async () => {
              if (!confirm('This will update photos for representatives with known images. Continue?')) return
              setLoading(true)
              try {
                const response = await fetch('/api/admin/update-photos', { method: 'POST' })
                const data = await response.json()
                if (data.success) {
                  alert(`Successfully updated ${data.updated} photos. ${data.notFound} representatives not found in photo database.`)
                  fetchRepresentatives()
                  fetchStats()
                } else {
                  alert('Failed to update photos: ' + (data.error || 'Unknown error'))
                }
              } catch (err: any) {
                alert('Error updating photos: ' + err.message)
              } finally {
                setLoading(false)
              }
            }}
            className="btn-ghost bg-amber-50 text-amber-700 hover:bg-amber-100"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <User className="w-4 h-4" />}
            Add Photos
          </button>
          <button
            onClick={() => setShowVoiceSettings(!showVoiceSettings)}
            className="btn-ghost bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
          >
            <Volume2 className="w-4 h-4" />
            Voice Settings
          </button>
        </div>

        {/* Voice Settings Panel */}
        {showVoiceSettings && (
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-ng-green-600" />
                <h2 className="font-semibold text-lg text-slate-900">Voice Settings</h2>
              </div>
              <button
                onClick={() => setShowVoiceSettings(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* ElevenLabs Nigerian Voices */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ElevenLabs Nigerian Voices (Recommended)
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  Choose from your saved Nigerian voices. These are high-quality voices optimized for Nigerian English.
                </p>
                <div className="space-y-3">
                  {NIGERIAN_VOICES.map((voice, index) => (
                    <div
                      key={voice.id}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedElevenLabsVoice === voice.id
                          ? 'border-ng-green-500 bg-ng-green-50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                      onClick={() => handleElevenLabsVoiceChange(voice.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-slate-900">{voice.name}</h3>
                            {index === 0 && (
                              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
                                Default
                              </span>
                            )}
                            {selectedElevenLabsVoice === voice.id && (
                              <Check className="w-5 h-5 text-ng-green-600" />
                            )}
                            {testingVoice === voice.id && (
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
                            handleElevenLabsVoiceChange(voice.id)
                          }}
                          className="ml-4 px-4 py-2 bg-ng-green-500 text-white rounded-lg hover:bg-ng-green-600 transition-colors text-sm"
                          disabled={testingVoice === voice.id || !voice.id}
                        >
                          {testingVoice === voice.id ? 'Testing...' : 'Test'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedElevenLabsVoice && (
                  <div className="mt-4 p-3 bg-ng-green-50 rounded-lg">
                    <p className="text-sm text-ng-green-700">
                      <strong>Selected:</strong> {NIGERIAN_VOICES.find(v => v.id === selectedElevenLabsVoice)?.name}
                    </p>
                    <p className="text-xs text-ng-green-600 mt-1">
                      This ElevenLabs voice will be used for all voice responses. Make sure your ELEVENLABS_API_KEY is set in environment variables.
                    </p>
                  </div>
                )}
              </div>

              {/* Browser TTS Fallback */}
              <div className="pt-4 border-t">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Browser TTS (Fallback)
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  Fallback voice if ElevenLabs is unavailable. Choose a Nigerian-sounding browser voice.
                </p>
                <select
                  value={selectedVoice}
                  onChange={(e) => handleVoiceChange(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Default (Auto-select Nigerian voice)</option>
                  {availableVoices
                    .filter(v => /^en/.test(v.lang)) // Only English voices
                    .sort((a, b) => {
                      // Prioritize Nigerian/British/African voices
                      const aScore = /en-NG|en-GB|en-ZA|en-AU|Google|Natural/i.test(a.name + a.lang) ? 1 : 0
                      const bScore = /en-NG|en-GB|en-ZA|en-AU|Google|Natural/i.test(b.name + b.lang) ? 1 : 0
                      return bScore - aScore
                    })
                    .map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name} {voice.lang && `(${voice.lang})`}
                        {/en-NG|en-GB|en-ZA|en-AU/i.test(voice.lang) && ' 🌍'}
                      </option>
                    ))}
                </select>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium text-slate-700 mb-2">Voice Settings Info</h3>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li>• <strong>ElevenLabs voices</strong> provide the best quality Nigerian accents</li>
                  <li>• <strong>Browser TTS</strong> is used as a fallback if ElevenLabs is unavailable</li>
                  <li>• Users can also select their preferred voice from their dashboard</li>
                  <li>• Make sure to add your ElevenLabs API key to environment variables</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search by name..."
                className="input pl-10"
              />
            </div>
            <select
              value={chamberFilter}
              onChange={(e) => { setChamberFilter(e.target.value); setPage(1) }}
              className="input w-full md:w-48"
            >
              <option value="">All Chambers</option>
              <option value="SENATE">Senate</option>
              <option value="HOUSE_OF_REPS">House of Reps</option>
              <option value="GOVERNOR">Governor</option>
              <option value="STATE_ASSEMBLY">State Assembly</option>
              <option value="LGA_CHAIRMAN">LGA Chairman</option>
              <option value="LGA_COUNCILLOR">LGA Councillor</option>
            </select>
          </div>
        </div>

        {/* Representatives Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-ng-green-600" />
            </div>
          ) : representatives.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No representatives found</p>
              <Link href="/admin/representatives/new" className="btn-primary mt-4">
                <Plus className="w-5 h-5" /> Add First Representative
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Chamber</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">State</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Party</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Contact</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {representatives.map((rep) => (
                    <tr 
                      key={rep.id} 
                      className="hover:bg-slate-50 cursor-pointer"
                      onClick={(e) => {
                        // Don't navigate if clicking on action buttons
                        if ((e.target as HTMLElement).closest('button, a')) return
                        router.push(`/admin/representatives/${rep.id}`)
                      }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {/* Photo */}
                          <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 relative">
                            {rep.photo_url ? (
                              <Image
                                src={rep.photo_url}
                                alt={rep.name}
                                fill
                                sizes="40px"
                                className="object-cover rounded-full"
                                unoptimized={rep.photo_url.startsWith('http') && !rep.photo_url.includes('supabase.co') && !rep.photo_url.includes('wikimedia.org')}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <User className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{rep.name}</div>
                            <div className="text-sm text-slate-500">{rep.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${
                          rep.chamber === 'SENATE' ? 'bg-purple-100 text-purple-700' :
                          rep.chamber === 'HOUSE_OF_REPS' ? 'bg-blue-100 text-blue-700' :
                          rep.chamber === 'GOVERNOR' ? 'bg-red-100 text-red-700' :
                          rep.chamber === 'LGA_CHAIRMAN' ? 'bg-ng-green-100 text-ng-green-700' :
                          rep.chamber === 'LGA_COUNCILLOR' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {rep.chamber.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-900">{rep.states?.name || '-'}</div>
                        {rep.lgas?.name && (
                          <div className="text-sm text-slate-500">{rep.lgas.name} LGA</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge bg-slate-100 text-slate-700">{rep.party || '-'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {rep.contact_info?.find(c => c.contact_type === 'EMAIL') && (
                            <Mail className="w-4 h-4 text-slate-400" />
                          )}
                          {rep.contact_info?.find(c => c.contact_type === 'PHONE') && (
                            <Phone className="w-4 h-4 text-slate-400" />
                          )}
                          {!rep.contact_info?.length && (
                            <span className="text-xs text-red-500">No contact</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/representatives/${rep.id}`}
                            className="p-2 text-slate-500 hover:text-ng-green-600 hover:bg-ng-green-50 rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteRepresentative(rep.id)
                            }}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50">
              <div className="text-sm text-slate-600">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border hover:bg-white disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border hover:bg-white disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


