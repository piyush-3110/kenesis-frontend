# Debug Course Access Issues

## Enhanced Logging Added

I've added comprehensive logging to help debug the course access denied issue you're experiencing with purchased courses. The logging covers:

### 1. Learn Page (`/app/learn/[id]/page.tsx`)
- User authentication state
- Token presence and preview
- API request/response details
- Error categorization (401, 403, 404, 5xx)

### 2. Course API (`/lib/api/courseApi.ts`)
- Course access check request details
- API response parsing
- Return value validation

### 3. API Client (`/lib/api/client.ts`)
- HTTP request construction
- Headers and authentication
- Response status and data
- Error handling and token refresh

## How to Debug

### Step 1: Open Browser Developer Tools
1. Go to a purchased course that's giving you "Access Denied"
2. Open Developer Tools (F12 or Ctrl+Shift+I)
3. Go to the **Console** tab
4. Clear the console (Ctrl+L)
5. Refresh the page

### Step 2: Look for These Log Patterns

#### Expected Flow (Working):
```
🔐 [LEARN] ============= STARTING ACCESS CHECK =============
🔐 [LEARN] Course ID: [course-id]
🔐 [LEARN] Token present: true
🌐 [API-CLIENT] ============= MAKING REQUEST =============
🌐 [API-CLIENT] Endpoint: /api/courses/purchases/access/[course-id]
🌐 [API-CLIENT] Access token present: true
🔐 [COURSE-API] ============= CHECKING COURSE ACCESS =============
🌐 [API-CLIENT] ============= SUCCESS RESPONSE =============
🔐 [COURSE-API] Has Access: true
✅ [LEARN] ============= ACCESS GRANTED =============
```

#### Problem Scenarios:

**No Token:**
```
🔐 [LEARN] Token present: false
🔐 [LEARN] No authentication token found!
```

**Expired Token:**
```
🌐 [API-CLIENT] Error status: 401
🔄 [API-CLIENT] Detected token expiration, attempting refresh...
```

**Access Denied (Not Purchased):**
```
🔐 [COURSE-API] Has Access: false
🚫 [LEARN] ============= ACCESS DENIED =============
```

**API Error:**
```
🌐 [API-CLIENT] ============= REQUEST FAILED =============
🌐 [API-CLIENT] Error status: [status-code]
```

### Step 3: Check Specific Issues

#### Issue 1: Token Missing
**Look for:** `Token present: false`
**Solution:** Re-login to get new token

#### Issue 2: Token Expired
**Look for:** `Error status: 401` or `Token refresh failed`
**Solution:** Clear localStorage/sessionStorage and re-login

#### Issue 3: API Endpoint Changed
**Look for:** `Error status: 404`
**Solution:** Check if backend API endpoint changed

#### Issue 4: Server Error
**Look for:** `Error status: 5xx`
**Solution:** Backend issue, try again later

#### Issue 5: Course Not Purchased
**Look for:** `Has Access: false` with status 200
**Solution:** Verify purchase in database

### Step 4: Share Debug Info

If you still have issues, share these details:

1. **Console Logs:** Copy all logs starting with 🔐, 🌐, or ✅
2. **Network Tab:** Check if the API request appears and what status it returns
3. **Application Tab:** Check localStorage/sessionStorage for `token` and `user`
4. **Course ID:** Which specific course is failing
5. **User Account:** Which user account is experiencing the issue

### Quick Checks

#### Verify Token Storage
In Console, run:
```javascript
console.log('Token:', localStorage.getItem('token') || sessionStorage.getItem('token'));
console.log('User:', localStorage.getItem('user') || sessionStorage.getItem('user'));
```

#### Test API Directly
In Console, run:
```javascript
fetch('/api/courses/purchases/access/[COURSE-ID]', {
  headers: {
    'Authorization': 'Bearer ' + (localStorage.getItem('token') || sessionStorage.getItem('token')),
    'Content-Type': 'application/json'
  }
}).then(r => r.json()).then(console.log);
```

### Common Fixes

1. **Clear Storage:** `localStorage.clear(); sessionStorage.clear();` then re-login
2. **Hard Refresh:** Ctrl+F5 or Cmd+Shift+R
3. **Incognito Mode:** Test in private/incognito window
4. **Different Browser:** Test in different browser

## Changes Made

### Enhanced Logging Files:
- `/app/learn/[id]/page.tsx` - Main course access logic
- `/lib/api/courseApi.ts` - Course access API wrapper
- `/lib/api/client.ts` - HTTP client with auth

### Log Categories:
- 🔐 Authentication & Authorization
- 🌐 HTTP Requests & Responses  
- ✅ Success States
- ❌ Error States
- 🔄 Token Refresh

The logging is very detailed so you should be able to pinpoint exactly where the issue is occurring.
