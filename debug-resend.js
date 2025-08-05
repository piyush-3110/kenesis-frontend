// Debug test for resend verification API
// This file is for debugging purposes only

const API_BASE_URL = 'https://kenesis-backend.onrender.com';

async function testResendVerification(email) {
  try {
    console.log('Testing resend verification for email:', email);
    console.log('API Base URL:', API_BASE_URL);
    
    const response = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    const data = await response.json();
    console.log('Response data:', data);
    
    return data;
  } catch (error) {
    console.error('Error in testResendVerification:', error);
    throw error;
  }
}

// Test with a sample email (replace with a real email for testing)
// testResendVerification('test@example.com');

console.log('Debug script loaded. Call testResendVerification("your-email@example.com") to test');
