import Link from 'next/link'
import { Twitter, Facebook, Instagram, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-ng-green-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">V2G</span>
              </div>
              <span className="font-display font-bold text-xl">Voice2Gov</span>
            </div>
            <p className="text-slate-400 text-sm">
              Empowering Nigerian citizens to connect with their elected representatives and make their voices heard.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/representatives" className="hover:text-white transition-colors">Find Representatives</Link></li>
              <li><Link href="/petitions" className="hover:text-white transition-colors">Browse Petitions</Link></li>
              <li><Link href="/petitions/create" className="hover:text-white transition-colors">Start a Petition</Link></li>
              <li><Link href="/voice" className="hover:text-white transition-colors">Voice Input</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQs</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} Voice2Gov. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Mail className="w-4 h-4" />
            <a href="mailto:hello@voice2gov.ng" className="hover:text-white transition-colors">
              hello@voice2gov.ng
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}


