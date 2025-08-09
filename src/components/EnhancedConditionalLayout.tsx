"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Landing/Navbar";
import Footer from "@/components/Landing/Footer";

/**
 * Enhanced ConditionalLayout Component
 * Uses enhanced navbar with improved wallet authentication and user display
 */
const EnhancedConditionalLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();

  // Routes where navbar and footer should be hidden
  const hiddenRoutes = ["/dashboard"];

  // Check if current route should hide navbar/footer
  const shouldHide = hiddenRoutes.some((route) => pathname.startsWith(route));

  return (
    <>
      {!shouldHide && <Navbar />}
      {children}
      {!shouldHide && <Footer />}
    </>
  );
};

export default EnhancedConditionalLayout;
