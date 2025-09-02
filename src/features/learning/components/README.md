# Certificate Section Component

A modern, responsive certificate display component for the Kenesis learning platform. Built with TypeScript, Tailwind CSS, and Motion animations following the website's design system.

## 🌟 Features

- **📱 Responsive Design**: Grid layout adapts from 1 column (mobile) to 3 columns (desktop)
- **🎨 Beautiful UI**: Gradient borders, soft shadows, and smooth hover effects
- **🎉 Congratulatory Banner**: Udemy-style completion celebration with custom design
- **🎯 Smooth Animations**: Motion library for card entry and hover effects
- **📥 Download & Share**: Built-in actions for downloading and sharing certificates
- **🎛️ TypeScript Support**: Full type safety with comprehensive interfaces
- **🔄 Loading States**: Graceful loading and empty state handling
- **♿ Accessibility**: Proper ARIA labels and keyboard navigation

## 🚀 Quick Start

### Basic Usage

```tsx
import { CertificateSection } from '@/features/learning/components/CertificateSection';
import type { Certificate } from '@/features/learning/types/certificate';

const certificates: Certificate[] = [
  {
    id: "cert-001",
    title: "Complete React Development",
    date: "2024-01-15T10:00:00Z",
    imageUrl: "/images/certificates/react-cert.png",
    downloadUrl: "/api/certificates/cert-001/download",
    shareUrl: "https://kenesis.com/certificates/cert-001",
    completionRate: 100
  }
];

function MyPage() {
  return (
    <CertificateSection 
      certificates={certificates}
      onDownload={(cert) => console.log('Downloading:', cert.title)}
      onShare={(cert) => console.log('Sharing:', cert.title)}
    />
  );
}
```

### Course Completion Banner

```tsx
import { CongratulatoryBanner } from '@/features/learning/components/CertificateSection';

function CourseCompletePage() {
  return (
    <CongratulatoryBanner
      courseTitle="Complete React Development Bootcamp"
      completionDate="2024-01-15T10:00:00Z"
      onViewCertificate={() => window.open('/certificate/view', '_blank')}
      onDownloadCertificate={() => downloadCertificate()}
    />
  );
}
```

## 📋 Component API

### CertificateSection Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `certificates` | `Certificate[]` | `[]` | Array of certificate objects |
| `className` | `string` | `""` | Additional CSS classes |
| `onDownload` | `(cert: Certificate) => void` | `undefined` | Download handler |
| `onShare` | `(cert: Certificate) => void` | `undefined` | Share handler |

### CongratulatoryBanner Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `courseTitle` | `string` | ✅ | Name of completed course |
| `completionDate` | `string` | ✅ | ISO date string |
| `onViewCertificate` | `() => void` | ✅ | View certificate handler |
| `onDownloadCertificate` | `() => void` | ✅ | Download certificate handler |
| `className` | `string` | ❌ | Additional CSS classes |

### Certificate Interface

```typescript
interface Certificate {
  id: string;                    // Unique identifier
  title: string;                 // Course/certificate title
  date: string;                  // Completion date (ISO string)
  imageUrl: string;              // Certificate preview image
  downloadUrl: string;           // PDF download link
  shareUrl: string;              // Shareable URL
  courseId?: string;             // Associated course ID
  completionRate?: number;       // 0-100 percentage
  instructor?: {                 // Instructor info
    id: string;
    username: string;
  };
  metadata?: {                   // Additional metadata
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
    verificationType?: "blockchain" | "traditional";
  };
}
```

## 🎨 Design System

The component follows the Kenesis design system:

### Colors
- **Primary Gradient**: `#0680FF` to `#022ED2`
- **Success Gradient**: Green (`#10B981` to `#059669`)
- **Background**: Black with transparency
- **Text**: White primary, gray secondary

### Typography
- **Font Family**: Inter
- **Sizes**: Responsive scaling (16px mobile → 24px desktop)
- **Weights**: Medium (500), Semi-bold (600), Bold (700)

### Layout
- **Mobile**: Single column, full width
- **Tablet**: 2 columns with gap
- **Desktop**: 3 columns with proper spacing
- **Hover Effects**: Scale transform + shadow enhancement

### Animations
- **Card Entry**: Staggered fade-in with upward motion
- **Hover**: Scale up (1.05x) with shadow
- **Banner**: Multi-stage animation with spring physics

## 🔧 Customization

### Custom Styling

```tsx
<CertificateSection 
  certificates={certificates}
  className="my-custom-class"
  // Custom download handler
  onDownload={(cert) => {
    // Your custom download logic
    analytics.track('certificate_downloaded', { id: cert.id });
    downloadCertificatePDF(cert.downloadUrl);
  }}
  // Custom share handler
  onShare={(cert) => {
    // Your custom share logic
    if (navigator.share) {
      navigator.share({
        title: cert.title,
        url: cert.shareUrl
      });
    } else {
      // Fallback to custom share modal
      openShareModal(cert);
    }
  }}
/>
```

### Backend Integration

```tsx
// With React Query
function CertificatesPage() {
  const { data: certificates, isLoading, error } = useQuery({
    queryKey: ['certificates'],
    queryFn: fetchUserCertificates
  });

  if (isLoading) return <CertificateLoadingSkeleton />;
  if (error) return <ErrorMessage error={error} />;

  return <CertificateSection certificates={certificates} />;
}

// API integration
async function fetchUserCertificates(): Promise<Certificate[]> {
  const response = await fetch('/api/user/certificates');
  return response.json();
}
```

## 📱 Responsive Behavior

### Mobile (< 640px)
- Single column layout
- Larger touch targets
- Simplified animations
- Stack action buttons vertically

### Tablet (640px - 1024px)
- 2 column grid
- Medium-sized cards
- Reduced animation delays

### Desktop (> 1024px)
- 3 column grid
- Full hover effects
- Optimized spacing
- Faster animations

## 🎭 Animation Details

### Card Entry Animation
```typescript
// Each card animates in with staggered delay
initial={{ opacity: 0, y: 30 }}
animate={{ opacity: 1, y: 0 }}
transition={{ 
  duration: 0.5, 
  delay: index * 0.1,
  ease: "easeOut" 
}}
```

### Hover Effects
```typescript
// Smooth scale and shadow on hover
whileHover={{ 
  scale: 1.05,
  transition: { duration: 0.2 }
}}
```

### Banner Animation
```typescript
// Multi-stage banner reveal
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6, ease: "easeOut" }}
```

## 🔍 Testing

### Unit Tests
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { CertificateSection } from './CertificateSection';

test('renders certificates correctly', () => {
  const mockCertificates = [/* ... */];
  render(<CertificateSection certificates={mockCertificates} />);
  
  expect(screen.getByText('Your Certificates')).toBeInTheDocument();
  expect(screen.getAllByRole('button')).toHaveLength(mockCertificates.length * 2);
});

test('handles download action', () => {
  const mockDownload = jest.fn();
  render(
    <CertificateSection 
      certificates={mockCertificates} 
      onDownload={mockDownload}
    />
  );
  
  fireEvent.click(screen.getAllByText('Download')[0]);
  expect(mockDownload).toHaveBeenCalledWith(mockCertificates[0]);
});
```

### Integration Tests
```typescript
test('certificate flow integration', async () => {
  // Test course completion → banner → certificate display
  render(<CourseCompletionFlow />);
  
  fireEvent.click(screen.getByText('Complete Course'));
  
  await waitFor(() => {
    expect(screen.getByText('🎉 Congratulations!')).toBeInTheDocument();
  });
});
```

## 📦 Dependencies

- **React**: ^19.0.0
- **Motion**: ^12.23.12 (for animations)
- **Lucide React**: ^0.540.0 (for icons)
- **Tailwind CSS**: (for styling)
- **clsx**: ^2.1.1 (for conditional classes)

## 🤝 Contributing

1. Follow TypeScript strict mode
2. Use Tailwind for all styling
3. Add comprehensive prop interfaces
4. Include JSDoc comments
5. Test responsive behavior
6. Maintain animation performance

## 📄 License

MIT License - Part of the Kenesis Learning Platform

---

**Built with ❤️ for modern web learning experiences**
