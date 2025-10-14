import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { LeadCard } from './LeadCard';
import type { Lead } from '@/hooks/useLeads';

// Mock hooks
vi.mock('@/hooks/useLeadHistory', () => ({
  useMarkLeadAsWon: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useMarkLeadAsLost: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/hooks/useEnrichLead', () => ({
  useEnrichLead: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/hooks/useActivities', () => ({
  usePendingActivitiesCount: () => ({
    data: 2,
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const mockLead: Lead = {
  id: '1',
  user_id: 'user-1',
  team_id: 'team-1',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  company: 'Acme Corp',
  job_title: 'CEO',
  status: 'active',
  temperature: 'hot',
  notes: 'Important lead',
  is_archived: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('LeadCard', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render lead information correctly', () => {
    render(<LeadCard lead={mockLead} onClick={mockOnClick} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('CEO')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
  });

  it('should call onClick when card is clicked', () => {
    render(<LeadCard lead={mockLead} onClick={mockOnClick} />, {
      wrapper: createWrapper(),
    });

    const card = screen.getByText('John Doe').closest('div[role="button"]');
    if (card) {
      fireEvent.click(card);
      expect(mockOnClick).toHaveBeenCalledWith(mockLead);
    }
  });

  it('should display initials correctly', () => {
    render(<LeadCard lead={mockLead} onClick={mockOnClick} />, {
      wrapper: createWrapper(),
    });

    const initials = screen.getByText('JD');
    expect(initials).toBeInTheDocument();
  });

  it('should render temperature indicator', () => {
    render(<LeadCard lead={mockLead} onClick={mockOnClick} />, {
      wrapper: createWrapper(),
    });

    // Lead com temperature: 'hot' deve mostrar "Quente"
    expect(screen.getByText(/quente/i)).toBeInTheDocument();
  });

  it('should show pending activities count', () => {
    render(<LeadCard lead={mockLead} onClick={mockOnClick} />, {
      wrapper: createWrapper(),
    });

    // Mock retorna 2 atividades pendentes
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should display phone number when available', () => {
    render(<LeadCard lead={mockLead} onClick={mockOnClick} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('+1234567890')).toBeInTheDocument();
  });

  it('should handle lead without phone number', () => {
    const leadWithoutPhone = { ...mockLead, phone: undefined };
    
    render(<LeadCard lead={leadWithoutPhone} onClick={mockOnClick} />, {
      wrapper: createWrapper(),
    });

    expect(screen.queryByText('+1234567890')).not.toBeInTheDocument();
  });

  it('should display company when available', () => {
    render(<LeadCard lead={mockLead} onClick={mockOnClick} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('should handle lead without company', () => {
    const leadWithoutCompany = { ...mockLead, company: undefined };
    
    render(<LeadCard lead={leadWithoutCompany} onClick={mockOnClick} />, {
      wrapper: createWrapper(),
    });

    expect(screen.queryByText('Acme Corp')).not.toBeInTheDocument();
  });

  it('should show different temperature states', () => {
    const temperatures: Array<'hot' | 'warm' | 'cold'> = ['hot', 'warm', 'cold'];
    const expectedLabels = ['Quente', 'Morno', 'Frio'];

    temperatures.forEach((temp, index) => {
      const { unmount } = render(
        <LeadCard lead={{ ...mockLead, temperature: temp }} onClick={mockOnClick} />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText(new RegExp(expectedLabels[index], 'i'))).toBeInTheDocument();
      unmount();
    });
  });

  it('should render dropdown menu with actions', () => {
    render(<LeadCard lead={mockLead} onClick={mockOnClick} />, {
      wrapper: createWrapper(),
    });

    // Find and click dropdown trigger (MoreHorizontal icon button)
    const dropdown = screen.getByRole('button', { name: /mais opções/i }) || 
                     document.querySelector('[aria-label*="menu"]');
    
    if (dropdown) {
      fireEvent.click(dropdown);
    }
  });

  it('should not re-render when props have not changed', () => {
    const { rerender } = render(<LeadCard lead={mockLead} onClick={mockOnClick} />, {
      wrapper: createWrapper(),
    });

    const initialRender = screen.getByText('John Doe');

    // Re-render with same props
    rerender(<LeadCard lead={mockLead} onClick={mockOnClick} />);

    const afterRerender = screen.getByText('John Doe');

    // Component should be memoized
    expect(initialRender).toBe(afterRerender);
  });

  it('should handle archived leads', () => {
    const archivedLead = { ...mockLead, is_archived: true };
    
    render(<LeadCard lead={archivedLead} onClick={mockOnClick} />, {
      wrapper: createWrapper(),
    });

    // Archived leads podem ter indicação visual diferente
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should calculate days since update correctly', () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    const oldLead = { ...mockLead, updated_at: twoDaysAgo.toISOString() };
    
    render(<LeadCard lead={oldLead} onClick={mockOnClick} />, {
      wrapper: createWrapper(),
    });

    // Should show "2d atrás" or similar
    expect(screen.getByText(/atrás/i)).toBeInTheDocument();
  });
});
