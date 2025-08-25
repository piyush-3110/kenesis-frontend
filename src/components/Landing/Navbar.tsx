"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { LogOut, User, ShoppingBag, LayoutDashboard } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useAuth } from "@/features/auth/AuthProvider";
import { useLogout } from "@/features/auth/hooks";
import { useCurrentUser } from "@/features/auth/useCurrentUser";
import { SiweAuthButton } from "@/features/wallet/SiweAuthButton";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";

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

function NavLinks() {
  return (
    <div className="hidden md:flex items-center space-x-8">
      <Link
        href="/presale"
        className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 group"
      >
        <span className="font-medium text-lg">Presale</span>
      </Link>

      <Link
        href="https://kenesis.gitbook.io/whitepaper"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 group"
      >
        <span className="font-medium text-lg">Whitepaper</span>
      </Link>
    </div>
  );
}

function AuthSection() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { addToast } = useUIStore();
  const { isAuthenticated } = useAuth();
  const logout = useLogout();
  const { data: user } = useCurrentUser();

  // Only run on client to avoid hydration mismatches
  useEffect(() => {
    setIsClient(true);
  }, []);

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
      router.push("/");
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

  // Show loading state during SSR to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-700 rounded-full animate-pulse"></div>
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
  // Limit username to 6 characters with '..' suffix if longer
  const displayName = user?.username
    ? user.username.length > 6
      ? `${user.username.slice(0, 6)}..`
      : user.username
    : user?.email
    ? user.email
    : user?.walletAddress
    ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
    : "User";

  return (
    <div className="flex items-center gap-3">
      {/* Always show wallet button */}
      <SiweAuthButton variant="default" />

      {/* Show profile icon if authenticated */}
      {isAuthenticated && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full transition-all duration-300 hover:scale-105 ring-2 ring-white/20 hover:ring-white/40"
            style={{
              background:
                "linear-gradient(107.31deg, #00C9FF -30.5%, #4648FF 54.41%, #0D01F6 100%)",
              boxShadow: "0 4px 20px rgba(70, 72, 255, 0.3)",
            }}
          >
            {user?.avatar ? (
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden shadow-lg">
                <Image
                  src={user.avatar}
                  alt={displayName}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-300 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base shadow-lg">
                {avatarLetter}
              </div>
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-64 md:w-72 bg-gradient-to-b from-[#0F0B24] to-[#1A1235] border border-blue-400/30 rounded-2xl shadow-2xl z-50 backdrop-blur-sm">
              <div className="py-3">
                <div className="px-5 py-4 border-b border-gray-700/40">
                  <div className="flex items-center space-x-3">
                    {user?.avatar ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg">
                        <Image
                          src={user.avatar}
                          alt={displayName}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {avatarLetter}
                      </div>
                    )}
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
                    href="/presale"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center space-x-4 px-5 py-4 text-gray-300 hover:text-white hover:bg-green-500/20 transition-all duration-300 group"
                  >
                    <span className="font-medium text-lg">Presale</span>
                  </Link>

                  <Link
                    href="https://kenesis.gitbook.io/whitepaper"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center space-x-4 px-5 py-4 text-gray-300 hover:text-white hover:bg-orange-500/20 transition-all duration-300 group"
                  >
                    <span className="font-medium text-lg">Whitepaper</span>
                  </Link>
                </div>

                <div className="py-1">
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
      )}
    </div>
  );
}

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  // Mobile sheet state related data (mirror of AuthSection logic)
  const router = useRouter();
  const { addToast } = useUIStore();
  const { isAuthenticated } = useAuth();
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      addToast({
        type: "error",
        message: "Please log in to access the dashboard",
      });
      router.push("/");
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
      await logout.mutateAsync();
    } finally {
      setIsLoggingOut(false);
    }
  };
  const avatarLetter = (
    user?.username ||
    user?.email ||
    user?.walletAddress ||
    "U"
  )
    .charAt(0)
    .toUpperCase();
  const displayName = user?.username
    ? user.username.length > 6
      ? `${user.username.slice(0, 6)}..`
      : user.username
    : user?.email
    ? user.email
    : user?.walletAddress
    ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
    : "User";

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

  return (
    <nav
      className={clsx(
        "fixed top-0 left-0 w-full z-50 transition-transform duration-300 ",
        !isVisible && "-translate-y-full"
      )}
    >
      <div
        className="flex items-center justify-between px-3 py-2 md:py-6 md:px-24 bg-[#0A071A]/90 backdrop-blur-sm"
        style={{
          borderBottom: "1.2px solid",
          borderImageSource:
            "linear-gradient(90deg, #0A071A 0%, #0036F6 48%, #0A071A 100%)",
          borderImageSlice: 1,
        }}
      >
        <Logo />
        <div className="flex items-center space-x-3 md:space-x-8">
          <NavLinks />
          {/* Language Switcher */}
          <div className="hidden md:block"></div>
          {/* Desktop dropdown */}
          <div className="hidden md:block">
            <AuthSection />
          </div>
          {/* Mobile language + sheet trigger */}
          <div className="md:hidden flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <button
                  aria-label="Open profile menu"
                  className="w-10 h-10 rounded-full overflow-hidden ring-1 ring-white/15 bg-gradient-to-br from-blue-500/40 to-purple-600/40 flex items-center justify-center"
                >
                  {isClient && isAuthenticated && user?.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={displayName}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : isClient && isAuthenticated ? (
                    <span className="text-sm font-semibold text-white">
                      {avatarLetter}
                    </span>
                  ) : (
                    <Image
                      src="/images/landing/avatar1.png"
                      alt="User"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover opacity-80"
                    />
                  )}
                </button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="p-0 pb-8 border-t border-white/10"
              >
                <div className="mx-auto h-1 w-12 rounded-full bg-white/20 mt-3 mb-4" />
                <div className="px-6 flex flex-col gap-4">
                  {/* <LanguageSwitcher /> */}
                  {/* User / Auth Section inside sheet */}
                  {isClient && isAuthenticated ? (
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                      {user?.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={displayName}
                          width={56}
                          height={56}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                          {avatarLetter}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-base truncate">
                          {displayName}
                        </p>
                        {user?.email && (
                          <p className="text-gray-400 text-xs truncate">
                            {user.email}
                          </p>
                        )}
                        {user?.walletAddress && (
                          <p className="text-gray-500 text-[10px] truncate">
                            {user.walletAddress}
                          </p>
                        )}
                        {user?.email && !user.emailVerified && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium bg-yellow-500/20 text-yellow-300 rounded-full border border-yellow-500/30">
                            Email Not Verified
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Link
                        href="/auth/login"
                        className="w-full text-center font-semibold text-sm px-4 py-3 rounded-xl text-white bg-gradient-to-r from-sky-400 to-indigo-600 hover:from-sky-400/90 hover:to-indigo-600/90 transition"
                      >
                        Login
                      </Link>
                    </div>
                  )}
                  {/* Wallet Connect inside sheet */}
                  <div className="w-full">
                    <SiweAuthButton variant="sheet" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/marketplace"
                      className="px-5 py-4 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-between text-white font-medium"
                    >
                      <span>Marketplace</span>
                      <ShoppingBag className="w-5 h-5 text-blue-400" />
                    </Link>
                    {isClient && isAuthenticated && (
                      <button
                        onClick={handleDashboardClick}
                        className="px-5 py-4 rounded-xl bg-gradient-to-r from-blue-600/30 to-indigo-600/30 hover:from-blue-600/40 hover:to-indigo-600/40 flex items-center justify-between text-white font-semibold"
                      >
                        <span>Dashboard</span>
                        <LayoutDashboard className="w-5 h-5 text-purple-300" />
                      </button>
                    )}
                    <Link
                      href="/presale"
                      className="px-5 py-4 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-between text-white font-medium"
                    >
                      Presale
                    </Link>
                    <Link
                      href="https://kenesis.gitbook.io/whitepaper"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-4 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-between text-white font-medium"
                    >
                      Whitepaper
                    </Link>
                    {isClient && isAuthenticated && (
                      <Link
                        href="/dashboard/profile"
                        className="px-5 py-4 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-between text-white font-medium"
                      >
                        <span>Profile</span>
                        <User className="w-5 h-5 text-green-300" />
                      </Link>
                    )}
                    {isClient && isAuthenticated && (
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut || logout.isPending}
                        className="px-5 py-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 flex items-center justify-between text-red-300 font-medium disabled:opacity-60"
                      >
                        <span>
                          {isLoggingOut || logout.isPending
                            ? "Logging out..."
                            : "Logout"}
                        </span>
                        <LogOut className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-center text-gray-500 mt-2">
                    Explore. Create. Earn.
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
