import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-NG').format(num)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + '...'
}

export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
]

export const POLITICAL_PARTIES = [
  'APC', 'PDP', 'LP', 'NNPP', 'APGA', 'SDP', 'ADC', 'YPP'
]

export const CHAMBERS = [
  { value: 'ALL', label: 'All Chambers' },
  { value: 'SENATE', label: 'Senate' },
  { value: 'HOUSE_OF_REPS', label: 'House of Representatives' },
  { value: 'GOVERNOR', label: 'Governor' },
  { value: 'STATE_ASSEMBLY', label: 'State Assembly' },
  { value: 'LGA_CHAIRMAN', label: 'LGA Chairman' },
  { value: 'LGA_COUNCILLOR', label: 'LGA Councillor' },
]


