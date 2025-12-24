import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Photo URLs for Nigerian representatives (10th Assembly)
// Using Wikipedia Commons - reliable public domain images
// Full resolution URLs (remove /thumb/ and size suffix for full size)
const REPRESENTATIVE_PHOTOS: Record<string, string> = {
  // Senators - 10th Assembly
  'Godswill Akpabio': 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Godswill_Akpabio.jpg',
  'Barau Jibrin': 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Barau_Jibrin.jpg',
  'Solomon Adeola': 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Solomon_Adeola.jpg',
  'Oluremi Tinubu': 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Oluremi_Tinubu.jpg',
  'Tokunbo Abiru': 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Tokunbo_Abiru.jpg',
  'Adams Oshiomhole': 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Adams_Oshiomhole.jpg',
  'Ali Ndume': 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Ali_Ndume.jpg',
  'Orji Uzor Kalu': 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Orji_Uzor_Kalu.jpg',
  'Seriake Dickson': 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Seriake_Dickson.jpg',
  'Abba Moro': 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Abba_Moro.jpg',
  'Enyinnaya Abaribe': 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Enyinnaya_Abaribe.jpg',
  'Theodore Orji': 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Theodore_Orji.jpg',
  'Elisha Abbo': 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Elisha_Abbo.jpg',
  'Aishatu Binani': 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Aishatu_Binani.jpg',
  'Binos Yaroe': 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Binos_Yaroe.jpg',
  'Bassey Albert Akpan': 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Bassey_Albert_Akpan.jpg',
  'Akon Eyakenyi': 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Akon_Eyakenyi.jpg',
  'Uche Ekwunife': 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Uche_Ekwunife.jpg',
  'Victor Umeh': 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Victor_Umeh.jpg',
  'Tony Nwoye': 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Tony_Nwoye.jpg',
  'Ifeanyi Ubah': 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Ifeanyi_Ubah.jpg',
  'Halliru Jika': 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Halliru_Jika.jpg',
  'Abdul Ningi': 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Abdul_Ningi.jpg',
  'Shehu Buba': 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Shehu_Buba.jpg',
  
  // House of Representatives - 10th Assembly
  'Tajudeen Abbas': 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Tajudeen_Abbas.jpg',
  'Benjamin Kalu': 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Benjamin_Kalu.jpg',
  'Kingsley Chinda': 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Kingsley_Chinda.jpg',
  'Julius Ihonvbere': 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Julius_Ihonvbere.jpg',
  'Akin Alabi': 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Akin_Alabi.jpg',
  'Femi Gbajabiamila': 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Femi_Gbajabiamila.jpg',
  'James Faleke': 'https://upload.wikimedia.org/wikipedia/commons/7/7a/James_Faleke.jpg',
  'Nkeiruka Onyejeocha': 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Nkeiruka_Onyejeocha.jpg',
  'Ahmed Idris Wase': 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Ahmed_Idris_Wase.jpg',
  'Alhassan Ado Doguwa': 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Alhassan_Ado_Doguwa.jpg',
}

export async function POST(req: NextRequest) {
  try {
    // Get all representatives
    const { data: representatives, error: fetchError } = await supabase
      .from('representatives')
      .select('id, name')
      .eq('is_active', true)

    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch representatives' }, { status: 500 })
    }

    if (!representatives) {
      return NextResponse.json({ error: 'No representatives found' }, { status: 404 })
    }

    // Update photos
    const updates = []
    const notFound: string[] = []

    for (const rep of representatives) {
      const photoUrl = REPRESENTATIVE_PHOTOS[rep.name]
      
      if (photoUrl) {
        const { error: updateError } = await supabase
          .from('representatives')
          .update({ photo_url: photoUrl })
          .eq('id', rep.id)

        if (updateError) {
          console.error(`Failed to update ${rep.name}:`, updateError)
        } else {
          updates.push(rep.name)
        }
      } else {
        notFound.push(rep.name)
      }
    }

    return NextResponse.json({
      success: true,
      updated: updates.length,
      updatedNames: updates,
      notFound: notFound.length,
      notFoundNames: notFound
    })
  } catch (error) {
    console.error('Error updating photos:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

