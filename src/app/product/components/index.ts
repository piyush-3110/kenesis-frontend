// Components
export { default as ProductHeader } from "./ProductHeader";
export { default as CourseStats } from "./CourseStats";
export { default as ProductImage } from "./ProductImage";
export { default as PurchaseSection } from "./PurchaseSection";
export { default as ProductDescription } from "./ProductDescription";
export { default as ProductInfo } from "./ProductInfo";
export { default as ProductPageLoading } from "./ProductPageLoading";
export { default as ProductPageError } from "./ProductPageError";
export { default as CourseChapters } from "./CourseChapters";
export { default as CourseDetails } from "./CourseDetails";

// Hooks
export { usePurchaseFlow } from "../hooks/usePurchaseFlow";
export { useProductActions } from "../hooks/useProductActions";

// Types
export type { UsePurchaseFlowReturn } from "../hooks/usePurchaseFlow";
export type { UseProductActionsReturn } from "../hooks/useProductActions";
