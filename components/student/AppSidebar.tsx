"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getStudentFromToken, logoutStudent } from "@/utils/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "../ui/sidebar";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import Link from "next/link";
import { BookOpenCheck, FileIcon as FileUser, HomeIcon as House, LogOut, User, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";

// A custom trigger component that adapts to the sidebar state
const CustomSidebarTrigger = () => {
  const { state, toggleSidebar } = useSidebar();
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleSidebar} 
      className="h-8 w-8 rounded-full absolute right-[-12px] top-4 bg-background border shadow-sm z-10"
    >
      {state === "collapsed" ? (
        <ChevronRight className="h-4 w-4" />
      ) : (
        <ChevronLeft className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
};

const AppSidebar = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  const [student, setStudent] = useState<{
    name: string;
    matricNumber: string;
  } | null>(null);
  
  useEffect(() => {
    const fetchStudent = async () => {
      const studentData = await getStudentFromToken(); 
      if (!studentData) {
        router.push("/auth/login");
      } else {
        setStudent(studentData);
      }
    };

    fetchStudent();
  }, [router]);
  
  const navItems = [
    { label: "Home", path: "/student", icon: <House className="h-5 w-5" /> },
    {
      label: "Take Exams",
      path: "/student/exams",
      icon: <BookOpenCheck className="h-5 w-5" />,
    },
    { label: "Results", path: "/student/results", icon: <FileUser className="h-5 w-5" /> },
    { label: "Profile", path: "/student/profile", icon: <User className="h-5 w-5" /> },
  ];

  const handleLogOut = async () => {
    setIsLoggingOut(true);
    try {
      await logoutStudent();
      router.push("/auth/login");
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const firstInitial = student?.name ? student.name.split(" ")[0][0] : "S";

  return (
    <Sidebar collapsible="icon" className="relative border-r">
      <CustomSidebarTrigger />
      
      <SidebarHeader className={cn(
        "p-4 flex flex-col items-center relative",
        isCollapsed ? "pb-2" : "pb-4"
      )}>
        <div className="w-full flex items-center justify-center mb-4">
          <Avatar className={cn(
            "border-2 border-primary/20",
            isCollapsed ? "h-8 w-8" : "h-16 w-16"
          )}>
            <AvatarFallback className="bg-primary/10 text-primary">
              {firstInitial}
            </AvatarFallback>
          </Avatar>
        </div>
        {!isCollapsed && (
          <>
            <h2 className="text-xl font-bold text-center">Student Portal</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Welcome, {student?.name?.split(" ")[0]}
            </p>
          </>
        )}
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent className="px-2 py-4">
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive}
                  tooltip={item.label}
                  className={cn(
                    "transition-all duration-200 hover:bg-primary/10",
                    isActive && "bg-primary/10 font-medium"
                  )}
                >
                  <Link href={item.path} className="flex items-center py-2">
                    <div className={cn(
                      "text-muted-foreground",
                      isCollapsed ? "mx-auto" : "mr-3",
                      isActive && "text-primary"
                    )}>
                      {item.icon}
                    </div>
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarSeparator />
      
      <SidebarFooter className={cn(
        "p-4",
        isCollapsed && "flex flex-col items-center"
      )}>
        {!isCollapsed && (
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <span>ID: {student?.matricNumber}</span>
            <span className="px-2 py-1 bg-green-600 text-white rounded-md text-xs">Active</span>
          </div>
        )}
        
        <Button
          onClick={handleLogOut}
          disabled={isLoggingOut}
          variant="outline"
          size={isCollapsed ? "icon" : "default"}
          className={cn(
            "border-muted-foreground/20 hover:bg-destructive hover:text-destructive-foreground transition-colors duration-300",
            isCollapsed ? "w-8 h-8 p-0" : "w-full"
          )}
          title="Sign Out"
        >
          {isLoggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Sign Out</span>}
            </>
          )}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;