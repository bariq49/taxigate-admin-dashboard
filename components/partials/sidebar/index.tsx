"use client";
import React from "react";
import { useSidebar } from "@/store";
import { useMediaQuery } from "@/hooks/use-media-query";
import PopoverSidebar from "./popover";
import MobileSidebar from "./mobile-sidebar";

const Sidebar = ({ trans }: { trans: string }) => {
 const isDesktop = useMediaQuery("(min-width: 1280px)");

 // Always use popover sidebar for semi-box layout
 if (!isDesktop) {
 return <MobileSidebar trans={trans} />;
 }

 return <PopoverSidebar trans={trans} />;
};

export default Sidebar;
