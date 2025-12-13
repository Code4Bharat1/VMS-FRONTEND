// app/no-access/page.jsx
import React from "react";
import Link from "next/link";

export default function NoAccess() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow text-center max-w-md">
        <h2 className="text-2xl font-semibold text-rose-600">Access Denied</h2>
        <p className="mt-3 text-gray-600">
          You do not have permission to view this page.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 px-4 py-2 bg-emerald-600 text-white rounded"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
