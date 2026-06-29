'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon, Menu, X, Cpu } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

const NAV_LINKS = [
  { href: '/tools', label: 'All Tools' },
  { href: '/tools/developer', label: 'Developer' },
  { href: '/tools/generator', label: 'Generators' },
  { href: '/tools/text', label: 'Text' },
  { href: '/tools/pdf', label: 'PDF' },
  { href: '/tools/image', label: 'Image' },
]

export function Header() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialTheme = saved === 'dark' || (!saved && prefersDark) ? 'dark' : 'light'

    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    const timer = setTimeout(() => {
      setTheme(initialTheme)
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
      localStorage.setItem('theme', 'dark')
      document.documentElement.classList.add('dark')
    } else {
      setTheme('light')
      localStorage.setItem('theme', 'light')
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-(--color-border) bg-(--color-surface)/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-90">
          <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-(--color-primary) to-(--color-accent) flex items-center justify-center text-white">
            <Cpu className="w-5 h-5" />
          </div>
          <span className="bg-linear-to-r from-(--color-primary) to-(--color-accent) bg-clip-text text-transparent">
            Toolify
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-(--color-primary) ${
                  isActive ? 'text-(--color-primary) font-semibold' : 'text-(--color-text-secondary)'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg hover:bg-(--color-surface-alt) cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-(--color-accent)" />
            ) : (
              <Moon className="w-5 h-5 text-(--color-text-secondary)" />
            )}
          </Button>
        </div>

        {/* Mobile menu trigger + theme toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg hover:bg-(--color-surface-alt) cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-(--color-accent)" />
            ) : (
              <Moon className="w-5 h-5 text-(--color-text-secondary)" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="w-9 h-9 rounded-lg hover:bg-(--color-surface-alt) cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden border-b border-(--color-border) bg-(--color-surface) py-4 px-4 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-sm font-medium py-2 px-3 rounded-md transition-colors hover:bg-(--color-surface-alt) hover:text-(--color-primary) ${
                    isActive
                      ? 'bg-(--color-primary-light) text-(--color-primary) font-semibold'
                      : 'text-(--color-text-secondary)'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}
