"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    if (user.role === "admin") {
      router.replace("/");
    } else if (user.role === "staff") {
      router.replace("/staff/dashboard");
    } else if (user.role === "supervisor") {
      router.replace("/supervisor/dashboard");
    }
  }, [isAuthenticated, user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-emerald-50 to-white">
      <Loader2 size={40} className="animate-spin text-emerald-600" />
    </div>
  );
}
