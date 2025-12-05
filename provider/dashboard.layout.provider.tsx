"use client";
import React from "react";
import Header from "@/components/partials/header";
import Sidebar from "@/components/partials/sidebar";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/store";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "@/hooks/use-media-query";
import HeaderSearch from "@/components/header-search";
import { useMounted } from "@/hooks/use-mounted";
import LayoutLoader from "@/components/layout-loader";

const DashBoardLayoutProvider = ({ children, trans }: { children: React.ReactNode, trans: any }) => {
 const { collapsed } = useSidebar();
 const [open, setOpen] = React.useState(false);
 const location = usePathname();
 const isMobile = useMediaQuery("(min-width: 768px)");
 const mounted = useMounted();
 
 if (!mounted) {
 return <LayoutLoader />;
 }

 return (
 <>
 <Header handleOpenSearch={() => setOpen(true)} trans={trans} />
 <Sidebar trans={trans} />

 <div
 className={cn("content-wrapper transition-all duration-150 ", {
 "xl:ml-[72px]": collapsed,
 "xl:ml-[272px]": !collapsed,
 })}
 >
 <div className="pt-6 pb-8 px-4 page-min-height-semibox">
 <div className="semibox-content-wrapper ">
 <LayoutWrapper
 isMobile={isMobile}
 setOpen={setOpen}
 open={open}
 location={location}
 trans={trans}
 >
 {children}
 </LayoutWrapper>
 </div>
 </div>
 </div>
 </>
 );
};

export default DashBoardLayoutProvider;

const LayoutWrapper = ({ children, isMobile, setOpen, open, location, trans }: { children: React.ReactNode, isMobile: boolean, setOpen: any, open: boolean, location: any, trans: any }) => {
 return (
 <>
 <motion.div
 key={location}
 initial="pageInitial"
 animate="pageAnimate"
 exit="pageExit"
 variants={{
 pageInitial: {
 opacity: 0,
 y: 50,
 },
 pageAnimate: {
 opacity: 1,
 y: 0,
 },
 pageExit: {
 opacity: 0,
 y: -50,
 },
 }}
 transition={{
 type: "tween",
 ease: "easeInOut",
 duration: 0.5,
 }}
 >
 <main>{children}</main>
 </motion.div>

 <HeaderSearch open={open} setOpen={setOpen} />
 </>
 );
};
