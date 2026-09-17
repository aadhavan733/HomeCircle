'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { db } from '@/lib/db'
import { syncTransactions } from '@/app/transactions/actions'

function subscribeOnline(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

function getOnlineSnapshot() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

function getOnlineServerSnapshot() {
  return true
}

export default function SyncProvider({ children }: { children: React.ReactNode }) {
  const isOnline = useSyncExternalStore(
    subscribeOnline,
    getOnlineSnapshot,
    getOnlineServerSnapshot
  )
  const [pendingCount, setPendingCount] = useState(0)



  useEffect(() => {
    const checkAuth = () => {
      const isPublic = window.location.pathname.startsWith('/login') || window.location.pathname.startsWith('/auth')
      if (isPublic) return

      const hasAuthCookie = document.cookie.split(';').some(c => c.trim().startsWith('sb-') && c.includes('auth-token'))
      if (!hasAuthCookie) {
        window.location.replace('/login')
      }
    }

    checkAuth()

    const handlePageShow = () => {
      checkAuth()
    }

    const handlePopState = () => {
      checkAuth()
    }

    window.addEventListener('pageshow', handlePageShow)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('pageshow', handlePageShow)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  useEffect(() => {
    let ignore = false

    const runSync = async () => {
      if (typeof navigator === 'undefined') return
      try {
        const count = await db.transactions.where('sync_status').equals('pending').count()
        if (!ignore) setPendingCount(count)

        if (navigator.onLine && count > 0) {
          const pendingTxns = await db.transactions.where('sync_status').equals('pending').toArray()
          if (pendingTxns.length > 0) {
            const result = await syncTransactions(pendingTxns)
            if (result.success && !ignore) {
              for (const txn of pendingTxns) {
                await db.transactions.update(txn.id, { sync_status: 'synced' })
                await db.transactions.delete(txn.id)
              }
              const updatedCount = await db.transactions.where('sync_status').equals('pending').count()
              if (!ignore) setPendingCount(updatedCount)
            }
          }
        }
      } catch (e) {
        console.error('Background sync error:', e)
      }
    }

    runSync()

    const interval = setInterval(runSync, 60000)

    return () => {
      ignore = true
      clearInterval(interval)
    }
  }, [isOnline])

  return (
    <>
      {!isOnline && (
        <div className="bg-yellow-500 text-yellow-900 text-xs text-center py-1 font-bold z-50 relative">
          [!] You are offline. Changes will sync later.
        </div>
      )}
      {isOnline && pendingCount > 0 && (
        <div className="bg-blue-500 text-white text-xs text-center py-1 font-bold z-50 relative">
          Syncing {pendingCount} pending items...
        </div>
      )}
      {children}
    </>
  )
}
