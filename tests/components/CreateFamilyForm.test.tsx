import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CreateFamilyForm from '@/components/CreateFamilyForm'
import * as familyActions from '@/app/family/actions'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

vi.mock('@/app/family/actions', () => ({
  createFamilyAction: vi.fn(),
}))

describe('CreateFamilyForm Component', () => {
  it('renders correctly with initial empty state', () => {
    render(<CreateFamilyForm />)
    expect(screen.getByPlaceholderText('e.g. The Smiths, Our Home')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Family' })).toBeInTheDocument()
  })

  it('shows error state when creation fails', async () => {
    vi.spyOn(familyActions, 'createFamilyAction').mockResolvedValueOnce({
      error: 'Family name cannot be empty.'
    })

    render(<CreateFamilyForm />)
    const input = screen.getByPlaceholderText('e.g. The Smiths, Our Home')
    const button = screen.getByRole('button', { name: 'Create Family' })

    fireEvent.change(input, { target: { value: 'Smiths' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Family name cannot be empty.')).toBeInTheDocument()
    })
  })
})
