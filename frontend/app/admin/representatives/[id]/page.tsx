'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Save, Loader2, User, Building2, MapPin,
  Phone, Plus, Trash2, Upload, Camera, X
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { POLITICAL_PARTIES } from '@/lib/utils'

interface ContactInfo {
  id?: number
  contact_type: string
  value: string
  is_primary: boolean
}

interface State {
  id: number
  name: string
}

interface LGA {
  id: number
  name: string
  state_id: number
}

export default function EditRepresentativePage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const id = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [states, setStates] = useState<State[]>([])
  const [lgas, setLgas] = useState<LGA[]>([])
  
  // Form state
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [chamber, setChamber] = useState('SENATE')
  const [party, setParty] = useState('')
  const [stateId, setStateId] = useState('')
  const [lgaId, setLgaId] = useState('')
  const [constituency, setConstituency] = useState('')
  const [senatorialDistrict, setSenatorialDistrict] = useState('')
  const [ward, setWard] = useState('')
  const [bio, setBio] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [originalPhotoUrl, setOriginalPhotoUrl] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [contacts, setContacts] = useState<ContactInfo[]>([])

  // Handle image file upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    setUploadingImage(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `representatives/${fileName}`

      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file)

      if (error) {
        console.error('Upload error:', error)
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreview(reader.result as string)
        }
        reader.readAsDataURL(file)
        alert('Image upload failed. Using local preview.')
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath)
        
        setPhotoUrl(publicUrl)
        setImagePreview(publicUrl)
        // Update original photo URL so it's preserved if save fails
        setOriginalPhotoUrl(publicUrl)
      }
    } catch (err) {
      console.error('Upload error:', err)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleUrlChange = (url: string) => {
    setPhotoUrl(url)
    setImagePreview(url)
  }

  const removeImage = () => {
    setPhotoUrl('')
    setImagePreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  useEffect(() => {
    fetchStates()
    fetchRepresentative()
  }, [id])

  useEffect(() => {
    if (stateId) {
      fetchLgas(parseInt(stateId))
    }
  }, [stateId])

  const fetchStates = async () => {
    const { data } = await supabase.from('states').select('*').order('name')
    if (data) setStates(data)
  }

  const fetchLgas = async (stateId: number) => {
    const { data } = await supabase
      .from('lgas')
      .select('*')
      .eq('state_id', stateId)
      .order('name')
    if (data) setLgas(data)
  }

  const fetchRepresentative = async () => {
    const { data, error } = await supabase
      .from('representatives')
      .select(`
        *,
        contact_info (id, contact_type, value, is_primary)
      `)
      .eq('id', id)
      .single()

    if (data) {
      setName(data.name || '')
      setTitle(data.title || '')
      setChamber(data.chamber || 'SENATE')
      setParty(data.party || '')
      setStateId(data.state_id?.toString() || '')
      setLgaId(data.lga_id?.toString() || '')
      setConstituency(data.constituency || '')
      setSenatorialDistrict(data.senatorial_district || '')
      setWard(data.ward || '')
      setBio(data.bio || '')
      const existingPhotoUrl = data.photo_url || ''
      setPhotoUrl(existingPhotoUrl)
      setOriginalPhotoUrl(existingPhotoUrl)
      setImagePreview(existingPhotoUrl)
      setIsActive(data.is_active)
      setContacts(data.contact_info || [])
    }
    
    setLoading(false)
  }

  const addContact = () => {
    setContacts([...contacts, { contact_type: 'PHONE', value: '', is_primary: false }])
  }

  const removeContact = async (index: number) => {
    const contact = contacts[index]
    if (contact.id) {
      await supabase.from('contact_info').delete().eq('id', contact.id)
    }
    setContacts(contacts.filter((_, i) => i !== index))
  }

  const updateContact = (index: number, field: string, value: string | boolean) => {
    const updated = [...contacts]
    updated[index] = { ...updated[index], [field]: value }
    setContacts(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Determine photo_url: use new one if provided, otherwise keep original
      // If photoUrl is empty but imagePreview is a data URL (base64), we can't save it
      // So we preserve the original photo_url
      const finalPhotoUrl = photoUrl || (imagePreview && !imagePreview.startsWith('data:') ? imagePreview : originalPhotoUrl) || null
      
      // Update representative
      const { error: repError } = await supabase
        .from('representatives')
        .update({
          name,
          title,
          chamber,
          party,
          state_id: parseInt(stateId),
          lga_id: lgaId ? parseInt(lgaId) : null,
          constituency: constituency || null,
          senatorial_district: senatorialDistrict || null,
          ward: ward || null,
          bio: bio || null,
          photo_url: finalPhotoUrl,
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (repError) throw repError

      // Update contacts - delete all and re-insert
      await supabase.from('contact_info').delete().eq('representative_id', id)
      
      const validContacts = contacts.filter(c => c.value.trim())
      if (validContacts.length > 0) {
        await supabase.from('contact_info').insert(
          validContacts.map(c => ({
            representative_id: parseInt(id),
            contact_type: c.contact_type,
            value: c.value,
            is_primary: c.is_primary
          }))
        )
      }

      router.push('/admin')
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to save representative')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${name || 'this representative'}? This action cannot be undone.`)) {
      return
    }

    setSaving(true)
    try {
      // Delete contact info first (foreign key constraint)
      await supabase.from('contact_info').delete().eq('representative_id', id)
      
      // Delete representative
      const { error } = await supabase
        .from('representatives')
        .delete()
        .eq('id', id)

      if (error) throw error

      router.push('/admin')
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to delete representative')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-ng-green-600" />
      </div>
    )
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
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Edit Representative
            </h1>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-slate-600">Active</span>
            </label>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="card">
            <h2 className="font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-ng-green-600" />
              Basic Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Chamber *</label>
                <select
                  value={chamber}
                  onChange={(e) => setChamber(e.target.value)}
                  className="input"
                  required
                >
                  <option value="SENATE">Senate</option>
                  <option value="HOUSE_OF_REPS">House of Representatives</option>
                  <option value="GOVERNOR">Governor</option>
                  <option value="STATE_ASSEMBLY">State Assembly</option>
                  <option value="LGA_CHAIRMAN">LGA Chairman</option>
                  <option value="LGA_COUNCILLOR">LGA Councillor</option>
                </select>
              </div>

              <div>
                <label className="label">Political Party *</label>
                <select
                  value={party}
                  onChange={(e) => setParty(e.target.value)}
                  className="input"
                  required
                >
                  <option value="">Select Party</option>
                  {POLITICAL_PARTIES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                  <option value="Independent">Independent</option>
                </select>
              </div>

            </div>
          </div>

          {/* Photo Upload */}
          <div className="card">
            <h2 className="font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-ng-green-600" />
              Representative Photo
            </h2>
            
            <div className="flex flex-col md:flex-row gap-6">
              {/* Image Preview */}
              <div className="flex-shrink-0">
                <div className="w-40 h-40 bg-slate-100 rounded-xl overflow-hidden relative border-2 border-dashed border-slate-300">
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                      <User className="w-16 h-16 mb-2" />
                      <span className="text-xs">No photo</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Options */}
              <div className="flex-1 space-y-4">
                {/* File Upload */}
                <div>
                  <label className="label">Upload Image</label>
                  <div className="flex items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="btn-ghost cursor-pointer flex items-center gap-2"
                    >
                      {uploadingImage ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {uploadingImage ? 'Uploading...' : 'Choose File'}
                    </label>
                    <span className="text-sm text-slate-500">JPG, PNG, max 5MB</span>
                  </div>
                </div>

                {/* Or URL */}
                <div>
                  <label className="label">Or paste image URL</label>
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className="input"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="card">
            <h2 className="font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-ng-green-600" />
              Location & Constituency
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">State *</label>
                <select
                  value={stateId}
                  onChange={(e) => { setStateId(e.target.value); setLgaId('') }}
                  className="input"
                  required
                >
                  <option value="">Select State</option>
                  {states.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {(chamber === 'LGA_CHAIRMAN' || chamber === 'LGA_COUNCILLOR') && (
                <div>
                  <label className="label">LGA</label>
                  <select
                    value={lgaId}
                    onChange={(e) => setLgaId(e.target.value)}
                    className="input"
                  >
                    <option value="">Select LGA</option>
                    {lgas.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {chamber === 'SENATE' && (
                <div>
                  <label className="label">Senatorial District</label>
                  <input
                    type="text"
                    value={senatorialDistrict}
                    onChange={(e) => setSenatorialDistrict(e.target.value)}
                    className="input"
                  />
                </div>
              )}

              {(chamber === 'HOUSE_OF_REPS' || chamber === 'STATE_ASSEMBLY') && (
                <div>
                  <label className="label">Constituency</label>
                  <input
                    type="text"
                    value={constituency}
                    onChange={(e) => setConstituency(e.target.value)}
                    className="input"
                  />
                </div>
              )}

              {chamber === 'LGA_COUNCILLOR' && (
                <div>
                  <label className="label">Ward</label>
                  <input
                    type="text"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="input"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
                <Phone className="w-5 h-5 text-ng-green-600" />
                Contact Information
              </h2>
              <button
                type="button"
                onClick={addContact}
                className="btn-ghost text-sm"
              >
                <Plus className="w-4 h-4" /> Add Contact
              </button>
            </div>
            
            <div className="space-y-3">
              {contacts.length === 0 ? (
                <p className="text-slate-500 text-sm">No contact information added yet.</p>
              ) : (
                contacts.map((contact, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <select
                      value={contact.contact_type}
                      onChange={(e) => updateContact(index, 'contact_type', e.target.value)}
                      className="input w-36"
                    >
                      <option value="EMAIL">Email</option>
                      <option value="PHONE">Phone</option>
                      <option value="TWITTER">Twitter</option>
                      <option value="FACEBOOK">Facebook</option>
                      <option value="INSTAGRAM">Instagram</option>
                      <option value="WEBSITE">Website</option>
                    </select>
                    <input
                      type="text"
                      value={contact.value}
                      onChange={(e) => updateContact(index, 'value', e.target.value)}
                      className="input flex-1"
                    />
                    <label className="flex items-center gap-1 text-sm text-slate-600 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={contact.is_primary}
                        onChange={(e) => updateContact(index, 'is_primary', e.target.checked)}
                        className="rounded"
                      />
                      Primary
                    </label>
                    <button
                      type="button"
                      onClick={() => removeContact(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="card">
            <h2 className="font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-ng-green-600" />
              Biography
            </h2>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="input resize-none"
              rows={4}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-between items-center gap-4">
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="btn-ghost text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  Delete Representative
                </>
              )}
            </button>
            <div className="flex gap-4">
              <Link href="/admin" className="btn-ghost">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}


