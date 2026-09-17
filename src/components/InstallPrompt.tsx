'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'

function subscribeStandalone(callback: () => void) {
  const mql = window.matchMedia('(display-mode: standalone)')
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

function getStandaloneSnapshot() {
  return window.matchMedia('(display-mode: standalone)').matches
}

function getStandaloneServerSnapshot() {
  return false
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const isStandalone = useSyncExternalStore(
    subscribeStandalone,
    getStandaloneSnapshot,
    getStandaloneServerSnapshot
  )

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()

    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
      setIsInstallable(false)
    } else {
      console.log('User dismissed the install prompt')
    }
    setDeferredPrompt(null)
  }

  if (isStandalone) {
    return null // Do not show if already installed
  }

  if (!isInstallable) {
    // Fallback UI if we want to show something when it's not promptable
    // but typically we just don't show the button.
    return null
  }

  return (
    <button
      onClick={handleInstallClick}
      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm transition-colors"
      aria-label="Install HomeCircle"
    >
      Install App
    </button>
  )
}
