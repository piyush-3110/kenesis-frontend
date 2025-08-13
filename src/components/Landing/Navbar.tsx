"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import {
  Wallet,
  LogOut,
  User,
  ChevronDown,
  ShoppingBag,
  LayoutDashboard,
} from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useAuth } from "@/features/auth/AuthProvider";
import { useLogout } from "@/features/auth/hooks";
import { useCurrentUser } from "@/features/auth/useCurrentUser";
import { SiweAuthButton } from "@/features/wallet/SiweAuthButton";

function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <Image
        src="/images/landing/logo.png"
        alt="Kenesis Logo"
        width={100}
        height={120}
        priority
        className="h-6 w-24 md:h-8 md:w-36"
      />
    </Link>
  );
}

function NavLinks({
  onDashboard,
}: {
  onDashboard: (e: React.MouseEvent) => void;
}) {
  const { isAuthenticated } = useAuth();
  const { data: user } = useCurrentUser();
  return (
    <div className="hidden md:flex items-center space-x-8">
      <Link
        href="/marketplace"
        className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 group"
      >
        <ShoppingBag
          size={20}
          className="text-blue-400 group-hover:text-blue-300 transition-colors"
        />
        <span className="font-medium text-xl">Marketplace</span>
      </Link>
      {isAuthenticated && user && (
        <button
          onClick={onDashboard}
          className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 group"
        >
          <LayoutDashboard
            size={20}
            className="text-purple-400 group-hover:text-purple-300 transition-colors"
          />
          <span className="font-medium text-xl">Dashboard</span>
        </button>
      )}
    </div>
  );
}

function AuthSection() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { addToast } = useUIStore();
  const { isAuthenticated } = useAuth();
  const logout = useLogout();
  const { data: user } = useCurrentUser();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      addToast({
        type: "error",
        message: "Please log in to access the dashboard",
      });
      router.push("/auth");
      return;
    }
    if (user?.email && !user.emailVerified) {
      addToast({
        type: "warning",
        message: "Please verify your email before accessing the dashboard",
      });
      router.push("/auth/verify-email");
      return;
    }
    router.push("/dashboard");
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setIsDropdownOpen(false);
      await logout.mutateAsync();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          <Link
            href="/marketplace"
            className="flex items-center justify-center w-12 h-12 text-gray-300 hover:text-white hover:bg-blue-500/20 rounded-full transition-all duration-300 border border-blue-400/20 hover:border-blue-400/40"
          >
            <ShoppingBag size={22} />
          </Link>
        </div>
        <Link
          href="/auth/login"
          className="flex items-center space-x-2 text-white font-semibold text-sm md:text-lg px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg"
          style={{
            background:
              "linear-gradient(107.31deg, #00C9FF -30.5%, #4648FF 54.41%, #0D01F6 100%)",
            boxShadow: "0 4px 20px rgba(70, 72, 255, 0.4)",
          }}
        >
          <Wallet size={20} />
          <span>Login</span>
        </Link>
      </div>
    );
  }

  const avatarLetter = (
    user?.username ||
    user?.email ||
    user?.walletAddress ||
    "U"
  )
    .charAt(0)
    .toUpperCase();
  // Preferred display: username > email > wallet (short)
  const displayName = user?.username
    ? user.username
    : user?.email
    ? user.email
    : user?.walletAddress
    ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
    : "User";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 md:space-x-3 text-white font-medium text-sm md:text-lg px-4 md:px-6 py-2 md:py-3 rounded-full transition-all duration-300 hover:scale-105"
        style={{
          background:
            "linear-gradient(107.31deg, #00C9FF -30.5%, #4648FF 54.41%, #0D01F6 100%)",
          boxShadow: "0 4px 20px rgba(70, 72, 255, 0.3)",
        }}
      >
        <div className="w-7 h-7 md:w-9 md:h-9 bg-gradient-to-br from-blue-300 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base shadow-lg">
          {avatarLetter}
        </div>
        <span className="hidden sm:inline max-w-28 md:max-w-36 truncate font-semibold">
          {displayName}
        </span>
        <ChevronDown
          size={16}
          className={clsx(
            "transition-all duration-300 md:w-5 md:h-5",
            isDropdownOpen && "rotate-180 text-blue-200"
          )}
        />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-3 w-64 md:w-72 bg-gradient-to-b from-[#0F0B24] to-[#1A1235] border border-blue-400/30 rounded-2xl shadow-2xl z-50 backdrop-blur-sm">
          <div className="py-3">
            <div className="px-5 py-4 border-b border-gray-700/40">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {avatarLetter}
                </div>
                <div className="flex-1 min-w-0">
                  {/* Primary line: preferred display */}
                  <p className="text-white font-semibold text-base md:text-lg truncate">
                    {displayName}
                  </p>
                  {/* Secondary lines: show all available identifiers (username/email/wallet) */}
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    {user?.email && (
                      <p className="text-gray-400 text-sm md:text-base truncate">
                        {user.email}
                      </p>
                    )}
                    {user?.walletAddress && (
                      <p className="text-gray-500 text-xs truncate">
                        {user.walletAddress}
                      </p>
                    )}
                  </div>
                  {user?.email && !user.emailVerified && (
                    <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-yellow-500/20 text-yellow-300 rounded-full border border-yellow-500/30">
                      Email Not Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="md:hidden border-b border-gray-700/40 py-1">
              <Link
                href="/marketplace"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center space-x-4 px-5 py-4 text-gray-300 hover:text-white hover:bg-blue-500/20 transition-all duration-300 group"
              >
                <ShoppingBag
                  size={20}
                  className="text-blue-400 group-hover:text-blue-300 transition-colors"
                />
                <span className="font-medium text-lg">Marketplace</span>
              </Link>
              <button
                onClick={(e) => {
                  setIsDropdownOpen(false);
                  handleDashboardClick(e);
                }}
                className="w-full flex items-center space-x-4 px-5 py-4 text-gray-300 hover:text-white hover:bg-purple-500/20 transition-all duration-300 group"
              >
                <LayoutDashboard
                  size={20}
                  className="text-purple-400 group-hover:text-purple-300 transition-colors"
                />
                <span className="font-medium text-lg">Dashboard</span>
              </button>
            </div>

            <div className="py-1">
              <Link
                href="/dashboard/profile"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center space-x-4 px-5 py-4 text-gray-300 hover:text-white hover:bg-green-500/20 transition-all duration-300 group"
              >
                <User
                  size={20}
                  className="text-green-400 group-hover:text-green-300 transition-colors"
                />
                <span className="font-medium text-lg">Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut || logout.isPending}
                className="w-full flex items-center space-x-4 px-5 py-4 text-gray-300 hover:text-red-300 hover:bg-red-500/20 transition-all duration-300 disabled:opacity-50 group"
              >
                <LogOut
                  size={20}
                  className="text-red-400 group-hover:text-red-300 transition-colors"
                />
                <span className="font-medium text-lg">
                  {isLoggingOut || logout.isPending
                    ? "Logging out..."
                    : "Logout"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50)
        setIsVisible(false);
      else setIsVisible(true);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <nav
      className={clsx(
        "fixed top-0 left-0 w-full z-50 transition-transform duration-300 ",
        !isVisible && "-translate-y-full"
      )}
    >
      <div
        className="flex items-center justify-between px-4 py-4 md:py-6 md:px-24 bg-[#0A071A]"
        style={{
          borderBottom: "1.2px solid",
          borderImageSource:
            "linear-gradient(90deg, #0A071A 0%, #0036F6 48%, #0A071A 100%)",
          borderImageSlice: 1,
        }}
      >
        <Logo />
        <div className="flex items-center space-x-8">
          <NavLinks onDashboard={handleDashboardClick} />
          <SiweAuthButton />
          <AuthSection />
        </div>
      </div>
    </nav>
  );
}
