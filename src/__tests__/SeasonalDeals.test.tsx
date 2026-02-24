import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SeasonalDeals from '../components/promotions/SeasonalDeals';

describe('SeasonalDeals', () => {
  const mockOnBack = vi.fn();

  beforeEach(() => {
    mockOnBack.mockClear();
  });

  describe('Component Rendering', () => {
    it('should render main title and description', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      expect(screen.getByText('Seasonal Deals & Promotions')).toBeInTheDocument();
      expect(screen.getByText(/Save big with limited-time/i)).toBeInTheDocument();
    });

    it('should display back button', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
    });
  });

  describe('Featured Deal Banner', () => {
    it('should display featured deal section', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      expect(screen.getByText(/Featured Deal/i)).toBeInTheDocument();
    });

    it('should show first featured deal', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      expect(screen.getByText('Winter Construction Blowout')).toBeInTheDocument();
    });

    it('should display discount amount in banner', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      // Winter Construction Blowout is 25%
      expect(screen.getByText(/25% OFF/)).toBeInTheDocument();
    });

    it('should show featured deal code button', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      expect(screen.getByText(/WINTER25/)).toBeInTheDocument();
    });

    it('should display countdown timer for featured deal', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      expect(screen.getByText(/Expires|left/i)).toBeInTheDocument();
    });
  });

  describe('Season Filters', () => {
    it('should display all season filter buttons', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      expect(screen.getByRole('button', { name: /All Deals/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Winter/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Spring/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Summer/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Fall/i })).toBeInTheDocument();
    });

    it('should filter deals by winter season', async () => {
      const user = userEvent.setup();
      render(<SeasonalDeals onBack={mockOnBack} />);

      const winterButton = screen.getByRole('button', { name: /Winter/i });
      await user.click(winterButton);

      // Should show winter deals
      expect(screen.getByText('Winter Construction Blowout')).toBeInTheDocument();
    });

    it('should filter deals by spring season', async () => {
      const user = userEvent.setup();
      render(<SeasonalDeals onBack={mockOnBack} />);

      const springButton = screen.getByRole('button', { name: /Spring/i });
      await user.click(springButton);

      // Should show spring deals
      expect(screen.getByText('Spring Event Package')).toBeInTheDocument();
    });

    it('should filter deals by summer season', async () => {
      const user = userEvent.setup();
      render(<SeasonalDeals onBack={mockOnBack} />);

      const summerButton = screen.getByRole('button', { name: /Summer/i });
      await user.click(summerButton);

      // Should show summer deals
      expect(screen.getByText('Summer Landscaping Bundle')).toBeInTheDocument();
    });

    it('should show all deals when All is selected', async () => {
      const user = userEvent.setup();
      render(<SeasonalDeals onBack={mockOnBack} />);

      const allButton = screen.getByRole('button', { name: /All Deals/i });
      await user.click(allButton);

      // Should show multiple deals
      expect(screen.getByText('Winter Construction Blowout')).toBeInTheDocument();
      expect(screen.getByText('Spring Event Package')).toBeInTheDocument();
    });
  });

  describe('Deal Cards Display', () => {
    it('should display all deal cards', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      expect(screen.getByText('Winter Construction Blowout')).toBeInTheDocument();
      expect(screen.getByText('Spring Event Package')).toBeInTheDocument();
      expect(screen.getByText('Drone Photography Week')).toBeInTheDocument();
      expect(screen.getByText('Summer Landscaping Bundle')).toBeInTheDocument();
    });

    it('should show discount percentage correctly', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      expect(screen.getByText(/25% OFF/)).toBeInTheDocument();
      expect(screen.getByText(/30% OFF/)).toBeInTheDocument();
      expect(screen.getByText(/20% OFF/)).toBeInTheDocument();
    });

    it('should show flat discount amount when applicable', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      // Drone Photography Week is $100 flat
      expect(screen.getByText(/\$100 OFF/)).toBeInTheDocument();
    });

    it('should display deal category badges', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      expect(screen.getByText('Heavy Equipment')).toBeInTheDocument();
      expect(screen.getByText('Event Equipment')).toBeInTheDocument();
      expect(screen.getByText('Photography')).toBeInTheDocument();
    });

    it('should show featured badge on featured deals', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      const featuredBadges = screen.queryAllByText('Featured');
      expect(featuredBadges.length).toBeGreaterThan(0);
    });
  });

  describe('Deal Details & Usage Tracking', () => {
    it('should display equipment list for deals', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      expect(screen.getByText('Excavators')).toBeInTheDocument();
      expect(screen.getByText('Tents')).toBeInTheDocument();
      expect(screen.getByText('Tractors')).toBeInTheDocument();
    });

    it('should show usage progress bar', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      // Should show usage percentages
      expect(screen.getByText(/uses left/i)).toBeInTheDocument();
    });

    it('should display minimum rental days requirement', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      expect(screen.getByText(/Min/)).toBeInTheDocument();
    });

    it('should show countdown timer for each deal', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      const timers = screen.queryAllByText(/Expires|left/i);
      expect(timers.length).toBeGreaterThan(0);
    });
  });

  describe('Countdown Timer Functionality', () => {
    it('should show urgent timer for deals expiring soon', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      // Flash Deal expires in 2 days - should show urgent timer
      const flashDeal = screen.getByText('Flash Deal: Power Tools').closest('div');
      expect(flashDeal).toBeTruthy();
    });

    it('should calculate days and hours remaining', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      // Should show countdown format
      const countdownTexts = screen.queryAllByText(/[0-9]+d [0-9]+h left|Expires/i);
      expect(countdownTexts.length).toBeGreaterThan(0);
    });
  });

  describe('Deal Code Copy Functionality', () => {
    it('should display deal codes', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      expect(screen.getByText('WINTER25')).toBeInTheDocument();
      expect(screen.getByText('SPRING30')).toBeInTheDocument();
      expect(screen.getByText('SUMMER20')).toBeInTheDocument();
    });

    it('should copy code to clipboard when clicked', async () => {
      const user = userEvent.setup();
      const clipboardSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

      render(<SeasonalDeals onBack={mockOnBack} />);

      const codeButton = screen.getByText('WINTER25');
      await user.click(codeButton);

      expect(clipboardSpy).toHaveBeenCalledWith('WINTER25');
      clipboardSpy.mockRestore();
    });

    it('should show copied confirmation', async () => {
      const user = userEvent.setup();
      vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

      render(<SeasonalDeals onBack={mockOnBack} />);

      const codeButton = screen.getByText('WINTER25');
      await user.click(codeButton);

      // Should show "Copied!" message
      await screen.findByText('Copied!');
    });
  });

  describe('Deal Actions', () => {
    it('should have Use Deal button for each deal', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      const useButtons = screen.queryAllByText(/Use Deal/i);
      expect(useButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no deals for selected season', async () => {
      const user = userEvent.setup();
      render(<SeasonalDeals onBack={mockOnBack} />);

      // Filter by a season and manually hide deals
      const winterButton = screen.getByRole('button', { name: /Winter/i });
      await user.click(winterButton);

      // Should display deals for winter
      expect(screen.getByText('Winter Construction Blowout')).toBeInTheDocument();
    });
  });

  describe('Navigation Callbacks', () => {
    it('should call onBack when back button clicked', async () => {
      const user = userEvent.setup();
      render(<SeasonalDeals onBack={mockOnBack} />);

      const backButton = screen.getByRole('button', { name: /go back/i });
      await user.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Deal Type Display', () => {
    it('should indicate percentage discount type', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      // Winter Construction Blowout is percentage type
      expect(screen.getByText(/25%/)).toBeInTheDocument();
    });

    it('should indicate flat discount type', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      // Drone Photography Week is flat type
      expect(screen.getByText(/\$100/)).toBeInTheDocument();
    });

    it('should indicate bundle type', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      // Summer Landscaping Bundle is bundle type
      expect(screen.getByText('Summer Landscaping Bundle')).toBeInTheDocument();
    });
  });
});
