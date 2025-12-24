'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Users, FileText, Mic, Home, Shield, Settings } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/representatives', label: 'Representatives', icon: Users },
    { href: '/petitions', label: 'Petitions', icon: FileText },
    { href: '/voice', label: 'Voice Input', icon: Mic },
    { href: '/legal', label: 'Know Your Rights', icon: Shield },
    { href: '/admin', label: 'Admin', icon: Settings },
  ]

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-ng-green-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">V2G</span>
            </div>
            <span className="font-display font-bold text-xl text-slate-900">Voice2Gov</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 text-slate-600 hover:text-ng-green-600 transition-colors font-medium"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
            {user && (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-slate-600 hover:text-ng-green-600 transition-colors font-medium"
              >
                <Settings className="w-4 h-4" />
                Dashboard
              </Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link href="/dashboard" className="btn-ghost">
                <Settings className="w-4 h-4" />
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="btn-ghost">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn-primary py-2">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-ng-green-600"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-slate-100">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg"
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
              {user && (
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg"
                >
                  <Settings className="w-5 h-5" />
                  Dashboard
                </Link>
              )}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
                {user ? (
                  <Link href="/dashboard" className="btn-primary justify-center">
                    <Settings className="w-4 h-4" />
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/login" className="btn-ghost justify-center">
                      Sign In
                    </Link>
                    <Link href="/auth/signup" className="btn-primary justify-center">
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

