"use client";
import { useSession, signOut } from "next-auth/react";
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
import Image from "next/image";
import Link from "next/link";

const ProfileInfo = () => {
 const { data: session } = useSession();
 return (
 <DropdownMenu>
 <DropdownMenuTrigger asChild className=" cursor-pointer">
 <div className=" flex items-center ">
 {session?.user?.image ? (
 <Image
 src={session?.user?.image}
 alt={session?.user?.name ?? ""}
 width={36}
 height={36}
 className="rounded-full"
 />
 ) : (
 <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
 {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
 </div>
 )}
 </div>
 </DropdownMenuTrigger>
 <DropdownMenuContent className="w-56 p-0" align="end">
 <DropdownMenuLabel className="flex gap-2 items-center mb-1 p-3">
 {session?.user?.image && (
 <Image
 src={session?.user?.image}
 alt={session?.user?.name ?? ""}
 width={36}
 height={36}
 className="rounded-full"
 />
 )}
 <div>
 <div className="text-sm font-medium text-default-800 capitalize ">
 {session?.user?.name ?? "Mcc Callem"}
 </div>
 <Link
 href="/dashboard"
 className="text-xs text-default-600 hover:text-primary"
 >
 @uxuidesigner
 </Link>
 </div>
 </DropdownMenuLabel>
 <DropdownMenuGroup>
 {[
 {
 name: "profile",
 icon: "heroicons:user",
 href:"/dashboard"
 },
 {
 name: "Settings",
 icon: "heroicons:cog-6-tooth",
 href:"/dashboard"
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
 onSelect={() => signOut()}
 className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize my-1 px-3 dark:hover:bg-background cursor-pointer"
 >
 <Icon icon="heroicons:power" className="w-4 h-4" />
 Log out
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 );
};
export default ProfileInfo;
