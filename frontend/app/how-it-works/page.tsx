export const metadata = {
  title: 'How Voice2Gov Works',
  description: 'Learn how Voice2Gov empowers Nigerians to petition officials.'
}

const steps = [
  {
    title: 'Find Representatives',
    description: 'Search the database for Senators, House of Representatives members, State Assembly reps, and LGA Chairmen across Nigeria.'
  },
  {
    title: 'Create Petitions',
    description: 'Draft petitions, collect signatures, and automatically send them to the right officials once a threshold is reached.'
  },
  {
    title: 'Social Listening',
    description: 'Aggregate constructive social media conversations, summarize them, and send digests to representatives.'
  },
  {
    title: 'Voice Accessibility',
    description: 'Use speech-to-text in English, Pidgin, Yoruba, Hausa, or Igbo, and use text-to-speech to listen to replies.'
  }
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="font-display text-4xl font-bold text-slate-900 mb-8">How Voice2Gov Works</h1>
        <div className="space-y-6">
          {steps.map((step) => (
            <div key={step.title} className="card">
              <h2 className="font-semibold text-xl text-slate-900 mb-1">{step.title}</h2>
              <p className="text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
