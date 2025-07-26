# My Affiliations Module

This module provides a comprehensive interface for users to manage and track their promoted affiliate products.

## Features

### 🎯 Core Functionality
- **Affiliate Product Management**: View and manage all promoted products
- **Performance Tracking**: Track clicks, conversions, and earnings
- **Status Management**: Enable/disable affiliate links
- **Detailed Analytics**: Comprehensive stats and metrics

### 📊 Key Components

#### 1. **My Affiliations Dashboard** (`/dashboard/my-affiliations`)
- Overview of all affiliated products
- Performance statistics cards
- Advanced filtering and search
- Table view with product details

#### 2. **Product Detail View** (`/dashboard/my-affiliations/product/[id]`)
- Reuses the same design as affiliate showcase
- Shows "You already promote this product" instead of generate link
- Displays affiliate performance metrics
- Copy/share affiliate link functionality

#### 3. **Statistics Cards**
- Total Affiliations
- Active Products  
- Total Earnings
- Total Clicks
- Conversions
- Conversion Rate

### 🔧 Technical Architecture

#### State Management
- **Zustand Store**: `useMyAffiliationsStore`
- Centralized state for affiliations, stats, and filters
- Error handling and loading states

#### API Layer
- Mock API with realistic data simulation
- Functions for CRUD operations
- Built-in delay simulation for realistic UX

#### Component Structure
```
my-affiliations/
├── page.tsx                    # Main dashboard page
├── components/
│   ├── AffiliationsTable.tsx   # Table with affiliate products
│   ├── StatsCards.tsx          # Performance metrics cards
│   └── FilterControls.tsx      # Search and filter UI
├── product/[id]/
│   └── page.tsx                # Product detail view
├── api/
│   └── affiliationsApi.ts      # API functions
├── store/
│   └── useMyAffiliationsStore.ts # State management
└── types/
    └── index.ts                # TypeScript types
```

### 🎨 Design System

#### Colors & Styling
- **Background**: Deep navy gradient (`#0e0f1a` to `#151625`)
- **Cards**: Gradient glass effect with subtle borders
- **Text**: White primary, gray secondary
- **Status Badges**: Red for inactive, green for active
- **Buttons**: Blue primary, gray secondary

#### Typography
- **Font**: Geist Sans / Inter
- **Weights**: Medium (500), Semi-bold (600), Bold (700)
- **Sizes**: 12px - 24px responsive scaling

### 📱 Responsive Design
- **Mobile First**: Optimized for mobile devices
- **Tablet**: Improved layout with more columns
- **Desktop**: Full feature set with optimal spacing

### 🚀 Usage

#### Basic Usage
```tsx
import { MyAffiliationsPage } from '@/app/dashboard/my-affiliations';

// Use in dashboard routing
<Route path="/dashboard/my-affiliations" component={MyAffiliationsPage} />
```

#### Store Usage
```tsx
import { useMyAffiliationsStore } from './store/useMyAffiliationsStore';

const MyComponent = () => {
  const { 
    affiliations, 
    stats, 
    loadAffiliations 
  } = useMyAffiliationsStore();
  
  useEffect(() => {
    loadAffiliations();
  }, []);
  
  return (
    <div>
      {affiliations.map(affiliation => (
        <div key={affiliation.id}>{affiliation.title}</div>
      ))}
    </div>
  );
};
```

### 🔄 Integration Points

#### With Affiliate Showcase
- Products promoted in showcase appear in My Affiliations
- Shared product data structure
- Consistent UI/UX patterns

#### With Analytics
- Performance metrics integration
- Click tracking
- Conversion tracking
- Earnings calculation

### 📈 Future Enhancements
- Real-time notifications for conversions
- Advanced analytics dashboard
- Bulk operations for affiliate links
- Export functionality for reports
- Integration with external affiliate networks

### 🧪 Testing
- Component unit tests
- API integration tests
- E2E user journey tests
- Performance testing for large datasets

### 📋 Todo
- [ ] Add real-time websocket updates
- [ ] Implement bulk actions
- [ ] Add export functionality
- [ ] Create mobile app version
- [ ] Add advanced analytics charts
