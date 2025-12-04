import DashBoardLayoutProvider from "@/provider/dashboard.layout.provider";

const layout = ({ children }: { children: React.ReactNode }) => {
  // Auth protection is handled by AuthProvider at the root level
  return (
    <DashBoardLayoutProvider trans={{}}>{children}</DashBoardLayoutProvider>
  );
};

export default layout;
