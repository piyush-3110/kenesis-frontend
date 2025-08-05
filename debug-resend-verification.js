/**
 * Debug script to test resend verification API call
 * This will help us see exactly what's being sent vs what Postman sends
 */

// Test function to debug resend verification
async function debugResendVerification(email) {
  console.log('🔍 Testing resend verification with email:', email);
  
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://kenesis-backend.onrender.com';
  const url = `${baseUrl}/api/auth/resend-verification`;
  
  console.log('📡 Request URL:', url);
  console.log('📤 Request body:', JSON.stringify({ email }));
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    console.log('📋 Response status:', response.status);
    console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📄 Raw response:', responseText);
    
    try {
      const responseJson = JSON.parse(responseText);
      console.log('✅ Parsed response:', responseJson);
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError);
    }
    
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.debugResendVerification = debugResendVerification;
  console.log('🚀 Debug function loaded. Use: debugResendVerification("your-email@example.com")');
}

export { debugResendVerification };
