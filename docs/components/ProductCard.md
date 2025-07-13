# ProductCard Component Documentation

## Overview

The `ProductCard` component is a reusable React component that displays product information in a visually appealing card format. It's designed for the Kenesis marketplace frontend with a modern, professional design featuring gradient borders and smooth animations.

## File Location
```
src/features/marketplace/ProductCard.tsx
```

## Features

- **Mobile-first responsive design**
- **Gradient border with blue-to-blue gradient**
- **Black gradient background for content**
- **Hover animations and scaling effects**
- **Certification badge display**
- **Star rating display**
- **Product image with hover zoom effect**
- **Price display with currency support**
- **Clickable link to product detail page**
- **Forward ref support for scroll management**

## Props

### ProductCardProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `product` | `Product` | Yes | Product object containing all product information |

### Product Type Structure

```typescript
interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  author: string;
  rating: number;
  totalRatings: number;
  isCertified: boolean;
  // ... other fields
}
```

## Usage

### Basic Usage

```tsx
import ProductCard from '@/features/marketplace/ProductCard';
import { Product } from '@/types/Product';

const product: Product = {
  id: '1',
  title: 'Advanced React Course',
  description: 'Learn advanced React concepts and patterns',
  price: 99.99,
  currency: '$',
  image: '/images/react-course.jpg',
  author: 'John Doe',
  rating: 4.8,
  totalRatings: 150,
  isCertified: true,
  // ... other required fields
};

function ProductList() {
  return (
    <div className="grid grid-cols-1 gap-4">
      <ProductCard product={product} />
    </div>
  );
}
```

### With Forward Ref (for infinite scroll)

```tsx
import { useRef } from 'react';
import ProductCard from '@/features/marketplace/ProductCard';

function ProductGrid() {
  const lastProductRef = useRef<HTMLDivElement>(null);

  return (
    <div className="grid grid-cols-1 gap-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          ref={index === products.length - 1 ? lastProductRef : undefined}
        />
      ))}
    </div>
  );
}
```

## Design Specifications

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Gradient Border (Blue to Blue)                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Black Gradient Background                           │ │
│ │ ┌─────┐ ┌─────────────────┐ ┌─────────────────────┐ │ │
│ │ │     │ │ Title           │ │                     │ │ │
│ │ │ IMG │ │ Author          │ │ Price               │ │ │
│ │ │     │ │ Rating          │ │                     │ │ │
│ │ │     │ │ Description     │ │                     │ │ │
│ │ └─────┘ └─────────────────┘ └─────────────────────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Color Scheme

- **Border Gradient**: `linear-gradient(180deg, #0680FF 0%, #022ED2 88.45%)`
- **Background Gradient**: `linear-gradient(152.97deg, #000000 18.75%, rgba(0, 0, 0, 0.95) 100%)`
- **Text Colors**:
  - Primary text (title): `text-white`
  - Secondary text (author): `text-gray-400`
  - Description: `text-gray-300`
  - Rating: `text-white` with `text-yellow-400` star
- **Hover Effects**:
  - Title: `group-hover:text-blue-300`
  - Shadow: `group-hover:shadow-blue-500/20`

### Dimensions

- **Card Border**: `0.73px` thickness
- **Border Radius**: `12px` outer, `calc(12px - 0.73px)` inner
- **Image Size**: `128px × 128px` (w-32 h-32)
- **Padding**: `16px` (p-4) inner content

## Animations

### Hover Effects

1. **Scale Animation**: `hover:scale-[1.02]` - 2% scale increase on hover
2. **Shadow Effect**: `hover:shadow-lg` with blue glow
3. **Image Zoom**: `group-hover:scale-105` - 5% image scale on card hover
4. **Color Transition**: Title changes to blue on hover

### Transition Settings

- **Duration**: `transition-all duration-300` (300ms)
- **Easing**: Default CSS easing
- **Properties**: Transform, shadow, colors

## Accessibility Features

- **Semantic HTML**: Uses proper heading hierarchy (`h3` for titles)
- **Alt Text**: Product images include descriptive alt text
- **Focus Management**: Keyboard navigation support through Link component
- **Screen Reader Support**: Meaningful text content and structure

## Dependencies

### External Libraries

- **Next.js**: `next/image`, `next/link`
- **Lucide React**: `lucide-react` (Star, Award icons)
- **React**: `forwardRef` for ref forwarding

### Internal Dependencies

- **Types**: `@/types/Product`
- **Styling**: Tailwind CSS classes

## Browser Support

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **CSS Features**: CSS Grid, Flexbox, CSS Gradients, CSS Transforms
- **JavaScript**: ES2020 features

## Performance Considerations

### Image Optimization

- Uses Next.js `Image` component for automatic optimization
- Lazy loading enabled by default
- Responsive image sizing with `sizes="128px"`

### Component Optimization

- Forward ref support for virtual scrolling
- Minimal re-renders with stable prop structure
- CSS-based animations (hardware accelerated)

## Customization Guide

### Styling Customization

To customize the appearance, modify the following sections:

#### Border Gradient
```tsx
style={{
  background: 'linear-gradient(180deg, #YOUR_COLOR1 0%, #YOUR_COLOR2 88.45%)',
  borderRadius: '12px'
}}
```

#### Background Gradient
```tsx
style={{
  background: 'linear-gradient(152.97deg, #YOUR_COLOR1 18.75%, #YOUR_COLOR2 100%)',
  borderRadius: 'calc(12px - 0.73px)'
}}
```

#### Animation Speeds
```tsx
className="transition-all duration-YOUR_DURATION"
```

### Layout Customization

To modify the card layout, adjust the flex structure:

```tsx
<div className="flex gap-YOUR_GAP">
  {/* Modify gap between sections */}
</div>
```

## Integration Examples

### With Loading State

```tsx
function ProductCardWithLoading({ product, isLoading }) {
  if (isLoading) {
    return <ProductCardSkeleton />;
  }
  
  return <ProductCard product={product} />;
}
```

### With Error Boundary

```tsx
function SafeProductCard({ product }) {
  return (
    <ErrorBoundary fallback={<ProductCardError />}>
      <ProductCard product={product} />
    </ErrorBoundary>
  );
}
```

## Testing

### Unit Test Example

```tsx
import { render, screen } from '@testing-library/react';
import ProductCard from './ProductCard';

const mockProduct = {
  id: '1',
  title: 'Test Product',
  description: 'Test Description',
  price: 99.99,
  currency: '$',
  image: '/test-image.jpg',
  author: 'Test Author',
  rating: 4.5,
  totalRatings: 100,
  isCertified: true,
};

test('renders product information correctly', () => {
  render(<ProductCard product={mockProduct} />);
  
  expect(screen.getByText('Test Product')).toBeInTheDocument();
  expect(screen.getByText('Test Author')).toBeInTheDocument();
  expect(screen.getByText('$ 99.99')).toBeInTheDocument();
  expect(screen.getByText('4.5')).toBeInTheDocument();
});
```

## Troubleshooting

### Common Issues

1. **Image not loading**: Ensure the image URL is valid and accessible
2. **Gradient not showing**: Check CSS support for linear gradients
3. **Hover effects not working**: Verify group hover classes are applied correctly
4. **Layout breaking**: Ensure container has proper width constraints

### Debug Tips

- Use browser dev tools to inspect gradient CSS
- Check console for image loading errors
- Verify product data structure matches expected interface
- Test responsiveness at different screen sizes

## Version History

- **v1.0.0**: Initial implementation with gradient border and black background
- **v1.1.0**: Added hover animations and certification badge
- **v1.2.0**: Improved mobile responsiveness and accessibility
- **v1.3.0**: Added forward ref support for infinite scroll integration

## Related Components

- **ProductGrid**: Container component for multiple ProductCards
- **ProductCardSkeleton**: Loading state component
- **Sidebar**: Filtering component for marketplace
- **SearchFilterBar**: Search and sort functionality

## API Integration

The ProductCard component is designed to work with the marketplace API:

```typescript
// API response structure
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
}
```

For detailed API documentation, see: `/BACKEND_API_DOCUMENTATION.md`
