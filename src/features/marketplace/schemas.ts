import { z } from "zod";

export const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const coursesQuerySchema = z
  .object({
    q: z.string().trim().max(100).optional(),
    type: z.enum(["video", "document"]).optional(),
    level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    instructor: z.string().regex(objectIdRegex, "Invalid instructor ID"),
    sortBy: z.enum(["createdAt", "title", "averageRating", "price"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().min(0).optional(),
    page: z.number().int().min(1).optional().default(1),
    limit: z.number().int().min(1).max(50).optional().default(20),
  })
  .partial({ instructor: true })
  .refine(
    (v) =>
      v.minPrice === undefined ||
      v.maxPrice === undefined ||
      (typeof v.minPrice === "number" &&
        typeof v.maxPrice === "number" &&
        v.maxPrice >= v.minPrice),
    {
      message: "maxPrice must be greater than or equal to minPrice",
      path: ["maxPrice"],
    }
  );

export type CoursesQueryInput = z.infer<typeof coursesQuerySchema>;
