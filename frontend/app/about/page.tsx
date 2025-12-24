export const metadata = {
  title: 'About Voice2Gov',
  description: 'Voice2Gov is building a civic engagement platform for Nigerians.'
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl space-y-6">
        <h1 className="font-display text-4xl font-bold text-slate-900">About Voice2Gov</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Voice2Gov is a civic technology platform that connects Nigerian citizens with their elected representatives.
          We provide contact information for Senators, House Members, State Assembly members, and LGA Chairmen.
          Citizens can create petitions, gather signatures, track responses, and monitor social media sentiment about governance.
        </p>
        <p className="text-slate-600 leading-relaxed">
          The platform prioritizes accessibility with voice input, text-to-speech, and multilingual support for English, Pidgin,
          Yoruba, Hausa, and Igbo. Transparency features track when petitions are sent, delivered, read, and responded to by officials.
        </p>
      </div>
    </div>
  )
}
