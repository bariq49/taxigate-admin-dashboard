import DashBoardLayoutProvider from "@/provider/dashboard.layout.provider";
export const metadata = {
    title: "Dashboard",
};

const Layout = async ({ children }: { children: React.ReactNode }) => {

    return (
        <DashBoardLayoutProvider trans={{}}>{children}</DashBoardLayoutProvider>
    );
};

export default Layout;