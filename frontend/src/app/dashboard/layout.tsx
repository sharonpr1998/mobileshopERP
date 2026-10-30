import type { ReactNode } from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Topbar from "@/components/layout/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <div className="hidden lg:block">
          </div>

          <div className="min-w-0 flex-1">
            <Topbar />

            <main className="p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}