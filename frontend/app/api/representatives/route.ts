import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const state = searchParams.get('state')
    const lga = searchParams.get('lga')
    const chamber = searchParams.get('chamber')
    const party = searchParams.get('party')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    // Build query
    let query = supabase
      .from('representatives')
      .select(`
        id,
        name,
        title,
        chamber,
        party,
        constituency,
        senatorial_district,
        bio,
        photo_url,
        is_active,
        states!inner (name),
        lgas (name)
      `, { count: 'exact' })
      .eq('is_active', true)

    // Apply filters
    if (chamber) {
      query = query.eq('chamber', chamber)
    }

    if (party) {
      query = query.eq('party', party)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,constituency.ilike.%${search}%,senatorial_district.ilike.%${search}%`)
    }

    // Pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: representatives, error, count } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch representatives' },
        { status: 500 }
      )
    }

    // Get stats
    const { data: statsData } = await supabase
      .from('representatives')
      .select('chamber')
      .eq('is_active', true)

    const stats = {
      total: statsData?.length || 0,
      senators: statsData?.filter(r => r.chamber === 'SENATE').length || 0,
      houseReps: statsData?.filter(r => r.chamber === 'HOUSE_OF_REPS').length || 0,
      lgaChairmen: statsData?.filter(r => r.chamber === 'LGA_CHAIRMAN').length || 0,
      lgaCouncillors: statsData?.filter(r => r.chamber === 'LGA_COUNCILLOR').length || 0,
      stateAssembly: statsData?.filter(r => r.chamber === 'STATE_ASSEMBLY').length || 0,
      governors: statsData?.filter(r => r.chamber === 'GOVERNOR').length || 0,
    }

    // Transform data
    const formattedReps = representatives?.map((rep: any) => ({
      id: rep.id.toString(),
      name: rep.name,
      title: rep.title,
      chamber: rep.chamber,
      party: rep.party,
      state: rep.states?.name || '',
      lga: rep.lgas?.name || null,
      constituency: rep.constituency,
      senatorialDistrict: rep.senatorial_district,
      photoUrl: rep.photo_url,
    })) || []

    // Filter by state name if provided (post-query filter since we joined)
    let filteredReps = formattedReps
    if (state) {
      filteredReps = formattedReps.filter(r => 
        r.state.toLowerCase().includes(state.toLowerCase())
      )
    }

    return NextResponse.json({
      representatives: filteredReps,
      stats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


