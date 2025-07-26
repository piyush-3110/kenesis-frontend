import { AffiliateProduct } from '../types';

// Mock data for affiliate products
export const MOCK_AFFILIATE_PRODUCTS: AffiliateProduct[] = [
  {
    id: '1',
    title: 'Complete Digital Marketing Mastery',
    author: 'Alex Vargas',
    rating: 4.6,
    reviewCount: 11254,
    price: 52.00,
    commission: 30,
    category: 'Health, Wellness and Beauty',
    type: 'video',
    thumbnail: '/images/landing/product.png',
    description: 'Master digital marketing strategies that convert'
  },
  {
    id: '2',
    title: 'Advanced UI/UX Design Course',
    author: 'Sarah Chen',
    rating: 4.8,
    reviewCount: 8932,
    price: 89.00,
    commission: 35,
    category: 'Design & Technology',
    type: 'video',
    thumbnail: '/images/landing/product.png',
    description: 'Learn modern UI/UX design principles'
  },
  {
    id: '3',
    title: 'Cryptocurrency Investment Guide',
    author: 'Mike Rodriguez',
    rating: 4.7,
    reviewCount: 15643,
    price: 127.00,
    commission: 25,
    category: 'Finance & Investment',
    type: 'document',
    thumbnail: '/images/landing/product.png',
    description: 'Complete guide to crypto investment strategies'
  },
  {
    id: '4',
    title: 'Personal Fitness & Nutrition Plan',
    author: 'Emma Johnson',
    rating: 4.9,
    reviewCount: 7234,
    price: 67.00,
    commission: 40,
    category: 'Health, Wellness and Beauty',
    type: 'document',
    thumbnail: '/images/landing/product.png',
    description: 'Comprehensive fitness and nutrition program'
  },
  {
    id: '5',
    title: 'E-commerce Business Blueprint',
    author: 'David Kim',
    rating: 4.5,
    reviewCount: 9876,
    price: 199.00,
    commission: 45,
    category: 'Business & Entrepreneurship',
    type: 'video',
    thumbnail: '/images/landing/product.png',
    description: 'Build a successful e-commerce business from scratch'
  },
  {
    id: '6',
    title: 'Mindfulness & Meditation Mastery',
    author: 'Lisa Parker',
    rating: 4.8,
    reviewCount: 5432,
    price: 45.00,
    commission: 35,
    category: 'Health, Wellness and Beauty',
    type: 'video',
    thumbnail: '/images/landing/product.png',
    description: 'Transform your life through mindfulness practices'
  },
  {
    id: '7',
    title: 'Professional Photography Techniques',
    author: 'James Wilson',
    rating: 4.7,
    reviewCount: 12987,
    price: 134.00,
    commission: 30,
    category: 'Arts & Photography',
    type: 'document',
    thumbnail: '/images/landing/product.png',
    description: 'Master professional photography techniques'
  },
  {
    id: '8',
    title: 'Social Media Marketing Secrets',
    author: 'Rachel Adams',
    rating: 4.6,
    reviewCount: 18765,
    price: 78.00,
    commission: 38,
    category: 'Marketing & Sales',
    type: 'video',
    thumbnail: '/images/landing/product.png',
    description: 'Unlock the secrets of viral social media marketing'
  }
];

export const AFFILIATE_CATEGORIES = [
  'Health, Wellness and Beauty',
  'Design & Technology',
  'Finance & Investment',
  'Business & Entrepreneurship',
  'Arts & Photography',
  'Marketing & Sales'
];

export const AFFILIATE_COLORS = {
  // Background colors
  PRIMARY_BG: '#010519',
  CARD_BG: 'linear-gradient(152.97deg, #000000 18.75%, rgba(0, 0, 0, 0) 100%)',
  
  // Border gradients
  PRIMARY_BORDER: 'linear-gradient(90deg, #0680FF 0%, #022ED2 100%)',
  
  // Text colors
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SECONDARY: '#BFBFBF',
  TEXT_MUTED: '#CCCCCC',
  
  // Button gradient
  BUTTON_BG: 'linear-gradient(90deg, #0680FF 0%, #022ED2 100%)',
} as const;
