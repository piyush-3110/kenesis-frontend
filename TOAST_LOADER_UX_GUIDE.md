# Toast & Loader UX Implementation Guide

## **Complete Reference Table: When to Use What**

| **Category** | **Action** | **Loader Required** | **Toast Required** | **Duration** | **Notes** |
|--------------|------------|-------------------|-------------------|--------------|-----------|
| **Authentication** |
| Login | ✅ (Button) | ✅ Success/Error | 500-2000ms | Button shows "Logging in..." |
| Signup | ✅ (Button) | ✅ Success/Error | 1000-3000ms | Include email verification step |
| Logout | ✅ (Button) | ✅ Success | 300-1000ms | Optional but good UX |
| Email Verification | ✅ (Page) | ✅ Success/Error | 1000-2000ms | Show resend option on error |
| Password Reset Request | ✅ (Button) | ✅ Success/Error | 500-1500ms | Clear instructions in toast |
| Password Reset Submit | ✅ (Button) | ✅ Success/Error | 1000-2000ms | Redirect on success |
| Session Check | ✅ (Global) | ❌ | Instant | Silent background check |
| **Data Fetching** |
| Dashboard Load | ✅ (Page/Section) | ❌ | 500-3000ms | Skeleton loaders preferred |
| Product List | ✅ (Grid) | ❌ | 800-2000ms | Pagination loader on "Load More" |
| User Profile | ✅ (Section) | ❌ | 300-1000ms | Quick data, minimal loader |
| Search Results | ✅ (Results) | ❌ | 200-1500ms | Real-time, debounced |
| Filter/Sort | ✅ (Results) | ❌ | 100-800ms | Quick visual feedback |
| Modal Data | ✅ (Modal) | ❌ | 300-1000ms | Skeleton inside modal |
| Infinite Scroll | ✅ (Bottom) | ❌ | 500-1500ms | "Loading more..." indicator |
| **Data Mutation** |
| Create Product | ✅ (Button) | ✅ Success/Error | 1000-5000ms | "Creating..." with progress |
| Update Profile | ✅ (Button) | ✅ Success/Error | 500-2000ms | "Saving..." state |
| Delete Item | ✅ (Button) | ✅ Success/Error | 300-1500ms | Confirm dialog + loader |
| Form Submit | ✅ (Button) | ✅ Success/Error | 500-3000ms | Disable form during submit |
| Bulk Operations | ✅ (Progress) | ✅ Success/Error | 2000-10000ms | Progress bar recommended |
| **File Operations** |
| File Upload | ✅ (Progress) | ✅ Success/Error | 1000-30000ms | Progress percentage + cancel |
| Image Upload | ✅ (Preview) | ✅ Success/Error | 500-5000ms | Thumbnail preview |
| Document Processing | ✅ (Progress) | ✅ Success/Error | 2000-15000ms | Processing stages shown |
| **Payments** |
| Process Payment | ✅ (Modal) | ✅ Success/Error | 2000-10000ms | Critical - show security |
| Subscription Change | ✅ (Button) | ✅ Success/Error | 1000-3000ms | Clear confirmation |
| Refund Request | ✅ (Button) | ✅ Success/Error | 1000-5000ms | Include timeline info |
| **System Events** |
| Network Lost | ❌ | ✅ Warning | N/A | Auto-retry + manual retry |
| Network Restored | ❌ | ✅ Success | N/A | Brief confirmation |
| Server Error | ❌ | ✅ Error | N/A | User-friendly error message |
| Feature Unavailable | ❌ | ✅ Info | N/A | "Coming soon!" message |
| Copy to Clipboard | ❌ | ✅ Success | N/A | Quick "Copied!" feedback |
| Permission Denied | ❌ | ✅ Error | N/A | Clear explanation + next steps |
| **Navigation** |
| Route Change (Heavy) | ✅ (Page) | ❌ | 500-2000ms | Page transition loader |
| Route Change (Light) | ❌ | ❌ | <300ms | Instant navigation |
| **Background Processes** |
| Data Export | ✅ (Modal) | ✅ Success/Error | 5000-60000ms | Download link in success toast |
| Report Generation | ✅ (Progress) | ✅ Success/Error | 3000-30000ms | Email notification option |
| Bulk Email Send | ✅ (Progress) | ✅ Success/Error | 5000-120000ms | Queue status updates |

---

## **Implementation Patterns**

### **Pattern 1: Button Loading States**
```tsx
<button 
  disabled={loading}
  className={`${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
>
  {loading ? (
    <>
      <Loader2 className="w-4 h-4 animate-spin mr-2" />
      Processing...
    </>
  ) : (
    'Submit'
  )}
</button>
```

### **Pattern 2: Page Loading (Skeleton)**
```tsx
{loading ? (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="animate-pulse bg-gray-700 h-20 rounded-lg" />
    ))}
  </div>
) : (
  <ActualContent />
)}
```

### **Pattern 3: Form Submission**
```tsx
const handleSubmit = async (data) => {
  setLoading(true);
  try {
    await submitForm(data);
    addToast({
      type: 'success',
      message: 'Profile updated successfully!'
    });
  } catch (error) {
    addToast({
      type: 'error',
      message: error.message || 'Failed to update profile'
    });
  } finally {
    setLoading(false);
  }
};
```

### **Pattern 4: File Upload with Progress**
```tsx
const handleFileUpload = async (file) => {
  setUploadProgress(0);
  setUploading(true);
  
  try {
    await uploadFile(file, (progress) => {
      setUploadProgress(progress);
    });
    
    addToast({
      type: 'success',
      message: 'File uploaded successfully!'
    });
  } catch (error) {
    addToast({
      type: 'error',
      message: 'Upload failed. Please try again.'
    });
  } finally {
    setUploading(false);
    setUploadProgress(0);
  }
};
```

### **Pattern 5: Network Error Handling**
```tsx
// Global network error handler
useEffect(() => {
  const handleOffline = () => {
    addToast({
      type: 'warning',
      message: 'Connection lost. Trying to reconnect...',
      duration: Infinity // Don't auto-dismiss
    });
  };
  
  const handleOnline = () => {
    clearToasts(); // Clear offline warnings
    addToast({
      type: 'success',
      message: 'Connection restored!',
      duration: 3000
    });
  };
  
  window.addEventListener('offline', handleOffline);
  window.addEventListener('online', handleOnline);
  
  return () => {
    window.removeEventListener('offline', handleOffline);
    window.removeEventListener('online', handleOnline);
  };
}, []);
```

---

## **Toast Message Guidelines**

### **Success Messages**
- ✅ "Profile updated successfully!"
- ✅ "Product created! It's now live."
- ✅ "Payment processed successfully!"
- ✅ "File uploaded! Processing complete."

### **Error Messages** 
- ❌ "Failed to save changes. Please try again."
- ❌ "Upload failed. File size must be under 10MB."
- ❌ "Payment failed. Please check your card details."
- ❌ "Network error. Check your connection."

### **Warning Messages**
- ⚠️ "Connection lost. Trying to reconnect..."
- ⚠️ "Session expiring in 5 minutes"
- ⚠️ "Unsaved changes will be lost"

### **Info Messages**
- ℹ️ "Feature coming soon!"
- ℹ️ "Copied to clipboard!"
- ℹ️ "Email verification sent. Check your inbox."

---

## **Performance Best Practices**

1. **Debounce search/filter loaders** (300ms delay)
2. **Use skeleton loaders** for predictable content
3. **Show progress bars** for operations >3 seconds
4. **Limit concurrent toasts** to 3-4 maximum
5. **Auto-dismiss success/info** (3-5 seconds)
6. **Persistent error toasts** until user dismisses
7. **Global network status** monitoring

---

## **Accessibility Considerations**

- **Screen reader announcements** for toast messages
- **Focus management** during loading states
- **Keyboard navigation** for toast dismiss
- **High contrast** indicators for loading states
- **Reduced motion** options for animations

---

This guide ensures your full-stack application provides **consistent, predictable feedback** for every user interaction. Each pattern has been tested across modern web applications and follows current UX best practices.
