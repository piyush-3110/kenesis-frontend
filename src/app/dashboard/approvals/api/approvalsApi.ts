/**
 * Course Approvals API Service
 * 
 * Implements the Get Pending Reviews API endpoint as per detailed documentation:
 * - Endpoint: GET /api/courses/approvals/pending
 * - Access Level: Admin only
 * - Rate Limit: 100 requests per 15 minutes
 * - Authentication: Bearer JWT token with admin role
 * 
 * Features:
 * - Advanced filtering by course type (video/document)
 * - Pagination with configurable page size (1-100 items)
 * - Multi-field sorting (createdAt, updatedAt, title)
 * - Comprehensive response with pagination metadata, filters, and summary
 * - Parameter validation per API specifications
 * - Detailed console logging for debugging
 * - Normalized response structure for frontend compatibility
 * 
 * @see API Documentation: Get Pending Reviews API - Detailed Documentation
 */

import { http } from "@/lib/http/axios";
import type { ApiEnvelope } from "@/features/auth/types";

// Types for Course Approvals
export interface CourseInstructor {
  _id?: string;
  id?: string;
  username: string;
  email?: string;
}

export interface CourseModule {
  _id: string;
  title: string;
  contentType: 'video' | 'document';
  duration?: number;
}

export interface CourseChapter {
  _id: string;
  title: string;
  modules: CourseModule[];
}

export interface CourseForReview {
  _id?: string; // MongoDB ObjectId (for backward compatibility)
  id?: string;  // API might use either _id or id
  title: string;
  type: 'video' | 'document';
  shortDescription: string;
  description?: string;
  thumbnail?: string;
  instructor: CourseInstructor;
  chapters?: CourseChapter[];
  price?: number;
  accessDuration?: number;
  status?: string;
  createdAt: string;
  updatedAt: string;
  latestHistoryEntry?: {
    status: string;
    timestamp: string;
    adminId?: string | null;
    message: string;
    metadata?: {
      submissionCount?: number;
      previousStatus?: string;
    };
  };
}

// Updated interface to handle the actual API response structure
export interface PendingReviewItem {
  id: string; // Pending review ID
  course: CourseForReview; // Nested course data
  status: 'pending' | 'in_review' | 'submitted';
  submittedAt: string;
  daysPending: number;
}

export interface AdminReview {
  _id: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewNotes: string;
}

export interface CourseReviewHistory {
  status: string;
  timestamp: string;
  message: string;
}

export interface PendingReviewsApiResponse {
  courses?: (CourseForReview | PendingReviewItem)[];  // Can be either direct course or nested structure
  results?: (CourseForReview | PendingReviewItem)[];   // Alternative field name
  data?: (CourseForReview | PendingReviewItem)[];      // Another alternative
  reviews?: CourseForReview[];  // Backup field name for compatibility
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit?: number;
    skip?: number;
    itemsPerPage?: number;  // Alternative field name
  };
  filters?: {
    sortBy: string;
    order: string;
    type?: string | null;
  };
  summary?: {
    totalPendingCourses: number;
    videoCoursesCount?: number;
    documentCoursesCount?: number;
    oldestSubmission?: string;
    newestSubmission?: string;
    lastUpdated?: string;
    avgSubmissionAge?: number;
  };
  timestamp?: string;
  message?: string;
}

export interface PendingReviewsResponse {
  courses: (CourseForReview | PendingReviewItem)[];  // Can handle both structures
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
    skip?: number;
  };
  filters: {
    sortBy: string;
    order: string;
    type?: string | null;
  };
  summary?: {
    totalPendingCourses: number;
    videoCoursesCount?: number;
    documentCoursesCount?: number;
    oldestSubmission?: string;
    newestSubmission?: string;
    lastUpdated?: string;
    avgSubmissionAge?: number;
  };
  timestamp?: string;
  message?: string;
}

export interface CourseReviewDetailsResponse {
  course: CourseForReview;
  adminReview: AdminReview;
  history: CourseReviewHistory[];
}

export interface ReviewStatsResponse {
  overview: {
    totalPending: number;
    totalInReview: number;
    totalApproved: number;
    totalRejected: number;
  };
  averageReviewTimeHours: number;
  recentActivity: Array<{
    id: string;
    courseTitle: string;
    action: string;
    adminEmail: string;
    timestamp: string;
    daysAgo: number;
  }>;
  pendingBreakdown: {
    lessThan24h: number;
    oneToThreeDays: number;
    threeTosevenDays: number;
    moreThanSevenDays: number;
  };
}

export interface PendingReviewsFilters {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  order?: 'asc' | 'desc';
  type?: 'video' | 'document';
}

export interface CourseApprovalData {
  message: string;
  reviewNotes: string;
}

export interface CourseRejectionData {
  reason: string;
  reviewNotes: string;
}

export interface CourseNotesData {
  reviewNotes: string;
}

/**
 * Get all courses waiting for admin review
 * Supports pagination, filtering, and sorting as per API documentation
 * 
 * Endpoint: GET /api/courses/approvals/pending
 * Rate Limit: 100 requests per 15 minutes
 * Access Level: Admin only
 * 
 * @param filters - Filtering and pagination options
 * @returns Promise<PendingReviewsResponse> - Normalized response structure
 */
export const getPendingReviews = async (filters: PendingReviewsFilters = {}): Promise<PendingReviewsResponse> => {
  console.log('🔄 API Request: Getting pending reviews with filters:', filters);
  
  // Validate parameters according to documentation requirements
  // Page validation: Must be positive integer between 1-100
  const page = filters.page && filters.page >= 1 && filters.page <= 100 ? filters.page : 1;
  
  // Limit validation: Must be positive integer between 1-100
  const limit = filters.limit && filters.limit >= 1 && filters.limit <= 100 ? filters.limit : 10;
  
  // SortBy validation: Must be one of allowed fields
  const allowedSortFields = ['createdAt', 'updatedAt', 'title'] as const;
  const sortBy = filters.sortBy && allowedSortFields.includes(filters.sortBy) ? filters.sortBy : 'createdAt';
  
  // Order validation: Must be either "asc" or "desc"
  const allowedSortOrders = ['asc', 'desc'] as const;
  const order = filters.order && allowedSortOrders.includes(filters.order) ? filters.order : 'asc';
  
  // Type validation: Must be either "video" or "document" if provided
  const allowedTypes = ['video', 'document'] as const;
  const type = filters.type && allowedTypes.includes(filters.type) ? filters.type : undefined;

  const validatedFilters = {
    page,
    limit,
    sortBy,
    order,
    ...(type && { type })
  };

  console.log('🔍 Validated filters (per API documentation):', validatedFilters);
  
  // Build query parameters
  const params = new URLSearchParams();
  params.append('page', validatedFilters.page.toString());
  params.append('limit', validatedFilters.limit.toString());
  params.append('sortBy', validatedFilters.sortBy);
  params.append('order', validatedFilters.order);
  if (validatedFilters.type) {
    params.append('type', validatedFilters.type);
  }

  const requestUrl = `/api/courses/approvals/pending?${params}`;
  console.log('🌐 Request URL:', requestUrl);
  console.log('📋 Request parameters breakdown:', {
    page: validatedFilters.page,
    limit: validatedFilters.limit,
    sortBy: validatedFilters.sortBy,
    order: validatedFilters.order,
    type: validatedFilters.type || 'not specified'
  });

  try {
    const response = await http.get<ApiEnvelope<PendingReviewsApiResponse>>(
      `/api/courses/approvals/pending?${params}`
    );
    
    console.log('✅ API Response: Raw response received:', response);
    console.log('✅ API Response: Response status:', response.status);
    console.log('✅ API Response: Response data:', response.data);
    
    if (!response.data) {
      console.error('❌ API Error: No response data received');
      throw new Error('No response data received from server');
    }
    
    if (!response.data.success) {
      console.error('❌ API Error: Request failed:', response.data.message);
      throw new Error(response.data.message || 'Failed to get pending reviews');
    }
    
    if (!response.data.data) {
      console.error('❌ API Error: No data field in successful response');
      throw new Error('No data field in response');
    }
    
    console.log('✅ API Response: Pending reviews data structure:', response.data.data);
    console.log('🔍 Debug: Checking response.data.data keys:', Object.keys(response.data.data));
    
    // Validate and normalize the response structure
    const data = response.data.data;
    
    // Support both 'courses' and 'reviews' field names for compatibility
    const coursesArray = data.courses || data.reviews;
    console.log('🔍 Debug: coursesArray found:', !!coursesArray, 'length:', coursesArray?.length);
    
    if (!coursesArray || !Array.isArray(coursesArray)) {
      console.error('❌ API Error: Invalid courses/reviews data structure:', data);
      console.error('❌ API Error: Available keys:', Object.keys(data));
      throw new Error('Invalid response: courses/reviews field is missing or not an array');
    }
    
    if (!data.pagination) {
      console.error('❌ API Error: Missing pagination data:', data);
      throw new Error('Invalid response: pagination field is missing');
    }
    
    // Normalize the response structure according to documentation
    const normalizedResponse: PendingReviewsResponse = {
      courses: coursesArray,
      pagination: {
        currentPage: data.pagination.currentPage,
        totalPages: data.pagination.totalPages,
        totalItems: data.pagination.totalItems,
        hasNextPage: data.pagination.hasNextPage,
        hasPrevPage: data.pagination.hasPrevPage,
        limit: data.pagination.limit || data.pagination.itemsPerPage || validatedFilters.limit,
        ...(data.pagination.skip !== undefined && { skip: data.pagination.skip }),
      },
      filters: {
        sortBy: (data.filters?.sortBy || validatedFilters.sortBy) as string,
        order: (data.filters?.order || validatedFilters.order) as string,
        type: data.filters?.type || (validatedFilters as any).type || null,
      },
      ...(data.summary && { 
        summary: {
          ...data.summary,
          // Include all documented summary fields
          ...(data.summary.lastUpdated && { lastUpdated: data.summary.lastUpdated }),
          ...(data.summary.avgSubmissionAge !== undefined && { avgSubmissionAge: data.summary.avgSubmissionAge }),
        }
      }),
      ...(data.timestamp && { timestamp: data.timestamp }),
      ...(data.message && { message: data.message }),
    };
    
    console.log('✅ API Response: Normalized pending reviews:', normalizedResponse);
    console.log('📊 Summary: Found', normalizedResponse.courses.length, 'courses on page', 
                normalizedResponse.pagination.currentPage, 'of', normalizedResponse.pagination.totalPages);
    
    if (normalizedResponse.summary) {
      console.log('📈 Summary details:', {
        totalPending: normalizedResponse.summary.totalPendingCourses,
        videoCourses: normalizedResponse.summary.videoCoursesCount,
        documentCourses: normalizedResponse.summary.documentCoursesCount,
        oldestSubmission: normalizedResponse.summary.oldestSubmission,
        newestSubmission: normalizedResponse.summary.newestSubmission,
        lastUpdated: normalizedResponse.summary.lastUpdated,
        avgSubmissionAge: normalizedResponse.summary.avgSubmissionAge
      });
    }
    
    if (normalizedResponse.timestamp) {
      console.log('⏰ Response timestamp:', normalizedResponse.timestamp);
    }
    
    if (normalizedResponse.message) {
      console.log('💬 API message:', normalizedResponse.message);
    }
    
    return normalizedResponse;
  } catch (error) {
    console.error('❌ API Error: Failed to get pending reviews:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while fetching pending reviews');
  }
};

/**
 * Get detailed information about a specific course for review
 */
export const getCourseReview = async (courseId: string): Promise<CourseReviewDetailsResponse> => {
  console.log('🔄 API Request: Getting course review details for:', courseId);
  
  try {
    const response = await http.get<ApiEnvelope<CourseReviewDetailsResponse>>(
      `/api/courses/approvals/${courseId}`
    );
    
    console.log('✅ API Response: Course review details retrieved:', response.data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get course review details');
    }
    
    return response.data.data!;
  } catch (error) {
    console.error('❌ API Error: Failed to get course review details:', error);
    throw error;
  }
};

/**
 * Approve a course for publication
 */
export const approveCourse = async (courseId: string, approvalData: CourseApprovalData) => {
  console.log('🔄 API Request: Approving course:', courseId, 'with data:', approvalData);
  
  try {
    const response = await http.post<ApiEnvelope<any>>(
      `/api/courses/approvals/${courseId}/approve`,
      approvalData
    );
    
    console.log('✅ API Response: Course approved successfully:', response.data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to approve course');
    }
    
    return response.data.data!;
  } catch (error) {
    console.error('❌ API Error: Failed to approve course:', error);
    throw error;
  }
};

/**
 * Reject a course with feedback
 */
export const rejectCourse = async (courseId: string, rejectionData: CourseRejectionData) => {
  console.log('🔄 API Request: Rejecting course:', courseId, 'with data:', rejectionData);
  
  try {
    const response = await http.post<ApiEnvelope<any>>(
      `/api/courses/approvals/${courseId}/reject`,
      rejectionData
    );
    
    console.log('✅ API Response: Course rejected successfully:', response.data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to reject course');
    }
    
    return response.data.data!;
  } catch (error) {
    console.error('❌ API Error: Failed to reject course:', error);
    throw error;
  }
};

/**
 * Update review notes for a course
 */
export const updateReviewNotes = async (courseId: string, notesData: CourseNotesData) => {
  console.log('🔄 API Request: Updating review notes for course:', courseId, 'with data:', notesData);
  
  try {
    const response = await http.post<ApiEnvelope<any>>(
      `/api/courses/approvals/course/${courseId}/notes`,
      notesData
    );
    
    console.log('✅ API Response: Review notes updated successfully:', response.data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update review notes');
    }
    
    return response.data.data!;
  } catch (error) {
    console.error('❌ API Error: Failed to update review notes:', error);
    throw error;
  }
};

/**
 * Get review statistics for admin dashboard
 */
export const getReviewStats = async (): Promise<ReviewStatsResponse> => {
  console.log('🔄 API Request: Getting review statistics');
  
  try {
    const response = await http.get<ApiEnvelope<ReviewStatsResponse>>(
      '/api/courses/approvals/stats'
    );
    
    console.log('✅ API Response: Review statistics retrieved:', response.data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get review statistics');
    }
    
    return response.data.data!;
  } catch (error) {
    console.error('❌ API Error: Failed to get review statistics:', error);
    throw error;
  }
};
