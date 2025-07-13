# Kenesis Marketplace Backend API Documentation

## Project Overview
This document outlines the backend API requirements for the Kenesis Marketplace platform. The marketplace allows users to browse, search, filter, and view digital courses and educational content. This documentation focuses specifically on marketplace functionality.




### Product Entity
```
- id: string (UUID primary key)
- title: string (required, max 500 chars)
- description: text (required)
- author: string (required, max 200 chars)
- price: decimal (required, min 0)
- currency: string (fixed "USD")
- rating: decimal (0-5, calculated field)
- totalRatings: integer (calculated field)
- image: string (URL to product image)
- category: string (required, references Category.id)
- type: enum ('video', 'document') (required)
- createdAt: timestamp
- updatedAt: timestamp
- isActive: boolean (default true)
```

### Category Entity
```
- id: string (UUID primary key)
- name: string (required, unique, max 200 chars)
- count: integer (calculated field - number of active products)
- createdAt: timestamp
- isActive: boolean (default true)
```


```



## API Endpoints Required

### Products API

#### GET /api/products
**Purpose**: Fetch paginated products with filtering, searching, and sorting
**Query Parameters**:
- `page`: integer (default 1)
- `limit`: integer (default 10, max 50)
- `category`: string (optional, filter by category ID)
- `searchQuery`: string (optional, search in title, description, author)
- `sortBy`: enum (most-relevant, a-z, z-a, price-low-high, price-high-low, rating-high-low, newest)
- `minPrice`: decimal (optional)
- `maxPrice`: decimal (optional)

**Response Format**:
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "author": "string",
      "price": 99.99,
      "currency": "USD",
      "rating": 4.5,
      "totalRatings": 123,
      "image": "https://...",
      "category": "marketing-sales",
      "type": "video",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 250,
    "totalPages": 25,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```



### Categories API

#### GET /api/categories
**Purpose**: Fetch all active categories with product counts
**Response Format**:
```json
[
  {
    "id": "marketing-sales",
    "name": "Marketing and sales",
    "count": 39732
  }
]
```

### Sort Options API

#### GET /api/sort-options
**Purpose**: Get available sort options for products
**Response Format**:
```json
[
  {
    "value": "most-relevant",
    "label": "Most Relevant"
  },
  {
    "value": "a-z",
    "label": "A to Z"
  },
  {
    "value": "z-a",
    "label": "Z to A"
  },
  {
    "value": "price-low-high",
    "label": "Price: Low to High"
  },
  {
    "value": "price-high-low",
    "label": "Price: High to Low"
  },    {
      "value": "rating-high-low",
      "label": "Rating: High to Low"
    },
    {
      "value": "newest",
      "label": "Newest"
    },
    {
      "value": "video-first",
      "label": "Video Courses First"
    },
    {
      "value": "document-first",
      "label": "Documents First"
    }
]
```

### Price Range API

#### GET /api/price-range
**Purpose**: Get min and max price range for filtering
**Response Format**:
```json
{
  "min": 0,
  "max": 999.99,
  "currency": "USD"
}
```


### Search Suggestions API

#### GET /api/search/suggestions
**Purpose**: Get search suggestions for autocomplete
**Query Parameters**:
- `q`: string (search query, minimum 2 characters)
**Response Format**:
```json
[
  {
    "text": "React Development",
    "type": "suggestion"
  },
  {
    "text": "JavaScript Fundamentals",
    "type": "suggestion"
  }
]
```

## Business Logic Requirements

### Search Functionality
- Full-text search across product title, description, and author fields
- Case-insensitive search
- Support for partial word matching
- Search should work with special characters and accents

### Filtering Logic
- Category filtering: exact match on category ID
- Price range filtering: inclusive range (minPrice <= price <= maxPrice)
- Multiple filters should work together (AND operation)

### Sorting Options
- **most-relevant**: Default order (can be by creation date or relevance score)
- **a-z**: Alphabetical by title (ascending)
- **z-a**: Alphabetical by title (descending)
- **price-low-high**: Price ascending
- **price-high-low**: Price descending
- **rating-high-low**: Rating descending
- **newest**: Creation date descending
- **video-first**: Video courses appear before documents
- **document-first**: Documents appear before video courses

### Certification
- All courses come with certificates (no need for isCertified field)
- Certificate display is handled on frontend

### Currency
- All prices are in USD only
- Fixed currency field in database
- No currency conversion needed

### Pagination
- Standard offset-based pagination
- Include metadata: current page, total items, total pages, has next/prev
- Default page size: 10 items
- Maximum page size: 50 items

### Rating System
- Products can receive ratings from 1-5 stars
- `rating` field should be calculated average of all ratings
- `totalRatings` field should be count of all ratings
- Ratings should be stored in separate Rating entity if user ratings are tracked

### Dynamic Data Endpoints
- Sort options, categories, and price ranges are fetched from backend
- Frontend adapts to backend configuration
- No hardcoded filter/sort options in frontend

## Performance Requirements
- Product listing API should respond within 200ms for most queries
- Categories API should respond within 100ms
- Sort options and price range APIs should respond within 50ms
- Search suggestions API should respond within 100ms
- Support concurrent users (aim for 1000+ simultaneous requests)
- Implement proper database indexing on:
  - Product: category, price, createdAt, title
  - Category: name

## Security Requirements
- API rate limiting (100 requests per minute per IP)
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration for frontend domain

## Error Handling
- Consistent error response format:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": {}
  }
}
```

## Environment Configuration
- Database connection string
- File upload configuration for product images
- CORS allowed origins
- API rate limits

## Database Considerations
- Use database transactions for data consistency
- Implement soft deletes for products and categories
- Add database indexes for performance
- Consider read replicas for scaling
- Regular database backups

## Integration Notes
- Frontend expects exact response formats as specified
- All timestamps should be in ISO 8601 format
- Currency values should be stored as decimals with 2 decimal places (USD only)
- Product images should return full URLs ready for frontend consumption
- API should support both mobile and desktop traffic patterns
- All courses include certificates by default (no certification field needed)
- Frontend dynamically loads sort options, categories, and price ranges from backend

## Future Considerations
- Implement caching layer (Redis) for frequently accessed data
- Add analytics tracking for popular products/searches
- Product reviews and ratings system
- Wishlist functionality

This backend focuses specifically on marketplace functionality to support the Kenesis Marketplace frontend browsing, filtering, and searching experience.
