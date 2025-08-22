// Mock API for affiliate showcase development
// This will be replaced with real backend API calls

import type {
  Course,
  Category,
  AvailableCoursesResponse,
  CourseFilters,
} from "../types";

// Mock course data matching the new Course interface
const mockCourses: Course[] = [
  {
    id: "1",
    title: "Complete React Development Bootcamp",
    slug: "complete-react-development-bootcamp",
    thumbnail:
      "https://via.placeholder.com/400x200/0680FF/white?text=React+Bootcamp",
    price: 149.99,
    type: "video",
    level: "intermediate",
    averageRating: 4.8,
    reviewCount: 1245,
    soldCount: 3200,
    affiliatePercentage: 40,
    instructor: {
      id: "inst_1",
      username: "sarah_johnson",
      avatar: "https://via.placeholder.com/64x64/22C55E/white?text=SJ",
    },
    categories: [
      {
        id: "cat_1",
        name: "Programming",
        isActive: true,
        courseCount: 15,
        createdAt: new Date("2023-01-01"),
        updatedAt: new Date("2024-08-01"),
      },
      {
        id: "cat_2",
        name: "React",
        isActive: true,
        courseCount: 8,
        createdAt: new Date("2023-02-01"),
        updatedAt: new Date("2024-07-15"),
      },
    ],
  },
  {
    id: "2",
    title: "Digital Marketing Mastery 2024",
    slug: "digital-marketing-mastery-2024",
    thumbnail:
      "https://via.placeholder.com/400x200/8B5CF6/white?text=Digital+Marketing",
    price: 199.99,
    type: "video",
    level: "beginner",
    averageRating: 4.6,
    reviewCount: 892,
    soldCount: 2100,
    affiliatePercentage: 45,
    instructor: {
      id: "inst_2",
      username: "mike_chen",
      avatar: "https://via.placeholder.com/64x64/F59E0B/white?text=MC",
    },
    categories: [
      {
        id: "cat_3",
        name: "Marketing",
        isActive: true,
        courseCount: 12,
        createdAt: new Date("2023-01-15"),
        updatedAt: new Date("2024-08-10"),
      },
      {
        id: "cat_4",
        name: "Business",
        isActive: true,
        courseCount: 20,
        createdAt: new Date("2023-01-01"),
        updatedAt: new Date("2024-08-05"),
      },
    ],
  },
  {
    id: "3",
    title: "Python for Data Science",
    slug: "python-for-data-science",
    thumbnail:
      "https://via.placeholder.com/400x200/EF4444/white?text=Python+Data+Science",
    price: 179.99,
    type: "video",
    level: "intermediate",
    averageRating: 4.9,
    reviewCount: 2100,
    soldCount: 4500,
    affiliatePercentage: 35,
    instructor: {
      id: "inst_3",
      username: "emily_rodriguez",
      avatar: "https://via.placeholder.com/64x64/06B6D4/white?text=ER",
    },
    categories: [
      {
        id: "cat_1",
        name: "Programming",
        isActive: true,
        courseCount: 15,
        createdAt: new Date("2023-01-01"),
        updatedAt: new Date("2024-08-01"),
      },
      {
        id: "cat_5",
        name: "Data Science",
        isActive: true,
        courseCount: 10,
        createdAt: new Date("2023-03-01"),
        updatedAt: new Date("2024-07-20"),
      },
    ],
  },
  {
    id: "4",
    title: "UI/UX Design Fundamentals",
    slug: "ui-ux-design-fundamentals",
    thumbnail:
      "https://via.placeholder.com/400x200/EC4899/white?text=UI%2FUX+Design",
    price: 129.99,
    type: "document",
    level: "beginner",
    averageRating: 4.7,
    reviewCount: 756,
    soldCount: 1800,
    affiliatePercentage: 42,
    instructor: {
      id: "inst_4",
      username: "alex_thompson",
      avatar: "https://via.placeholder.com/64x64/8B5CF6/white?text=AT",
    },
    categories: [
      {
        id: "cat_6",
        name: "Design",
        isActive: true,
        courseCount: 14,
        createdAt: new Date("2023-02-15"),
        updatedAt: new Date("2024-08-12"),
      },
      {
        id: "cat_7",
        name: "User Experience",
        isActive: true,
        courseCount: 9,
        createdAt: new Date("2023-04-01"),
        updatedAt: new Date("2024-07-25"),
      },
    ],
  },
  {
    id: "5",
    title: "Advanced JavaScript Concepts",
    slug: "advanced-javascript-concepts",
    thumbnail:
      "https://via.placeholder.com/400x200/F59E0B/white?text=Advanced+JavaScript",
    price: 119.99,
    type: "video",
    level: "advanced",
    averageRating: 4.8,
    reviewCount: 1100,
    soldCount: 2800,
    affiliatePercentage: 38,
    instructor: {
      id: "inst_5",
      username: "james_wilson",
      avatar: "https://via.placeholder.com/64x64/10B981/white?text=JW",
    },
    categories: [
      {
        id: "cat_1",
        name: "Programming",
        isActive: true,
        courseCount: 15,
        createdAt: new Date("2023-01-01"),
        updatedAt: new Date("2024-08-01"),
      },
      {
        id: "cat_8",
        name: "JavaScript",
        isActive: true,
        courseCount: 18,
        createdAt: new Date("2023-01-10"),
        updatedAt: new Date("2024-08-15"),
      },
    ],
  },
];

// Mock categories
const mockCategories: Category[] = [
  {
    id: "cat_1",
    name: "Programming",
    isActive: true,
    courseCount: 15,
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2024-08-01"),
  },
  {
    id: "cat_2",
    name: "React",
    isActive: true,
    courseCount: 8,
    createdAt: new Date("2023-02-01"),
    updatedAt: new Date("2024-07-15"),
  },
  {
    id: "cat_3",
    name: "Marketing",
    isActive: true,
    courseCount: 12,
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2024-08-10"),
  },
  {
    id: "cat_4",
    name: "Business",
    isActive: true,
    courseCount: 20,
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2024-08-05"),
  },
  {
    id: "cat_5",
    name: "Data Science",
    isActive: true,
    courseCount: 10,
    createdAt: new Date("2023-03-01"),
    updatedAt: new Date("2024-07-20"),
  },
  {
    id: "cat_6",
    name: "Design",
    isActive: true,
    courseCount: 14,
    createdAt: new Date("2023-02-15"),
    updatedAt: new Date("2024-08-12"),
  },
  {
    id: "cat_7",
    name: "User Experience",
    isActive: true,
    courseCount: 9,
    createdAt: new Date("2023-04-01"),
    updatedAt: new Date("2024-07-25"),
  },
  {
    id: "cat_8",
    name: "JavaScript",
    isActive: true,
    courseCount: 18,
    createdAt: new Date("2023-01-10"),
    updatedAt: new Date("2024-08-15"),
  },
];

// Mock API functions
export const mockAffiliateAPI = {
  async getCourses(
    params: CourseFilters = {}
  ): Promise<{
    success: boolean;
    data: AvailableCoursesResponse;
    message?: string;
  }> {
    // Simulate API delay
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 500 + 200)
    );

    let filteredCourses = [...mockCourses];

    // Apply filters
    if (params.q) {
      const query = params.q.toLowerCase();
      filteredCourses = filteredCourses.filter((course) =>
        course.title.toLowerCase().includes(query)
      );
    }

    if (params.type) {
      filteredCourses = filteredCourses.filter(
        (course) => course.type === params.type
      );
    }

    if (params.level) {
      filteredCourses = filteredCourses.filter(
        (course) => course.level === params.level
      );
    }

    if (params.minPrice !== undefined && params.minPrice !== null) {
      filteredCourses = filteredCourses.filter(
        (course) => course.price >= params.minPrice!
      );
    }

    if (params.maxPrice !== undefined && params.maxPrice !== null) {
      filteredCourses = filteredCourses.filter(
        (course) => course.price <= params.maxPrice!
      );
    }

    if (params.minRating !== undefined && params.minRating !== null) {
      filteredCourses = filteredCourses.filter(
        (course) => course.averageRating >= params.minRating!
      );
    }

    if (params.maxRating !== undefined && params.maxRating !== null) {
      filteredCourses = filteredCourses.filter(
        (course) => course.averageRating <= params.maxRating!
      );
    }

    if (params.minCommission !== undefined && params.minCommission !== null) {
      filteredCourses = filteredCourses.filter(
        (course) => course.affiliatePercentage >= params.minCommission!
      );
    }

    if (params.maxCommission !== undefined && params.maxCommission !== null) {
      filteredCourses = filteredCourses.filter(
        (course) => course.affiliatePercentage <= params.maxCommission!
      );
    }

    if (params.categoryIds) {
      const categoryIds = params.categoryIds.split(",");
      filteredCourses = filteredCourses.filter((course) =>
        course.categories.some((cat) => categoryIds.includes(cat.id))
      );
    }

    // Apply sorting
    if (params.sortBy) {
      filteredCourses.sort((a, b) => {
        let aValue: string | number, bValue: string | number;

        switch (params.sortBy) {
          case "createdAt":
            // Since we don't have createdAt in Course interface, use ID as proxy for creation order
            aValue = a.id;
            bValue = b.id;
            break;
          case "affiliatePercentage":
            aValue = a.affiliatePercentage;
            bValue = b.affiliatePercentage;
            break;
          case "price":
            aValue = a.price;
            bValue = b.price;
            break;
          case "averageRating":
            aValue = a.averageRating;
            bValue = b.averageRating;
            break;
          case "soldCount":
            aValue = a.soldCount;
            bValue = b.soldCount;
            break;
          case "reviewCount":
            aValue = a.reviewCount;
            bValue = b.reviewCount;
            break;
          default:
            aValue = a.id;
            bValue = b.id;
        }

        if (params.sortOrder === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

    return {
      success: true,
      data: {
        courses: paginatedCourses,
        total: filteredCourses.length,
        page: page,
        totalPages: Math.ceil(filteredCourses.length / limit),
      },
    };
  },

  async getCategories(): Promise<{
    success: boolean;
    data: Category[];
    message?: string;
  }> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      success: true,
      data: mockCategories,
    };
  },
};
