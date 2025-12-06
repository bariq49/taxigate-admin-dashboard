
import {
  DashBoard,
  User,
} from "@/components/svg";
import { Car, Calendar } from "lucide-react";


export interface MenuItemProps {
  title: string;
  icon?: any;
  href?: string;
  child?: MenuItemProps[];
  megaMenu?: MenuItemProps[];
  multi_menu?: MenuItemProps[];
  nested?: MenuItemProps[];
  onClick?: () => void;
  isHeader?: boolean;
}

export const menusConfig = {
  mainNav: [
    {
      title: "Dashboard",
      icon: DashBoard,
      href: "/dashboard",
    },
    {
      title: "Drivers",
      icon: User,
      href: "/drivers",
    },
    {
      title: "Vehicles",
      icon: Car,
      href: "/vehicles",
    },
    {
      title: "Bookings",
      icon: Calendar,
      href: "/bookings",
    },
  ],
  sidebarNav: {
    modern: [
      {
        title: "Dashboard",
        icon: DashBoard,
        href: "/dashboard",
      },
      {
        title: "Drivers",
        icon: User,
        href: "/drivers",
      },
      {
        title: "Vehicles",
        icon: Car,
        href: "/vehicles",
      },
      {
        title: "Bookings",
        icon: Calendar,
        href: "/bookings",
      },
    ],
    classic: [
      {
        isHeader: true,
        title: "menu",
      },
      {
        title: "Dashboard",
        icon: DashBoard,
        href: "/dashboard",
      },
      {
        title: "Drivers",
        icon: User,
        href: "/drivers",
      },
      {
        title: "Vehicles",
        icon: Car,
        href: "/vehicles",
      },
      {
        title: "Bookings",
        icon: Calendar,
        href: "/bookings",
      },
    ],
  },
};


export type ModernNavType = (typeof menusConfig.sidebarNav.modern)[number]
export type ClassicNavType = (typeof menusConfig.sidebarNav.classic)[number]
export type MainNavType = (typeof menusConfig.mainNav)[number]
