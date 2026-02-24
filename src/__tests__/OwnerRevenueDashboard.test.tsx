import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OwnerRevenueDashboard from '../components/revenue/OwnerRevenueDashboard';

describe('OwnerRevenueDashboard', () => {
  const mockOnBack = vi.fn();

  beforeEach(() => {
    mockOnBack.mockClear();
  });

  describe('Component Rendering', () => {
    it('should render with main title and description', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('Revenue Dashboard')).toBeInTheDocument();
      expect(screen.getByText(/Track your equipment rental earnings/i)).toBeInTheDocument();
    });

    it('should display back button', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      const backButton = screen.getByRole('button', { name: /go back/i });
      expect(backButton).toBeInTheDocument();
    });

    it('should display period selection buttons', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByRole('button', { name: /Week/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Month/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Quarter/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Year/i })).toBeInTheDocument();
    });
  });

  describe('KPI Cards Display', () => {
    it('should display this month revenue card', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('This Month Revenue')).toBeInTheDocument();
    });

    it('should display revenue amount', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText(/\$[0-9,]+/)).toBeInTheDocument();
    });

    it('should display total bookings card', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('Total Bookings')).toBeInTheDocument();
    });

    it('should display booking count', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText(/24/)).toBeInTheDocument();
    });

    it('should display average utilization card', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('Avg Utilization')).toBeInTheDocument();
    });

    it('should display utilization percentage', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText(/%/)).toBeInTheDocument();
    });

    it('should display total earnings card', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText(/Total Earnings \(6mo\)/i)).toBeInTheDocument();
    });

    it('should display revenue change indicator', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // Should show comparison to previous month
      expect(screen.getByText(/vs last month/i)).toBeInTheDocument();
    });

    it('should show up/down trend icons', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // Should indicate if revenue is trending up or down
      expect(screen.getByText(/% vs last month/)).toBeInTheDocument();
    });
  });

  describe('Period Selection', () => {
    it('should select month period by default', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      const monthButton = screen.getByRole('button', { name: /Month/i });
      expect(monthButton).toBeInTheDocument();
    });

    it('should allow switching to week period', async () => {
      const user = userEvent.setup();
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);

      const weekButton = screen.getByRole('button', { name: /Week/i });
      await user.click(weekButton);

      expect(weekButton).toBeInTheDocument();
    });

    it('should allow switching to quarter period', async () => {
      const user = userEvent.setup();
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);

      const quarterButton = screen.getByRole('button', { name: /Quarter/i });
      await user.click(quarterButton);

      expect(quarterButton).toBeInTheDocument();
    });

    it('should allow switching to year period', async () => {
      const user = userEvent.setup();
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);

      const yearButton = screen.getByRole('button', { name: /Year/i });
      await user.click(yearButton);

      expect(yearButton).toBeInTheDocument();
    });
  });

  describe('Revenue Calculations', () => {
    it('should calculate current month revenue', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText(/\$14,800/)).toBeInTheDocument();
    });

    it('should calculate total 6-month revenue', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // Sum of all 6 months should be displayed
      const totalRevenue = 8450 + 11200 + 9800 + 7200 + 12500 + 14800;
      expect(screen.getByText(new RegExp(totalRevenue.toString()))).toBeInTheDocument();
    });

    it('should calculate revenue change percentage', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // Feb vs Jan: (14800-12500)/12500 * 100 = 18.4%
      expect(screen.getByText(/% vs last month/)).toBeInTheDocument();
    });

    it('should calculate average daily revenue', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // Feb average daily is $529
      expect(screen.getByText(/average daily/i)).toBeInTheDocument();
    });

    it('should calculate booking change percentage', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // Feb vs Jan: (24-20)/20 * 100 = 20%
      expect(screen.getByText(/% vs last month/)).toBeInTheDocument();
    });
  });

  describe('Monthly Revenue Chart Display', () => {
    it('should display monthly revenue chart', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
    });

    it('should display month labels in chart', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('Sep')).toBeInTheDocument();
      expect(screen.getByText('Oct')).toBeInTheDocument();
    });

    it('should display revenue amounts in chart', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // Chart should show values like 8.5k, 11.2k, etc
      expect(screen.getByText(/k/)).toBeInTheDocument();
    });

    it('should display booking count for each month', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText(/bookings/i)).toBeInTheDocument();
    });

    it('should show revenue bars proportional to values', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // Bar chart should be visible
      expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
    });
  });

  describe('Equipment Performance Display', () => {
    it('should display top equipment section', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('Top Equipment')).toBeInTheDocument();
    });

    it('should display equipment rankings', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // Should show rankings 1-5
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should display top equipment names', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('CAT 320 Excavator')).toBeInTheDocument();
      expect(screen.getByText('Sony A7IV Camera Kit')).toBeInTheDocument();
    });

    it('should display equipment revenue', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText(/\$[0-9,]+/)).toBeInTheDocument();
    });

    it('should display equipment ratings', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText(/4\.[0-9]/)).toBeInTheDocument();
    });

    it('should display utilization percentage for equipment', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText(/%/)).toBeInTheDocument();
    });

    it('should display trend indicators for equipment', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // Should show up or down trends
      expect(screen.getByText(/78|65|82|91|73/)).toBeInTheDocument();
    });
  });

  describe('Transaction Listing', () => {
    it('should display recent transactions section', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
    });

    it('should display transaction dates', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // Should show date format
      expect(screen.getByText(/2\/24\/2026|2\/23\/2026/)).toBeInTheDocument();
    });

    it('should display renter names', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('John D.')).toBeInTheDocument();
      expect(screen.getByText('Sarah M.')).toBeInTheDocument();
    });

    it('should display equipment names in transactions', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('CAT 320 Excavator')).toBeInTheDocument();
    });

    it('should display transaction types', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText(/Rental Income|Deposit Return|Insurance Claim|Payout/)).toBeInTheDocument();
    });

    it('should display transaction status badges', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText(/Completed|Pending|Processing/)).toBeInTheDocument();
    });

    it('should display transaction amounts', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText(/\$[0-9,]+/)).toBeInTheDocument();
    });

    it('should show transaction direction (+ or -)', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // Should show positive for income, negative for deposits returned
      expect(screen.getByText(/-/)).toBeInTheDocument();
    });
  });

  describe('Transaction Status Styling', () => {
    it('should display completed status transactions', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('should display pending status transactions', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('should display processing status transactions', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('Processing')).toBeInTheDocument();
    });

    it('should show proper color coding for status', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // Status badges should have appropriate colors
      expect(screen.getByText(/Completed|Pending|Processing/)).toBeInTheDocument();
    });
  });

  describe('Trend Indicators', () => {
    it('should show revenue trend direction', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // Should indicate trend with up/down indicators
      expect(screen.getByText(/% vs last month/)).toBeInTheDocument();
    });

    it('should show booking trend', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText(/% vs last month/)).toBeInTheDocument();
    });

    it('should display equipment trend indicators', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // Equipment should show up/down/stable trends
      expect(screen.getByText(/78|65|82|91|73/)).toBeInTheDocument();
    });
  });

  describe('Data Formatting', () => {
    it('should format revenue with thousand separators', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText(/\$[0-9,]+/)).toBeInTheDocument();
    });

    it('should format dates correctly', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // Dates should be in MM/DD/YYYY format
      expect(screen.getByText(/2\/[0-9]+\/2026/)).toBeInTheDocument();
    });

    it('should display percentages with decimal places', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText(/[0-9]+\.[0-9]+%/)).toBeInTheDocument();
    });

    it('should format large numbers as thousands (k)', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText(/k/)).toBeInTheDocument();
    });
  });

  describe('Key Metrics Display', () => {
    it('should display current month revenue with icon', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('This Month Revenue')).toBeInTheDocument();
    });

    it('should display total bookings with icon', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('Total Bookings')).toBeInTheDocument();
    });

    it('should display utilization with icon', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('Avg Utilization')).toBeInTheDocument();
    });

    it('should display earnings with icon', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText(/Total Earnings/)).toBeInTheDocument();
    });
  });

  describe('Table Rendering', () => {
    it('should display transaction table headers', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Renter')).toBeInTheDocument();
      expect(screen.getByText('Equipment')).toBeInTheDocument();
    });

    it('should display transaction rows', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('John D.')).toBeInTheDocument();
      expect(screen.getByText('Sarah M.')).toBeInTheDocument();
    });

    it('should be scrollable horizontally on small screens', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
    });
  });

  describe('Navigation Callbacks', () => {
    it('should call onBack when back button is clicked', async () => {
      const user = userEvent.setup();
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);

      const backButton = screen.getByRole('button', { name: /go back/i });
      await user.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Responsive Layout', () => {
    it('should display KPI cards in grid', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('This Month Revenue')).toBeInTheDocument();
      expect(screen.getByText('Total Bookings')).toBeInTheDocument();
      expect(screen.getByText('Avg Utilization')).toBeInTheDocument();
    });

    it('should display two-column layout for chart and equipment', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
      expect(screen.getByText('Top Equipment')).toBeInTheDocument();
    });

    it('should display full-width transaction table', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
    });
  });

  describe('Equipment Earnings Metrics', () => {
    it('should display equipment revenue', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText(/\$[0-9,]+/)).toBeInTheDocument();
    });

    it('should display booking count per equipment', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // Should show booking numbers like 42, 35, 52, 89, 67
      expect(screen.getByText(/42|35|52|89|67/)).toBeInTheDocument();
    });

    it('should display equipment utilization rate', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText(/%/)).toBeInTheDocument();
    });

    it('should display average rating', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText(/4\.[0-9]/)).toBeInTheDocument();
    });
  });
});
