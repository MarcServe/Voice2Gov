export const metadata = {
  title: 'FAQ | Voice2Gov',
  description: 'Frequently asked questions about Voice2Gov.'
}

const items = [
  {
    question: 'Is Voice2Gov free to use?',
    answer: 'Yes—citizens can browse representatives, sign petitions, and access public information at no cost.'
  },
  {
    question: 'How do petitions reach my representative?',
    answer: 'Once a petition meets a signature milestone, we automatically email the target representative and track the delivery status.'
  },
  {
    question: 'Can I use voice input?',
    answer: 'Yes! Voice2Gov supports English, Pidgin, Yoruba, Hausa, and Igbo via the Web Speech API.'
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl space-y-6">
        <h1 className="font-display text-4xl font-bold text-slate-900">Frequently Asked Questions</h1>
        {items.map((item) => (
          <div key={item.question} className="card">
            <h2 className="font-semibold text-xl text-slate-900">{item.question}</h2>
            <p className="text-slate-600 mt-2">{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
