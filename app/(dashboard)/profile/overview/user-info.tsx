"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@/components/svg";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/badge";

interface UserInfoItem {
  icon: React.ComponentType<{ className?: string }> | string;
  label: string;
  value: string;
}

const UserInfo = () => {
  const { user, isLoading } = useAuth();

  const userInfo: UserInfoItem[] = [
    {
      icon: User,
      label: "ID",
      value: isLoading ? "Loading..." : user?.id || "N/A"
    },
    {
      icon: User,
      label: "Full Name",
      value: isLoading ? "Loading..." : user?.name || "N/A"
    },
    {
      icon: "heroicons:envelope",
      label: "Email",
      value: isLoading ? "Loading..." : user?.email || "N/A"
    },
    {
      icon: "heroicons:user-circle",
      label: "Role",
      value: isLoading ? "Loading..." : (user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "N/A")
    },
    {
      icon: "heroicons:check-circle",
      label: "Status",
      value: isLoading ? "Loading..." : (user?.active ? "Active" : "Inactive")
    },
  ]
  return (
    <Card>
      <CardHeader className="border-none mb-0">
        <CardTitle className="text-lg font-medium text-default-800">Information</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {
              userInfo.map((item, index) => (
                <li
                  key={`user-info-${index}`}
                  className="flex items-center"
                >
                  <div className="flex-none  2xl:w-56 flex items-center gap-1.5">
                    <span>
                      {typeof item.icon === 'string' ? (
                        <Icon icon={item.icon} className="w-4 h-4 text-primary" />
                      ) : (
                        <item.icon className="w-4 h-4 text-primary" />
                      )}
                    </span>
                    <span className="text-sm font-medium text-default-800">{item.label}:</span>
                  </div>
                  <div className="flex-1 text-sm text-default-700">
                    {item.label === "Status" && user ? (
                      <Badge 
                        variant={user.active ? "default" : "secondary"}
                        className={user.active ? "bg-green-500 hover:bg-green-600" : ""}
                      >
                        {item.value}
                      </Badge>
                    ) : (
                      item.value
                    )}
                  </div>
                </li>
              ))
            }
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default UserInfo;