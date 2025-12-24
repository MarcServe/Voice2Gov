'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter, X } from 'lucide-react'
import { NIGERIAN_STATES, POLITICAL_PARTIES, CHAMBERS } from '@/lib/utils'

export function RepresentativeSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [state, setState] = useState(searchParams.get('state') || '')
  const [chamber, setChamber] = useState(searchParams.get('chamber') || '')
  const [party, setParty] = useState(searchParams.get('party') || '')
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (state) params.set('state', state)
    if (chamber) params.set('chamber', chamber)
    if (party) params.set('party', party)
    
    router.push(`/representatives?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearch('')
    setState('')
    setChamber('')
    setParty('')
    router.push('/representatives')
  }

  const hasFilters = search || state || chamber || party

  return (
    <div className="card">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by name, constituency, or LGA..."
            className="input pl-12"
          />
        </div>

        {/* Filter Toggle & Search Button */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-ghost ${showFilters ? 'bg-ng-green-50 text-ng-green-600' : ''}`}
          >
            <Filter className="w-5 h-5" />
            Filters
            {hasFilters && (
              <span className="w-2 h-2 bg-ng-green-500 rounded-full" />
            )}
          </button>
          <button onClick={handleSearch} className="btn-primary">
            Search
          </button>
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="grid md:grid-cols-3 gap-4">
            {/* State Filter */}
            <div>
              <label className="label">State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="input"
              >
                <option value="">All States</option>
                {NIGERIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Chamber Filter */}
            <div>
              <label className="label">Chamber</label>
              <select
                value={chamber}
                onChange={(e) => setChamber(e.target.value)}
                className="input"
              >
                {CHAMBERS.map((c) => (
                  <option key={c.value} value={c.value === 'ALL' ? '' : c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Party Filter */}
            <div>
              <label className="label">Party</label>
              <select
                value={party}
                onChange={(e) => setParty(e.target.value)}
                className="input"
              >
                <option value="">All Parties</option>
                {POLITICAL_PARTIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}


