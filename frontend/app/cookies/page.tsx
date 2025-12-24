export const metadata = {
  title: 'Cookie Policy',
  description: 'Cookie policy for Voice2Gov.'
}

const categories = [
  { title: 'Essential Cookies', description: 'Enable authentication, preferences, and navigation.' },
  { title: 'Analytics Cookies', description: 'Track usage to improve the platform.' },
  { title: 'Marketing Cookies', description: 'Never used without explicit consent.' }
]

export default function CookiePage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl space-y-6">
        <h1 className="font-display text-3xl font-bold text-slate-900">Cookie Policy</h1>
        <p className="text-slate-600 leading-relaxed">
          Voice2Gov uses cookies to secure your session and analyze usage. You can disable analytics cookies from your browser settings.
        </p>
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.title} className="card">
              <h2 className="font-semibold text-xl text-slate-900">{category.title}</h2>
              <p className="text-slate-600 mt-1">{category.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
