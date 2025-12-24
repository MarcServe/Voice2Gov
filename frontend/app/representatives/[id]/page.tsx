import { RepresentativeDetail } from '@/components/RepresentativeDetail'

export const metadata = {
  title: 'Representative Profile | Voice2Gov',
  description: 'View representative details, contact information, and start a petition.',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function RepresentativePage({ params }: PageProps) {
  const { id } = await params
  
  return <RepresentativeDetail id={id} />
}


