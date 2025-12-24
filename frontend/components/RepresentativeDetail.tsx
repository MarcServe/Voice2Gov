'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  User, MapPin, Building2, Mail, Phone, Twitter, 
  FileText, ArrowLeft, ExternalLink, Copy, Check,
  Volume2, VolumeX, Landmark, Info, Scale, Users,
  BookOpen, Shield, Loader2
} from 'lucide-react'
import { getTTSHandler } from '@/lib/speech'
import Image from 'next/image'

interface ContactInfo {
  id: string
  contactType: string
  value: string
  isPrimary: boolean
}

interface Representative {
  id: string
  name: string
  title: string | null
  chamber: string
  party: string | null
  state: string
  lga: string | null
  constituency: string | null
  senatorialDistrict: string | null
  ward: string | null
  photoUrl: string | null
  bio: string | null
  contactInfo: ContactInfo[]
  duties: string[]
  obligations: string[]
  citizenRights: string[]
}

// Chamber-specific duties and obligations (fallback data)
const CHAMBER_DUTIES: Record<string, { duties: string[]; obligations: string[]; citizenRights: string[] }> = {
  SENATE: {
    duties: [
      'Make laws for the peace, order and good governance of Nigeria',
      'Approve presidential appointments and nominations',
      'Confirm appointments of judges, ambassadors, and federal commissions',
      'Approve national budget and monitor implementation',
      'Conduct investigations into matters of public interest',
      'Ratify international treaties and agreements'
    ],
    obligations: [
      'Represent the interests of their senatorial district',
      'Attend Senate sessions and committee meetings',
      'Declare assets before and after tenure',
      'Maintain transparency and accountability',
      'Respond to constituent concerns and petitions'
    ],
    citizenRights: [
      'Right to contact your Senator directly via official channels',
      'Right to attend public legislative sessions',
      'Right to submit petitions on matters of public interest',
      'Right to access information on bills and Senate proceedings',
      'Right to recall your Senator through constitutional process'
    ]
  },
  HOUSE_OF_REPS: {
    duties: [
      'Initiate money bills and appropriation bills',
      'Make laws for the peace, order and good governance of Nigeria',
      'Approve the national budget',
      'Investigate activities of government ministries and agencies',
      'Represent the interests of federal constituencies'
    ],
    obligations: [
      'Represent all constituents regardless of political affiliation',
      'Maintain regular contact with constituency through town halls',
      'Declare assets before and after tenure',
      'Facilitate constituency projects and development'
    ],
    citizenRights: [
      'Right to attend public sittings of the House',
      'Right to submit petitions through your representative',
      'Right to be informed about bills affecting your constituency',
      'Right to recall your representative through due process'
    ]
  },
  LGA_CHAIRMAN: {
    duties: [
      'Administer the Local Government Area',
      'Implement policies and programs at the grassroots level',
      'Manage local government revenue and expenditure',
      'Provide basic amenities: roads, water, healthcare, education',
      'Coordinate community development projects'
    ],
    obligations: [
      'Be accessible to local residents',
      'Hold regular community meetings',
      'Publish quarterly financial statements',
      'Respond to community complaints within reasonable time'
    ],
    citizenRights: [
      'Right to access basic services: water, roads, sanitation',
      'Right to report issues directly to the LGA office',
      'Right to information on LGA budget and spending',
      'Right to participate in community development meetings'
    ]
  },
  LGA_COUNCILLOR: {
    duties: [
      'Represent the interests of their ward at the Local Government Council',
      'Participate in council meetings and decision-making',
      'Oversee ward-level development projects and initiatives',
      'Liaise between ward residents and the LGA administration',
      'Monitor and report on community needs and concerns',
      'Facilitate grassroots participation in governance'
    ],
    obligations: [
      'Be accessible to all ward residents',
      'Hold regular ward meetings and consultations',
      'Report back to constituents on council decisions',
      'Respond promptly to ward-level complaints and requests',
      'Maintain transparency in ward development activities',
      'Work collaboratively with other councillors and the LGA Chairman'
    ],
    citizenRights: [
      'Right to direct access to your ward councillor',
      'Right to attend ward meetings and consultations',
      'Right to report local issues (roads, water, sanitation) to your councillor',
      'Right to information on ward development projects and budget',
      'Right to petition your councillor on community matters',
      'Right to hold your councillor accountable for ward representation'
    ]
  },
  GOVERNOR: {
    duties: [
      'Serve as the Chief Executive Officer of the state',
      'Approve or veto bills passed by the State House of Assembly',
      'Appoint commissioners, special advisers, and heads of state agencies',
      'Manage state resources and budget allocation',
      'Ensure security and welfare of all citizens in the state',
      'Implement federal and state policies at the state level',
      'Coordinate development projects across local government areas'
    ],
    obligations: [
      'Be accountable to the people of the state',
      'Declare assets before and after tenure',
      'Hold regular town hall meetings with citizens',
      'Publish annual state budget and financial reports',
      'Respond to public petitions and concerns',
      'Ensure transparency in governance and procurement',
      'Maintain regular communication with constituents'
    ],
    citizenRights: [
      'Right to access state government services and information',
      'Right to attend public state government events and town halls',
      'Right to petition the Governor on matters of public interest',
      'Right to information on state budget, contracts, and projects',
      'Right to hold the Governor accountable through democratic processes',
      'Right to access state healthcare, education, and infrastructure'
    ]
  }
}

// Sample representative data (fallback)
const SAMPLE_REPRESENTATIVES: Record<string, Representative> = {
  '1': {
    id: '1', name: 'Godswill Akpabio', title: 'Senator', chamber: 'SENATE', party: 'APC',
    state: 'Akwa Ibom', lga: null, constituency: null, senatorialDistrict: 'Akwa Ibom North West',
    ward: null, photoUrl: null, bio: 'President of the Senate, 10th National Assembly. Former Governor of Akwa Ibom State.',
    contactInfo: [{ id: '1', contactType: 'email', value: 'senate.president@nass.gov.ng', isPrimary: true }],
    duties: CHAMBER_DUTIES.SENATE.duties, obligations: CHAMBER_DUTIES.SENATE.obligations, citizenRights: CHAMBER_DUTIES.SENATE.citizenRights
  },
  '2': {
    id: '2', name: 'Barau Jibrin', title: 'Senator', chamber: 'SENATE', party: 'APC',
    state: 'Kano', lga: null, constituency: null, senatorialDistrict: 'Kano North',
    ward: null, photoUrl: null, bio: 'Deputy President of the Senate, 10th National Assembly.',
    contactInfo: [{ id: '1', contactType: 'email', value: 'deputy.senate@nass.gov.ng', isPrimary: true }],
    duties: CHAMBER_DUTIES.SENATE.duties, obligations: CHAMBER_DUTIES.SENATE.obligations, citizenRights: CHAMBER_DUTIES.SENATE.citizenRights
  },
  '3': {
    id: '3', name: 'Tajudeen Abbas', title: 'Rt. Hon.', chamber: 'HOUSE_OF_REPS', party: 'APC',
    state: 'Kaduna', lga: null, constituency: 'Zaria Federal Constituency', senatorialDistrict: null,
    ward: null, photoUrl: null, bio: 'Speaker of the House of Representatives, 10th National Assembly.',
    contactInfo: [{ id: '1', contactType: 'email', value: 'speaker@nass.gov.ng', isPrimary: true }],
    duties: CHAMBER_DUTIES.HOUSE_OF_REPS.duties, obligations: CHAMBER_DUTIES.HOUSE_OF_REPS.obligations, citizenRights: CHAMBER_DUTIES.HOUSE_OF_REPS.citizenRights
  },
  '4': {
    id: '4', name: 'Benjamin Kalu', title: 'Hon.', chamber: 'HOUSE_OF_REPS', party: 'APC',
    state: 'Abia', lga: null, constituency: 'Bende Federal Constituency', senatorialDistrict: null,
    ward: null, photoUrl: null, bio: 'Deputy Speaker of the House of Representatives.',
    contactInfo: [{ id: '1', contactType: 'email', value: 'kalu.benjamin@nass.gov.ng', isPrimary: true }],
    duties: CHAMBER_DUTIES.HOUSE_OF_REPS.duties, obligations: CHAMBER_DUTIES.HOUSE_OF_REPS.obligations, citizenRights: CHAMBER_DUTIES.HOUSE_OF_REPS.citizenRights
  },
  '5': {
    id: '5', name: 'Solomon Adeola', title: 'Senator', chamber: 'SENATE', party: 'APC',
    state: 'Lagos', lga: null, constituency: null, senatorialDistrict: 'Lagos West',
    ward: null, photoUrl: null, bio: 'Chairman, Senate Committee on Finance.',
    contactInfo: [{ id: '1', contactType: 'email', value: 'adeola.solomon@nass.gov.ng', isPrimary: true }],
    duties: CHAMBER_DUTIES.SENATE.duties, obligations: CHAMBER_DUTIES.SENATE.obligations, citizenRights: CHAMBER_DUTIES.SENATE.citizenRights
  },
  '6': {
    id: '6', name: 'Adams Oshiomhole', title: 'Senator', chamber: 'SENATE', party: 'APC',
    state: 'Edo', lga: null, constituency: null, senatorialDistrict: 'Edo North',
    ward: null, photoUrl: null, bio: 'Former Governor of Edo State, former National Chairman of APC.',
    contactInfo: [{ id: '1', contactType: 'email', value: 'oshiomhole.adams@nass.gov.ng', isPrimary: true }],
    duties: CHAMBER_DUTIES.SENATE.duties, obligations: CHAMBER_DUTIES.SENATE.obligations, citizenRights: CHAMBER_DUTIES.SENATE.citizenRights
  },
  '7': {
    id: '7', name: 'Kingsley Chinda', title: 'Hon.', chamber: 'HOUSE_OF_REPS', party: 'PDP',
    state: 'Rivers', lga: null, constituency: 'Obio/Akpor Federal Constituency', senatorialDistrict: null,
    ward: null, photoUrl: null, bio: 'House Minority Leader.',
    contactInfo: [{ id: '1', contactType: 'email', value: 'chinda.kingsley@nass.gov.ng', isPrimary: true }],
    duties: CHAMBER_DUTIES.HOUSE_OF_REPS.duties, obligations: CHAMBER_DUTIES.HOUSE_OF_REPS.obligations, citizenRights: CHAMBER_DUTIES.HOUSE_OF_REPS.citizenRights
  },
  '8': {
    id: '8', name: 'Abba Moro', title: 'Senator', chamber: 'SENATE', party: 'PDP',
    state: 'Benue', lga: null, constituency: null, senatorialDistrict: 'Benue South',
    ward: null, photoUrl: null, bio: 'Senate Minority Leader.',
    contactInfo: [{ id: '1', contactType: 'email', value: 'moro.abba@nass.gov.ng', isPrimary: true }],
    duties: CHAMBER_DUTIES.SENATE.duties, obligations: CHAMBER_DUTIES.SENATE.obligations, citizenRights: CHAMBER_DUTIES.SENATE.citizenRights
  },
  '101': {
    id: '101', name: 'Mojeed Balogun', title: 'Hon. Chairman', chamber: 'LGA_CHAIRMAN', party: 'APC',
    state: 'Lagos', lga: 'Ikeja', constituency: null, senatorialDistrict: null,
    ward: null, photoUrl: null, bio: 'Chairman of Ikeja Local Government Area.',
    contactInfo: [{ id: '1', contactType: 'email', value: 'chairman@ikeja.lg.gov.ng', isPrimary: true }],
    duties: CHAMBER_DUTIES.LGA_CHAIRMAN.duties, obligations: CHAMBER_DUTIES.LGA_CHAIRMAN.obligations, citizenRights: CHAMBER_DUTIES.LGA_CHAIRMAN.citizenRights
  },
  '102': {
    id: '102', name: 'Jelili Sulaimon', title: 'Hon. Chairman', chamber: 'LGA_CHAIRMAN', party: 'APC',
    state: 'Lagos', lga: 'Alimosho', constituency: null, senatorialDistrict: null,
    ward: null, photoUrl: null, bio: 'Chairman of Alimosho Local Government Area.',
    contactInfo: [{ id: '1', contactType: 'email', value: 'chairman@alimosho.lg.gov.ng', isPrimary: true }],
    duties: CHAMBER_DUTIES.LGA_CHAIRMAN.duties, obligations: CHAMBER_DUTIES.LGA_CHAIRMAN.obligations, citizenRights: CHAMBER_DUTIES.LGA_CHAIRMAN.citizenRights
  },
  '104': {
    id: '104', name: 'Ibrahim Ungogo', title: 'Hon. Chairman', chamber: 'LGA_CHAIRMAN', party: 'NNPP',
    state: 'Kano', lga: 'Ungogo', constituency: null, senatorialDistrict: null,
    ward: null, photoUrl: null, bio: 'Chairman of Ungogo Local Government Area.',
    contactInfo: [{ id: '1', contactType: 'email', value: 'chairman@ungogo.lg.gov.ng', isPrimary: true }],
    duties: CHAMBER_DUTIES.LGA_CHAIRMAN.duties, obligations: CHAMBER_DUTIES.LGA_CHAIRMAN.obligations, citizenRights: CHAMBER_DUTIES.LGA_CHAIRMAN.citizenRights
  },
  '106': {
    id: '106', name: 'George Ariolu', title: 'Hon. Chairman', chamber: 'LGA_CHAIRMAN', party: 'PDP',
    state: 'Rivers', lga: 'Obio/Akpor', constituency: null, senatorialDistrict: null,
    ward: null, photoUrl: null, bio: 'Chairman of Obio/Akpor Local Government Area.',
    contactInfo: [{ id: '1', contactType: 'email', value: 'chairman@obioakpor.lg.gov.ng', isPrimary: true }],
    duties: CHAMBER_DUTIES.LGA_CHAIRMAN.duties, obligations: CHAMBER_DUTIES.LGA_CHAIRMAN.obligations, citizenRights: CHAMBER_DUTIES.LGA_CHAIRMAN.citizenRights
  }
}

function getContactIcon(type: string) {
  switch (type) {
    case 'email': return <Mail className="w-5 h-5" />
    case 'phone': return <Phone className="w-5 h-5" />
    case 'twitter': return <Twitter className="w-5 h-5" />
    default: return <ExternalLink className="w-5 h-5" />
  }
}

function getContactLink(type: string, value: string): string {
  switch (type) {
    case 'email': return `mailto:${value}`
    case 'phone': return `tel:${value}`
    case 'twitter': return `https://twitter.com/${value.replace('@', '')}`
    default: return value
  }
}

function getChamberIcon(chamber: string) {
  return chamber === 'LGA_CHAIRMAN' ? Landmark : Building2
}

function getChamberLabel(chamber: string): string {
  const labels: Record<string, string> = {
    'GOVERNOR': 'Governor',
    'SENATE': 'Senator',
    'HOUSE_OF_REPS': 'House of Representatives',
    'LGA_CHAIRMAN': 'Local Government Chairman',
    'LGA_COUNCILLOR': 'Local Government Councillor',
    'STATE_ASSEMBLY': 'State House of Assembly'
  }
  return labels[chamber] || chamber
}

export function RepresentativeDetail({ id }: { id: string }) {
  const [rep, setRep] = useState<Representative | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [activeTab, setActiveTab] = useState<'duties' | 'obligations' | 'rights'>('duties')

  useEffect(() => {
    const fetchRepresentative = async () => {
      setLoading(true)
      
      try {
        const response = await fetch(`/api/representatives/${id}`)
        if (response.ok) {
          const data = await response.json()
          // Map API response to component format
          const mappedData: Representative = {
            ...data,
            contactInfo: (data.contacts || []).map((c: any, idx: number) => ({
              id: c.id?.toString() || idx.toString(),
              contactType: c.type || c.contactType,
              value: c.value,
              isPrimary: c.isPrimary || false
            }))
          }
          setRep(mappedData)
        } else {
          // Fallback to sample data
          setRep(SAMPLE_REPRESENTATIVES[id] || null)
        }
      } catch (err) {
        console.error('Error fetching representative:', err)
        setRep(SAMPLE_REPRESENTATIVES[id] || null)
      } finally {
        setLoading(false)
      }
    }

    fetchRepresentative()
  }, [id])

  const copyToClipboard = async (text: string, contactId: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(contactId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const readAloud = (text: string) => {
    const tts = getTTSHandler()
    if (isSpeaking) {
      tts.stop()
      setIsSpeaking(false)
    } else {
      tts.speak(text)
      setIsSpeaking(true)
    }
  }

  const readDutiesAloud = () => {
    if (!rep) return
    let text = ''
    if (activeTab === 'duties') {
      text = `Duties of ${getChamberLabel(rep.chamber)}. ${rep.duties.join('. ')}`
    } else if (activeTab === 'obligations') {
      text = `Obligations to citizens. ${rep.obligations.join('. ')}`
    } else {
      text = `Your rights as a citizen. ${rep.citizenRights.join('. ')}`
    }
    readAloud(text)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 text-ng-green-600 animate-spin mx-auto mb-4" />
        <p className="text-slate-600">Loading representative details...</p>
      </div>
    )
  }

  if (!rep) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Representative Not Found</h2>
        <p className="text-slate-600 mb-6">
          The representative you&apos;re looking for could not be found.
        </p>
        <Link href="/representatives" className="btn-primary">
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </Link>
      </div>
    )
  }

  const ChamberIcon = getChamberIcon(rep.chamber)

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/representatives" className="inline-flex items-center gap-2 text-slate-600 hover:text-ng-green-600 mb-8">
        <ArrowLeft className="w-4 h-4" />
        Back to Representatives
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className={`w-24 h-24 md:w-32 md:h-32 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden relative ${
                rep.chamber === 'LGA_CHAIRMAN' ? 'bg-ng-green-100' :
                rep.chamber === 'LGA_COUNCILLOR' ? 'bg-emerald-100' :
                rep.chamber === 'SENATE' ? 'bg-purple-100' :
                rep.chamber === 'GOVERNOR' ? 'bg-red-100' : 'bg-blue-100'
              }`}>
                {rep.photoUrl ? (
                  <Image
                    src={rep.photoUrl}
                    alt={rep.name}
                    fill
                    sizes="(max-width: 768px) 96px, 128px"
                    className="object-cover rounded-2xl"
                    unoptimized={rep.photoUrl.startsWith('http') && !rep.photoUrl.includes('supabase.co') && !rep.photoUrl.includes('wikimedia.org')}
                  />
                ) : (
                  <ChamberIcon className={`w-12 h-12 md:w-16 md:h-16 ${
                    rep.chamber === 'LGA_CHAIRMAN' ? 'text-ng-green-600' :
                    rep.chamber === 'LGA_COUNCILLOR' ? 'text-emerald-600' :
                    rep.chamber === 'SENATE' ? 'text-purple-600' :
                    rep.chamber === 'GOVERNOR' ? 'text-red-600' : 'text-blue-600'
                  }`} />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900">
                      {rep.title} {rep.name}
                    </h1>
                    <p className={`text-lg font-medium mt-1 ${
                      rep.chamber === 'LGA_CHAIRMAN' ? 'text-ng-green-600' :
                      rep.chamber === 'LGA_COUNCILLOR' ? 'text-emerald-600' :
                      rep.chamber === 'SENATE' ? 'text-purple-600' :
                      rep.chamber === 'GOVERNOR' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {getChamberLabel(rep.chamber)}
                    </p>
                  </div>
                  {rep.party && (
                    <span className={`badge text-sm ${
                      rep.party === 'APC' ? 'bg-green-100 text-green-700' :
                      rep.party === 'PDP' ? 'bg-red-100 text-red-700' :
                      rep.party === 'LP' ? 'bg-orange-100 text-orange-700' :
                      rep.party === 'NNPP' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {rep.party}
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{rep.state}</span>
                  </div>
                  {rep.lga && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Landmark className="w-4 h-4 text-slate-400" />
                      <span>{rep.lga} Local Government Area</span>
                    </div>
                  )}
                  {rep.senatorialDistrict && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span>{rep.senatorialDistrict}</span>
                    </div>
                  )}
                  {rep.constituency && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span>{rep.constituency}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {rep.bio && (
              <div className="mt-8 pt-8 border-t">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-slate-900">About</h2>
                  <button
                    onClick={() => readAloud(`About ${rep.name}. ${rep.bio}`)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                      isSpeaking ? 'bg-warm-100 text-warm-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                  </button>
                </div>
                <p className="text-slate-600 leading-relaxed">{rep.bio}</p>
              </div>
            )}
          </div>

          {/* Duties, Obligations & Rights */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-ng-green-600" />
                Duties, Obligations & Your Rights
              </h2>
              <button
                onClick={readDutiesAloud}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                  isSpeaking ? 'bg-warm-100 text-warm-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
              </button>
            </div>

            <div className="flex gap-2 mb-6">
              <button onClick={() => setActiveTab('duties')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${activeTab === 'duties' ? 'bg-ng-green-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                <BookOpen className="w-4 h-4" /> Duties
              </button>
              <button onClick={() => setActiveTab('obligations')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${activeTab === 'obligations' ? 'bg-ng-green-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                <Users className="w-4 h-4" /> Obligations
              </button>
              <button onClick={() => setActiveTab('rights')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${activeTab === 'rights' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                <Shield className="w-4 h-4" /> Your Rights
              </button>
            </div>

            {activeTab === 'duties' && (
              <ul className="space-y-3">
                {rep.duties.map((duty, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="w-6 h-6 bg-ng-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-ng-green-600">{i + 1}</span>
                    </div>
                    <span className="text-slate-700">{duty}</span>
                  </li>
                ))}
              </ul>
            )}

            {activeTab === 'obligations' && (
              <ul className="space-y-3">
                {rep.obligations.map((obligation, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">{i + 1}</span>
                    </div>
                    <span className="text-slate-700">{obligation}</span>
                  </li>
                ))}
              </ul>
            )}

            {activeTab === 'rights' && (
              <div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 text-amber-800 font-medium mb-1">
                    <Info className="w-5 h-5" />
                    Know Your Rights
                  </div>
                  <p className="text-sm text-amber-700">
                    As a Nigerian citizen, you have constitutional rights in your relationship with elected officials.
                  </p>
                </div>
                <ul className="space-y-3">
                  {rep.citizenRights.map((right, i) => (
                    <li key={i} className="flex gap-3">
                      <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Shield className="w-3 h-3 text-amber-600" />
                      </div>
                      <span className="text-slate-700">{right}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Card */}
          <div className="card bg-gradient-to-br from-ng-green-500 to-ng-green-600 text-white">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-8 h-8" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold mb-2">Have a Concern?</h3>
                <p className="text-ng-green-100">
                  Start a petition addressed to {rep.title} {rep.name} and gather support from fellow citizens.
                </p>
              </div>
              <Link href={`/petitions/create?rep=${rep.id}`} className="btn-primary bg-white text-ng-green-600 hover:bg-ng-green-50 shadow-none">
                Start Petition
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h2 className="font-semibold text-slate-900 mb-4">Contact Information</h2>
            
            {!rep.contactInfo || rep.contactInfo.length === 0 ? (
              <p className="text-slate-500 text-sm">No contact information available yet.</p>
            ) : (
              <div className="space-y-3">
                {rep.contactInfo.map((contact) => (
                  <div key={contact.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl group">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-ng-green-600 shadow-sm">
                      {getContactIcon(contact.contactType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 uppercase tracking-wide">
                        {contact.contactType}
                        {contact.isPrimary && <span className="ml-1 text-ng-green-600">(Primary)</span>}
                      </p>
                      <a href={getContactLink(contact.contactType, contact.value)} className="text-slate-900 hover:text-ng-green-600 truncate block">
                        {contact.value}
                      </a>
                    </div>
                    <button
                      onClick={() => copyToClipboard(contact.value, contact.id)}
                      className="p-2 text-slate-400 hover:text-ng-green-600 hover:bg-white rounded-lg"
                    >
                      {copiedId === contact.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {rep.contactInfo?.some(c => c.contactType === 'email') && (
              <a href={`mailto:${rep.contactInfo.find(c => c.contactType === 'email')?.value}`} className="btn-primary w-full mt-6">
                <Mail className="w-4 h-4" /> Send Email
              </a>
            )}

            <div className="mt-6 p-4 bg-ng-green-50 rounded-xl">
              <div className="flex items-start gap-2">
                <Volume2 className="w-5 h-5 text-ng-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-ng-green-800">Voice Support</p>
                  <p className="text-xs text-ng-green-700 mt-1">
                    Click &quot;Listen&quot; buttons to hear information read aloud.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


