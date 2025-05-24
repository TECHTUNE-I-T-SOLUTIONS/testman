"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import AppSidebar from "@/components/student/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const showSidebar = pathname.startsWith("/student");

  // ✅ Updated exclusion logic:
  const isExcluded = pathname.startsWith("/student/exams/") && pathname.includes("/take");

  const [showNoticeModal, setShowNoticeModal] = useState(false);

  useEffect(() => {
    if (showSidebar && !isExcluded) {
      const timeout = setTimeout(() => {
        setShowNoticeModal(true);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [pathname, isExcluded, showSidebar]); // ✅ include showSidebar

// this section is for showing ads
//   useEffect(() => {
//   const checkAdsStatus = async () => {
//     const res = await fetch("/api/ads");
//     const data = await res.json();
//     if (data.status === "on") {
//       // Show ads
//     }
//   };
//   checkAdsStatus();
// }, []);

  

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full relative">
        {showSidebar && <AppSidebar />}
        <main className="flex-1 pt-4 ml-8 md:pt-0 w-full">{children}</main>

        {/* Notification Modal */}
        {showNoticeModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center animate-fade-in">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-4 relative transform transition-all duration-300 animate-slide-up">
              {/* Header */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertCircle className="text-yellow-600" size={24} />
                <h2 className="text-xl font-semibold text-yellow-700">
                  Important Notification
                </h2>
              </div>

              {/* Body */}
              <p className="text-gray-700 text-sm mb-6 leading-relaxed">
                Some Faculties, Departments, and Levels will soon be deleted from the system.
                Please check and update your Faculty, Departments and levels correctly within two weeks before the final deletion, in your profile page if any of your data was affected.
                <br />
                <strong>
                  The faculties that will be deleted are (Social Science, Vetenary Medicine,
                  Physical Sciences and General Studies)
                </strong>
                <br />
                Please, kindly unselect these faculties and their departments and choose the
                correct faculties. <br />
                <strong>We are sorry for any inconveniences caused as a result of this.</strong>
                <br />
                Kindly ignore this notice if your institutional details are correct and please
                bear with us till the notice is removed.
              </p>

              {/* Footer */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowNoticeModal(false)}
                  className="px-4 py-2 border border-gray-400 text-gray-700 rounded-md hover:bg-gray-100 transition"
                >
                  Ignore
                </button>
                <button
                  onClick={() => {
                    setShowNoticeModal(false);
                    router.push("/student/profile");
                  }}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition"
                >
                  Go to Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarProvider>
  );
}
