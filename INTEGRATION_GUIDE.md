# Quick Integration Guide: Toast & Loader Patterns

## **How to Add These Patterns to Your Existing Components**

### **1. Basic Setup - Add to Your Layout/App Root**

```tsx
// In your main layout or app component
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import ToastContainer from '@/components/ui/ToastContainer';

export default function RootLayout({ children }) {
  // Initialize network monitoring globally
  useNetworkStatus();
  
  return (
    <html>
      <body>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
```

### **2. Convert Existing API Calls**

**Before:**
```tsx
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await updateProfile(data);
    // No user feedback
  } catch (error) {
    // Silent failure
  } finally {
    setLoading(false);
  }
};
```

**After:**
```tsx
import { useFormSubmission, LOADING_CONFIGS } from '@/hooks/useLoading';

const profileForm = useFormSubmission(
  updateProfile,
  LOADING_CONFIGS.SAVE_PROFILE
);

const handleSubmit = () => profileForm.submit(data);
```

### **3. Upgrade Form Components**

**Before:**
```tsx
<button disabled={loading}>
  {loading ? 'Saving...' : 'Save'}
</button>
```

**After:**
```tsx
<button 
  disabled={profileForm.loading}
  className={`${profileForm.loading ? 'opacity-50 cursor-not-allowed' : ''}`}
>
  {profileForm.loading ? (
    <>
      <Loader2 className="w-4 h-4 animate-spin mr-2" />
      Saving...
    </>
  ) : (
    'Save Profile'
  )}
</button>
```

### **4. Add File Upload Feedback**

```tsx
import { useFileUpload } from '@/hooks/useLoading';

const fileUpload = useFileUpload();

const handleUpload = (file: File) => {
  fileUpload.upload(file, async (file, onProgress) => {
    // Your existing upload logic
    return await uploadToServer(file, onProgress);
  });
};

// In your JSX:
{fileUpload.loading && (
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span>{fileUpload.status}</span>
      <span>{fileUpload.progress}%</span>
    </div>
    <div className="w-full bg-gray-700 rounded-full h-2">
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all"
        style={{ width: `${fileUpload.progress || 0}%` }}
      />
    </div>
  </div>
)}
```

### **5. Add Copy-to-Clipboard Feedback**

```tsx
import { useClipboard } from '@/hooks/useNetworkStatus';

const { copyToClipboard } = useClipboard();

// Replace silent clipboard operations:
navigator.clipboard.writeText(text);

// With feedback:
copyToClipboard(text, 'Link copied to clipboard!');
```

### **6. Handle Network-Dependent Operations**

```tsx
import { useNetworkStatus, useAutoRetry } from '@/hooks/useNetworkStatus';

const { isOnline } = useNetworkStatus();
const { executeWithRetry } = useAutoRetry(fetchUserData, {
  maxRetries: 3,
  retryDelay: 1000,
});

// Auto-retry with user feedback
const loadData = () => executeWithRetry();

// Disable network-dependent buttons
<button 
  disabled={!isOnline}
  title={!isOnline ? 'No internet connection' : ''}
>
  Sync Data
</button>
```

### **7. Replace Loading Skeletons**

**Before:**
```tsx
{loading ? <div>Loading...</div> : <Content />}
```

**After:**
```tsx
import { ProductCardSkeleton } from '@/shared/components/Loading';

{loading ? (
  <div className="grid grid-cols-3 gap-4">
    {[...Array(6)].map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
) : (
  <ProductGrid />
)}
```

### **8. Add System Event Toasts**

```tsx
// Add to components that might have system events
import { useUIStore } from '@/store/useUIStore';

const { addToast } = useUIStore();

// For features not yet available:
const handleAdvancedFeature = () => {
  addToast({
    type: 'info',
    message: 'Advanced analytics coming soon! Stay tuned.',
    duration: 4000,
  });
};

// For permission errors:
const handleRestrictedAction = () => {
  addToast({
    type: 'error',
    message: 'Access denied. Please contact admin for permissions.',
    duration: 6000,
  });
};
```

---

## **Quick Checklist for Each Component**

When adding/updating a component, ask:

- [ ] **Does it make API calls?** → Add proper loading states
- [ ] **Does it submit forms?** → Use `useFormSubmission`
- [ ] **Does it upload files?** → Use `useFileUpload` with progress
- [ ] **Does it perform destructive actions?** → Add confirmation + loading
- [ ] **Does it copy data?** → Use `useClipboard` for feedback
- [ ] **Does it depend on network?** → Check `useNetworkStatus`
- [ ] **Does it show "coming soon" features?** → Add info toasts
- [ ] **Can it fail with permissions?** → Add error toasts

---

## **Performance Tips**

1. **Don't overuse global loaders** - Reserve for major operations only
2. **Use skeleton loaders** for predictable content layouts
3. **Debounce search operations** to prevent excessive loading states
4. **Limit concurrent toasts** to 3-4 maximum
5. **Auto-dismiss success toasts** but let users dismiss errors manually

---

## **Testing Your Implementation**

1. **Slow Network**: Throttle your network in dev tools to see loading states
2. **Offline Mode**: Disable network to test offline handling
3. **Error Scenarios**: Mock API failures to see error toasts
4. **Fast Operations**: Use `minDuration` to prevent loading flash
5. **Mobile**: Test touch interactions and smaller screens

---

This approach ensures **every user interaction** gets proper feedback, creating a professional, responsive user experience that builds trust and reduces user confusion.
