'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, Mic, Send } from 'lucide-react'

export default function CreatePetitionPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link href="/petitions" className="inline-flex items-center gap-2 text-slate-600 hover:text-ng-green-600 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Petitions
        </Link>

        <div className="card">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-ng-green-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-ng-green-600" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900">Create a Petition</h1>
              <p className="text-slate-600">Make your voice heard on issues that matter</p>
            </div>
          </div>

          <form className="space-y-6">
            <div>
              <label className="label">Petition Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Improve Road Infrastructure in Lagos"
                className="input"
              />
            </div>

            <div>
              <label className="label">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
                <option value="">Select a category</option>
                <option value="INFRASTRUCTURE">Infrastructure</option>
                <option value="EDUCATION">Education</option>
                <option value="HEALTHCARE">Healthcare</option>
                <option value="SECURITY">Security</option>
                <option value="ECONOMY">Economy</option>
                <option value="ENVIRONMENT">Environment</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="Describe the issue and what action you want the representative to take..."
                className="input resize-none"
              />
            </div>

            <div className="flex items-center gap-4 p-4 bg-ng-green-50 rounded-xl">
              <Mic className="w-6 h-6 text-ng-green-600" />
              <div>
                <p className="font-medium text-ng-green-800">Voice Input Available</p>
                <p className="text-sm text-ng-green-700">Click the microphone to dictate your petition</p>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full">
              <Send className="w-5 h-5" />
              Submit Petition
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}


