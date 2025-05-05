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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  NotebookPen,  
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
  Megaphone,
  NotepadTextDashed,
  View,
  ClipboardPlus,
  NotebookTabs,
  Menu,
} from "lucide-react"
import { HelpCircle, AlertCircle } from "lucide-react"

const CustomSidebarTrigger = () => {
  const { state, toggleSidebar } = useSidebar()
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className="h-8 w-8 rounded-full absolute right-[-12px] top-4 bg-background border shadow-sm z-10 hidden md:flex"
    >
      {state === "collapsed" ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

const MobileSidebarTrigger = () => {
  const { setOpenMobile } = useSidebar()
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setOpenMobile(true)}
      className="fixed top-4 left-4 z-50 md:hidden"
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
  const router = useRouter()
  const pathname = usePathname()
  const { state } = useSidebar()
  const { data: session } = useSession()

  const adminEmail = session?.user?.email ?? "admin@example.com"
  const adminName = session?.user?.name ?? "Admin User"
  const adminRole = session?.user?.role ?? "Admin"
  const adminMatric = session?.user?.matricNumber ?? "ADMIN-2023-001"
  const isSuperAdmin = adminRole === "super-admin"
  const isCollapsed = state === "collapsed"

  const navItems = [
    { label: "Home", path: "/dashboard/super-admin", icon: <Home className="h-5 w-5" /> },
    {
      label: "Manage Academics",
      icon: <Users className="h-5 w-5" />,
      subItems: [
        { label: "Session", path: "/dashboard/super-admin/manage-academics/session", icon: <Calendar className="h-4 w-4" /> },
        { label: "Faculty", path: "/dashboard/super-admin/manage-academics/faculties", icon: <Book className="h-4 w-4" /> },
        { label: "Departments", path: "/dashboard/super-admin/manage-academics/departments", icon: <ClipboardList className="h-4 w-4" /> },
        { label: "Levels", path: "/dashboard/super-admin/manage-academics/levels", icon: <Layers className="h-4 w-4" /> },
        { label: "Courses", path: "/dashboard/super-admin/manage-academics/courses", icon: <Cpu className="h-4 w-4" /> },
      ],
    },
    {
      label: "Manage Questions",
      icon: <HelpCircle className="h-5 w-5" />,
      subItems: [
        { label: "Create Questions", path: "/dashboard/super-admin/manage-questions/questions", icon: <HelpCircle className="h-4 w-4" /> },
        { label: "Create Exams", path: "/dashboard/super-admin/manage-questions/exams", icon: <AlertCircle className="h-4 w-4" /> },
        { label: "Manage Results", path: "/dashboard/super-admin/manage-questions/results", icon: <List className="h-4 w-4" /> },
      ],
    },
    isSuperAdmin && {
      label: "Manage Admins",
      path: "/dashboard/super-admin/manage-admins",
      icon: <Tag className="h-5 w-5" />,
    },
    {
      label: "Manage Students",
      path: "/dashboard/super-admin/manage-students",
      icon: <Cpu className="h-5 w-5" />,
    },
    isSuperAdmin && {
      label: "Manage Notes",
      icon: <NotebookPen className="h-5 w-5" />,
      subItems: [
        { label: "Create Notes", path: "/dashboard/super-admin/manage-notes/create", icon: <NotepadTextDashed className="h-4 w-4" /> },
        { label: "view Notes", path: "/dashboard/super-admin/manage-notes/view", icon: <NotebookTabs className="h-4 w-4" /> },
      ],
    },
    isSuperAdmin && {
      label: "Manage Advertisements",
      icon: <Megaphone className="h-5 w-5" />,
      subItems: [
        { label: "Toggle adds on/off", path: "/dashboard/super-admin/manage-ads/create", icon: <ClipboardPlus className="h-4 w-4" /> },
        { label: "view Ads", path: "/dashboard/super-admin/manage-ads/view", icon: <View className="h-4 w-4" /> },
      ],
    },
    { label: "Profile", path: "/dashboard/super-admin/profile", icon: <Settings className="h-5 w-5" /> },
  ].filter(Boolean)

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

  return (
    <>
      <MobileSidebarTrigger />

      <Sidebar collapsible="icon" className="fixed border-r">
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
              <p className="text-sm text-muted-foreground mt-1">Welcome, {adminEmail}</p>
              <p className="text-xs font-bold text-muted-foreground mt-0 capitalize">{adminRole}</p>
            </>
          )}
        </SidebarHeader>
        <SidebarSeparator />

        <UISidebarContent className="px-2 py-4">
          <SidebarMenu>
            {navItems.map((item, index) => {
              if (!item.subItems) {
                return (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton
                      asChild
                      isActive={isPathActive(item.path!)}
                      tooltip={item.label}
                      className={cn("transition-all duration-200", isPathActive(item.path!) ? "bg-primary/10 text-primary" : "hover:bg-muted")}
                    >
                      <button onClick={() => router.push(item.path!)} className="flex items-center py-2 w-full">
                        <div className={cn("text-current", isCollapsed ? "mx-auto" : "mr-3")}>{item.icon}</div>
                        {!isCollapsed && <span>{item.label}</span>}
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
                                  openDropdowns[item.label] ? "rotate-180" : "rotate-0"
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
                                className={cn("hover:bg-muted", isPathActive(sub.path) && "bg-primary/10 text-primary")}
                                onClick={() => router.push(sub.path)}
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

        <SidebarFooter className="border-t p-4 flex flex-col gap-2">
          <Button
            variant="outline"
            className="w-full text-sm"
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
                Logout
              </>
            )}
          </Button>
        </SidebarFooter>
      </Sidebar>

      <Dialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to log out of the Admin Portal?
          </p>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={cancelLogout}>Cancel</Button>
            <Button onClick={handleLogOut} disabled={isLoggingOut}>
              {isLoggingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AdminSidebar
