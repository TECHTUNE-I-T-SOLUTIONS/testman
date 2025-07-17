"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
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
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Home,
  Users,
  Calendar,
  Book,
  ClipboardList,
  Layers,
  Cpu,
  HelpCircle,
  Tag,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  List,
  Brain,
  NotebookPen,
  NotepadTextDashed,
  NotebookTabs,
  Megaphone,
  ClipboardPlus,
  View,
  Bell,
} from "lucide-react"
import { HelpCircle, AlertCircle } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

const CustomSidebarTrigger = () => {
  const { state, toggleSidebar } = useSidebar()
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className="h-8 w-8 rounded-full absolute right-[-12px] top-4 bg-white border border-gray-200 shadow-sm z-10 hidden md:flex hover:bg-gray-50"
    >
      {state === "collapsed" ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

const MobileSidebarTrigger = () => {
  const { setOpenMobile } = useSidebar()
  useEffect(() => {
    const handleRouteChange = () => {
      if (window.innerWidth < 768) {
        setOpenMobile(false)
      }
    }
    window.addEventListener("hashchange", handleRouteChange)
    window.addEventListener("popstate", handleRouteChange)
    return () => {
      window.removeEventListener("hashchange", handleRouteChange)
      window.removeEventListener("popstate", handleRouteChange)
    }
  }, [setOpenMobile])

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setOpenMobile(true)}
      className="fixed top-4 left-4 z-50 md:hidden bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Open Menu</span>
    </Button>
  )
}

const AdminSidebar = () => {
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({})
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [currentTime, setCurrentTime] = useState("")
  const router = useRouter()
  const pathname = usePathname()
  const { state, setOpenMobile } = useSidebar()
  const { data: session } = useSession()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const adminEmail = session?.user?.email ?? "admin@example.com"
  const adminRole = session?.user?.role ?? "Admin"
  const adminMatric = session?.user?.matricNumber ?? "ADMIN-2023-001"
  const adminName = session?.user?.name ?? "Admin User"
  const isSuperAdmin = adminRole === "super-admin"
  const isCollapsed = state === "collapsed"

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const navItems = [
    { label: "Dashboard", path: "/dashboard/super-admin", icon: <Home className="h-5 w-5" /> },
    // Only show to super-admin
    isSuperAdmin && {
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
    // Only for super-admin
    (adminRole === "super-admin" || adminRole === "Admin") && {
      label: "Manage Admins",
      path: "/dashboard/super-admin/manage-admins",
      icon: <Tag className="h-5 w-5" />,
    },
    // Available to all roles
    {
      label: "Manage Students",
      path: "/dashboard/super-admin/manage-students",
      icon: <Cpu className="h-5 w-5" />,
    },
    // NEW: AI Access Management - Only for super-admin
    isSuperAdmin && {
      label: "AI Access Management",
      path: "/dashboard/super-admin/manage-ai-access",
      icon: <Brain className="h-5 w-5" />,
      badge: "NEW",
      badgeColor: "bg-green-500",
    },
    isSuperAdmin && {
      label: "Manage Notes",
      icon: <NotebookPen className="h-5 w-5" />,
      subItems: [
        {
          label: "Create Notes",
          path: "/dashboard/super-admin/manage-notes/create",
          icon: <NotepadTextDashed className="h-4 w-4" />,
        },
        {
          label: "View Notes",
          path: "/dashboard/super-admin/manage-notes/view",
          icon: <NotebookTabs className="h-4 w-4" />,
        },
      ],
    },
    isSuperAdmin && {
      label: "Manage Advertisements",
      icon: <Megaphone className="h-5 w-5" />,
      subItems: [
        {
          label: "Toggle Ads On/Off",
          path: "/dashboard/super-admin/manage-ads/create",
          icon: <ClipboardPlus className="h-4 w-4" />,
        },
        { label: "View Ads", path: "/dashboard/super-admin/manage-ads/view", icon: <View className="h-4 w-4" /> },
      ],
    },
    isSuperAdmin && {
      label: "Announcements",
      icon: <Megaphone className="h-5 w-5" />,
      subItems: [
        {
          label: "Create",
          path: "/dashboard/super-admin/announcements/create",
          icon: <ClipboardPlus className="h-4 w-4" />,
        },
        { label: "View", path: "/dashboard/super-admin/announcements/view", icon: <View className="h-4 w-4" /> },
      ],
    },
    {
      label: "Manage Blog",
      icon: <Book className="h-5 w-5" />,
      subItems: [
        {
          label: "Create Blog",
          path: "/dashboard/super-admin/blog/create",
          icon: <NotepadTextDashed className="h-4 w-4" />,
        },
        { label: "View Blogs", path: "/dashboard/super-admin/blog/view", icon: <View className="h-4 w-4" /> },
      ],
    },
    { label: "Profile", path: "/dashboard/super-admin/profile", icon: <Settings className="h-5 w-5" /> },
  ].filter((item): item is Exclude<typeof item, false> => item !== false)

  const toggleDropdown = (label: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  useEffect(() => {
    if (isCollapsed) setOpenDropdowns({})
  }, [isCollapsed])

  const isPathActive = (path: string) => pathname === path || pathname?.startsWith(`${path}/`)

  const confirmLogout = () => setShowLogoutModal(true)
  const cancelLogout = () => setShowLogoutModal(false)

  const handleLogOut = async () => {
    setIsLoggingOut(true)
    try {
      await signOut({ callbackUrl: "/auth/admin/login" })
    } catch (error) {
      console.error("Error during logout:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const displayRole = adminRole.charAt(0).toUpperCase() + adminRole.slice(1).toLowerCase()

  return (
    <>
      <MobileSidebarTrigger />
      <Sidebar collapsible="icon" className="fixed border-r border-gray-200 bg-white">
        <CustomSidebarTrigger />
        <SidebarHeader
          className={cn(
            "p-6 flex flex-col items-center relative border-b border-gray-100",
            isCollapsed ? "pb-4" : "pb-6",
          )}
        >
          {/* Admin Avatar and Info */}
          <div className="w-full flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className={cn("border-2 border-gray-200", isCollapsed ? "h-10 w-10" : "h-16 w-16")}>
                <AvatarFallback className="bg-gray-900 text-white font-semibold text-lg">
                  {adminName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full" />
            </div>
            {!isCollapsed && (
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-gray-900">Admin Portal</h2>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700">{adminName}</p>
                  <Badge className="bg-gray-900 text-white text-xs">
                    {displayRole === "Super-admin" ? "Super Admin" : displayRole}
                  </Badge>
                </div>
                <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>{currentTime}</span>
                </div>
              </div>
            )}
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <UISidebarContent className="px-3 py-4">
          <SidebarMenu>
            {navItems.map((item, index) => {
              if (!item.subItems) {
                return (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton
                      asChild
                      isActive={isPathActive(item.path!)}
                      tooltip={item.label}
                      className={cn(
                        "transition-all duration-200 h-12 mb-1 rounded-lg relative",
                        isPathActive(item.path!)
                          ? "bg-gray-900 text-white hover:bg-gray-800 shadow-sm"
                          : "hover:bg-gray-50 text-gray-700",
                      )}
                    >
                      <button
                        onClick={() => {
                          router.push(item.path!)
                          setOpenMobile(false)
                        }}
                        className="flex items-center py-2 w-full relative"
                      >
                        <div className={cn("text-current", isCollapsed ? "mx-auto" : "mr-3")}>{item.icon}</div>
                        {!isCollapsed && <span className="font-medium">{item.label}</span>}
                        {/* NEW Badge */}
                        {item.badge && !isCollapsed && (
                          <div className="ml-auto">
                            <Badge className={cn("text-xs px-2 py-0.5 text-white", item.badgeColor || "bg-blue-500")}>
                              {item.badge}
                            </Badge>
                          </div>
                        )}
                        {item.badge && isCollapsed && (
                          <div className="absolute -top-1 -right-1">
                            <div className={cn("w-2 h-2 rounded-full", item.badgeColor || "bg-blue-500")} />
                          </div>
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              }

              return (
                <div key={index}>
                  <SidebarMenuItem>
                    <Collapsible
                      open={openDropdowns[item.label]}
                      onOpenChange={() => !isCollapsed && toggleDropdown(item.label)}
                      className="w-full"
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.label}
                          className={cn(
                            "transition-all duration-200 h-12 mb-1 rounded-lg",
                            openDropdowns[item.label] ? "bg-gray-100" : "hover:bg-gray-50",
                            item.subItems?.some((subItem) => isPathActive(subItem.path)) && "text-gray-900 bg-gray-100",
                          )}
                        >
                          <div className="flex items-center justify-between py-2 w-full">
                            <div className="flex items-center">
                              <div className={cn("text-current", isCollapsed ? "mx-auto" : "mr-3")}>{item.icon}</div>
                              {!isCollapsed && <span className="font-medium">{item.label}</span>}
                            </div>
                            {!isCollapsed && (
                              <ChevronDown
                                className={cn(
                                  "h-4 w-4 transition-transform duration-200",
                                  openDropdowns[item.label] ? "rotate-180" : "rotate-0",
                                )}
                              />
                            )}
                          </div>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pl-8 space-y-1">
                        <ul>
                          {item.subItems.map((sub, i) => (
                            <SidebarMenuSubItem key={i}>
                              <SidebarMenuSubButton
                                isActive={isPathActive(sub.path)}
                                className={cn(
                                  "hover:bg-gray-50 transition-colors rounded-lg",
                                  isPathActive(sub.path) && "bg-gray-900 text-white hover:bg-gray-800",
                                )}
                                onClick={() => {
                                  router.push(sub.path)
                                  setOpenMobile(false)
                                }}
                              >
                                {sub.icon}
                                <span>{sub.label}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </ul>
                      </CollapsibleContent>
                    </Collapsible>
                  </SidebarMenuItem>
                </div>
              )
            })}
          </SidebarMenu>
        </UISidebarContent>
        <SidebarFooter className="border-t border-gray-100 p-4 space-y-4">
          {!isCollapsed && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <User className="h-3 w-3" />
                <span>ID: {adminMatric}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Shield className="h-3 w-3" />
                <span>Secure Session</span>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              className="w-full text-sm border-gray-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors bg-transparent"
              disabled={isLoggingOut}
              onClick={confirmLogout}
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  {isCollapsed ? "" : "Sign Out"}
                </>
              )}
            </Button>
            <ThemeToggle />
          </div>
        </SidebarFooter>
      </Sidebar>

      <Dialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 bg-red-50 rounded-full">
                <LogOut className="h-5 w-5 text-red-600" />
              </div>
              Confirm Sign Out
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to sign out of the Admin Portal? You&apos;ll need to log in again to access your
              dashboard.
            </p>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={cancelLogout} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handleLogOut}
              disabled={isLoggingOut}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing Out...
                </>
              ) : (
                "Sign Out"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AdminSidebar