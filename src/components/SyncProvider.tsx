'use client'

import { useEffect, useState, useCallback } from 'react'
import { db } from '@/lib/db'
import { syncTransactions } from '@/app/transactions/actions'

export default function SyncProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)

  const checkPending = useCallback(async () => {
    try {
      const count = await db.transactions.where('sync_status').equals('pending').count()
      setPendingCount(count)
    } catch (e) {
      console.error(e)
    }
  }, [])

  const attemptSync = useCallback(async () => {
    if (!navigator.onLine) return
    
    try {
      const pendingTxns = await db.transactions.where('sync_status').equals('pending').toArray()
      if (pendingTxns.length === 0) return

      const result = await syncTransactions(pendingTxns)
      if (result.success) {
        // Mark all as synced and delete
        for (const txn of pendingTxns) {
          await db.transactions.update(txn.id, { sync_status: 'synced' })
          await db.transactions.delete(txn.id)
        }
        checkPending()
      }
    } catch (e) {
      console.error('Background sync failed:', e)
    }
  }, [checkPending])

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      attemptSync()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initial check
    checkPending()
    attemptSync()

    // Periodically retry sync every minute
    const interval = setInterval(() => {
      checkPending()
      attemptSync()
    }, 60000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [attemptSync, checkPending])

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
