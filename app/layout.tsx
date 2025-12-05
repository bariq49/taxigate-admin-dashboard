import "./assets/scss/globals.scss";
import "./assets/scss/theme.scss";
import { Inter } from "next/font/google";
import { siteConfig } from "@/config/site";
import Providers from "@/provider/providers";
import "simplebar-react/dist/simplebar.min.css";
import TanstackProvider from "@/provider/providers.client";
import "flatpickr/dist/themes/light.css";
import DirectionProvider from "@/provider/direction.provider";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata = {
    title: {
        default: siteConfig.name,
        template: `%s - ${siteConfig.name}`,
    },
    description: siteConfig.description,
};

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className} suppressHydrationWarning>
                <TanstackProvider>
                    <Providers>
                        <DirectionProvider>{children}</DirectionProvider>
                    </Providers>
                </TanstackProvider>
            </body>
        </html>
    );
}
