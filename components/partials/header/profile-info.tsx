"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useLogout } from "@/hooks/auth-query";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const ProfileInfo = () => {
  const { user, isLoading } = useAuth();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Logged out successfully");
    } catch (error: any) {
      toast.error("Logout failed, but clearing local session");
    }
  };

  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "A";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className=" cursor-pointer">
        <div className=" flex items-center ">
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              getUserInitials()
            )}
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 p-0" align="end">
        <DropdownMenuLabel className="flex gap-2 items-center mb-1 p-3">
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              getUserInitials()
            )}
          </div>
          <div>
            <div className="text-sm font-medium text-default-800 capitalize ">
              {isLoading ? "Loading..." : user?.name || "Admin User"}
            </div>
            <div className="text-xs text-default-600">
              {isLoading ? "..." : user?.email || "admin@example.com"}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {[
            {
              name: "profile",
              icon: "heroicons:user",
              href: "/profile"
            },
            {
              name: "Settings",
              icon: "heroicons:cog-6-tooth",
              href: "/profile/settings"
            },
          ].map((item, index) => (
            <Link
              href={item.href}
              key={`info-menu-${index}`}
              className="cursor-pointer"
            >
              <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize px-3 py-1.5 dark:hover:bg-background cursor-pointer">
                <Icon icon={item.icon} className="w-4 h-4" />
                {item.name}
              </DropdownMenuItem>
            </Link>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="mb-0 dark:bg-background" />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            handleLogout();
          }}
          disabled={logoutMutation.isPending}
          className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize my-1 px-3 dark:hover:bg-background cursor-pointer disabled:opacity-50"
        >
          {logoutMutation.isPending ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Logging out...
            </>
          ) : (
            <>
              <Icon icon="heroicons:power" className="w-4 h-4" />
              Log out
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileInfo;
