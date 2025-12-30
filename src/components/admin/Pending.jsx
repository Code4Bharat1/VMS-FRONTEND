"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  CheckCircle,
  Clock,
  Phone,
  Building2,
  X,
} from "lucide-react";

export default function PendingStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reject modal
  const [rejectingStaff, setRejectingStaff] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  /* ================= FETCH PENDING STAFF ================= */
  useEffect(() => {
    fetchPendingStaff();
  }, []);

  const fetchPendingStaff = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/staff`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const pending = (res.data.staff || []).filter(
        (s) => s.approvalStatus === "pending"
      );

      setStaff(pending);
    } catch (err) {
      console.error("Failed to fetch pending staff", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= APPROVE STAFF ================= */
  const approveStaff = async (id) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/staff/${id}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setStaff((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Approval failed", err);
    }
  };

  /* ================= REJECT STAFF ================= */
  const rejectStaff = async () => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/staff/${rejectingStaff._id}/reject`,
        { reason: rejectReason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setStaff((prev) =>
        prev.filter((s) => s._id !== rejectingStaff._id)
      );

      setRejectingStaff(null);
      setRejectReason("");
    } catch (err) {
      console.error("Reject failed", err);
    }
  };

  /* ================= UI ================= */
  if (loading) {
    return (
      <div className="p-6 text-gray-500">
        Loading pending staff...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Users className="text-emerald-600" />
        <h1 className="text-xl font-semibold">
          Pending Staff Approvals
        </h1>
      </div>

      {staff.length === 0 && (
        <div className="text-gray-500 text-sm">
          No pending staff requests.
        </div>
      )}

      <div className="grid gap-4">
        {staff.map((s) => (
          <div
            key={s._id}
            className="bg-white border border-gray-200 rounded-xl
                       p-5 flex flex-col sm:flex-row
                       sm:items-center sm:justify-between gap-4"
          >
            {/* Info */}
            <div className="space-y-1">
              <p className="font-medium text-gray-900">{s.name}</p>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Phone size={14} />
                {s.phone || "N/A"}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Building2 size={14} />
                Requested Bay: {s.assignedBay?.bayName || "—"}
              </div>

              {/* ✅ CORRECT LOGIC */}
              <div className="text-xs text-gray-500">
                Requested by:{" "}
                <span className="font-medium text-gray-700">
                  {s.requestSource === "supervisor"
                    ? s.createdBy?.name || "Supervisor"
                    : "Admin"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-amber-600">
                <Clock size={14} />
                Pending Approval
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => approveStaff(s._id)}
                className="flex items-center gap-2
                           bg-emerald-600 hover:bg-emerald-700
                           text-white text-sm px-4 py-2 rounded-lg"
              >
                <CheckCircle size={16} />
                Approve
              </button>

              <button
                onClick={() => setRejectingStaff(s)}
                className="flex items-center gap-2
                           bg-red-600 hover:bg-red-700
                           text-white text-sm px-4 py-2 rounded-lg"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reject Modal */}
      {rejectingStaff && (
        <div className="fixed inset-0 z-50 bg-black/50
                        flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl">
            <div className="flex justify-between items-center
                            px-4 py-3 border-b">
              <h2 className="font-semibold">Reject Staff</h2>
              <X
                className="cursor-pointer"
                onClick={() => setRejectingStaff(null)}
              />
            </div>

            <div className="p-4">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason for rejection"
                className="w-full border rounded-lg p-2 text-sm"
              />
            </div>

            <div className="px-4 py-3 border-t flex justify-end gap-3">
              <button onClick={() => setRejectingStaff(null)}>
                Cancel
              </button>
              <button
                onClick={rejectStaff}
                className="bg-red-600 text-white
                           px-4 py-2 rounded-lg"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
