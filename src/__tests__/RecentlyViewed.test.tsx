import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Equipment } from '../types';
import RecentlyViewed from '../components/home/RecentlyViewed';

// Mock EquipmentCard to avoid deep dependency tree
vi.mock('../components/equipment/EquipmentCard', () => ({
  default: ({ equipment }: { equipment: Equipment }) => (
    <div data-testid="equipment-card">{equipment.title}</div>
  ),
}));

const makeEquipment = (id: string, title: string): Equipment => ({
  id: id as Equipment['id'],
  owner_id: 'owner1' as Equipment['owner_id'],
  category_id: 'cat1',
  title,
  description: 'Test equipment',
  brand: null,
  model: null,
  condition: 'good',
  daily_rate: 100,
  weekly_rate: null,
  monthly_rate: null,
  deposit_amount: 0,
  location: 'Sydney, NSW',
  latitude: null,
  longitude: null,
  images: [],
  features: [],
  specifications: {},
  availability_status: 'available',
  min_rental_days: 1,
  max_rental_days: 30,
  rating: 4.5,
  total_reviews: 5,
  total_bookings: 10,
  is_featured: false,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

describe('RecentlyViewed', () => {
  const mockProps = {
    onEquipmentClick: vi.fn(),
    onFavoriteClick: vi.fn(),
    favorites: new Set<string>(),
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should render nothing when localStorage is empty', () => {
    const { container } = render(<RecentlyViewed {...mockProps} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render recently viewed section when items exist', () => {
    const items = [makeEquipment('1', 'CAT Excavator'), makeEquipment('2', 'Sony Camera')];
    localStorage.setItem('recentlyViewed', JSON.stringify(items));
    render(<RecentlyViewed {...mockProps} />);
    expect(screen.getByText(/recently viewed/i)).toBeInTheDocument();
  });

  it('should render equipment cards for stored items', () => {
    const items = [makeEquipment('1', 'CAT Excavator'), makeEquipment('2', 'Sony Camera')];
    localStorage.setItem('recentlyViewed', JSON.stringify(items));
    render(<RecentlyViewed {...mockProps} />);
    expect(screen.getByText('CAT Excavator')).toBeInTheDocument();
    expect(screen.getByText('Sony Camera')).toBeInTheDocument();
  });

  it('should show at most 4 items', () => {
    const items = Array.from({ length: 8 }, (_, i) =>
      makeEquipment(`${i}`, `Equipment ${i}`)
    );
    localStorage.setItem('recentlyViewed', JSON.stringify(items));
    render(<RecentlyViewed {...mockProps} />);
    const cards = screen.getAllByTestId('equipment-card');
    expect(cards.length).toBeLessThanOrEqual(4);
  });

  it('should gracefully handle corrupt localStorage data', () => {
    localStorage.setItem('recentlyViewed', 'not-valid-json');
    expect(() => render(<RecentlyViewed {...mockProps} />)).not.toThrow();
  });
});
