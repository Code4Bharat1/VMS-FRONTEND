import ProtectedRoute from "@/components/ProtectedRoute";
import React from "react";

const SupervisorLayout = ({ children }) => {
  return <ProtectedRoute role="supervisor">{children}</ProtectedRoute>;
};

export default SupervisorLayout;
