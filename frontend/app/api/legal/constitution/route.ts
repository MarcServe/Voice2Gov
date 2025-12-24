import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const question = body.question?.trim()

    if (!question) {
      return NextResponse.json(
        { error: 'Question cannot be empty' },
        { status: 400 }
      )
    }

    // Check if OpenAI is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 503 }
      )
    }

    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Extract keywords from question for better search
    const keywords = question
      .toLowerCase()
      .replace(/[?.,!]/g, '')
      .split(' ')
      .filter(w => w.length > 3 && !['what', 'are', 'the', 'for', 'how', 'can', 'does', 'this', 'that', 'with', 'about', 'rights', 'right', 'nigerian', 'nigeria', 'child', 'person'].includes(w))

    // Build search query for each keyword
    let sections: any[] = []
    
    for (const keyword of keywords.slice(0, 3)) { // Search top 3 keywords
      const { data: keywordDocs } = await supabase
        .from('legal_documents')
        .select('*')
        .or(`content.ilike.%${keyword}%,heading.ilike.%${keyword}%,section.ilike.%${keyword}%`)
        .limit(3)
      
      if (keywordDocs) {
        // Add unique docs only
        for (const doc of keywordDocs) {
          if (!sections.find(s => s.id === doc.id)) {
            sections.push(doc)
          }
        }
      }
    }

    // If still no matches, search the full question
    if (sections.length === 0) {
      const { data: docs } = await supabase
        .from('legal_documents')
        .select('*')
        .or(`content.ilike.%${question}%,heading.ilike.%${question}%`)
        .limit(5)
      sections = docs || []
    }

    // Only use fallback if absolutely nothing found - and choose relevant fallback
    if (sections.length === 0) {
      // Don't show unrelated sections - just let AI answer without context
      sections = []
    }

    // Format sections for response
    const formattedSections = sections.map((doc: any) => ({
      id: doc.id,
      title: doc.title,
      chapter: doc.chapter,
      section: doc.section,
      heading: doc.heading,
      content: doc.content,
      tags: doc.tags || [],
    }))

    // Build context for OpenAI
    const contextText = formattedSections
      .map((s: any) => `${s.chapter} ${s.section} (${s.heading}): ${s.content}`)
      .join('\n\n')

    // Call OpenAI for summarization
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert Nigerian legal advisor with deep knowledge of ALL Nigerian laws - not just the Constitution, but also Acts of Parliament, State Laws, and regulations.

Your task is to provide COMPREHENSIVE, PRACTICAL legal guidance that helps ordinary Nigerians understand their rights.

IMPORTANT - REFERENCE ALL RELEVANT LAWS:
When answering, cite ALL applicable Nigerian laws, including but not limited to:

**For Education questions:**
- 1999 Constitution (Section 18 - Educational Objectives)
- Child Rights Act 2003 (if adopted by the state)
- Universal Basic Education (UBE) Act 2004
- National Policy on Education

**For Property/Rental questions:**
- 1999 Constitution (Section 44 - Right to Property)
- Land Use Act 1978
- Tenancy Laws (vary by state - Lagos Tenancy Law 2011, etc.)
- Recovery of Premises Act

**For Employment/Labour questions:**
- 1999 Constitution (Section 17)
- Labour Act
- Employees Compensation Act
- National Minimum Wage Act

**For Family/Marriage questions:**
- Marriage Act
- Matrimonial Causes Act
- Child Rights Act 2003
- Violence Against Persons (Prohibition) Act 2015

**For Criminal matters:**
- 1999 Constitution (Sections 33-36)
- Criminal Code / Penal Code
- Administration of Criminal Justice Act 2015

**IMPORTANT CONTACTS TO REFERENCE** (include actual details when relevant):

**Legal Aid:**
- Legal Aid Council of Nigeria: www.legalaidcouncil.gov.ng | 09-4617089 | info@legalaidcouncil.gov.ng
- NBA (Nigerian Bar Association): www.nigerianbar.org.ng

**Human Rights:**
- National Human Rights Commission: www.nigeriarights.gov.ng | 09-5238315 | info@nigeriarights.gov.ng
- Public Complaints Commission: www.pcc.gov.ng

**Labour/Employment:**
- Federal Ministry of Labour: www.labour.gov.ng | 09-5238007
- Industrial Arbitration Panel: 09-2348620
- National Industrial Court: www.nicn.gov.ng

**Consumer Protection:**
- Federal Competition & Consumer Protection Commission (FCCPC): www.fccpc.gov.ng | 0800-222-2552 (toll-free)
- Consumer Protection Council: consumer@cpc.gov.ng

**Land/Property:**
- State Lands Bureau (varies by state)
- Lagos: Lagos State Lands Bureau - www.lagoslands.com
- Federal Lands Registry: lands.gov.ng

**Tenancy (Lagos):**
- Lagos State Tenancy Law Office
- Lagos Citizens Mediation Centre: 01-2700022

**Police/Security:**
- Nigeria Police Force: www.npf.gov.ng | 112 (emergency) | 0703-241-8737
- Police Service Commission: www.psc.gov.ng

**Anti-Corruption:**
- EFCC: www.efcc.gov.ng | 09-9044752 | info@efcc.gov.ng
- ICPC: www.icpc.gov.ng | 08076369259 | info@icpc.gov.ng

**Education:**
- Federal Ministry of Education: education.gov.ng | 09-5238167
- UBEC: www.ubec.gov.ng | 09-6720017

**Child Rights:**
- National Agency for Prohibition of Trafficking in Persons (NAPTIP): www.naptip.gov.ng | 07030000203
- National Child Welfare Office: Ministry of Women Affairs

RESPONSE FORMAT:
1. **Start with a direct, helpful summary**
2. **Organize by law/source** - clearly label each:
   - "### 1. Constitution (Section X)"
   - "### 2. Child Rights Act (2003)"
   - "### 3. Universal Basic Education Act"
3. **Use bullet points** for specific rights under each law
4. **Add practical tips** with 👉 emoji for actionable advice
5. **Tell them what's ILLEGAL** that they might not know
6. **Suggest who to contact** for enforcement

Be conversational but authoritative. Help people understand what they can actually DO with this information.

STAY ON TOPIC - only discuss laws relevant to the specific question asked.`,
        },
        {
          role: 'user',
          content: `A Nigerian citizen is asking: "${question}"

Provide a COMPREHENSIVE answer covering ALL relevant Nigerian laws (not just the Constitution).

${contextText ? `\nConstitutional excerpts for reference:\n${contextText}` : ''}

FORMAT YOUR RESPONSE LIKE THIS:

### 1. Constitution (Section X)
[What the constitution says about this topic]
- Bullet point 1
- Bullet point 2

### 2. [Relevant Act Name] (Year)
[What this law provides]
- Bullet point 1
- Bullet point 2

### 3. [Another Relevant Law]
...

### What This Means For You
👉 Practical tip 1
👉 Practical tip 2

### ⚠️ What's Illegal (That You Should Know)
- Thing 1 is illegal
- Thing 2 is illegal

### Who To Contact
- **[Organization Name]**: [Brief description]
  - 🌐 Website: [URL]
  - 📞 Phone: [Number]
  - ✉️ Email: [Email]

Remember: Be helpful, practical, and comprehensive. Reference ALL relevant laws, not just the Constitution.`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    })

    const answer = completion.choices[0]?.message?.content || 
      'I am unable to provide a comprehensive answer based on the available information.'

    return NextResponse.json({
      question,
      answer,
      sections: formattedSections,
    })
  } catch (error) {
    console.error('Legal API error:', error)
    return NextResponse.json(
      { error: 'Failed to process your question. Please try again.' },
      { status: 500 }
    )
  }
}

