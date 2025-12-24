'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Upload, Download, FileText, Loader2, 
  CheckCircle, AlertCircle, X
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ImportResult {
  success: number
  failed: number
  skipped: number
  updated: number
  errors: string[]
  skippedItems: string[]
  updatedItems: string[]
}

export default function ImportPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [csvData, setCsvData] = useState('')
  const [duplicateAction, setDuplicateAction] = useState<'skip' | 'update'>('skip')

  const sampleCSV = `name,title,chamber,party,state,lga,constituency,senatorial_district,email,phone
"John Doe","Senator","SENATE","APC","Lagos","","","Lagos West","john.doe@nass.gov.ng","08012345678"
"Jane Smith","Hon.","HOUSE_OF_REPS","PDP","Kano","","Kano Municipal","","jane.smith@nass.gov.ng",""
"Mike Johnson","Hon. Chairman","LGA_CHAIRMAN","APC","Lagos","Ikeja","","","chairman@ikeja.lg.gov.ng","08098765432"`

  const downloadTemplate = () => {
    const blob = new Blob([sampleCSV], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'representatives_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setCsvData(event.target?.result as string)
    }
    reader.readAsText(file)
  }

  const parseCSV = (csv: string) => {
    const lines = csv.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    
    return lines.slice(1).map(line => {
      // Handle quoted values with commas
      const values: string[] = []
      let current = ''
      let inQuotes = false
      
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      values.push(current.trim())

      const row: Record<string, string> = {}
      headers.forEach((header, i) => {
        row[header] = values[i]?.replace(/"/g, '') || ''
      })
      return row
    })
  }

  const handleImport = async () => {
    if (!csvData.trim()) {
      alert('Please upload a CSV file or paste CSV data')
      return
    }

    setLoading(true)
    setResult(null)

    const importResult: ImportResult = { 
      success: 0, 
      failed: 0, 
      skipped: 0,
      updated: 0,
      errors: [],
      skippedItems: [],
      updatedItems: []
    }

    try {
      const rows = parseCSV(csvData)
      
      // Get states mapping
      const { data: states } = await supabase.from('states').select('id, name')
      const stateMap = new Map(states?.map(s => [s.name.toLowerCase(), s.id]) || [])

      // Get LGAs mapping
      const { data: lgas } = await supabase.from('lgas').select('id, name, state_id')
      
      for (const row of rows) {
        try {
          // Find state
          const stateId = stateMap.get(row.state?.toLowerCase())
          if (!stateId) {
            importResult.errors.push(`State not found: ${row.state} for ${row.name}`)
            importResult.failed++
            continue
          }

          // Find LGA if provided
          let lgaId = null
          if (row.lga) {
            const lga = lgas?.find(l => 
              l.name.toLowerCase() === row.lga.toLowerCase() && l.state_id === stateId
            )
            lgaId = lga?.id || null
          }

          const chamber = row.chamber || 'SENATE'
          
          // Check for existing representative (duplicate check)
          // Match by: name + chamber + state (basic match)
          // For more specific: also check constituency/senatorial_district if provided
          let existingRep = null
          const { data: existingReps } = await supabase
            .from('representatives')
            .select('id, name, title, chamber, party, state_id, constituency, senatorial_district, lga_id')
            .eq('name', row.name)
            .eq('chamber', chamber)
            .eq('state_id', stateId)
            .limit(1)
            .maybeSingle()

          if (existingReps) {
            existingRep = existingReps
          }

          let rep
          if (existingRep) {
            // Duplicate found - handle based on user preference
            if (duplicateAction === 'skip') {
              importResult.skipped++
              importResult.skippedItems.push(`${row.name} (${chamber}, ${row.state})`)
              continue
            } else if (duplicateAction === 'update') {
              // Update existing representative
              const { data: updatedRep, error: updateError } = await supabase
                .from('representatives')
                .update({
                  title: row.title || existingRep.title || null,
                  party: row.party || existingRep.party || null,
                  lga_id: lgaId || existingRep.lga_id || null,
                  constituency: row.constituency || existingRep.constituency || null,
                  senatorial_district: row.senatorial_district || existingRep.senatorial_district || null,
                  is_active: true,
                  updated_at: new Date().toISOString()
                })
                .eq('id', existingRep.id)
                .select()
                .single()

              if (updateError) {
                importResult.errors.push(`Failed to update ${row.name}: ${updateError.message}`)
                importResult.failed++
                continue
              }

              rep = updatedRep
              importResult.updated++
              importResult.updatedItems.push(`${row.name} (${chamber}, ${row.state})`)
            }
          } else {
            // No duplicate - insert new representative
            const { data: newRep, error: repError } = await supabase
              .from('representatives')
              .insert({
                name: row.name,
                title: row.title || null,
                chamber: chamber,
                party: row.party || null,
                state_id: stateId,
                lga_id: lgaId,
                constituency: row.constituency || null,
                senatorial_district: row.senatorial_district || null,
                is_active: true
              })
              .select()
              .single()

            if (repError) {
              importResult.errors.push(`Failed to import ${row.name}: ${repError.message}`)
              importResult.failed++
              continue
            }

            rep = newRep
            importResult.success++
          }

          // Handle contact info (for both new and updated records)
          if (rep) {
            // Delete existing contact info if updating
            if (existingRep && duplicateAction === 'update') {
              await supabase.from('contact_info').delete().eq('representative_id', rep.id)
            }

            // Insert/update contact info
            if (row.email) {
              await supabase.from('contact_info').insert({
                representative_id: rep.id,
                contact_type: 'EMAIL',
                value: row.email,
                is_primary: true
              })
            }
            if (row.phone) {
              await supabase.from('contact_info').insert({
                representative_id: rep.id,
                contact_type: 'PHONE',
                value: row.phone,
                is_primary: !row.email
              })
            }
          }
        } catch (err) {
          importResult.errors.push(`Error importing ${row.name}: ${err}`)
          importResult.failed++
        }
      }
    } catch (err) {
      importResult.errors.push(`CSV parsing error: ${err}`)
    }

    setResult(importResult)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Link href="/admin" className="flex items-center gap-2 text-slate-600 hover:text-ng-green-600 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </Link>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Bulk Import Representatives
          </h1>
          <p className="text-slate-600 mt-1">
            Upload a CSV file to add multiple representatives at once
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Instructions */}
        <div className="card mb-6">
          <h2 className="font-semibold text-lg text-slate-900 mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-slate-600">
            <li>Download the CSV template below</li>
            <li>Fill in the representative details (name and state are required)</li>
            <li>Upload the completed CSV file</li>
            <li>Click "Import" to add all representatives</li>
          </ol>
          
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            <strong>Note:</strong> Valid chamber values are: SENATE, HOUSE_OF_REPS, STATE_ASSEMBLY, LGA_CHAIRMAN, LGA_COUNCILLOR
          </div>

          <button onClick={downloadTemplate} className="btn-ghost mt-4">
            <Download className="w-5 h-5" />
            Download Template
          </button>
        </div>

        {/* Upload */}
        <div className="card mb-6">
          <h2 className="font-semibold text-lg text-slate-900 mb-4">Upload CSV</h2>
          
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-ng-green-400 transition-colors">
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">
              Drag and drop a CSV file, or click to browse
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="btn-primary cursor-pointer">
              <FileText className="w-5 h-5" />
              Choose File
            </label>
          </div>

          {csvData && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">CSV Preview</span>
                <button onClick={() => setCsvData('')} className="text-slate-400 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                className="input font-mono text-sm"
                rows={8}
              />
            </div>
          )}
        </div>

        {/* Or Paste CSV */}
        <div className="card mb-6">
          <h2 className="font-semibold text-lg text-slate-900 mb-4">Or Paste CSV Data</h2>
          <textarea
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            placeholder={`Paste your CSV data here...\n\nExample:\nname,title,chamber,party,state,email\n"John Doe","Senator","SENATE","APC","Lagos","john@example.com"`}
            className="input font-mono text-sm"
            rows={6}
          />
        </div>

        {/* Duplicate Handling Options */}
        <div className="card mb-6">
          <h2 className="font-semibold text-lg text-slate-900 mb-4">Duplicate Handling</h2>
          <p className="text-sm text-slate-600 mb-4">
            How should duplicate representatives be handled? (Duplicates are detected by matching name + chamber + state)
          </p>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="duplicateAction"
                value="skip"
                checked={duplicateAction === 'skip'}
                onChange={(e) => setDuplicateAction(e.target.value as 'skip' | 'update')}
                className="rounded"
              />
              <span className="text-slate-700">Skip duplicates (recommended)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="duplicateAction"
                value="update"
                checked={duplicateAction === 'update'}
                onChange={(e) => setDuplicateAction(e.target.value as 'skip' | 'update')}
                className="rounded"
              />
              <span className="text-slate-700">Update existing records</span>
            </label>
          </div>
        </div>

        {/* Import Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={handleImport}
            disabled={loading || !csvData.trim()}
            className="btn-primary"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Import Representatives
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="card">
            <h2 className="font-semibold text-lg text-slate-900 mb-4">Import Results</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span>{result.success} new</span>
              </div>
              {result.updated > 0 && (
                <div className="flex items-center gap-2 text-blue-600">
                  <CheckCircle className="w-5 h-5" />
                  <span>{result.updated} updated</span>
                </div>
              )}
              {result.skipped > 0 && (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="w-5 h-5" />
                  <span>{result.skipped} skipped</span>
                </div>
              )}
              {result.failed > 0 && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <span>{result.failed} failed</span>
                </div>
              )}
            </div>

            {result.skippedItems.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-amber-800 mb-2">Skipped Duplicates ({result.skippedItems.length}):</h3>
                <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                  {result.skippedItems.slice(0, 10).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                  {result.skippedItems.length > 10 && (
                    <li>...and {result.skippedItems.length - 10} more</li>
                  )}
                </ul>
              </div>
            )}

            {result.updatedItems.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-blue-800 mb-2">Updated Records ({result.updatedItems.length}):</h3>
                <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                  {result.updatedItems.slice(0, 10).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                  {result.updatedItems.length > 10 && (
                    <li>...and {result.updatedItems.length - 10} more</li>
                  )}
                </ul>
              </div>
            )}

            {result.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-medium text-red-800 mb-2">Errors:</h3>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {result.errors.slice(0, 10).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {result.errors.length > 10 && (
                    <li>...and {result.errors.length - 10} more errors</li>
                  )}
                </ul>
              </div>
            )}

            {result.success > 0 && (
              <div className="mt-4">
                <Link href="/admin" className="btn-primary">
                  View All Representatives
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}


