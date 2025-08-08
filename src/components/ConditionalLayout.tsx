"use client";

import { usePathname } from "next/navigation";
import EnhancedNavbar from "@/components/Landing/EnhancedNavbar";
import Footer from "@/components/Landing/Footer";

/**
 * ConditionalLayout Component
 * Conditionally renders navbar and footer based on route
 */
const ConditionalLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();

  // Routes where navbar and footer should be hidden
  const hiddenRoutes = ["/dashboard"];

  // Check if current route should hide navbar/footer
  const shouldHide = hiddenRoutes.some((route) => pathname.startsWith(route));

  return (
    <>
      {!shouldHide && <EnhancedNavbar />}
      {children}
      {!shouldHide && <Footer />}
    </>
  );
};

export default ConditionalLayout;
