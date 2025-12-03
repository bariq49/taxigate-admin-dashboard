"use client";
import React from "react";
import { cn } from "@/lib/utils";
import ThemeButton from "./theme-button";
import { useSidebar, useThemeStore } from "@/store";
import ProfileInfo from "./profile-info";
import VerticalHeader from "./vertical-header";
import HorizontalHeader from "./horizontal-header";
import HorizontalMenu from "./horizontal-menu";
import NotificationMessage from "./notification-message";
import { useMediaQuery } from "@/hooks/use-media-query";
import MobileMenuHandler from "./mobile-menu-handler";
import ClassicHeader from "./layout/classic-header";
import FullScreen from "./full-screen";

const NavTools = ({ isDesktop, isMobile, sidebarType }: { isDesktop: boolean; isMobile: boolean; sidebarType: string }) => {
 return (
 <div className="nav-tools flex items-center gap-2">
 {isDesktop && <FullScreen />}
 <ThemeButton />
 <NotificationMessage />
 <div className="pl-2">
 <ProfileInfo />
 </div>
 {!isDesktop && sidebarType !== "module" && <MobileMenuHandler />}
 </div>
 );
};
const Header = ({ handleOpenSearch, trans }: { handleOpenSearch: () => void; trans: string }) => {
 const { collapsed, sidebarType } = useSidebar();
 const { navbarType } = useThemeStore();

 const isDesktop = useMediaQuery("(min-width: 1280px)");

 const isMobile = useMediaQuery("(min-width: 768px)");

 // Always use semibox layout
 if (navbarType === "hidden") {
 return null;
 }

 return (
 <ClassicHeader
 className={cn("has-sticky-header rounded-md ", {
 "xl:ml-[72px]": collapsed,
 "xl:ml-[272px]": !collapsed,
 "sticky top-6": navbarType === "sticky",
 })}
 >
 <div className="xl:mx-20 mx-4">
 <div className="w-full bg-card/90 backdrop-blur-lg md:px-6 px-[15px] py-3 rounded-md my-6 shadow-md border-b">
 <div className="flex justify-between items-center h-full">
 <VerticalHeader />
 <NavTools
 isDesktop={isDesktop}
 isMobile={isMobile}
 sidebarType={sidebarType}
 />
 </div>
 </div>
 </div>
 </ClassicHeader>
 );
};

export default Header;
