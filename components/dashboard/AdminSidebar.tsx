"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  Sidebar,
  SidebarContent as UISidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  LogOut,
  Home,
  Users,
  Tag,
  Cpu,
  Settings,
  Book,
  ClipboardList,
  Layers,
  Calendar,
  List,
  ChevronDown,
} from "lucide-react"
import { HelpCircle, AlertCircle } from "lucide-react"

// A custom trigger component that adapts to the sidebar state
const CustomSidebarTrigger = () => {
  const { state, toggleSidebar } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className="h-8 w-8 rounded-full absolute right-[-12px] top-4 bg-background border shadow-sm z-10"
    >
      {state === "collapsed" ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

const AdminSidebar = () => {
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({})
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const navItems = [
    { label: "Home", path: "/dashboard/super-admin", icon: <Home className="h-5 w-5" /> },
    {
      label: "Manage Academics",
      icon: <Users className="h-5 w-5" />,
      subItems: [
        {
          label: "Session",
          path: "/dashboard/super-admin/manage-academics/session",
          icon: <Calendar className="h-4 w-4" />,
        },
        {
          label: "Faculty",
          path: "/dashboard/super-admin/manage-academics/faculties",
          icon: <Book className="h-4 w-4" />,
        },
        {
          label: "Departments",
          path: "/dashboard/super-admin/manage-academics/departments",
          icon: <ClipboardList className="h-4 w-4" />,
        },
        {
          label: "Levels",
          path: "/dashboard/super-admin/manage-academics/levels",
          icon: <Layers className="h-4 w-4" />,
        },
        {
          label: "Courses",
          path: "/dashboard/super-admin/manage-academics/courses",
          icon: <Cpu className="h-4 w-4" />,
        },
      ],
    },
    {
      label: "Manage Questions",
      icon: <HelpCircle className="h-5 w-5" />,
      subItems: [
        {
          label: "Create Questions",
          path: "/dashboard/super-admin/manage-questions/questions",
          icon: <HelpCircle className="h-4 w-4" />,
        },
        {
          label: "Create Exams",
          path: "/dashboard/super-admin/manage-questions/exams",
          icon: <AlertCircle className="h-4 w-4" />,
        },
        {
          label: "Manage Results",
          path: "/dashboard/super-admin/manage-questions/results",
          icon: <List className="h-4 w-4" />,
        },
      ],
    },
    {
      label: "Manage Admins",
      path: "/dashboard/super-admin/manage-admins",
      icon: <Tag className="h-5 w-5" />,
    },
    {
      label: "Manage Students",
      path: "/dashboard/super-admin/manage-students",
      icon: <Cpu className="h-5 w-5" />,
    },
    {
      label: "Profile",
      path: "/dashboard/super-admin/profile",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  const toggleDropdown = (label: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [label]: !prev[label],
    }))
  }

  // Close dropdowns when sidebar collapses
  useEffect(() => {
    if (isCollapsed) {
      setOpenDropdowns({})
    }
  }, [isCollapsed])

  const handleLogOut = async () => {
    setIsLoggingOut(true)
    try {
      await signOut({ callbackUrl: "/dashboard/login" })
    } catch (error) {
      console.error("Error during logout:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const isPathActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  return (
    <Sidebar collapsible="icon" className="relative border-r">
      <CustomSidebarTrigger />
      <SidebarHeader className={cn("p-4 flex flex-col items-center relative", isCollapsed ? "pb-2" : "pb-4")}>
        <div className="w-full flex items-center justify-center mb-4">
          <Avatar className={cn("border-2 border-primary/20", isCollapsed ? "h-8 w-8" : "h-16 w-16")}>
            <AvatarFallback className="bg-primary/10 text-primary">AD</AvatarFallback>
          </Avatar>
        </div>
        {!isCollapsed && (
          <>
            <h2 className="text-xl font-bold text-center">Admin Portal</h2>
            <p className="text-sm text-muted-foreground mt-1">Welcome, Admin</p>
          </>
        )}
      </SidebarHeader>
      <SidebarSeparator />

      <UISidebarContent className="px-2 py-4">
        <SidebarMenu>
          {navItems.map((item, index) => {
            // For items without subitems
            if (!item.subItems) {
              return (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton
                    asChild
                    isActive={isPathActive(item.path!)}
                    tooltip={item.label}
                    className={cn(
                      "transition-all duration-200",
                      isPathActive(item.path!) ? "bg-primary/10 text-primary" : "hover:bg-muted",
                    )}
                  >
                    <button onClick={() => router.push(item.path!)} className="flex items-center py-2 w-full">
                      <div className={cn("text-current", isCollapsed ? "mx-auto" : "mr-3")}>{item.icon}</div>
                      {!isCollapsed && <span>{item.label}</span>}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            }

            // For items with subitems
            return (
              <SidebarMenuItem key={index}>
                <Collapsible
                  open={openDropdowns[item.label]}
                  onOpenChange={() => !isCollapsed && toggleDropdown(item.label)}
                  className="w-full"
                >
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.label}
                      className={cn(
                        "transition-all duration-200",
                        openDropdowns[item.label] ? "bg-primary/10" : "hover:bg-muted",
                        item.subItems?.some((subItem) => isPathActive(subItem.path)) && "text-primary",
                      )}
                    >
                      <div className="flex items-center justify-between py-2 w-full">
                        <div className="flex items-center">
                          <div className={cn("text-current", isCollapsed ? "mx-auto" : "mr-3")}>{item.icon}</div>
                          {!isCollapsed && <span>{item.label}</span>}
                        </div>
                        {!isCollapsed && (
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform duration-200",
                              openDropdowns[item.label] ? "rotate-180" : "",
                            )}
                          />
                        )}
                      </div>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    {!isCollapsed && (
                      <SidebarMenuSub>
                        {item.subItems?.map((subItem, subIndex) => (
                          <SidebarMenuSubItem key={subIndex}>
                            <SidebarMenuSubButton asChild isActive={isPathActive(subItem.path)}>
                              <button onClick={() => router.push(subItem.path)} className="flex items-center w-full">
                                <div className="mr-2 text-current">{subItem.icon}</div>
                                <span>{subItem.label}</span>
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </UISidebarContent>

      <SidebarSeparator />

      <SidebarFooter className={cn("p-4", isCollapsed && "flex flex-col items-center")}>
        {!isCollapsed && (
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <span>ID: jgd67fwgk</span>
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">Active</span>
          </div>
        )}

        <Button
          onClick={handleLogOut}
          disabled={isLoggingOut}
          variant="outline"
          size={isCollapsed ? "icon" : "default"}
          className={cn(
            "border-muted-foreground/20 hover:bg-destructive hover:text-destructive-foreground transition-colors duration-300",
            isCollapsed ? "w-8 h-8 p-0" : "w-full",
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
  )
}


export default AdminSidebar

