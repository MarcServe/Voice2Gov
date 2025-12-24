export const metadata = {
  title: 'Petitions | Voice2Gov',
  description: 'Browse and sign petitions addressing Nigerian governance issues.',
}

export default function PetitionsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-ng-green-500 to-ng-green-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Active Petitions
          </h1>
          <p className="text-ng-green-100 text-lg max-w-2xl">
            Browse petitions from fellow Nigerians addressing issues in governance, infrastructure, healthcare, and more.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-slate-600 mb-4">Petitions feature coming soon!</p>
          <a href="/petitions/create" className="btn-primary">
            Create New Petition
          </a>
        </div>
      </div>
    </div>
  )
}


