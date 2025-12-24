import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Chamber-specific duties and obligations
const CHAMBER_DUTIES: Record<string, { duties: string[]; obligations: string[]; citizenRights: string[] }> = {
  SENATE: {
    duties: [
      'Make laws for the peace, order and good governance of Nigeria',
      'Approve presidential appointments and nominations',
      'Confirm appointments of judges, ambassadors, and federal commissions',
      'Approve national budget and monitor implementation',
      'Conduct investigations into matters of public interest',
      'Ratify international treaties and agreements',
      'Impeach the President or Vice President for gross misconduct',
      'Confirm declaration of state of emergency'
    ],
    obligations: [
      'Represent the interests of their senatorial district',
      'Attend Senate sessions and committee meetings',
      'Declare assets before and after office',
      'Act with integrity and avoid conflicts of interest',
      'Be accessible to constituents and address their concerns',
      'Submit periodic reports on their activities'
    ],
    citizenRights: [
      'Right to contact and petition your Senator',
      'Right to attend public Senate sessions',
      'Right to access information on Senate activities',
      'Right to recall your Senator through due process',
      'Right to participate in town halls and constituency meetings',
      'Right to request your Senator to sponsor bills on your behalf'
    ]
  },
  HOUSE_OF_REPS: {
    duties: [
      'Make laws for the peace, order and good governance of Nigeria',
      'Appropriate funds for government operations',
      'Oversee the executive branch through committees',
      'Investigate matters of public concern',
      'Approve major government appointments',
      'Represent constituency interests at federal level',
      'Participate in joint sessions with the Senate',
      'Initiate money bills and taxation measures'
    ],
    obligations: [
      'Represent their federal constituency faithfully',
      'Attend House sessions and committee meetings',
      'Maintain regular contact with constituents',
      'Declare assets as required by law',
      'Avoid abuse of office and privileges',
      'Account for constituency project funds'
    ],
    citizenRights: [
      'Right to contact and petition your Representative',
      'Right to attend public House sessions',
      'Right to information on constituency projects',
      'Right to recall your Representative through due process',
      'Right to participate in public hearings',
      'Right to demand accountability for allocated funds'
    ]
  },
  LGA_CHAIRMAN: {
    duties: [
      'Provide local government services to residents',
      'Implement federal and state policies at grassroots level',
      'Maintain local infrastructure (roads, markets, drains)',
      'Collect local taxes and rates',
      'Register births and deaths',
      'Manage primary education and healthcare facilities',
      'Coordinate community development projects',
      'Maintain peace and order in the local government area'
    ],
    obligations: [
      'Be accountable to the people of the LGA',
      'Hold regular council meetings',
      'Publish quarterly financial reports',
      'Ensure transparent procurement processes',
      'Respond to citizen complaints promptly',
      'Maintain office hours for public access'
    ],
    citizenRights: [
      'Right to access basic local services',
      'Right to information on LGA budget and spending',
      'Right to attend council meetings',
      'Right to petition for community projects',
      'Right to report corruption and misconduct',
      'Right to participate in community development'
    ]
  },
  STATE_ASSEMBLY: {
    duties: [
      'Make laws for the state',
      'Approve state budget',
      'Oversee state executive activities',
      'Confirm state-level appointments',
      'Create or modify local government areas',
      'Investigate state matters of public interest'
    ],
    obligations: [
      'Represent constituency interests at state level',
      'Attend Assembly sessions regularly',
      'Participate in committee work',
      'Maintain contact with constituents',
      'Declare assets as required'
    ],
    citizenRights: [
      'Right to contact your state legislator',
      'Right to attend public Assembly sessions',
      'Right to information on state laws',
      'Right to petition for state-level action',
      'Right to participate in public hearings'
    ]
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    const { data: rep, error } = await supabase
      .from('representatives')
      .select(`
        id,
        name,
        title,
        chamber,
        party,
        constituency,
        senatorial_district,
        ward,
        bio,
        photo_url,
        is_active,
        term_start,
        term_end,
        states (id, name, code, region, capital),
        lgas (id, name),
        contact_info (id, contact_type, value, is_primary, is_verified)
      `)
      .eq('id', id)
      .single()

    if (error || !rep) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Representative not found' },
        { status: 404 }
      )
    }

    // Get chamber-specific info
    const chamberInfo = CHAMBER_DUTIES[rep.chamber] || CHAMBER_DUTIES.SENATE

    // Transform data
    const representative = {
      id: rep.id.toString(),
      name: rep.name,
      title: rep.title,
      chamber: rep.chamber,
      party: rep.party,
      state: (rep.states as any)?.name || '',
      stateCode: (rep.states as any)?.code || '',
      region: (rep.states as any)?.region || '',
      lga: (rep.lgas as any)?.name || null,
      constituency: rep.constituency,
      senatorialDistrict: rep.senatorial_district,
      ward: rep.ward,
      bio: rep.bio,
      photoUrl: rep.photo_url,
      isActive: rep.is_active,
      termStart: rep.term_start,
      termEnd: rep.term_end,
      contacts: (rep.contact_info as any[])?.map(c => ({
        type: c.contact_type,
        value: c.value,
        isPrimary: c.is_primary,
        isVerified: c.is_verified,
      })) || [],
      duties: chamberInfo.duties,
      obligations: chamberInfo.obligations,
      citizenRights: chamberInfo.citizenRights,
    }

    return NextResponse.json(representative)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


