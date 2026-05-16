"use client"

import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/image/actions/create', label: 'Generate' },
  { href: '/credits', label: 'Buy Credits' },
  { href: '/profile', label: 'Profile' },
]

const Header = () => {
  const pathname = usePathname();

  return (
    <header className="header">
      <Link href="/" className="header-logo">
        <Image src="/logo.png" alt="logo" width={150} height={24} />
      </Link>

      <ul className="header-nav">
        {navItems.map(({ href, label }) => (
          <li key={href}>
            <Link href={href} className={`nav-link ${pathname === href ? 'active' : ''}`}>
              {label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="header-actions">
        <SignedIn>
          <UserButton showName afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <Link href="/sign-in" className="login-btn">Login</Link>
        </SignedOut>

        <Sheet>
          <SheetTrigger className="mobile-trigger">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </SheetTrigger>
          <SheetContent side="right" className="mobile-sheet">
            <div className="mobile-sheet-logo">
              <Image src="/logo.png" alt="logo" width={120} height={20} />
            </div>
            <nav className="mobile-sheet-nav">
              {navItems.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`mobile-nav-link ${pathname === href ? 'active' : ''}`}
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div className="mobile-sheet-footer">
              <SignedIn>
                <UserButton showName afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <Link href="/sign-in" className="login-btn">Login</Link>
              </SignedOut>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

export default Header