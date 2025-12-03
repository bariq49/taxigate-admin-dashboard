"use client";

import { Inter } from "next/font/google";
import { useThemeStore } from "@/store";
import { ThemeProvider } from "next-themes";
import { cn } from "@/lib/utils";
import { Toaster as ReactToaster } from "@/components/ui/toaster";
import { Toaster } from "react-hot-toast";
import { SonnToaster } from "@/components/ui/sonner";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

type ProvidersProps = {
 children: React.ReactNode;
};

const Providers = ({ children }: ProvidersProps) => {
 const { theme, radius } = useThemeStore();
 const location = usePathname();

 const baseClass = cn("taxi-gate-app", inter.className);

 return (
 <ThemeProvider attribute="class" enableSystem={false} defaultTheme="light">
 <div
 className={location === "/" ? baseClass : cn(baseClass, "theme-" + theme)}
 style={{ "--radius": `${radius}rem` } as React.CSSProperties}
 >
 {children}
 <ReactToaster />
 <Toaster />
 <SonnToaster />
 </div>
 </ThemeProvider>
 );
};

export default Providers;
