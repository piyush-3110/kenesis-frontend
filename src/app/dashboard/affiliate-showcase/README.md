# Affiliate Showcase Feature

This feature allows users to browse and promote products they haven't created affiliate links for yet. It's designed to be easily integrated with your backend API.

## 🏗️ Architecture

```
affiliate-showcase/
├── api/                    # API integration layer
│   └── affiliateApi.ts    # API functions (currently using mocks)
├── components/            # React components
│   ├── AffiliateShowcaseContainer.tsx
│   ├── FilterTabs.tsx
│   ├── SearchBar.tsx
│   ├── ProductCard.tsx
│   ├── ProductGrid.tsx
│   └── LoadingState.tsx
├── hooks/                 # Custom hooks
│   └── useAuth.ts        # Authentication hook
├── store/                 # State management
│   └── useAffiliateShowcaseStore.ts
├── types/                 # TypeScript types
│   └── index.ts
├── constants/             # Constants and mock data
│   └── index.ts
└── page.tsx              # Main page component
```

## 🔌 Backend Integration

### Required API Endpoints

1. **GET /api/affiliate/products/non-affiliated**
   - Returns products the user hasn't created affiliate links for
   - Supports filtering by type (video/document), search, pagination
   - Query parameters: `page`, `limit`, `search`, `type`, `category`

2. **GET /api/affiliate/products/type**
   - Returns products filtered by type (video or document)
   - Query parameters: `type`, `page`, `limit`, `search`, `category`

3. **POST /api/affiliate/links**
   - Creates an affiliate link for a product
   - Body: `{ productId: string, userId: string }`
   - Returns: `{ affiliateLink: string, affiliateId: string, commission: number }`

### API Response Format

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### Product Data Structure

```typescript
interface AffiliateProduct {
  id: string;
  title: string;
  author: string;
  rating: number;
  reviewCount: number;
  price: number;
  commission: number;
  category: string;
  type: 'video' | 'document';
  thumbnail: string;
  description?: string;
}
```

## 🚀 Quick Backend Integration

### Step 1: Update Environment Variables

Copy `.env.example` to `.env.local` and update:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
NEXT_PUBLIC_USE_MOCK_DATA=false
```

### Step 2: Update API Functions

In `api/affiliateApi.ts`, uncomment the real API functions and comment out the mock functions:

```typescript
// Comment out mock functions
// export const getNonAffiliatedProducts = async (params) => { ... }

// Uncomment real API functions
export const getNonAffiliatedProducts = async (
  params: GetProductsParams = {}
): Promise<ApiResponse<AffiliateProduct[]>> => {
  // Real API implementation
};
```

### Step 3: Update Authentication

Replace the mock authentication in `hooks/useAuth.ts` with your real auth system:

```typescript
export const useAuth = () => {
  // Connect to your actual auth system
  const { user } = useYourAuthSystem();
  
  return {
    user,
    getCurrentUserId: () => user?.id || null,
    isAuthenticated: () => !!user,
  };
};
```

### Step 4: Update User ID in Store

In `store/useAffiliateShowcaseStore.ts`, update the `promoteProduct` function to use real user ID:

```typescript
const { getCurrentUserId } = useAuth();
const userId = getCurrentUserId();
```

## 🎨 UI Features

### Filter Tabs
- **All**: Shows all available products
- **Video**: Shows only video-based products
- **Document**: Shows only document-based products

### Search Bar
- Real-time search with 300ms debounce
- Searches in title, author, and category
- Advanced search button (ready for modal implementation)

### Product Cards
- Displays product image, rating, title, author, category
- Shows price and commission percentage
- "Promote this product" button for creating affiliate links
- Proper gradient borders and hover effects

### Features
- Responsive grid layout (1-4 columns based on screen size)
- Loading states with skeleton components
- Empty states with helpful messages
- Real-time filtering and search
- Automatic product removal after affiliate link creation

## 🔧 Customization

### Colors
Update colors in `constants/index.ts`:

```typescript
export const AFFILIATE_COLORS = {
  PRIMARY_BG: '#010519',
  PRIMARY_BORDER: 'linear-gradient(90deg, #0680FF 0%, #022ED2 100%)',
  // ... other colors
};
```

### Typography
All components use the CircularXX font family as specified in your design requirements.

### Mock Data
Modify `MOCK_PRODUCTS` in `constants/index.ts` for development/testing.

## 📱 Responsive Design

- **Mobile**: Single column grid
- **Tablet**: 2 columns
- **Desktop**: 3 columns
- **Large Desktop**: 4 columns

## 🔍 Search & Filtering

- **Client-side**: Fast UI updates
- **Server-side**: Actual data filtering via API
- **Debounced**: Prevents excessive API calls
- **Multi-criteria**: Search across multiple fields

## 🚦 Error Handling

- Network errors are caught and displayed to users
- Loading states prevent multiple simultaneous requests
- User feedback for successful/failed affiliate link creation

## 🧪 Testing

Current setup includes:
- Mock data for development
- Simulated API delays
- Error simulation capabilities

## 📈 Performance

- Debounced search to reduce API calls
- Efficient state management with Zustand
- Proper loading states
- Optimized re-renders

## 🔮 Future Enhancements

- Advanced search modal
- Product categories filter
- Sorting options (price, rating, commission)
- Infinite scroll/pagination
- Bulk affiliate link creation
- Product comparison
- Favorites/wishlist functionality

---

## Quick Start

1. The feature is already integrated into your dashboard sidebar
2. Click "Affiliate Showcase" in the sidebar
3. Browse products, use filters, and search
4. Click "Promote this product" to create affiliate links
5. Products disappear from the list once affiliate links are created

This ensures you only see products you haven't created affiliate links for, matching your requirements!
