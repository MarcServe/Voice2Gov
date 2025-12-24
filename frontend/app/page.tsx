import Link from 'next/link'
import { Users, FileText, Mic, TrendingUp, Shield, MessageCircle } from 'lucide-react'

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ng-green-500 via-ng-green-600 to-ng-green-700 text-white">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-warm-400 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium">Empowering Nigerian Citizens</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Your Voice Matters in{' '}
              <span className="text-warm-300">Nigerian Governance</span>
            </h1>
            
            <p className="text-xl text-ng-green-100 mb-8 leading-relaxed">
              Connect directly with your elected representatives. Create petitions, 
              track responses, and hold officials accountable — even through voice input.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/representatives" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-ng-green-600 font-semibold rounded-xl hover:bg-ng-green-50 transition-all duration-200 shadow-xl">
                <Users className="w-5 h-5" />
                Find Your Representative
              </Link>
              <Link href="/petitions" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent text-white font-semibold rounded-xl border-2 border-white hover:bg-white hover:text-ng-green-600 transition-all duration-200">
                <FileText className="w-5 h-5" />
                Browse Petitions
              </Link>
            </div>
          </div>
        </div>
        
        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {[
              { value: '109', label: 'Senators', color: 'text-purple-600' },
              { value: '360', label: 'House Members', color: 'text-blue-600' },
              { value: '774', label: 'LGA Chairmen', color: 'text-ng-green-600' },
              { value: '8,610 +', label: 'LGA Councillors', color: 'text-emerald-600' },
              { value: '36+1', label: 'States + FCT', color: 'text-amber-600' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className={`font-display text-4xl md:text-5xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-slate-600 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              How Voice2Gov Works
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              We make civic engagement accessible to every Nigerian, regardless of literacy level.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Find Representatives',
                description: 'Access contact information for all Nigerian representatives — from Senators to LGA Councillors at the grassroots level.',
                color: 'bg-purple-100 text-purple-600'
              },
              {
                icon: FileText,
                title: 'Create Petitions',
                description: 'Start petitions on issues that matter. Gather signatures and send directly to officials.',
                color: 'bg-blue-100 text-blue-600'
              },
              {
                icon: Mic,
                title: 'Voice Input',
                description: 'Speak in English, Pidgin, Yoruba, Hausa, or Igbo. We transcribe and create your petition.',
                color: 'bg-ng-green-100 text-ng-green-600'
              },
              {
                icon: TrendingUp,
                title: 'Track Progress',
                description: 'See when your petition is sent, delivered, read, and responded to — full transparency.',
                color: 'bg-amber-100 text-amber-600'
              },
              {
                icon: Shield,
                title: 'Know Your Rights',
                description: 'Learn about your representatives\' duties and your constitutional rights as a citizen.',
                color: 'bg-red-100 text-red-600'
              },
              {
                icon: MessageCircle,
                title: 'Social Aggregation',
                description: 'We gather constructive feedback from social media and compile weekly digests for officials.',
                color: 'bg-indigo-100 text-indigo-600'
              }
            ].map((feature) => (
              <div key={feature.title} className="card hover:shadow-lg transition-shadow">
                <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-ng-green-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Make Your Voice Heard?
          </h2>
          <p className="text-xl text-ng-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of Nigerians using Voice2Gov to engage with their elected representatives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="btn-primary bg-white text-ng-green-600 hover:bg-ng-green-50">
              Create Free Account
            </Link>
            <Link href="/petitions" className="btn-secondary border-white/30 text-white hover:bg-white/10">
              Browse Petitions
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

