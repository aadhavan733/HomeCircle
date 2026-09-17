import { describe, it, expect } from 'vitest'
import {
  calculateTransactionsSummary,
  calculateBudgetRemaining,
  calculateSpentPercentage,
  getTopCategories,
  calculateNextOccurrence,
  calculateSavingsProgress,
  validateAmount,
  TransactionData
} from '@/lib/calculations'

describe('Calculations - Income & Expense', () => {
  const currentUserId = 'user-1'
  
  it('calculates total income correctly', () => {
    const transactions: TransactionData[] = [
      { amount_paise: 10000, type: 'income', visibility: 'shared', user_id: 'user-2', categories: { name: 'Salary' } },
      { amount_paise: 5000, type: 'income', visibility: 'shared', user_id: 'user-1', categories: null }
    ]
    const { totalIncomePaise } = calculateTransactionsSummary(transactions, currentUserId)
    expect(totalIncomePaise).toBe(15000)
  })

  it('calculates total expense correctly', () => {
    const transactions: TransactionData[] = [
      { amount_paise: 2000, type: 'expense', visibility: 'shared', user_id: 'user-2', categories: { name: 'Food' } },
      { amount_paise: 3000, type: 'expense', visibility: 'shared', user_id: 'user-1', categories: [{ name: 'Transport' }] }
    ]
    const { totalExpensePaise } = calculateTransactionsSummary(transactions, currentUserId)
    expect(totalExpensePaise).toBe(5000)
  })

  it('filters out personal transactions not owned by the current user', () => {
    const transactions: TransactionData[] = [
      { amount_paise: 2000, type: 'expense', visibility: 'personal', user_id: 'user-2', categories: null },
      { amount_paise: 3000, type: 'expense', visibility: 'personal', user_id: 'user-1', categories: null }
    ]
    const { totalExpensePaise } = calculateTransactionsSummary(transactions, currentUserId)
    expect(totalExpensePaise).toBe(3000)
  })

  it('calculates category spending correctly', () => {
    const transactions: TransactionData[] = [
      { amount_paise: 2000, type: 'expense', visibility: 'shared', user_id: 'user-1', categories: { name: 'Food' } },
      { amount_paise: 1000, type: 'expense', visibility: 'shared', user_id: 'user-1', categories: { name: 'Food' } },
      { amount_paise: 500, type: 'expense', visibility: 'shared', user_id: 'user-1', categories: null }
    ]
    const { categorySpending } = calculateTransactionsSummary(transactions, currentUserId)
    expect(categorySpending['Food']).toBe(3000)
    expect(categorySpending['Uncategorized']).toBe(500)
  })
})

describe('Calculations - Budget', () => {
  it('calculates budget remaining correctly', () => {
    expect(calculateBudgetRemaining(10000, 3000)).toBe(7000)
    expect(calculateBudgetRemaining(10000, 12000)).toBe(0) // Should not go below 0
    expect(calculateBudgetRemaining(0, 5000)).toBe(0)
  })

  it('calculates budget usage percentage correctly', () => {
    expect(calculateSpentPercentage(10000, 5000)).toBe(50)
    expect(calculateSpentPercentage(10000, 15000)).toBe(100) // Should cap at 100
    expect(calculateSpentPercentage(0, 5000)).toBe(0) // Prevent division by zero
  })
})

describe('Calculations - Categories', () => {
  it('sorts and limits top categories correctly', () => {
    const categorySpending = {
      'Food': 5000,
      'Transport': 2000,
      'Entertainment': 8000,
      'Utilities': 1000,
      'Rent': 15000,
      'Misc': 500
    }
    const top = getTopCategories(categorySpending, 3)
    expect(top).toHaveLength(3)
    expect(top[0]).toEqual(['Rent', 15000])
    expect(top[1]).toEqual(['Entertainment', 8000])
    expect(top[2]).toEqual(['Food', 5000])
  })
})

describe('Calculations - Bill Occurrence', () => {
  it('calculates next occurrence for monthly frequency', () => {
    expect(calculateNextOccurrence('2026-09-15', 'monthly')).toBe('2026-10-15')
  })

  it('calculates next occurrence for yearly frequency', () => {
    expect(calculateNextOccurrence('2026-09-15', 'yearly')).toBe('2027-09-15')
  })

  it('calculates next occurrence for weekly frequency', () => {
    expect(calculateNextOccurrence('2026-09-15', 'weekly')).toBe('2026-09-22')
  })
})

describe('Calculations - Savings Goals', () => {
  it('calculates savings progress correctly and caps at 100%', () => {
    expect(calculateSavingsProgress(5000, 10000)).toBe(50)
    expect(calculateSavingsProgress(12000, 10000)).toBe(100)
    expect(calculateSavingsProgress(100, 0)).toBe(0)
  })
})

describe('Calculations - Validation', () => {
  it('rejects invalid amounts', () => {
    expect(validateAmount('100.50')).toBe(true)
    expect(validateAmount('0')).toBe(false)
    expect(validateAmount('-50')).toBe(false)
    expect(validateAmount('abc')).toBe(false)
  })
})
