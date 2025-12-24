export const metadata = {
  title: 'Contact Voice2Gov',
  description: 'Get in touch with the Voice2Gov team.'
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl space-y-6">
        <h1 className="font-display text-4xl font-bold text-slate-900">Contact Voice2Gov</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          For feature requests, partnership inquiries, or media, email us at <a className="text-ng-green-700 font-semibold" href="mailto:hello@voice2gov.ng">hello@voice2gov.ng</a>.
        </p>
        <div className="card">
          <p className="text-slate-600 mb-4">Support hours: Monday-Friday, 9am-5pm WAT</p>
          <p className="text-slate-600">Join our community on X/Twitter: <a href="https://twitter.com/voice2gov" className="text-ng-green-700 hover:underline">@Voice2Gov</a></p>
        </div>
      </div>
    </div>
  )
}
