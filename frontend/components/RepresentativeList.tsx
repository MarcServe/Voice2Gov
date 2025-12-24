'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { User, MapPin, Building2, ExternalLink, ChevronLeft, ChevronRight, Landmark, Volume2, Loader2 } from 'lucide-react'
import { getTTSHandler } from '@/lib/speech'
import Image from 'next/image'

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
  photoUrl: string | null
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

// Sample data for demonstration (until database is seeded)
const SAMPLE_REPRESENTATIVES: Representative[] = [
  { id: '1', name: 'Godswill Akpabio', title: 'Senator', chamber: 'SENATE', party: 'APC', state: 'Akwa Ibom', lga: null, constituency: null, senatorialDistrict: 'Akwa Ibom North West', photoUrl: null },
  { id: '2', name: 'Barau Jibrin', title: 'Senator', chamber: 'SENATE', party: 'APC', state: 'Kano', lga: null, constituency: null, senatorialDistrict: 'Kano North', photoUrl: null },
  { id: '3', name: 'Tajudeen Abbas', title: 'Rt. Hon.', chamber: 'HOUSE_OF_REPS', party: 'APC', state: 'Kaduna', lga: null, constituency: 'Zaria Federal Constituency', senatorialDistrict: null, photoUrl: null },
  { id: '4', name: 'Benjamin Kalu', title: 'Hon.', chamber: 'HOUSE_OF_REPS', party: 'APC', state: 'Abia', lga: null, constituency: 'Bende Federal Constituency', senatorialDistrict: null, photoUrl: null },
  { id: '5', name: 'Solomon Adeola', title: 'Senator', chamber: 'SENATE', party: 'APC', state: 'Lagos', lga: null, constituency: null, senatorialDistrict: 'Lagos West', photoUrl: null },
  { id: '6', name: 'Adams Oshiomhole', title: 'Senator', chamber: 'SENATE', party: 'APC', state: 'Edo', lga: null, constituency: null, senatorialDistrict: 'Edo North', photoUrl: null },
  { id: '7', name: 'Kingsley Chinda', title: 'Hon.', chamber: 'HOUSE_OF_REPS', party: 'PDP', state: 'Rivers', lga: null, constituency: 'Obio/Akpor Federal Constituency', senatorialDistrict: null, photoUrl: null },
  { id: '8', name: 'Abba Moro', title: 'Senator', chamber: 'SENATE', party: 'PDP', state: 'Benue', lga: null, constituency: null, senatorialDistrict: 'Benue South', photoUrl: null },
  { id: '101', name: 'Mojeed Balogun', title: 'Hon. Chairman', chamber: 'LGA_CHAIRMAN', party: 'APC', state: 'Lagos', lga: 'Ikeja', constituency: null, senatorialDistrict: null, photoUrl: null },
  { id: '102', name: 'Jelili Sulaimon', title: 'Hon. Chairman', chamber: 'LGA_CHAIRMAN', party: 'APC', state: 'Lagos', lga: 'Alimosho', constituency: null, senatorialDistrict: null, photoUrl: null },
  { id: '104', name: 'Ibrahim Ungogo', title: 'Hon. Chairman', chamber: 'LGA_CHAIRMAN', party: 'NNPP', state: 'Kano', lga: 'Ungogo', constituency: null, senatorialDistrict: null, photoUrl: null },
  { id: '106', name: 'George Ariolu', title: 'Hon. Chairman', chamber: 'LGA_CHAIRMAN', party: 'PDP', state: 'Rivers', lga: 'Obio/Akpor', constituency: null, senatorialDistrict: null, photoUrl: null },
]

function getPartyBadgeColor(party: string | null): string {
  switch (party) {
    case 'APC':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'PDP':
      return 'bg-red-100 text-red-700 border-red-200'
    case 'LP':
      return 'bg-orange-100 text-orange-700 border-orange-200'
    case 'NNPP':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'APGA':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

function getChamberInfo(chamber: string): { label: string; icon: typeof Building2; color: string; bgColor: string } {
  switch (chamber) {
    case 'SENATE':
      return { label: 'Senator', icon: Building2, color: 'text-purple-600', bgColor: 'bg-purple-100 group-hover:bg-purple-200' }
    case 'HOUSE_OF_REPS':
      return { label: 'House of Reps', icon: Building2, color: 'text-blue-600', bgColor: 'bg-blue-100 group-hover:bg-blue-200' }
    case 'GOVERNOR':
      return { label: 'Governor', icon: Building2, color: 'text-red-600', bgColor: 'bg-red-100 group-hover:bg-red-200' }
    case 'LGA_CHAIRMAN':
      return { label: 'LGA Chairman', icon: Landmark, color: 'text-ng-green-600', bgColor: 'bg-ng-green-100 group-hover:bg-ng-green-200' }
    case 'LGA_COUNCILLOR':
      return { label: 'LGA Councillor', icon: Landmark, color: 'text-emerald-600', bgColor: 'bg-emerald-100 group-hover:bg-emerald-200' }
    case 'STATE_ASSEMBLY':
      return { label: 'State Assembly', icon: Building2, color: 'text-amber-600', bgColor: 'bg-amber-100 group-hover:bg-amber-200' }
    default:
      return { label: chamber, icon: Building2, color: 'text-slate-600', bgColor: 'bg-slate-100 group-hover:bg-slate-200' }
  }
}

export function RepresentativeList() {
  const searchParams = useSearchParams()
  const [reps, setReps] = useState<Representative[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, senators: 0, houseReps: 0, lgaChairmen: 0, lgaCouncillors: 0, stateAssembly: 0, governors: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 12

  // Fetch representatives
  useEffect(() => {
    const fetchRepresentatives = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const params = new URLSearchParams()
        
        const state = searchParams.get('state')
        const lga = searchParams.get('lga')
        const chamber = searchParams.get('chamber')
        const party = searchParams.get('party')
        const search = searchParams.get('search')

        if (state) params.append('state', state)
        if (lga) params.append('lga', lga)
        if (chamber) params.append('chamber', chamber)
        if (party) params.append('party', party)
        if (search) params.append('search', search)
        params.append('page', page.toString())
        params.append('limit', pageSize.toString())

        const response = await fetch(`/api/representatives?${params.toString()}`)
        
        if (response.ok) {
          const data = await response.json()
          setReps(data.representatives)
          setStats(data.stats)
          setTotalPages(data.pagination.totalPages)
          setTotalCount(data.pagination.total)
        } else {
          // Fall back to sample data if API fails
          let filtered = SAMPLE_REPRESENTATIVES
          
          if (state) {
            filtered = filtered.filter(r => r.state.toLowerCase().includes(state.toLowerCase()))
          }
          if (chamber) {
            filtered = filtered.filter(r => r.chamber === chamber)
          }
          if (party) {
            filtered = filtered.filter(r => r.party === party)
          }
          if (search) {
            filtered = filtered.filter(r => 
              r.name.toLowerCase().includes(search.toLowerCase()) ||
              r.lga?.toLowerCase().includes(search.toLowerCase()) ||
              r.constituency?.toLowerCase().includes(search.toLowerCase())
            )
          }
          
          setReps(filtered)
          setStats({
            total: SAMPLE_REPRESENTATIVES.length,
            senators: SAMPLE_REPRESENTATIVES.filter(r => r.chamber === 'SENATE').length,
            houseReps: SAMPLE_REPRESENTATIVES.filter(r => r.chamber === 'HOUSE_OF_REPS').length,
            lgaChairmen: SAMPLE_REPRESENTATIVES.filter(r => r.chamber === 'LGA_CHAIRMAN').length,
            lgaCouncillors: SAMPLE_REPRESENTATIVES.filter(r => r.chamber === 'LGA_COUNCILLOR').length,
            stateAssembly: 0,
            governors: SAMPLE_REPRESENTATIVES.filter(r => r.chamber === 'GOVERNOR').length
          })
          setTotalPages(1)
          setTotalCount(filtered.length)
        }
      } catch (err) {
        console.error('Error fetching representatives:', err)
        // Fall back to sample data
        setReps(SAMPLE_REPRESENTATIVES)
        setStats({
          total: SAMPLE_REPRESENTATIVES.length,
          senators: SAMPLE_REPRESENTATIVES.filter(r => r.chamber === 'SENATE').length,
          houseReps: SAMPLE_REPRESENTATIVES.filter(r => r.chamber === 'HOUSE_OF_REPS').length,
          lgaChairmen: SAMPLE_REPRESENTATIVES.filter(r => r.chamber === 'LGA_CHAIRMAN').length,
          lgaCouncillors: SAMPLE_REPRESENTATIVES.filter(r => r.chamber === 'LGA_COUNCILLOR').length,
          stateAssembly: 0,
          governors: SAMPLE_REPRESENTATIVES.filter(r => r.chamber === 'GOVERNOR').length
        })
        setTotalCount(SAMPLE_REPRESENTATIVES.length)
      } finally {
        setLoading(false)
      }
    }

    fetchRepresentatives()
  }, [searchParams, page])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [searchParams])

  // Voice announcement
  const announceStats = () => {
    const tts = getTTSHandler()
    tts.speak(`Voice2Gov database contains ${stats.total} representatives. ${stats.senators} Senators, ${stats.houseReps} House of Representatives members, ${stats.governors} Governors, ${stats.lgaChairmen} Local Government Chairmen, and ${stats.lgaCouncillors} Local Government Councillors for grassroots representation. Use the search filters to find your representative.`)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-ng-green-600 animate-spin mb-4" />
        <p className="text-slate-600">Loading representatives...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Stats with Voice Support */}
      <div className="bg-slate-50 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Database Overview</h3>
          <button
            onClick={announceStats}
            className="flex items-center gap-2 px-3 py-1.5 bg-ng-green-100 text-ng-green-700 rounded-full text-sm hover:bg-ng-green-200 transition-colors"
          >
            <Volume2 className="w-4 h-4" />
            Listen
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-sm text-slate-600">Total Representatives</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border-l-4 border-purple-500">
            <div className="text-3xl font-bold text-purple-600">{stats.senators}</div>
            <div className="text-sm text-slate-600">Senators</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border-l-4 border-blue-500">
            <div className="text-3xl font-bold text-blue-600">{stats.houseReps}</div>
            <div className="text-sm text-slate-600">House of Reps</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border-l-4 border-red-500">
            <div className="text-3xl font-bold text-red-600">{stats.governors}</div>
            <div className="text-sm text-slate-600">Governors</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border-l-4 border-ng-green-500">
            <div className="text-3xl font-bold text-ng-green-600">{stats.lgaChairmen}</div>
            <div className="text-sm text-slate-600">LGA Chairmen</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border-l-4 border-emerald-500">
            <div className="text-3xl font-bold text-emerald-600">{stats.lgaCouncillors}</div>
            <div className="text-sm text-slate-600">LGA Councillors</div>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-4 text-center">
          Nigeria has 109 Senators, 360 House of Representatives members, 36 Governors, 774 LGA Chairmen, and thousands of LGA Councillors representing wards at the grassroots level. 
          This database is continuously being updated.
        </p>
      </div>

      {reps.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No Representatives Found</h3>
          <p className="text-slate-600 mb-6">
            Try adjusting your search filters or search for a different term.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-slate-600">
              Showing <span className="font-semibold">{reps.length}</span> of{' '}
              <span className="font-semibold">{totalCount}</span> representatives
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reps.map((rep) => {
              const chamberInfo = getChamberInfo(rep.chamber)
              const ChamberIcon = chamberInfo.icon
              
              return (
                <Link
                  key={rep.id}
                  href={`/representatives/${rep.id}`}
                  className="card-interactive group"
                >
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${chamberInfo.bgColor} relative overflow-hidden`}>
                      {rep.photoUrl ? (
                        <Image
                          src={rep.photoUrl}
                          alt={rep.name}
                          fill
                          sizes="64px"
                          className="object-cover rounded-full"
                          unoptimized={rep.photoUrl.startsWith('http') && !rep.photoUrl.includes('supabase.co') && !rep.photoUrl.includes('wikimedia.org')}
                        />
                      ) : (
                        <ChamberIcon className={`w-8 h-8 ${chamberInfo.color}`} />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-slate-900 group-hover:text-ng-green-600 transition-colors truncate">
                          {rep.name}
                        </h3>
                        {rep.party && (
                          <span className={`badge text-xs border ${getPartyBadgeColor(rep.party)}`}>
                            {rep.party}
                          </span>
                        )}
                      </div>

                      <div className="mt-1 space-y-1">
                        <div className={`flex items-center gap-1 text-sm ${chamberInfo.color}`}>
                          <ChamberIcon className="w-3.5 h-3.5" />
                          <span className="font-medium">{chamberInfo.label}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="truncate">
                            {rep.state}
                            {rep.lga && ` • ${rep.lga} LGA`}
                            {rep.constituency && ` • ${rep.constituency.replace(' Federal Constituency', '')}`}
                            {rep.senatorialDistrict && ` • ${rep.senatorialDistrict}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <span className="text-sm text-ng-green-600 font-medium group-hover:underline">
                      View Profile & Contact
                    </span>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-ng-green-600 transition-colors" />
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="px-4 py-2 text-sm text-slate-600">
                Page {page} of {totalPages}
              </span>
              
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Info Box */}
      <div className="mt-8 p-6 bg-ng-green-50 border border-ng-green-100 rounded-xl">
        <h4 className="font-semibold text-ng-green-800 mb-2">🏘️ About Nigerian Representatives</h4>
        <div className="text-sm text-ng-green-700 space-y-2">
          <p><strong>Senators (109):</strong> 3 from each of the 36 states, plus 1 from FCT. They serve 4-year terms.</p>
          <p><strong>House of Representatives (360):</strong> Elected from 360 federal constituencies across Nigeria.</p>
          <p><strong>Governors (36):</strong> Chief Executive Officers of each state, responsible for state-level governance.</p>
          <p><strong>LGA Chairmen (774):</strong> Each of Nigeria&apos;s 774 Local Government Areas has an elected Chairman responsible for grassroots governance.</p>
          <p><strong>LGA Councillors (Thousands):</strong> Elected representatives at the ward level, providing direct grassroots representation and ensuring community voices are heard in local government decisions.</p>
        </div>
      </div>
    </div>
  )
}


