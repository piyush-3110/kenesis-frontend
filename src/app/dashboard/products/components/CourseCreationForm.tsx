import React, { useEffect, useMemo, useState } from "react";
// import { useRouter } from "next/navigation";
import Link from "next/link";
import { useProductCreationStore } from "../store/useProductCreationStore";
// import { useLogout } from "@/features/auth/hooks";
import { useUIStore } from "@/store/useUIStore";
import { CourseFormData, Course, CourseLevel } from "../types";
import {
  COURSE_TYPES,
  COURSE_LEVELS,
  SUPPORTED_LANGUAGES,
  FILE_UPLOAD_LIMITS,
} from "../constants";
import { Upload, X, ArrowRight, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
// import { TokenManager } from "@/features/auth/tokenManager";
import Image from "next/image";
import { getCurrentChainConfigs } from "@/lib/contracts/chainConfig";
import { useCurrentUser } from "@/features/auth/useCurrentUser";
import { SiweAuthButton } from "@/features/wallet/SiweAuthButton";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { CategoriesAPI } from "@/lib/api";
import type { Category } from "@/types/Product";
import { uploadFile, UploadProgress } from "@/lib/uploadService";
import { http } from "@/lib/http/axios";
import { AxiosError } from "axios";

// IMPROVEMENT: Type for backend validation errors
type BackendError = {
  field: string;
  message: string;
};

// IMPROVEMENT: Helper function for dynamic upload text
const getUploadStatusText = (progress: UploadProgress | null): string => {
  if (!progress) return "";
  const percent = progress.percentage;
  if (percent <= 0) return "Initializing upload...";
  if (percent < 70)
    return `Uploading... (${(progress.loaded / 1024 / 1024).toFixed(1)}MB of ${(
      progress.total /
      1024 /
      1024
    ).toFixed(1)}MB)`;
  if (percent < 99) return "Almost there...";
  if (percent === 100) return "Uploaded";
  return "Finalizing upload...";
};

/**
 * CourseCreationForm Component
 * Step 1: Basic course information with improved submission flow and error handling.
 */
const CourseCreationForm: React.FC = () => {
  // const router = useRouter();
  const { setCurrentStep, setCurrentCourse, markStepCompleted } =
    useProductCreationStore();
  // const logout = useLogout();
  const { addToast } = useUIStore();

  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    type: "video",
    shortDescription: "",
    description: "",
    level: "beginner",
    language: "en",
    price: 0,
    tokenToPayWith: [],
    accessDuration: -1,
    affiliatePercentage: 10,
    availableQuantity: -1,
    metadata: {
      requirements: [],
      learningOutcomes: ["", "", ""],
      targetAudience: [],
    },
    categoryIds: [],
  });
  const [categories, setCategories] = useState<Category[]>([]);

  // File and submission states
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [previewVideoFile, setPreviewVideoFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  // IMPROVEMENT: Consolidated submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<
    "idle" | "uploading" | "creating"
  >("idle");

  // IMPROVEMENT: State to preserve uploaded URLs across failed submissions
  const [uploadedUrls, setUploadedUrls] = useState<{
    thumbnailUrl: string | null;
    previewVideoUrl: string | null;
  }>({
    thumbnailUrl: null,
    previewVideoUrl: null,
  });

  // IMPROVEMENT: State for dynamic upload progress text
  const [uploadProgress, setUploadProgress] = useState<{
    thumbnail: UploadProgress | null;
    previewVideo: UploadProgress | null;
  }>({
    thumbnail: null,
    previewVideo: null,
  });

  const chainConfigs = useMemo(() => getCurrentChainConfigs(), []);
  const supportedChains = useMemo(
    () => chainConfigs.map((c) => ({ chainId: c.chainId, chainName: c.name })),
    [chainConfigs]
  );
  const supportedTokens = useMemo(
    () =>
      chainConfigs.flatMap((c) =>
        c.supportedTokens.map((t) => ({
          symbol: t.symbol,
          name: t.symbol,
          address: t.address,
          chainId: c.chainId,
          chainName: c.name,
          decimals: t.decimals,
        }))
      ),
    [chainConfigs]
  );
  type SelectedToken = (typeof supportedTokens)[0];

  const [selectedChainId, setSelectedChainId] = useState<number>(
    supportedChains[0]?.chainId ?? 1
  );
  const me = useCurrentUser();
  const missingWallet = !me.isLoading && !me.data?.walletAddress;
  const missingUsername = !me.isLoading && !me.data?.username;
  const anyIdentityMissing = missingWallet || missingUsername;
  const uniqueChains = supportedChains;
  const availableTokens = useMemo(
    () => supportedTokens.filter((t) => t.chainId === selectedChainId),
    [supportedTokens, selectedChainId]
  );
  const [selectedTokens, setSelectedTokens] = useState<SelectedToken[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await CategoriesAPI.getCategories({ active: true });
        if (mounted && res.success && res.data) setCategories(res.data);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (isInitialized || supportedTokens.length === 0) return;
    const source = formData.tokenToPayWith || [];
    const initialTokens = source
      .map((s) => {
        const [symbol, chainIdStr] = s.split("-");
        const chainId = Number(chainIdStr);
        return supportedTokens.find(
          (t) => t.symbol === symbol && t.chainId === chainId
        );
      })
      .filter((t): t is SelectedToken => Boolean(t));
    setSelectedTokens(initialTokens);
    setIsInitialized(true);
  }, [supportedTokens, formData.tokenToPayWith, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    const tokenStrings = Array.from(
      new Set(selectedTokens.map((t) => `${t.symbol}-${t.chainId}`))
    );
    setFormData((prev) => ({ ...prev, tokenToPayWith: tokenStrings }));
  }, [selectedTokens, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    setSelectedTokens((prev) =>
      prev.filter((t) => t.chainId === selectedChainId)
    );
  }, [selectedChainId, isInitialized]);

  const handleInputChange = (
    field: keyof CourseFormData,
    value: string | string[] | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
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
        [field]: `File size exceeds ${limits.maxSize / (1024 * 1024)}MB`,
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

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });

    if (field === "thumbnail") {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setUploadedUrls((prev) => ({ ...prev, thumbnailUrl: null }));
    } else {
      setPreviewVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setUploadedUrls((prev) => ({ ...prev, previewVideoUrl: null }));
    }
  };

  const handleTokenToggle = (token: SelectedToken) => {
    setSelectedTokens((prev) => {
      const exists = prev.some(
        (t) => t.address === token.address && t.chainId === token.chainId
      );
      if (exists) {
        return prev.filter(
          (t) => !(t.address === token.address && t.chainId === token.chainId)
        );
      }
      return [...prev, token];
    });
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData((prev) => {
      const current = prev.categoryIds || [];
      const exists = current.includes(categoryId);
      const updated = exists
        ? current.filter((c) => c !== categoryId)
        : [...current, categoryId];
      return { ...prev, categoryIds: updated };
    });
    if (errors.categoryIds) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.categoryIds;
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.shortDescription.trim())
      newErrors.shortDescription = "Short description is required";
    if (formData.price > 0 && formData.tokenToPayWith.length === 0)
      newErrors.tokenToPayWith =
        "Select at least one payment token for paid courses";
    const learningOutcomes =
      formData.metadata?.learningOutcomes?.filter((o) => o.trim().length > 0) ||
      [];
    if (learningOutcomes.length < 3) {
      newErrors.learningOutcomes =
        "At least 3 non-empty learning outcomes are required";
    }
    if (!thumbnailFile && !uploadedUrls.thumbnailUrl)
      newErrors.thumbnail = "Thumbnail image is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (anyIdentityMissing) {
      addToast({
        type: "error",
        message: "Please complete your profile before creating a course.",
      });
      return;
    }
    if (!validateForm()) {
      addToast({
        type: "error",
        message: "Please fix the errors before submitting.",
      });
      return;
    }
    setShowConfirmationModal(true);
  };

  const handleConfirmSubmission = async () => {
    setIsSubmitting(true);
    setSubmissionStatus("uploading");
    setErrors({});

    let finalThumbnailUrl = uploadedUrls.thumbnailUrl;
    let finalPreviewVideoUrl = uploadedUrls.previewVideoUrl;

    try {
      const uploadPromises = [];

      if (thumbnailFile && !finalThumbnailUrl) {
        uploadPromises.push(
          uploadFile(thumbnailFile, "course-thumbnails", (progress) =>
            setUploadProgress((prev) => ({ ...prev, thumbnail: progress }))
          ).then((result) => {
            finalThumbnailUrl = result.url;
          })
        );
      }
      if (previewVideoFile && !finalPreviewVideoUrl) {
        uploadPromises.push(
          uploadFile(previewVideoFile, "course-preview-videos", (progress) =>
            setUploadProgress((prev) => ({ ...prev, previewVideo: progress }))
          ).then((result) => {
            finalPreviewVideoUrl = result.url;
          })
        );
      }

      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
        addToast({ type: "success", message: "Media uploaded successfully!" });
      }

      setUploadedUrls({
        thumbnailUrl: finalThumbnailUrl,
        previewVideoUrl: finalPreviewVideoUrl,
      });

      setSubmissionStatus("creating");

      const coursePayload = {
        ...formData,
        metadata: {
          ...formData.metadata,
          learningOutcomes:
            formData.metadata?.learningOutcomes?.filter(
              (o) => o.trim() !== ""
            ) || [],
        },
        thumbnailUrl: finalThumbnailUrl,
        previewVideoUrl: finalPreviewVideoUrl,
      };

      const response = await http.post<{
        success: boolean;
        data: { course: Course };
        message: string;
      }>("/api/courses", coursePayload);

      const createdCourse = response.data.data.course;
      setCurrentCourse(createdCourse);
      markStepCompleted("course");
      addToast({
        type: "success",
        message: "Course created! Now add your chapters.",
      });
      setCurrentStep("chapters");
    } catch (error) {
      console.error("Course creation error:", error);
      if (
        error instanceof AxiosError &&
        error.response?.status === 400 &&
        error.response.data.errors
      ) {
        const backendErrors = error.response.data.errors as BackendError[];
        const newErrors: Record<string, string> = {};
        backendErrors.forEach((err) => {
          // Handles "body.shortDescription" -> "shortDescription"
          const fieldName = err.field.split(".").pop();

          if (fieldName) {
            newErrors[fieldName] = err.message;
          }
        });
        setErrors(newErrors);
        addToast({
          type: "error",
          message: "Please correct the validation errors.",
        });
      } else {
        addToast({
          type: "error",
          message:
            error instanceof AxiosError
              ? error.response?.data.message || "An unknown API error occurred."
              : "A network error occurred. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
      setSubmissionStatus("idle");
      setUploadProgress({ thumbnail: null, previewVideo: null });
      setShowConfirmationModal(false);
    }
  };

  const thumbnailUploadText = getUploadStatusText(uploadProgress.thumbnail);
  const videoUploadText = getUploadStatusText(uploadProgress.previewVideo);

  const getSubmitButtonText = () => {
    if (submissionStatus === "uploading") return "Uploading Media...";
    if (submissionStatus === "creating") return "Creating Course...";
    return "Continue to Chapters";
  };

  const inputClass =
    "w-full px-4 py-3 bg-[#010519] border border-transparent bg-clip-padding rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-transparent focus:ring-0 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed";
  const gradientBorderClass =
    "bg-gradient-to-r from-[#0680FF] to-[#022ED2] p-[2px] rounded-lg";

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        <fieldset disabled={isSubmitting} className="space-y-8">
          {!me.isLoading && anyIdentityMissing && (
            <div className="space-y-3">
              {missingWallet && (
                <div className="p-4 rounded-lg bg-red-600/15 border border-red-600/30 text-red-300 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm">
                      You need to connect a wallet to your account to accept
                      crypto payments and create courses.
                    </p>
                    <p className="text-xs opacity-80 mt-1">
                      Use the wallet button at the top-right, or click below to
                      authorize with your wallet.
                    </p>
                  </div>
                  <SiweAuthButton />
                </div>
              )}
              {missingUsername && (
                <div className="p-4 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 flex flex-col gap-2">
                  <p className="text-sm font-medium">
                    {"Add a username to continue."}
                  </p>
                  <p className="text-xs opacity-80">
                    We require a public username for instructor identity and
                    communication.
                  </p>
                  <div>
                    <Link
                      href="/dashboard/settings"
                      className="inline-block text-xs px-3 py-1.5 rounded-md bg-gradient-to-r from-[#0680FF] to-[#022ED2] text-white hover:opacity-90 transition"
                    >
                      Go to Settings
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

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

          <div>
            <label className="block text-white font-medium mb-3">
              Categories
              <span className="text-sm text-gray-400 ml-2">
                (Select up to 5)
              </span>
            </label>
            <div className="space-y-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {categories.map((cat) => {
                  const isSelected = (formData.categoryIds || []).includes(
                    cat.id
                  );
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryToggle(cat.id)}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm text-left border transition-all duration-200",
                        isSelected
                          ? "bg-gradient-to-r from-[#0680FF] to-[#022ED2] border-[#0680FF] text-white"
                          : "bg-[#010519] border-gray-600 text-gray-300 hover:border-[#0680FF] hover:text-white"
                      )}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
            {errors.categoryIds && (
              <p className="text-red-400 text-sm mt-2">{errors.categoryIds}</p>
            )}
          </div>

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
                placeholder="Brief course overview (Upto 200 Characters)"
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

          <div>
            <label className="block text-white font-medium mb-3">
              Detailed Description *
            </label>
            <div className={gradientBorderClass}>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Detailed course description, what students will learn, prerequisites, etc."
                rows={6}
                className={cn(inputClass, "resize-none")}
              />
            </div>
            {errors.description && (
              <p className="text-red-400 text-sm mt-2">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-medium mb-3">
                Level *
              </label>
              <div className={gradientBorderClass}>
                <select
                  value={formData.level}
                  onChange={(e) =>
                    handleInputChange("level", e.target.value as CourseLevel)
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
                  onChange={(e) =>
                    handleInputChange("language", e.target.value)
                  }
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

          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">
              Advanced Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <option
                      value={15552000}
                      className="bg-[#010519] text-white"
                    >
                      180 Days
                    </option>
                    <option
                      value={31536000}
                      className="bg-[#010519] text-white"
                    >
                      1 Year
                    </option>
                  </select>
                </div>
              </div>

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

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Payment Configuration
            </h3>
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
                  const isSelected = selectedTokens.some(
                    (t) =>
                      t.address === token.address && t.chainId === token.chainId
                  );
                  return (
                    <button
                      key={`${token.chainId}-${token.address}`}
                      type="button"
                      onClick={() => handleTokenToggle(token)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed",
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
                      <div className="text-sm opacity-75">
                        {token.chainName}
                      </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-medium mb-3">
                Course Thumbnail *
              </label>
              <div className={cn(gradientBorderClass, "h-40")}>
                <div className="h-full bg-[#010519] rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                  {thumbnailPreview || uploadedUrls.thumbnailUrl ? (
                    <>
                      <Image
                        src={thumbnailPreview || uploadedUrls.thumbnailUrl!}
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
                          setUploadedUrls((prev) => ({
                            ...prev,
                            thumbnailUrl: null,
                          }));
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors z-10"
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
              {submissionStatus === "uploading" && thumbnailUploadText && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-blue-300 mb-1">
                    <span>{thumbnailUploadText}</span>
                    <span>
                      {Math.round(uploadProgress.thumbnail?.percentage || 0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${uploadProgress.thumbnail?.percentage || 0}%`,
                      }}
                    />
                  </div>
                </div>
              )}
              {errors.thumbnail && (
                <p className="text-red-400 text-sm mt-2">{errors.thumbnail}</p>
              )}
            </div>

            <div>
              <label className="block text-white font-medium mb-3">
                Preview Video
                <span className="text-xs text-gray-400 ml-2">(Optional)</span>
              </label>
              <div className={cn(gradientBorderClass, "h-40")}>
                <div className="h-full bg-[#010519] rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                  {videoPreview || uploadedUrls.previewVideoUrl ? (
                    <>
                      <video
                        src={videoPreview || uploadedUrls.previewVideoUrl!}
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
                          setUploadedUrls((prev) => ({
                            ...prev,
                            previewVideoUrl: null,
                          }));
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors z-10"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-gray-400 text-sm text-center">
                        Upload preview video (optional)
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        Max 50MB, MP4/WEBM. Helps attract students to your
                        course.
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
              {submissionStatus === "uploading" && videoUploadText && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-blue-300 mb-1">
                    <span>{videoUploadText}</span>
                    <span>
                      {Math.round(uploadProgress.previewVideo?.percentage || 0)}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          uploadProgress.previewVideo?.percentage || 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              )}
              {errors.previewVideo && (
                <p className="text-red-400 text-sm mt-2">
                  {errors.previewVideo}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Course Details</h3>

            <div>
              <label className="block text-white font-medium mb-3">
                Prerequisites (Optional)
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
                            metadata: {
                              ...prev.metadata,
                              requirements: newReqs,
                            },
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

            <div>
              <label className="block text-white font-medium mb-3">
                Target Audience (Optional)
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
                      metadata: {
                        ...prev.metadata,
                        targetAudience: newAudience,
                      },
                    }));
                  }}
                  className="text-[#0680FF] hover:text-blue-400 transition-colors text-sm"
                >
                  + Add Target Audience
                </button>
              </div>
            </div>
          </div>
        </fieldset>

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={isSubmitting || anyIdentityMissing}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#0680FF] to-[#022ED2] text-white font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
            {getSubmitButtonText()}
            {!isSubmitting && <ArrowRight className="w-5 h-5" />}
          </button>
        </div>
      </form>

      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmSubmission}
        title="Create Course"
        message="Once you create this course, you'll be able to add chapters and modules. After creation, course details can only be edited from the My Products section in your dashboard. Do you want to proceed?"
        type="info"
        confirmText="Create Course"
        cancelText="Review Again"
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default CourseCreationForm;
