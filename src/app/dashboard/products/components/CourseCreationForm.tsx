"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useProductCreationStore } from "../store/useProductCreationStore";
import { useCreateCourse } from "@/hooks/useCourse";
import { useLogout } from "@/features/auth/hooks";
import { useUIStore } from "@/store/useUIStore";
import { CourseFormData, PaymentToken, Course, CourseStatus } from "../types";
import {
  COURSE_TYPES,
  COURSE_LEVELS,
  SUPPORTED_LANGUAGES,
  PAYMENT_TOKENS,
  FILE_UPLOAD_LIMITS,
} from "../constants";
import { Upload, X, ArrowRight, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { TokenManager } from "@/features/auth/tokenManager";
import Image from "next/image";

/**
 * CourseCreationForm Component
 * Step 1: Basic course information with blue gradient design and API integration
 */
const CourseCreationForm: React.FC = () => {
  const router = useRouter();
  const { currentCourse, setCurrentStep, setCurrentCourse } =
    useProductCreationStore();
  const {
    createCourse: createCourseAPI,
    loading: apiLoading,
    error: apiError,
    clearError,
  } = useCreateCourse();
  const logout = useLogout();
  const { addToast } = useUIStore();

  const [formData, setFormData] = useState<CourseFormData>({
    title: currentCourse?.title || "",
    type: currentCourse?.type || "video",
    shortDescription: currentCourse?.shortDescription || "",
    description: currentCourse?.description || "",
    level: currentCourse?.level || "beginner",
    language: currentCourse?.language || "en",
    price: currentCourse?.price || 0,
    tokenToPayWith: currentCourse?.tokenToPayWith || [],
    accessDuration: -1,
    affiliatePercentage: 10, // 10% default instead of 1000
    availableQuantity: -1,
    metadata: {
      requirements: [],
      learningOutcomes: ["", "", ""], // Start with 3 empty learning outcomes
      targetAudience: [],
    },
  });

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [previewVideoFile, setPreviewVideoFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedChainId, setSelectedChainId] = useState<number>(1); // Default to Ethereum

  // Get unique chains from payment tokens
  const uniqueChains = Array.from(
    new Set(PAYMENT_TOKENS.map((token) => token.chainId))
  )
    .map((chainId) => {
      const token = PAYMENT_TOKENS.find((t) => t.chainId === chainId);
      return token
        ? { chainId: token.chainId, chainName: token.chainName }
        : null;
    })
    .filter(Boolean) as Array<{ chainId: number; chainName: string }>;

  // Filter tokens by selected chain
  const availableTokens = PAYMENT_TOKENS.filter(
    (token) => token.chainId === selectedChainId
  );

  const handleInputChange = (
    field: keyof CourseFormData,
    value: string | string[] | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileUpload = (
    field: "thumbnail" | "previewVideo",
    file: File
  ) => {
    const limits =
      field === "thumbnail"
        ? FILE_UPLOAD_LIMITS.thumbnail
        : FILE_UPLOAD_LIMITS.previewVideo;

    if (file.size > limits.maxSize) {
      setErrors((prev) => ({
        ...prev,
        [field]: `File size exceeds ${limits.maxSize / (1024 * 1024)}MB limit`,
      }));
      return;
    }

    if (!limits.allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        [field]: `Invalid file type. Allowed: ${limits.allowedTypes.join(
          ", "
        )}`,
      }));
      return;
    }

    // Clear any existing errors
    setErrors((prev) => ({ ...prev, [field]: "" }));

    // Store the file and create preview
    if (field === "thumbnail") {
      setThumbnailFile(file);
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
    } else {
      setPreviewVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  const handleTokenToggle = (token: PaymentToken) => {
    setFormData((prev) => ({
      ...prev,
      tokenToPayWith: prev.tokenToPayWith.some(
        (t) => t.address === token.address && t.chainId === token.chainId
      )
        ? prev.tokenToPayWith.filter(
            (t) => !(t.address === token.address && t.chainId === token.chainId)
          )
        : [...prev.tokenToPayWith, token],
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.type.trim()) newErrors.type = "Course type is required";
    if (!formData.shortDescription.trim())
      newErrors.shortDescription = "Short description is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (formData.price < 0) newErrors.price = "Price cannot be negative";
    if (formData.price > 0 && formData.tokenToPayWith.length === 0)
      newErrors.tokenToPayWith =
        "Select at least one payment token for paid courses";

    // Affiliate percentage validation (stored and displayed as percentage directly)
    if (formData.affiliatePercentage < 0)
      newErrors.affiliatePercentage = "Affiliate commission cannot be negative";
    if (formData.affiliatePercentage > 50)
      newErrors.affiliatePercentage = "Affiliate commission cannot exceed 50%";

    // Learning outcomes validation - MANDATORY minimum 3 with non-empty content
    const learningOutcomes =
      formData.metadata?.learningOutcomes?.filter(
        (outcome) => outcome.trim().length > 0
      ) || [];
    if (learningOutcomes.length < 3) {
      newErrors.learningOutcomes =
        "At least 3 non-empty learning outcomes are required";
    }

    if (!thumbnailFile) newErrors.thumbnail = "Thumbnail image is required";
    if (!previewVideoFile) newErrors.previewVideo = "Preview video is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Authentication check (following security standards)
    const hasAuth = TokenManager.getAccessToken();
    if (!hasAuth) {
      addToast({
        type: "error",
        message: "Authentication required. Please log in.",
      });
      logout.mutate();
      router.push("/auth/login");
      return;
    }

    if (!validateForm()) {
      addToast({
        type: "error",
        message: "Please fix validation errors before submitting",
      });
      return;
    }

    clearError();

    try {
      // Create FormData exactly as per API specification
      const courseFormData = new FormData();

      // Required fields (exact field names per backend API)
      courseFormData.append("title", formData.title);
      courseFormData.append("description", formData.description);
      courseFormData.append("shortDescription", formData.shortDescription);
      courseFormData.append("type", formData.type);
      courseFormData.append("level", formData.level);
      courseFormData.append("language", formData.language);
      courseFormData.append("price", formData.price.toString());
      courseFormData.append(
        "tokenToPayWith",
        JSON.stringify(formData.tokenToPayWith)
      );
      courseFormData.append(
        "accessDuration",
        formData.accessDuration.toString()
      );
      courseFormData.append(
        "affiliatePercentage",
        formData.affiliatePercentage.toString()
      );
      courseFormData.append(
        "availableQuantity",
        formData.availableQuantity.toString()
      );

      // Required files
      if (thumbnailFile) {
        courseFormData.append("thumbnail", thumbnailFile);
      }
      if (previewVideoFile) {
        courseFormData.append("previewVideo", previewVideoFile);
      }

      // Optional metadata (as JSON string per backend spec)
      // Filter out empty values more thoroughly before sending
      const cleanedMetadata = {
        requirements:
          formData.metadata?.requirements?.filter(
            (req) => req.trim().length > 0
          ) || [],
        learningOutcomes:
          formData.metadata?.learningOutcomes?.filter(
            (outcome) => outcome.trim().length > 0
          ) || [],
        targetAudience:
          formData.metadata?.targetAudience?.filter(
            (audience) => audience.trim().length > 0
          ) || [],
      };

      console.log("📋 Original metadata:", formData.metadata);
      console.log("📋 Cleaned metadata:", cleanedMetadata);

      // Only send metadata if there's actually content, otherwise send empty object
      if (
        cleanedMetadata.requirements.length > 0 ||
        cleanedMetadata.learningOutcomes.length > 0 ||
        cleanedMetadata.targetAudience.length > 0
      ) {
        courseFormData.append("metadata", JSON.stringify(cleanedMetadata));
        console.log(
          "✅ Metadata with content added to FormData:",
          JSON.stringify(cleanedMetadata)
        );
      } else {
        // Send an empty object if no metadata
        courseFormData.append("metadata", JSON.stringify({}));
        console.log("✅ Empty metadata object added to FormData");
      }

      console.log("📤 Submitting course creation request");
      console.log("📦 FormData contents:");
      for (const [key, value] of courseFormData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`);
        } else {
          console.log(`  ${key}:`, value);
        }
      }
      const result = await createCourseAPI(courseFormData);

      if (result.success && result.data) {
        console.log("✅ Course created successfully:", result.data);

        // Extract course data from nested response
        const courseData = result.data.course || result.data; // Handle both nested and flat responses
        console.log("📋 Extracted course data:", courseData);

        addToast({
          type: "success",
          message: result.message || "Course created successfully!",
        });

        // Construct a complete course object that matches the Course interface
        const updatedCourse: Course = {
          // Required fields from form data
          title: formData.title,
          description: formData.description,
          shortDescription: formData.shortDescription,
          type: formData.type,
          level: formData.level,
          language: formData.language,
          price: formData.price,
          tokenToPayWith: formData.tokenToPayWith,
          accessDuration: formData.accessDuration,
          affiliatePercentage: formData.affiliatePercentage,
          availableQuantity: formData.availableQuantity,

          // Backend response data (accessing the nested course object)
          id: courseData.id, // This should now get the correct ID!
          status: (courseData.status as CourseStatus) || "draft",

          // Required arrays/objects
          chapters: [],

          // Optional fields
          thumbnail: formData.thumbnail,
          previewVideo: formData.previewVideo,
          metadata: formData.metadata,
          createdAt: courseData.createdAt || new Date().toISOString(),
        };

        console.log("📝 Complete course object for store:", updatedCourse);
        console.log("📝 Course ID to be stored:", updatedCourse.id);

        if (!updatedCourse.id) {
          console.error("❌ No course ID found in response!");
          console.error("Backend response structure:", result.data);
          addToast({
            type: "error",
            message: "Course created but ID not found. Please try again.",
          });
          return;
        }

        setCurrentCourse(updatedCourse);

        console.log("🔄 Navigating to chapters step");
        setCurrentStep("chapters");
      } else {
        console.error("Course creation failed:", result.message);
        addToast({
          type: "error",
          message: result.message || "Failed to create course",
        });
      }
    } catch (error) {
      console.error("Course creation error:", error);
      addToast({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    }
  };

  // Gradient input class
  const inputClass =
    "w-full px-4 py-3 bg-[#010519] border border-transparent bg-clip-padding rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-transparent focus:ring-0 transition-all duration-300";
  const gradientBorderClass =
    "bg-gradient-to-r from-[#0680FF] to-[#022ED2] p-[2px] rounded-lg";

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Course Title */}
        <div>
          <label className="block text-white font-medium mb-3">
            Course Title *
          </label>
          <div className={gradientBorderClass}>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter course title"
              className={inputClass}
            />
          </div>
          {errors.title && (
            <p className="text-red-400 text-sm mt-2">{errors.title}</p>
          )}
        </div>

        {/* Course Type */}
        <div>
          <label className="block text-white font-medium mb-3">
            Course Type *
          </label>
          <div className={gradientBorderClass}>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange("type", e.target.value)}
              className={inputClass}
            >
              <option value="">Select course type</option>
              {COURSE_TYPES.map((type) => (
                <option
                  key={type.value}
                  value={type.value}
                  className="bg-[#010519] text-white"
                >
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          {errors.type && (
            <p className="text-red-400 text-sm mt-2">{errors.type}</p>
          )}
        </div>

        {/* Short Description */}
        <div>
          <label className="block text-white font-medium mb-3">
            Short Description *
          </label>
          <div className={gradientBorderClass}>
            <textarea
              value={formData.shortDescription}
              onChange={(e) =>
                handleInputChange("shortDescription", e.target.value)
              }
              placeholder="Brief course overview (2-3 sentences)"
              rows={3}
              className={cn(inputClass, "resize-none")}
            />
          </div>
          {errors.shortDescription && (
            <p className="text-red-400 text-sm mt-2">
              {errors.shortDescription}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-white font-medium mb-3">
            Detailed Description *
          </label>
          <div className={gradientBorderClass}>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Detailed course description, what students will learn, prerequisites, etc."
              rows={6}
              className={cn(inputClass, "resize-none")}
            />
          </div>
          {errors.description && (
            <p className="text-red-400 text-sm mt-2">{errors.description}</p>
          )}
        </div>

        {/* Level and Language */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white font-medium mb-3">Level *</label>
            <div className={gradientBorderClass}>
              <select
                value={formData.level}
                onChange={(e) =>
                  handleInputChange("level", e.target.value as any)
                }
                className={inputClass}
              >
                {COURSE_LEVELS.map((level) => (
                  <option
                    key={level.value}
                    value={level.value}
                    className="bg-[#010519] text-white"
                  >
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white font-medium mb-3">
              Language *
            </label>
            <div className={gradientBorderClass}>
              <select
                value={formData.language}
                onChange={(e) => handleInputChange("language", e.target.value)}
                className={inputClass}
              >
                {SUPPORTED_LANGUAGES.map((language) => (
                  <option
                    key={language.value}
                    value={language.value}
                    className="bg-[#010519] text-white"
                  >
                    {language.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block text-white font-medium mb-3">
            Price (USD) *
          </label>
          <div className={gradientBorderClass}>
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                handleInputChange("price", parseFloat(e.target.value) || 0)
              }
              placeholder="0.00"
              min="0"
              step="0.01"
              className={inputClass}
            />
          </div>
          {errors.price && (
            <p className="text-red-400 text-sm mt-2">{errors.price}</p>
          )}
        </div>

        {/* Advanced Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white">
            Advanced Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Access Duration */}
            <div>
              <label className="block text-white font-medium mb-3">
                Access Duration *
              </label>
              <div className={gradientBorderClass}>
                <select
                  value={formData.accessDuration}
                  onChange={(e) =>
                    handleInputChange(
                      "accessDuration",
                      parseInt(e.target.value)
                    )
                  }
                  className={inputClass}
                >
                  <option value={-1} className="bg-[#010519] text-white">
                    Unlimited
                  </option>
                  <option value={2592000} className="bg-[#010519] text-white">
                    30 Days
                  </option>
                  <option value={7776000} className="bg-[#010519] text-white">
                    90 Days
                  </option>
                  <option value={15552000} className="bg-[#010519] text-white">
                    180 Days
                  </option>
                  <option value={31536000} className="bg-[#010519] text-white">
                    1 Year
                  </option>
                </select>
              </div>
            </div>

            {/* Affiliate Percentage */}
            <div>
              <label className="block text-white font-medium mb-3">
                Affiliate Commission (%) *
              </label>
              <div className={gradientBorderClass}>
                <input
                  type="number"
                  value={formData.affiliatePercentage}
                  onChange={(e) =>
                    handleInputChange(
                      "affiliatePercentage",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="10"
                  min="0"
                  max="50"
                  step="0.1"
                  className={inputClass}
                />
              </div>
              {errors.affiliatePercentage && (
                <p className="text-red-400 text-sm mt-2">
                  {errors.affiliatePercentage}
                </p>
              )}
            </div>

            {/* Available Quantity */}
            <div>
              <label className="block text-white font-medium mb-3">
                Max Enrollments *
              </label>
              <div className={gradientBorderClass}>
                <select
                  value={formData.availableQuantity}
                  onChange={(e) =>
                    handleInputChange(
                      "availableQuantity",
                      parseInt(e.target.value)
                    )
                  }
                  className={inputClass}
                >
                  <option value={-1} className="bg-[#010519] text-white">
                    Unlimited
                  </option>
                  <option value={50} className="bg-[#010519] text-white">
                    50 Students
                  </option>
                  <option value={100} className="bg-[#010519] text-white">
                    100 Students
                  </option>
                  <option value={250} className="bg-[#010519] text-white">
                    250 Students
                  </option>
                  <option value={500} className="bg-[#010519] text-white">
                    500 Students
                  </option>
                  <option value={1000} className="bg-[#010519] text-white">
                    1000 Students
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Tokens Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">
            Payment Configuration
          </h3>

          {/* Chain Selection */}
          <div>
            <label className="block text-white font-medium mb-3">
              Blockchain Network *
            </label>
            <div className={gradientBorderClass}>
              <select
                value={selectedChainId}
                onChange={(e) => setSelectedChainId(parseInt(e.target.value))}
                className={inputClass}
              >
                {uniqueChains.map((chain) => (
                  <option
                    key={chain.chainId}
                    value={chain.chainId}
                    className="bg-[#010519] text-white"
                  >
                    {chain.chainName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Token Selection */}
          <div>
            <label className="block text-white font-medium mb-3">
              Accepted Payment Tokens *
              <span className="text-sm text-gray-400 ml-2">
                (for{" "}
                {
                  uniqueChains.find((c) => c.chainId === selectedChainId)
                    ?.chainName
                }
                )
              </span>
            </label>
            <div className="space-y-2">
              {availableTokens.map((token) => {
                const isSelected = formData.tokenToPayWith.some(
                  (t) =>
                    t.address === token.address && t.chainId === token.chainId
                );
                return (
                  <button
                    key={`${token.chainId}-${token.address}`}
                    type="button"
                    onClick={() => handleTokenToggle(token)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all duration-300",
                      isSelected
                        ? "bg-gradient-to-r from-[#0680FF] to-[#022ED2] border-[#0680FF] text-white"
                        : "border-gray-600 text-gray-400 hover:border-[#0680FF] hover:text-white bg-[#010519]"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-left">
                        <div className="font-medium">{token.symbol}</div>
                        <div className="text-sm opacity-75">{token.name}</div>
                      </div>
                    </div>
                    <div className="text-sm opacity-75">{token.chainName}</div>
                  </button>
                );
              })}
            </div>
            {errors.tokenToPayWith && (
              <p className="text-red-400 text-sm mt-2">
                {errors.tokenToPayWith}
              </p>
            )}
          </div>
        </div>

        {/* File Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Thumbnail Upload */}
          <div>
            <label className="block text-white font-medium mb-3">
              Course Thumbnail
            </label>
            <div className={cn(gradientBorderClass, "h-40")}>
              <div className="h-full bg-[#010519] rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                {thumbnailPreview ? (
                  <>
                    <Image
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                      width={500}
                      height={200}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (thumbnailPreview) {
                          URL.revokeObjectURL(thumbnailPreview);
                        }
                        setThumbnailPreview(null);
                        setThumbnailFile(null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-gray-400 text-sm text-center">
                      Upload thumbnail image
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Max 5MB, JPG/PNG
                    </p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files?.[0] &&
                    handleFileUpload("thumbnail", e.target.files[0])
                  }
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
            {errors.thumbnail && (
              <p className="text-red-400 text-sm mt-2">{errors.thumbnail}</p>
            )}
          </div>

          {/* Preview Video Upload */}
          <div>
            <label className="block text-white font-medium mb-3">
              Preview Video
            </label>
            <div className={cn(gradientBorderClass, "h-40")}>
              <div className="h-full bg-[#010519] rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                {videoPreview ? (
                  <>
                    <video
                      src={videoPreview}
                      className="w-full h-full object-cover"
                      controls
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (videoPreview) {
                          URL.revokeObjectURL(videoPreview);
                        }
                        setVideoPreview(null);
                        setPreviewVideoFile(null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-gray-400 text-sm text-center">
                      Upload preview video
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Max 500MB, MP4/WEBM
                    </p>
                  </>
                )}
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) =>
                    e.target.files?.[0] &&
                    handleFileUpload("previewVideo", e.target.files[0])
                  }
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
            {errors.previewVideo && (
              <p className="text-red-400 text-sm mt-2">{errors.previewVideo}</p>
            )}
          </div>
        </div>

        {/* Course Metadata (Optional) */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white">
            Course Details (Optional)
          </h3>

          {/* Requirements */}
          <div>
            <label className="block text-white font-medium mb-3">
              Prerequisites
            </label>
            <div className="space-y-2">
              {formData.metadata?.requirements?.map((req, index) => (
                <div key={index} className="flex gap-2">
                  <div className={gradientBorderClass + " flex-1"}>
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => {
                        const newReqs = [
                          ...(formData.metadata?.requirements || []),
                        ];
                        newReqs[index] = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          metadata: { ...prev.metadata, requirements: newReqs },
                        }));
                      }}
                      placeholder="e.g., Basic programming knowledge"
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newReqs =
                        formData.metadata?.requirements?.filter(
                          (_, i) => i !== index
                        ) || [];
                      setFormData((prev) => ({
                        ...prev,
                        metadata: { ...prev.metadata, requirements: newReqs },
                      }));
                    }}
                    className="px-3 py-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )) || []}
              <button
                type="button"
                onClick={() => {
                  const newReqs = [
                    ...(formData.metadata?.requirements || []),
                    "",
                  ];
                  setFormData((prev) => ({
                    ...prev,
                    metadata: { ...prev.metadata, requirements: newReqs },
                  }));
                }}
                className="text-[#0680FF] hover:text-blue-400 transition-colors text-sm"
              >
                + Add Prerequisite
              </button>
            </div>
          </div>

          {/* Learning Outcomes */}
          <div>
            <label className="block text-white font-medium mb-3">
              What Students Will Learn *
              <span className="text-xs text-gray-400 ml-2">
                (Minimum 3 required -{" "}
                {formData.metadata?.learningOutcomes?.filter(
                  (outcome) => outcome.trim().length > 0
                ).length || 0}
                /3)
              </span>
            </label>
            <div className="space-y-2">
              {formData.metadata?.learningOutcomes?.map((outcome, index) => (
                <div key={index} className="flex gap-2">
                  <div className={gradientBorderClass + " flex-1"}>
                    <input
                      type="text"
                      value={outcome}
                      onChange={(e) => {
                        const newOutcomes = [
                          ...(formData.metadata?.learningOutcomes || []),
                        ];
                        newOutcomes[index] = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            learningOutcomes: newOutcomes,
                          },
                        }));
                        // Clear error when user starts typing
                        if (errors.learningOutcomes) {
                          setErrors((prev) => ({
                            ...prev,
                            learningOutcomes: "",
                          }));
                        }
                      }}
                      placeholder={`Learning outcome ${
                        index + 1
                      } (e.g., Build responsive web applications)`}
                      className={inputClass}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newOutcomes =
                        formData.metadata?.learningOutcomes?.filter(
                          (_, i) => i !== index
                        ) || [];
                      setFormData((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          learningOutcomes: newOutcomes,
                        },
                      }));
                    }}
                    className={cn(
                      "px-3 py-2 transition-colors",
                      (formData.metadata?.learningOutcomes?.length || 0) <= 3
                        ? "text-gray-500 cursor-not-allowed"
                        : "text-red-400 hover:text-red-300"
                    )}
                    disabled={
                      (formData.metadata?.learningOutcomes?.length || 0) <= 3
                    }
                    title={
                      (formData.metadata?.learningOutcomes?.length || 0) <= 3
                        ? "Minimum 3 learning outcomes required"
                        : "Remove this outcome"
                    }
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )) || []}

              {errors.learningOutcomes && (
                <p className="text-red-400 text-sm">
                  {errors.learningOutcomes}
                </p>
              )}

              <button
                type="button"
                onClick={() => {
                  const newOutcomes = [
                    ...(formData.metadata?.learningOutcomes || []),
                    "",
                  ];
                  setFormData((prev) => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      learningOutcomes: newOutcomes,
                    },
                  }));
                }}
                className="text-[#0680FF] hover:text-blue-400 transition-colors text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Learning Outcome
                {(formData.metadata?.learningOutcomes?.filter(
                  (outcome) => outcome.trim().length > 0
                ).length || 0) < 3 && (
                  <span className="text-orange-400 text-xs">
                    (
                    {3 -
                      (formData.metadata?.learningOutcomes?.filter(
                        (outcome) => outcome.trim().length > 0
                      ).length || 0)}{" "}
                    more needed)
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-white font-medium mb-3">
              Target Audience
            </label>
            <div className="space-y-2">
              {formData.metadata?.targetAudience?.map((audience, index) => (
                <div key={index} className="flex gap-2">
                  <div className={gradientBorderClass + " flex-1"}>
                    <input
                      type="text"
                      value={audience}
                      onChange={(e) => {
                        const newAudience = [
                          ...(formData.metadata?.targetAudience || []),
                        ];
                        newAudience[index] = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            targetAudience: newAudience,
                          },
                        }));
                      }}
                      placeholder="e.g., Beginner developers"
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newAudience =
                        formData.metadata?.targetAudience?.filter(
                          (_, i) => i !== index
                        ) || [];
                      setFormData((prev) => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          targetAudience: newAudience,
                        },
                      }));
                    }}
                    className="px-3 py-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )) || []}
              <button
                type="button"
                onClick={() => {
                  const newAudience = [
                    ...(formData.metadata?.targetAudience || []),
                    "",
                  ];
                  setFormData((prev) => ({
                    ...prev,
                    metadata: { ...prev.metadata, targetAudience: newAudience },
                  }));
                }}
                className="text-[#0680FF] hover:text-blue-400 transition-colors text-sm"
              >
                + Add Target Audience
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={apiLoading}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#0680FF] to-[#022ED2] text-white font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {apiLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Course...
              </>
            ) : (
              <>
                Continue to Chapters
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Display API errors */}
        {apiError && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{apiError}</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default CourseCreationForm;
