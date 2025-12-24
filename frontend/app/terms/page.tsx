export const metadata = {
  title: 'Terms of Service',
  description: 'Terms for using Voice2Gov.'
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-4">Terms of Service</h1>
        <p className="text-slate-600 leading-relaxed">
          By using Voice2Gov, you agree to engage respectfully, provide accurate information, and not impersonate public officials.
          We reserve the right to remove abusive content and suspend accounts that violate the community guidelines.
        </p>
      </div>
    </div>
  )
}
