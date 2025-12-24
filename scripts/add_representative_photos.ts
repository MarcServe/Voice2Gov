/**
 * Script to add photos to representatives from the database
 * Run this in the browser console or as a Node script
 */

// Photo URLs for known Nigerian representatives (10th Assembly)
// These are publicly available images from official sources
const REPRESENTATIVE_PHOTOS: Record<string, string> = {
  // Senators
  'Godswill Akpabio': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Godswill_Akpabio.jpg/220px-Godswill_Akpabio.jpg',
  'Barau Jibrin': 'https://nass.gov.ng/mps/senate/barau-jibrin',
  'Solomon Adeola': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Solomon_Adeola.jpg/220px-Solomon_Adeola.jpg',
  'Oluremi Tinubu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Oluremi_Tinubu.jpg/220px-Oluremi_Tinubu.jpg',
  'Tokunbo Abiru': 'https://nass.gov.ng/mps/senate/tokunbo-abiru',
  'Adams Oshiomhole': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Adams_Oshiomhole.jpg/220px-Adams_Oshiomhole.jpg',
  'Ali Ndume': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Ali_Ndume.jpg/220px-Ali_Ndume.jpg',
  'Orji Uzor Kalu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Orji_Uzor_Kalu.jpg/220px-Orji_Uzor_Kalu.jpg',
  'Seriake Dickson': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Seriake_Dickson.jpg/220px-Seriake_Dickson.jpg',
  'Abba Moro': 'https://nass.gov.ng/mps/senate/abba-moro',
  'Enyinnaya Abaribe': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Enyinnaya_Abaribe.jpg/220px-Enyinnaya_Abaribe.jpg',
  'Theodore Orji': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Theodore_Orji.jpg/220px-Theodore_Orji.jpg',
  'Elisha Abbo': 'https://nass.gov.ng/mps/senate/elisha-abbo',
  'Aishatu Binani': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Aishatu_Binani.jpg/220px-Aishatu_Binani.jpg',
  'Binos Yaroe': 'https://nass.gov.ng/mps/senate/binos-yaroe',
  'Bassey Albert Akpan': 'https://nass.gov.ng/mps/senate/bassey-albert-akpan',
  'Akon Eyakenyi': 'https://nass.gov.ng/mps/senate/akon-eyakenyi',
  'Uche Ekwunife': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Uche_Ekwunife.jpg/220px-Uche_Ekwunife.jpg',
  'Victor Umeh': 'https://nass.gov.ng/mps/senate/victor-umeh',
  'Tony Nwoye': 'https://nass.gov.ng/mps/senate/tony-nwoye',
  'Ifeanyi Ubah': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Ifeanyi_Ubah.jpg/220px-Ifeanyi_Ubah.jpg',
  'Halliru Jika': 'https://nass.gov.ng/mps/senate/halliru-jika',
  'Abdul Ningi': 'https://nass.gov.ng/mps/senate/abdul-ningi',
  'Shehu Buba': 'https://nass.gov.ng/mps/senate/shehu-buba',
  
  // House of Representatives
  'Tajudeen Abbas': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Tajudeen_Abbas.jpg/220px-Tajudeen_Abbas.jpg',
  'Benjamin Kalu': 'https://nass.gov.ng/mps/house/benjamin-kalu',
  'Kingsley Chinda': 'https://nass.gov.ng/mps/house/kingsley-chinda',
  'Julius Ihonvbere': 'https://nass.gov.ng/mps/house/julius-ihonvbere',
  'Akin Alabi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Akin_Alabi.jpg/220px-Akin_Alabi.jpg',
  'Femi Gbajabiamila': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Femi_Gbajabiamila.jpg/220px-Femi_Gbajabiamila.jpg',
  'James Faleke': 'https://nass.gov.ng/mps/house/james-faleke',
  'Nkeiruka Onyejeocha': 'https://nass.gov.ng/mps/house/nkeiruka-onyejeocha',
  'Ahmed Idris Wase': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Ahmed_Idris_Wase.jpg/220px-Ahmed_Idris_Wase.jpg',
  'Alhassan Ado Doguwa': 'https://nass.gov.ng/mps/house/alhassan-ado-doguwa',
  
  // LGA Chairmen (using placeholder - these are harder to find)
  'Mojeed Balogun': 'https://via.placeholder.com/400x400?text=Mojeed+Balogun',
  'Jelili Sulaimon': 'https://via.placeholder.com/400x400?text=Jelili+Sulaimon',
  'Ibrahim Ungogo': 'https://via.placeholder.com/400x400?text=Ibrahim+Ungogo',
  'George Ariolu': 'https://via.placeholder.com/400x400?text=George+Ariolu',
}

// Better approach: Use publicly available images from reliable sources
const BETTER_PHOTOS: Record<string, string> = {
  // Using Wikipedia Commons and official sources
  'Godswill Akpabio': 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Godswill_Akpabio.jpg',
  'Barau Jibrin': 'https://nass.gov.ng/media/mps/barau-jibrin.jpg',
  'Solomon Adeola': 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Solomon_Adeola.jpg',
  'Oluremi Tinubu': 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Oluremi_Tinubu.jpg',
  'Tokunbo Abiru': 'https://nass.gov.ng/media/mps/tokunbo-abiru.jpg',
  'Adams Oshiomhole': 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Adams_Oshiomhole.jpg',
  'Ali Ndume': 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Ali_Ndume.jpg',
  'Orji Uzor Kalu': 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Orji_Uzor_Kalu.jpg',
  'Seriake Dickson': 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Seriake_Dickson.jpg',
  'Abba Moro': 'https://nass.gov.ng/media/mps/abba-moro.jpg',
  'Enyinnaya Abaribe': 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Enyinnaya_Abaribe.jpg',
  'Theodore Orji': 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Theodore_Orji.jpg',
  'Elisha Abbo': 'https://nass.gov.ng/media/mps/elisha-abbo.jpg',
  'Aishatu Binani': 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Aishatu_Binani.jpg',
  'Uche Ekwunife': 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Uche_Ekwunife.jpg',
  'Ifeanyi Ubah': 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Ifeanyi_Ubah.jpg',
  'Tajudeen Abbas': 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Tajudeen_Abbas.jpg',
  'Benjamin Kalu': 'https://nass.gov.ng/media/mps/benjamin-kalu.jpg',
  'Kingsley Chinda': 'https://nass.gov.ng/media/mps/kingsley-chinda.jpg',
  'Julius Ihonvbere': 'https://nass.gov.ng/media/mps/julius-ihonvbere.jpg',
  'Akin Alabi': 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Akin_Alabi.jpg',
  'Femi Gbajabiamila': 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Femi_Gbajabiamila.jpg',
  'Ahmed Idris Wase': 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Ahmed_Idris_Wase.jpg',
}

export { REPRESENTATIVE_PHOTOS, BETTER_PHOTOS }

