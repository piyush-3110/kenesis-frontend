/**
 * Debug Script for Course Access Issue
 * This script will test the course access API endpoints to diagnose the "access denied" issue
 */

const { TokenManager } = require('./src/features/auth/tokenManager.ts');

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://kenesis-backend.onrender.com";

// Helper function to get headers with authentication
function getHeaders() {
  const token = localStorage.getItem('kenesis:accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

async function testAPI(endpoint, method = 'GET', body = null) {
  try {
    console.log(`\n🔍 Testing: ${method} ${endpoint}`);
    
    const options = {
      method,
      headers: getHeaders(),
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📄 Response:`, JSON.stringify(data, null, 2));
    
    return { response, data };
  } catch (error) {
    console.error(`❌ Error testing ${endpoint}:`, error);
    return { error };
  }
}

async function debugCourseAccess() {
  console.log('🚀 Starting Course Access Debug...\n');
  
  // Check if user is authenticated
  const token = localStorage.getItem('kenesis:accessToken');
  if (!token) {
    console.error('❌ No access token found. User needs to be logged in.');
    return;
  }
  
  console.log('✅ Access token found');
  
  // 1. Test user profile to ensure authentication works
  console.log('\n=== 1. Testing User Authentication ===');
  await testAPI('/api/users/profile');
  
  // 2. Test getting user's purchases
  console.log('\n=== 2. Testing User Purchases ===');
  await testAPI('/api/courses/purchases/my-purchases?limit=10');
  
  // 3. Test getting published courses (to find a course ID)
  console.log('\n=== 3. Testing Published Courses ===');
  const { data: coursesData } = await testAPI('/api/courses?limit=5');
  
  if (coursesData && coursesData.success && coursesData.data && coursesData.data.courses && coursesData.data.courses.length > 0) {
    const testCourseId = coursesData.data.courses[0].id;
    console.log(`\n📝 Using test course ID: ${testCourseId}`);
    
    // 4. Test course access check for a specific course
    console.log('\n=== 4. Testing Course Access Check ===');
    await testAPI(`/api/courses/purchases/access/${testCourseId}`);
    
    // 5. Test getting course details
    console.log('\n=== 5. Testing Course Details ===');
    await testAPI(`/api/courses/${testCourseId}`);
    
    // 6. Test getting course chapters
    console.log('\n=== 6. Testing Course Chapters ===');
    await testAPI(`/api/courses/${testCourseId}/chapters?includeModules=true`);
  } else {
    console.log('⚠️ No courses found to test with');
  }
  
  console.log('\n✅ Debug complete!');
}

// Function to test with a specific course ID
async function testSpecificCourse(courseId) {
  console.log(`\n🎯 Testing specific course: ${courseId}`);
  
  console.log('\n=== Access Check ===');
  await testAPI(`/api/courses/purchases/access/${courseId}`);
  
  console.log('\n=== Course Details ===');
  await testAPI(`/api/courses/${courseId}`);
  
  console.log('\n=== Course Chapters ===');
  await testAPI(`/api/courses/${courseId}/chapters?includeModules=true`);
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.debugCourseAccess = debugCourseAccess;
  window.testSpecificCourse = testSpecificCourse;
  window.testAPI = testAPI;
  
  console.log('🔧 Debug functions loaded! Run debugCourseAccess() in console to start debugging.');
}

module.exports = { debugCourseAccess, testSpecificCourse, testAPI };
