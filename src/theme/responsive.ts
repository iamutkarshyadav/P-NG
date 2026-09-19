import { useWindowDimensions } from 'react-native';

export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
} as const;

export const LAYOUT = {
  shellMaxWidth: 480,
  feedMaxWidth: 440,
  tabletMaxWidth: 680,
  contentPadding: 16,
} as const;

export interface ResponsiveInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  shellMaxWidth: number;
  feedMaxWidth: number;
}

export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();

  const isMobile = width < BREAKPOINTS.mobile;
  const isTablet = width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet;
  const isDesktop = width >= BREAKPOINTS.tablet;

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    shellMaxWidth: LAYOUT.shellMaxWidth,
    feedMaxWidth: LAYOUT.feedMaxWidth,
  };
}
