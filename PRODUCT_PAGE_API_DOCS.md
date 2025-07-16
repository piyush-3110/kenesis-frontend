# Single Product Page API Documentation

This document outlines the API requirements for the single product page functionality, including product details, reviews, course content, and user access management.

## Overview

The single product page requires several API endpoints to provide a complete user experience including product information, reviews and ratings, course content access, and purchase functionality.

---

## 1. Get Extended Product Details

**Endpoint:** `GET /api/products/{productId}`

**Description:** Fetches comprehensive product information including basic details, reviews, user access status, and course content.

### Request Parameters
- **productId** (path parameter, required): Unique identifier for the product

### Request Headers
- **Authorization**: Bearer token for user authentication (required for access status)

### Response Format

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "author": "string",
  "price": "number",
  "currency": "string",
  "rating": "number",
  "totalRatings": "number",
  "image": "string (URL)",
  "category": "string",
  "type": "video | document",
  "createdAt": "string (ISO date)",
  "reviews": [
    {
      "id": "string",
      "userId": "string",
      "userName": "string",
      "userAvatar": "string (URL, optional)",
      "rating": "number (1-5)",
      "comment": "string",
      "createdAt": "string (ISO date)",
      "likes": "number",
      "likedByCurrentUser": "boolean"
    }
  ],
  "reviewSummary": {
    "averageRating": "number",
    "totalReviews": "number",
    "ratingDistribution": {
      "5": "number",
      "4": "number",
      "3": "number",
      "2": "number",
      "1": "number"
    }
  },
  "courseAccess": {
    "hasAccess": "boolean",
    "purchaseDate": "string (ISO date, optional)",
    "progress": "number (0-100, optional)",
    "lastWatched": "string (ISO date, optional)"
  },
  "content": [
    {
      "id": "string",
      "title": "string",
      "type": "video | document",
      "duration": "number (seconds, for videos only)",
      "videoUrl": "string (URL, for videos)",
      "documentUrl": "string (URL, for documents)",
      "isCompleted": "boolean",
      "attachments": [
        {
          "id": "string",
          "title": "string",
          "url": "string (URL)",
          "type": "pdf | doc | docx | ppt | pptx | txt | xlsx | other",
          "size": "string (optional, e.g., '2.1 MB')",
          "description": "string (optional)"
        }
      ]
    }
  ],
  "purchasedBy": ["string (array of user IDs)"]
}
```

### Response Codes
- **200**: Success
- **404**: Product not found
- **401**: Unauthorized (invalid or missing token)
- **500**: Server error

### Notes
- `content` array should only be populated if `courseAccess.hasAccess` is true
- `likedByCurrentUser` should be calculated based on the authenticated user
- `isCompleted` in content should reflect the user's progress
- `purchasedBy` is used to determine access and show student count

---

## 2. Submit Product Review

**Endpoint:** `POST /api/products/{productId}/reviews`

**Description:** Allows authenticated users who have purchased the course to submit a review.

### Request Parameters
- **productId** (path parameter, required): Unique identifier for the product

### Request Headers
- **Authorization**: Bearer token for user authentication (required)
- **Content-Type**: application/json

### Request Body
```json
{
  "rating": "number (1-5, required)",
  "comment": "string (required, min 10 characters)"
}
```

### Response Format
```json
{
  "id": "string",
  "userId": "string",
  "userName": "string",
  "userAvatar": "string (URL, optional)",
  "rating": "number",
  "comment": "string",
  "createdAt": "string (ISO date)",
  "likes": "number (default: 0)",
  "likedByCurrentUser": "boolean (default: false)"
}
```

### Response Codes
- **201**: Review created successfully
- **400**: Invalid input (rating out of range, comment too short)
- **401**: Unauthorized
- **403**: User hasn't purchased the course
- **409**: User has already reviewed this product
- **500**: Server error

### Validation Rules
- User must have purchased the course (`courseAccess.hasAccess` = true)
- Rating must be between 1 and 5
- Comment must be at least 10 characters long
- One review per user per product

---

## 3. Toggle Review Like

**Endpoint:** `POST /api/reviews/{reviewId}/like`

**Description:** Allows authenticated users to like or unlike a review.

### Request Parameters
- **reviewId** (path parameter, required): Unique identifier for the review

### Request Headers
- **Authorization**: Bearer token for user authentication (required)

### Request Body
```json
{
  "action": "like | unlike"
}
```

### Response Format
```json
{
  "liked": "boolean",
  "likes": "number",
  "message": "string"
}
```

### Response Codes
- **200**: Success
- **401**: Unauthorized
- **404**: Review not found
- **500**: Server error

### Business Logic
- If user hasn't liked the review: add like, increment count
- If user has already liked the review: remove like, decrement count
- Users can like/unlike any review (not restricted to course owners)

---

## 4. Mark Course Content Complete

**Endpoint:** `POST /api/products/{productId}/content/{contentId}/complete`

**Description:** Marks a specific piece of course content as completed by the user.

### Request Parameters
- **productId** (path parameter, required): Unique identifier for the product
- **contentId** (path parameter, required): Unique identifier for the content item

### Request Headers
- **Authorization**: Bearer token for user authentication (required)

### Request Body
```json
{
  "completedAt": "string (ISO date, optional - defaults to current time)"
}
```

### Response Format
```json
{
  "success": "boolean",
  "message": "string",
  "progress": "number (updated course progress percentage)"
}
```

### Response Codes
- **200**: Content marked as complete
- **401**: Unauthorized
- **403**: User doesn't have access to this course
- **404**: Product or content not found
- **500**: Server error

### Business Logic
- User must have purchased the course
- Progress percentage should be recalculated based on completed content
- Should update `lastWatched` timestamp for the course

---

## 5. Purchase Course

**Endpoint:** `POST /api/products/{productId}/purchase`

**Description:** Handles course purchase and grants user access to course content.

### Request Parameters
- **productId** (path parameter, required): Unique identifier for the product

### Request Headers
- **Authorization**: Bearer token for user authentication (required)
- **Content-Type**: application/json

### Request Body
```json
{
  "paymentMethod": "string (credit_card | paypal | crypto)",
  "paymentDetails": {
    "token": "string (payment gateway token)",
    "amount": "number",
    "currency": "string"
  }
}
```

### Response Format
```json
{
  "success": "boolean",
  "message": "string",
  "transactionId": "string",
  "accessGranted": "boolean",
  "purchaseDate": "string (ISO date)"
}
```

### Response Codes
- **200**: Purchase successful
- **400**: Invalid payment details or amount mismatch
- **401**: Unauthorized
- **402**: Payment failed
- **409**: User already owns this course
- **500**: Server error

### Business Logic
- Verify payment amount matches product price
- Process payment through appropriate gateway
- Add user to `purchasedBy` array
- Grant course access (`courseAccess.hasAccess` = true)
- Initialize progress at 0%
- Send confirmation email to user

---

## 6. Get Course Content Details

**Endpoint:** `GET /api/products/{productId}/content/{contentId}`

**Description:** Retrieves detailed information for a specific piece of course content (for authenticated users who own the course).

### Request Parameters
- **productId** (path parameter, required): Unique identifier for the product
- **contentId** (path parameter, required): Unique identifier for the content

### Request Headers
- **Authorization**: Bearer token for user authentication (required)

### Response Format
```json
{
  "id": "string",
  "title": "string",
  "type": "video | document",
  "duration": "number (seconds, for videos)",
  "videoUrl": "string (signed URL for videos)",
  "documentUrl": "string (signed URL for documents)",
  "description": "string (optional)",
  "isCompleted": "boolean",
  "completedAt": "string (ISO date, if completed)",
  "transcript": "string (for videos, optional)",
  "downloadAllowed": "boolean",
  "attachments": [
    {
      "id": "string",
      "title": "string",
      "url": "string (signed URL)",
      "type": "pdf | doc | docx | ppt | pptx | txt | xlsx | other",
      "size": "string (optional)",
      "description": "string (optional)",
      "downloadAllowed": "boolean"
    }
  ]
}
```

### Response Codes
- **200**: Success
- **401**: Unauthorized
- **403**: User doesn't have access to this course
- **404**: Product or content not found
- **500**: Server error

### Security Notes
- Video and document URLs should be signed/temporary URLs with expiration
- URLs should be generated per request to prevent sharing
- Consider implementing download restrictions if needed

---

## 7. Get Document Attachment

**Endpoint:** `GET /api/attachments/{attachmentId}`

**Description:** Retrieves a specific document attachment with a signed URL for viewing or downloading.

### Request Parameters
- **attachmentId** (path parameter, required): Unique identifier for the attachment

### Request Headers
- **Authorization**: Bearer token for user authentication (required)

### Response Format
```json
{
  "id": "string",
  "title": "string",
  "url": "string (signed URL for viewing/downloading)",
  "type": "pdf | doc | docx | ppt | pptx | txt | xlsx | other",
  "size": "string",
  "description": "string (optional)",
  "downloadAllowed": "boolean",
  "viewerUrl": "string (optional, URL for in-browser viewing)",
  "expiresAt": "string (ISO date, URL expiration time)"
}
```

### Response Codes
- **200**: Success
- **401**: Unauthorized
- **403**: User doesn't have access to this attachment
- **404**: Attachment not found
- **500**: Server error

### Security Notes
- URLs should be signed with expiration (recommend 1-4 hours)
- Different URLs for viewing vs downloading if needed
- For PDFs, provide both download URL and viewer URL for in-browser viewing

---

## Document Viewer Implementation

### Supported Document Types
The frontend includes a **built-in document viewer** supporting:

#### Primary Document Types
- **PDF**: In-browser viewing with PDF.js integration
- **DOC/DOCX**: Microsoft Word documents (via viewer or conversion)
- **PPT/PPTX**: PowerPoint presentations (via viewer or conversion)
- **TXT**: Plain text files with syntax highlighting
- **XLSX**: Excel spreadsheets (via viewer or conversion)

#### Viewer Features
- **In-browser Viewing**: No downloads required for viewing
- **Responsive Design**: Mobile and desktop optimized
- **Zoom Controls**: Zoom in/out for better readability
- **Page Navigation**: For multi-page documents
- **Download Option**: When permitted by course settings
- **Print Support**: When download is allowed
- **Full-screen Mode**: Distraction-free viewing
- **Search**: Text search within documents (when supported)

#### Document URL Requirements
```json
{
  "documentExamples": {
    "pdf": "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
    "samplePdf": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    "publicDocs": "https://github.com/mozilla/pdf.js/blob/master/examples/learning/helloworld.pdf",
    "technicalPdf": "https://www.adobe.com/content/dam/acom/en/devnet/acrobat/pdfs/pdf_reference_1-7.pdf"
  }
}
```

#### Integration with Video Content
- Documents can be attached to any video content
- **Side Panel**: Documents accessible via button in video player controls
- **Popup Viewer**: Documents open in modal/popup for viewing
- **Progress Tracking**: Document viewing can contribute to course progress
- **Contextual Access**: Documents related to current video section

### Document Type Courses
For courses that are primarily document-based:

#### Course Structure
```json
{
  "documentCourse": {
    "type": "document",
    "content": [
      {
        "id": "doc-1",
        "title": "Course Introduction Guide",
        "type": "document",
        "documentUrl": "https://example.com/intro.pdf",
        "attachments": [
          {
            "id": "att-1",
            "title": "Quick Reference Card",
            "url": "https://example.com/quick-ref.pdf",
            "type": "pdf"
          }
        ]
      }
    ]
  }
}
```

#### Testing URLs for Document Courses
```json
{
  "testDocuments": {
    "introductionPdf": "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
    "technicalSpec": "https://www.w3.org/WAI/WCAG21/Understanding/intro",
    "sampleWorkbook": "https://github.com/SheetJS/sheetjs/raw/master/test_files/RkNumber.xls",
    "presentationSample": "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kaleidoscope.ppt"
  }
}
```

---

## Video Player Implementation

### Technology Stack
The frontend uses a **custom-built video player** with the following specifications:

#### Core Technologies
- **HTML5 Video API** for video playback
- **React 18+** with TypeScript for component logic
- **Tailwind CSS** for responsive styling
- **Real Video URLs** for testing (Google's public video samples)

#### Video Player Features
- **Full Controls**: Play, pause, seek, volume, fullscreen
- **Advanced Features**: Speed control (0.25x to 2x), skip forward/backward (10s)
- **Document Integration**: Access attached documents via documents button in controls
- **Document Panel**: Side panel showing all attached documents with thumbnails
- **Keyboard Shortcuts**: Space (play/pause), arrows (seek/volume), M (mute), F (fullscreen)
- **Auto-hide Controls**: Controls disappear after 3s of inactivity
- **Progress Tracking**: Real-time progress updates and auto-completion
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Loading States**: Smooth loading animations and error handling

#### Document Attachment Features
- **Document List**: Shows all documents attached to current video
- **Quick Access**: One-click access to view documents without leaving video
- **Document Types**: Support for PDF, DOC, PPT, TXT, and other formats
- **File Information**: Display document title, type, and file size
- **External Links**: Open documents in new tab or in-app viewer
- **Context Preservation**: Video continues playing while viewing documents

#### Video URL Requirements
- **Format Support**: MP4, WebM, OGG (standard HTML5 video formats)
- **Security**: Signed/temporary URLs recommended for content protection
- **Quality**: Recommended minimum 720p for optimal user experience
- **Duration Tracking**: Backend should provide video duration in seconds

#### Testing URLs
For development and testing, the following real video URLs are used:
```json
{
  "sampleVideos": {
    "bigBuckBunny": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "elephantsDream": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "forBiggerBlazes": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
  }
}
```

---

## Authentication & Authorization

### Required User Information
For all authenticated endpoints, the system needs access to:
- **userId**: Unique identifier for the authenticated user
- **email**: User's email address (for purchase confirmations)
- **name**: User's display name (for reviews)
- **avatar**: User's profile picture URL (optional)

### Token Validation
- All authenticated endpoints require a valid Bearer token
- Token should contain user information or allow user lookup
- Expired or invalid tokens should return 401 Unauthorized

---

## Error Response Format

All error responses should follow this consistent format:

```json
{
  "error": {
    "code": "string (error code)",
    "message": "string (human-readable message)",
    "details": "object (optional, additional error details)"
  }
}
```

### Common Error Codes
- `PRODUCT_NOT_FOUND`: Product doesn't exist
- `ACCESS_DENIED`: User doesn't have access to course
- `ALREADY_REVIEWED`: User has already reviewed this product
- `PAYMENT_FAILED`: Payment processing failed
- `INVALID_INPUT`: Request validation failed
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: User lacks required permissions

---

## Rate Limiting

Recommended rate limits:
- **Review submission**: 5 requests per hour per user
- **Like/unlike**: 100 requests per hour per user
- **Content access**: 1000 requests per hour per user
- **Purchase**: 10 requests per hour per user

---

## Caching Considerations

### Recommended Caching
- **Product details**: Cache for 5 minutes (exclude user-specific data)
- **Reviews**: Cache for 10 minutes
- **Content URLs**: No caching (generate fresh signed URLs)
- **User progress**: Cache for 1 minute

### Cache Invalidation
- Invalidate product cache when new review is added
- Invalidate user progress when content is completed
- Invalidate review cache when likes are updated

---

## Testing & Development

### Test Pages Available

1. **Video Player Test**: `/video-test`
   - Tests custom video player with document attachments
   - Real video URLs from Google's public samples
   - Document attachment functionality
   - Keyboard shortcuts and controls

2. **Document Viewer Test**: `/document-test`
   - Tests document viewer with various file types
   - Real document URLs for PDF, DOC, XLS, PPT, TXT
   - Modal viewer functionality
   - Download and external link options

### Sample Data URLs

#### Video Content URLs
```json
{
  "videos": {
    "bigBuckBunny": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "elephantsDream": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "forBiggerBlazes": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "forBiggerEscapes": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
  }
}
```

#### Document URLs for Testing
```json
{
  "documents": {
    "pdfs": {
      "tracemonkey": "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
      "dummy": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      "sample": "https://file-examples.com/storage/fe6ad6e2b6e4a06b54b58b3/2017/10/file_example_PDF_1MB.pdf"
    },
    "office": {
      "docx": "https://calibre-ebook.com/downloads/demos/demo.docx",
      "xlsx": "https://file-examples.com/storage/fe6ad6e2b6e4a06b54b58b3/2017/10/file_example_XLSX_10.xlsx",
      "ppt": "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kaleidoscope.ppt"
    },
    "text": {
      "txt": "https://www.textfiles.com/computers/CUPDOCS/CUP2.TXT"
    },
    "web": {
      "react": "https://react.dev/learn",
      "typescript": "https://www.typescriptlang.org/docs/",
      "mdn": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide"
    }
  }
}
```

### API Response Examples with Documents

#### Video Course with Attachments
```json
{
  "content": [
    {
      "id": "content-1",
      "title": "Introduction to Digital Marketing",
      "type": "video",
      "duration": 1245,
      "videoUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      "isCompleted": true,
      "attachments": [
        {
          "id": "doc-1",
          "title": "Marketing Strategy Fundamentals",
          "url": "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
          "type": "pdf",
          "size": "2.1 MB",
          "description": "Complete guide to digital marketing strategies"
        },
        {
          "id": "doc-2",
          "title": "Digital Marketing Checklist",
          "url": "https://www.w3.org/WAI/WCAG21/Understanding/intro",
          "type": "other",
          "size": "Web Page",
          "description": "Step-by-step checklist for campaign planning"
        }
      ]
    }
  ]
}
```

#### Document-Only Course
```json
{
  "content": [
    {
      "id": "content-1",
      "title": "Digital Marketing Fundamentals Study Guide",
      "type": "document",
      "documentUrl": "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
      "isCompleted": true,
      "attachments": [
        {
          "id": "att-1",
          "title": "Marketing Checklist Template",
          "url": "https://file-examples.com/storage/fe6ad6e2b6e4a06b54b58b3/2017/10/file_example_XLSX_10.xlsx",
          "type": "xlsx",
          "size": "13 KB",
          "description": "Excel template for tracking marketing campaigns"
        },
        {
          "id": "att-2",
          "title": "Quick Reference Card",
          "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          "type": "pdf",
          "size": "13 KB",
          "description": "One-page summary of key concepts"
        }
      ]
    },
    {
      "id": "content-2",
      "title": "Market Research Resources",
      "type": "document",
      "documentUrl": "https://file-examples.com/storage/fe6ad6e2b6e4a06b54b58b3/2017/10/file_example_PDF_1MB.pdf",
      "isCompleted": false,
      "attachments": [
        {
          "id": "att-3",
          "title": "Survey Templates",
          "url": "https://calibre-ebook.com/downloads/demos/demo.docx",
          "type": "docx",
          "size": "25 KB",
          "description": "Editable survey templates for market research"
        }
      ]
    }
  ]
}
```

---

## Course Content Types

### Video Courses with Document Attachments
- **Primary Content**: Video files (`.mp4`, `.webm`, `.ogg`)
- **videoUrl**: Required - direct link to the main video content
- **attachments**: Optional - supplementary documents related to the video
- **Use Case**: Video lessons with downloadable resources (PDFs, worksheets, templates)

### Document-Only Courses  
- **Primary Content**: Document files (PDF, DOC, XLS, PPT, TXT, etc.)
- **documentUrl**: Required - direct link to the main document content
- **attachments**: Optional - additional related documents
- **Use Case**: Study guides, ebooks, reference materials, templates

### Key Differences

| Feature | Video Courses | Document Courses |
|---------|---------------|------------------|
| Primary URL | `videoUrl` | `documentUrl` |
| Duration | `duration` in seconds | No duration field |
| Player | Custom video player | Document viewer |
| Attachments | Supplementary materials | Additional resources |
| Progress Tracking | Time-based progress | Read/completion status |

---
