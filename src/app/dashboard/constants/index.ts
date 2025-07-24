import { 
  Home, 
  Package, 
  Users, 
  Wallet, 
  ShoppingCart, 
  TrendingUp, 
  Mail, 
  Flame, 
  Settings, 
  MessageSquare, 
  LogOut,
  BarChart3
} from 'lucide-react';
import { DashboardMenuItem } from '../types';

/**
 * Dashboard Constants
 * Configuration and static data for the dashboard
 */

export const DASHBOARD_CONFIG = {
  SIDEBAR_WIDTH: 280,
  SIDEBAR_COLLAPSED_WIDTH: 80,
  MOBILE_BREAKPOINT: 768,
  ANIMATION_DURATION: 200,
} as const;

export const DASHBOARD_COLORS = {
  // Background colors
  PRIMARY_BG: '#010519',
  CARD_BG: 'linear-gradient(152.97deg, #000000 18.75%, rgba(0, 0, 0, 0) 100%)',
  
  // Border gradients
  PRIMARY_BORDER: 'linear-gradient(90deg, #0680FF 0%, #022ED2 100%)',
  SIDEBAR_BORDER: 'linear-gradient(180deg, #0680FF 0%, #010519 88.45%)',
  
  // Text colors
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SECONDARY: '#C0C0C0',
  TEXT_ACCENT: '#0680FF',
  
  // Transaction wallet background
  WALLET_BG: '#4285F4',
} as const;

export const DASHBOARD_TYPOGRAPHY = {
  SIDEBAR_TEXT: {
    fontFamily: 'Inter',
    fontSize: '16.4px',
    fontWeight: 500,
    lineHeight: '140%',
  },
  SIDEBAR_HEADER: {
    fontFamily: 'CircularXX, Inter, sans-serif',
    fontSize: '28.69px',
    fontWeight: 500,
    lineHeight: '100%',
  },
  CARD_TITLE: {
    fontFamily: 'CircularXX, Inter, sans-serif',
    fontSize: '20.5px',
    fontWeight: 450,
    lineHeight: '140%',
  },
  CARD_BODY: {
    fontFamily: 'CircularXX, Inter, sans-serif',
    fontSize: '16.4px',
    fontWeight: 450,
    lineHeight: '140%',
  },
  WALLET_TEXT: {
    fontFamily: 'Rubik, monospace',
    fontSize: '16.84px',
    fontWeight: 400,
    lineHeight: '100%',
  },
} as const;

export const DASHBOARD_MENU_ITEMS: DashboardMenuItem[] = [
  {
    id: 'initial-panel',
    label: 'Initial Panel',
    icon: Home,
    href: '/dashboard',
    isActive: true,
  },
  {
    id: 'products',
    label: 'Products',
    icon: Package,
    href: '/dashboard/products',
  },
  {
    id: 'affiliate-showcase',
    label: 'Affiliate Showcase',
    icon: BarChart3,
    href: '/dashboard/affiliate-showcase',
  },
  {
    id: 'members-area',
    label: 'Members Area',
    icon: Users,
    href: '/dashboard/members',
  },
  {
    id: 'wallet',
    label: 'Wallet',
    icon: Wallet,
    href: '/dashboard/wallet',
  },
  {
    id: 'affiliate-products',
    label: 'Affiliate Products',
    icon: ShoppingCart,
    href: '/dashboard/affiliate-products',
  },
  {
    id: 'sales',
    label: 'Sales',
    icon: TrendingUp,
    href: '/dashboard/sales',
  },
  {
    id: 'nft-automation-email',
    label: 'NFT Automation - Email',
    icon: Mail,
    href: '/dashboard/nft-automation',
  },
  {
    id: 'hot-leads',
    label: 'Hot Leads',
    icon: Flame,
    href: '/dashboard/hot-leads',
  },
];

export const DASHBOARD_BOTTOM_ITEMS: DashboardMenuItem[] = [
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/dashboard/settings',
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: MessageSquare,
    href: '/dashboard/messages',
    badge: {
      count: 3,
      variant: 'primary',
    },
  },
  {
    id: 'logout',
    label: 'Log out',
    icon: LogOut,
    href: '/logout',
  },
];

export const DASHBOARD_STYLES = {
  CARD_BORDER: '1px solid transparent',
  CARD_BORDER_IMAGE: 'linear-gradient(90deg, #0680FF 0%, #022ED2 100%) 1',
  SIDEBAR_BORDER_RIGHT: '0.97px solid transparent',
  SIDEBAR_BORDER_IMAGE: 'linear-gradient(180deg, #0680FF 0%, #010519 88.45%) 1',
  BORDER_RADIUS: '12px',
} as const;
