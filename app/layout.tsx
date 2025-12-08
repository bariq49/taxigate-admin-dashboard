import "./assets/scss/globals.scss";
import "./assets/scss/theme.scss";
import { siteConfig } from "@/config/site";
import Providers from "@/provider/providers";
import "simplebar-react/dist/simplebar.min.css";
import TanstackProvider from "@/provider/providers.client";
import "flatpickr/dist/themes/light.css";
import DirectionProvider from "@/provider/direction.provider";
import { AblyProvider } from "@/contexts/ably-context";

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
            <body suppressHydrationWarning>
                <TanstackProvider>
                    <Providers>
                        <AblyProvider>
                            <DirectionProvider>{children}</DirectionProvider>
                        </AblyProvider>
                    </Providers>
                </TanstackProvider>
            </body>
        </html>
    );
}
