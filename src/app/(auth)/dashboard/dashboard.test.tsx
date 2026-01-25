import { render, screen, waitFor } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import Dashboard from '@/app/(auth)/dashboard/page'

// Mocking the hooks and supabase to avoid network calls during test
vi.mock('@/hooks/useAccounts', () => ({
    useAccounts: () => ({
        accounts: [{ id: '1', name: 'Test Account', currency: 'USD' }],
        loading: false
    })
}))

vi.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            getUser: vi.fn(() => Promise.resolve({ data: { user: { id: '123' } } }))
        },
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                order: vi.fn(() => Promise.resolve({ data: [], error: null }))
            }))
        }))
    }
}))

// Mock components that might be problematic in JSDOM
vi.mock('@/components/report/report-header', () => ({ ReportHeader: () => <div /> }))
vi.mock('@/components/equity-chart', () => ({ EquityChart: () => <div /> }))
vi.mock('@/components/shared-trade-card', () => ({ SharedTradeCard: () => <div /> }))

test('Dashboard renders heading after loading', async () => {
    render(<Dashboard />)

    // Wait for the skeleton to disappear and the real content to show
    await waitFor(() => {
        // The heading is "Dashboard"
        expect(screen.getAllByText(/Dashboard/i)).toBeDefined()
    }, { timeout: 3000 })
})
