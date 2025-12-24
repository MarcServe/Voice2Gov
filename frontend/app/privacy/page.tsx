export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Voice2Gov.'
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
        <p className="text-slate-600 leading-relaxed">
          Voice2Gov collects only the data required to power petitions, representative lookups, and communications.
          Email addresses are used for account verification and petition updates. We never sell your data.
        </p>
      </div>
    </div>
  )
}
