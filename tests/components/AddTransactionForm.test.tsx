import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AddTransactionForm from '@/components/AddTransactionForm'

// Mock the useRouter hook
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

// Mock the db actions
vi.mock('@/lib/db', () => ({
  db: {
    transactions: {
      add: vi.fn().mockResolvedValue('test-id')
    }
  }
}))

vi.mock('@/app/transactions/actions', () => ({
  syncTransactions: vi.fn().mockResolvedValue(true)
}))

describe('AddTransactionForm Component', () => {
  const mockProps = {
    familyId: 'family-1',
    expenses: [{ id: 'cat-1', name: 'Food' }],
    incomes: [{ id: 'cat-2', name: 'Salary' }]
  }

  it('renders the form correctly', () => {
    const { container } = render(<AddTransactionForm {...mockProps} />)
    expect(container.querySelector('input[name="amount"]')).toBeInTheDocument()
    expect(container.querySelector('input[name="date"]')).toBeInTheDocument()
  })

  it('switches between expense and income types', () => {
    render(<AddTransactionForm {...mockProps} />)
    
    // Default is expense, so Food category should be present
    expect(screen.getByText('Food')).toBeInTheDocument()
    expect(screen.queryByText('Salary')).not.toBeInTheDocument()

    // Click Income tab
    const incomeTab = screen.getByText('Income')
    fireEvent.click(incomeTab)

    // Now Salary category should be present
    expect(screen.getByText('Salary')).toBeInTheDocument()
    expect(screen.queryByText('Food')).not.toBeInTheDocument()
  })

  it('shows custom category input when Other is selected', () => {
    const { container } = render(<AddTransactionForm {...mockProps} />)
    
    expect(screen.queryByPlaceholderText('e.g. Subscriptions')).not.toBeInTheDocument()

    const select = container.querySelector('select[name="category_id"]')!
    fireEvent.change(select, { target: { value: 'other' } })

    expect(screen.getByPlaceholderText('e.g. Subscriptions')).toBeInTheDocument()
  })

  it('validates required fields', () => {
    const { container } = render(<AddTransactionForm {...mockProps} />)
    const amountInput = container.querySelector('input[name="amount"]')
    expect(amountInput).toBeRequired()
  })
})
