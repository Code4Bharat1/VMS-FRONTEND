// "use client";

// import React from "react";
// import { LogOut, CarTaxiFront } from "lucide-react";
// import { useRouter } from "next/navigation";
// import ProtectedRoute from "@/components/ProtectedRoute";
// import authService from "@/services/authService";
// import { useAuth } from "@/context/AuthContext";

// function StaffDashboardContent() {
//   const router = useRouter();
//   const { user, logout } = useAuth();

//   const handleLogout = async () => {
//     try {
//       await authService.logout();
//       logout();
//     } catch (err) {
//       console.error(err);
//       logout();
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white p-4">
//       <div className="max-w-6xl mx-auto">
//         <div className="bg-white rounded-2xl shadow-lg p-8">
//           <div className="flex items-center justify-between mb-6">
//             <div className="flex items-center gap-4">
//               <div className="bg-green-100 text-green-700 p-3 rounded-xl">
//                 <CarTaxiFront size={32} />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold text-emerald-700">
//                   Staff Dashboard
//                 </h1>
//                 <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
//               </div>
//             </div>

//             <button
//               onClick={handleLogout}
//               className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
//             >
//               <LogOut size={16} />
//               Logout
//             </button>
//           </div>

//           <div className="border-t pt-6">
//             <p className="text-gray-600">
//               This is your staff dashboard. Add your staff-specific content
//               here.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function StaffDashboardPage() {
//   return (
//     <ProtectedRoute>
//       <StaffDashboardContent />
//     </ProtectedRoute>
//   );
// }

import Dashboard from "@/components/Staff/Dashboard";
import React from "react";
const Page = () => {
  return (
    <Dashboard />
  );

};

export default Page;
