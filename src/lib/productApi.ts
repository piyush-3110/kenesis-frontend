import { ExtendedProduct, Review, ReviewSummary, CourseAccess, CourseContent } from '@/types/Review';
import { Product } from '@/types/Product';

// Mock user ID for demonstration
const CURRENT_USER_ID = 'user-123';

// Mock reviews data
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const generateMockReviews = (_productId: string): Review[] => {
  const reviewsData = [
    {
      id: 'rev-1',
      userId: 'user-456',
      userName: 'Luciana',
      rating: 5,
      comment: 'I really enjoyed the course, but at some points I found it repetitive, with several topics on the same subject.',
      createdAt: '2025-04-20T00:00:00Z',
      likes: 12,
      likedByCurrentUser: false,
    },
    {
      id: 'rev-2',
      userId: 'user-789',
      userName: 'Romilda',
      rating: 5,
      comment: 'Very edifying course, very qualified and with all the technical specifications and tools used, and also how to acquire the material',
      createdAt: '2025-03-25T00:00:00Z',
      likes: 8,
      likedByCurrentUser: true,
    },
    {
      id: 'rev-3',
      userId: 'user-101',
      userName: 'Margarete',
      rating: 5,
      comment: 'Wonderful classes, very well explained, congratulations, gratitude 🙏',
      createdAt: '2025-03-11T00:00:00Z',
      likes: 15,
      likedByCurrentUser: false,
    },
    {
      id: 'rev-4',
      userId: 'user-102',
      userName: 'Luciana',
      rating: 3,
      comment: 'Good content but could be more comprehensive in some areas.',
      createdAt: '2025-02-24T00:00:00Z',
      likes: 3,
      likedByCurrentUser: false,
    },
    {
      id: 'rev-5',
      userId: 'user-103',
      userName: 'Sara',
      rating: 5,
      comment: 'Excellent course! Highly recommend to anyone looking to improve their skills.',
      createdAt: '2025-02-11T00:00:00Z',
      likes: 22,
      likedByCurrentUser: false,
    },
  ];

  return reviewsData;
};

const generateReviewSummary = (reviews: Review[]): ReviewSummary => {
  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let totalRating = 0;

  reviews.forEach(review => {
    ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    totalRating += review.rating;
  });

  return {
    averageRating: reviews.length > 0 ? totalRating / reviews.length : 0,
    totalReviews: reviews.length,
    ratingDistribution,
  };
};

const generateMockCourseContent = (productType: 'video' | 'document'): CourseContent[] => {
  if (productType === 'video') {
    return [
      {
        id: 'content-1',
        title: 'Introduction to Digital Marketing',
        type: 'video',
        duration: 1245, // 20:45
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        isCompleted: true,
        attachments: [
          {
            id: 'doc-1',
            title: 'Marketing Strategy Fundamentals PDF',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            type: 'pdf',
            size: '13 KB'
          },
          {
            id: 'doc-2',
            title: 'Digital Marketing Best Practices',
            url: 'https://developer.mozilla.org/en-US/docs/Web/Guide',
            type: 'doc',
            size: 'Web Page'
          },
          {
            id: 'doc-3',
            title: 'Marketing Tools & Resources',
            url: 'https://www.textfiles.com/computers/CUPDOCS/CUP2.TXT',
            type: 'txt',
            size: '2 KB'
          }
        ]
      },
      {
        id: 'content-2',
        title: 'Understanding Your Target Audience',
        type: 'video',
        duration: 1580, // 26:20
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        isCompleted: true,
        attachments: [
          {
            id: 'doc-4',
            title: 'Audience Research Template',
            url: 'https://react.dev/learn',
            type: 'doc',
            size: 'Web Page'
          },
          {
            id: 'doc-5',
            title: 'Demographics Analysis Guide',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            type: 'pdf',
            size: '13 KB'
          }
        ]
      },
      {
        id: 'content-3',
        title: 'Creating Engaging Content',
        type: 'video',
        duration: 1920, // 32:00
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        isCompleted: false,
        attachments: [
          {
            id: 'doc-6',
            title: 'Content Creation Checklist',
            url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
            type: 'doc',
            size: 'Web Page'
          }
        ]
      },
      {
        id: 'content-4',
        title: 'Social Media Marketing Strategies',
        type: 'video',
        duration: 2100, // 35:00
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        isCompleted: false,
        attachments: [
          {
            id: 'doc-7',
            title: 'Social Media Calendar Template',
            url: 'https://www.typescriptlang.org/docs/',
            type: 'doc',
            size: 'Web Page'
          },
          {
            id: 'doc-8',
            title: 'Platform-Specific Guidelines',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            type: 'pdf',
            size: '13 KB'
          },
          {
            id: 'doc-9',
            title: 'Engagement Metrics Reference',
            url: 'https://www.textfiles.com/computers/CUPDOCS/CUP2.TXT',
            type: 'txt',
            size: '2 KB'
          }
        ]
      },
      {
        id: 'content-5',
        title: 'Analytics and Performance Tracking',
        type: 'video',
        duration: 1680, // 28:00
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        isCompleted: false,
        // No attachments - to test videos without documents
      },
    ];
  } else {
    // Document-only course content
    return [
      {
        id: 'content-1',
        title: 'Digital Marketing Fundamentals Study Guide',
        type: 'document',
        documentUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
        isCompleted: true,
        attachments: [
          {
            id: 'guide-1',
            title: 'Complete Marketing Strategy Guide',
            url: 'https://developer.mozilla.org/en-US/docs/Web/Guide',
            type: 'doc',
            size: 'Web Page'
          },
          {
            id: 'guide-2',
            title: 'Marketing Fundamentals PDF',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            type: 'pdf',
            size: '13 KB'
          },
          {
            id: 'guide-3',
            title: 'Industry Best Practices',
            url: 'https://react.dev/learn',
            type: 'doc',
            size: 'Web Page'
          }
        ]
      },
      {
        id: 'content-2',
        title: 'Market Research Resources',
        type: 'document',
        documentUrl: 'https://file-examples.com/storage/fe6ad6e2b6e4a06b54b58b3/2017/10/file_example_PDF_1MB.pdf',
        isCompleted: false,
        attachments: [
          {
            id: 'research-1',
            title: 'Research Methodology Guide',
            url: 'https://www.typescriptlang.org/docs/',
            type: 'doc',
            size: 'Web Page'
          },
          {
            id: 'research-2',
            title: 'Survey Templates Collection',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            type: 'pdf',
            size: '13 KB'
          },
          {
            id: 'research-3',
            title: 'Data Analysis Tools List',
            url: 'https://www.textfiles.com/computers/CUPDOCS/CUP2.TXT',
            type: 'txt',
            size: '2 KB'
          }
        ]
      },
      {
        id: 'content-3',
        title: 'Content Creation Templates',
        type: 'document',
        documentUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/intro',
        isCompleted: false,
        attachments: [
          {
            id: 'template-1',
            title: 'Blog Post Templates',
            url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
            type: 'doc',
            size: 'Web Page'
          },
          {
            id: 'template-2',
            title: 'Social Media Content Calendar',
            url: 'https://react.dev/reference/react',
            type: 'doc',
            size: 'Web Page'
          }
        ]
      },
      {
        id: 'content-4',
        title: 'Analytics & Reporting Resources',
        type: 'document',
        documentUrl: 'https://www.textfiles.com/computers/CUPDOCS/CUP2.TXT',
        isCompleted: false,
        attachments: [
          {
            id: 'analytics-1',
            title: 'KPI Tracking Spreadsheet Template',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            type: 'pdf',
            size: '13 KB'
          },
          {
            id: 'analytics-2',
            title: 'Google Analytics Setup Guide',
            url: 'https://developer.mozilla.org/en-US/docs/Web/Guide',
            type: 'doc',
            size: 'Web Page'
          },
          {
            id: 'analytics-3',
            title: 'Monthly Report Template',
            url: 'https://www.textfiles.com/computers/CUPDOCS/CUP2.TXT',
            type: 'txt',
            size: '2 KB'
          }
        ]
      },
      {
        id: 'content-5',
        title: 'Industry Case Studies',
        type: 'document',
        documentUrl: 'https://calibre-ebook.com/downloads/demos/demo.docx',
        isCompleted: false,
        attachments: [
          {
            id: 'case-1',
            title: 'Successful Campaign Analysis',
            url: 'https://www.w3.org/TR/html52/',
            type: 'doc',
            size: 'Web Page'
          },
          {
            id: 'case-2',
            title: 'ROI Case Study Collection',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            type: 'pdf',
            size: '13 KB'
          }
        ]
      }
    ];
  }
};

/**
 * Fetch extended product data with reviews and access information
 */
export async function fetchExtendedProduct(productId: string): Promise<ExtendedProduct | null> {
  console.log('🔍 Fetching extended product from backend:', productId);

  try {
    // Use the real backend API
    const { fetchProduct } = await import('@/lib/marketplaceApiReal');
    const product = await fetchProduct(productId);
    
    if (!product) {
      console.error('❌ Product not found in backend:', productId);
      return null;
    }

    console.log('✅ Successfully fetched product from backend:', product.title);
    return createExtendedProduct(product);

  } catch (error) {
    console.error('💥 Error fetching extended product from backend:', error);
    
    // Fallback to mock data for development
    console.log('🔄 Falling back to mock data for product:', productId);
    try {
      const mockProducts = await import('@/lib/marketplaceApiReal').then(m => m.fetchProducts());
      const product = mockProducts.data.find(p => p.id === productId);
      if (!product) return null;
      
      return createExtendedProduct(product);
    } catch (fallbackError) {
      console.error('💥 Fallback also failed:', fallbackError);
      return null;
    }
  }
}

function createExtendedProduct(product: Product): ExtendedProduct {
  const reviews = generateMockReviews(product.id);
  const reviewSummary = generateReviewSummary(reviews);
  
  // Use the actual product purchase data instead of hardcoded values
  const hasAccess = product.isPurchased || false;
  
  const courseAccess: CourseAccess = {
    hasAccess,
    purchaseDate: hasAccess && product.purchaseDate ? product.purchaseDate : undefined,
    progress: hasAccess ? 40 : undefined,
    lastWatched: hasAccess ? '2025-01-10T00:00:00Z' : undefined,
  };

  const content = hasAccess ? generateMockCourseContent(product.type) : undefined;

  // Generate a mock list of purchasers for UI display
  const purchasedBy = hasAccess ? [CURRENT_USER_ID] : [];

  return {
    ...product,
    reviews,
    reviewSummary,
    courseAccess,
    content,
    purchasedBy,
  };
}

/**
 * Submit a new review
 */
export async function submitReview(_productId: string, rating: number, comment: string): Promise<Review> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock response
  const newReview: Review = {
    id: `rev-${Date.now()}`,
    userId: CURRENT_USER_ID,
    userName: 'You',
    rating,
    comment,
    createdAt: new Date().toISOString(),
    likes: 0,
    likedByCurrentUser: false,
  };

  return newReview;
}

/**
 * Like/unlike a review
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function toggleReviewLike(_reviewId: string): Promise<{ liked: boolean; likes: number }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Mock response
  return {
    liked: Math.random() > 0.5, // Random for demo
    likes: Math.floor(Math.random() * 20) + 1,
  };
}

/**
 * Mark course content as complete
 */
export async function markContentComplete(productId: string, contentId: string): Promise<boolean> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  console.log(`Marking content ${contentId} as complete for product ${productId}`);
  return true;
}

/**
 * Purchase a course
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function purchaseCourse(_productId: string): Promise<{ success: boolean; message: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock successful purchase
  return {
    success: true,
    message: 'Course purchased successfully! You now have access to all content.',
  };
}
