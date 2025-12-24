import { Suspense } from 'react'
import { RepresentativeSearch } from '@/components/RepresentativeSearch'
import { RepresentativeList } from '@/components/RepresentativeList'

export const metadata = {
  title: 'Find Your Representative | Voice2Gov',
  description: 'Search for Nigerian Senators, House of Representatives members, and LGA Chairmen.',
}

export default function RepresentativesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-ng-green-500 to-ng-green-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Find Your Representative
          </h1>
          <p className="text-ng-green-100 text-lg max-w-2xl">
            Search through Nigeria&apos;s elected officials — Senators, House of Representatives members, 
            State Assembly members, and Local Government Chairmen.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="container mx-auto px-4 -mt-6">
        <Suspense fallback={<div className="card animate-pulse h-24" />}>
          <RepresentativeSearch />
        </Suspense>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-slate-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-slate-200 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        }>
          <RepresentativeList />
        </Suspense>
      </div>
    </div>
  )
}


