import { create } from 'zustand'
import { siteConfig } from "@/config/site";
import { persist, createJSONStorage } from "zustand/middleware";

interface ThemeStoreState {
 theme: string;
 setTheme: (theme: string) => void;
 radius: number;
 setRadius: (value: number) => void;
 navbarType: string;
 setNavbarType: (value: string) => void;
 footerType: string;
 setFooterType: (value: string) => void;
}

export const useThemeStore = create<ThemeStoreState>()(
 persist(
 (set) => ({
 theme: siteConfig.theme,
 setTheme: (theme) => set({ theme }),
 radius: siteConfig.radius,
 setRadius: (value) => set({ radius: value }),
 navbarType: siteConfig.navbarType,
 setNavbarType: (value) => set({ navbarType: value }),
 footerType: siteConfig.footerType,
 setFooterType: (value) => set({ footerType: value }),
 }),
 { name: "theme-store",
 storage: createJSONStorage(() => localStorage), },
 ),
)



interface SidebarState {
 collapsed: boolean;
 setCollapsed: (value: boolean) => void;
 sidebarType: string;
 setSidebarType: (value: string) => void;
 subMenu: boolean;
 setSubmenu: (value: boolean) => void;
 sidebarBg: string;
 setSidebarBg: (value: string) => void;
 mobileMenu: boolean;
 setMobileMenu: (value: boolean) => void;
}

export const useSidebar = create<SidebarState>()(
 persist(
 (set) => ({
 collapsed: false,
 setCollapsed: (value) => set({ collapsed: value }),
 sidebarType: "popover",
 setSidebarType: (value) => set({ sidebarType: value }),
 subMenu: false,
 setSubmenu: (value) => set({ subMenu: value }),
 sidebarBg: siteConfig.sidebarBg,
 setSidebarBg: (value) => set({ sidebarBg: value }),
 mobileMenu: false,
 setMobileMenu: (value) => set({ mobileMenu: value }),
 }),
 { name: "sidebar-store",
 storage: createJSONStorage(() => localStorage), },
 ),
)