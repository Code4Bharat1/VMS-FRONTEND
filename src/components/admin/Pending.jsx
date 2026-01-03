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
      <div className="min-h-screen bg-emerald-50/60 flex items-center justify-center">
        <p className="text-emerald-600">Loading pending staff...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50/60">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-emerald-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center gap-3">
            <Users className="text-emerald-600" size={24} />
            <div>
              <h1 className="text-xl font-bold text-emerald-800">
                Pending Staff Approvals
              </h1>
              <p className="text-sm text-emerald-600 mt-1">
                Review and approve staff registration requests
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {staff.length === 0 && (
          <div className="bg-white rounded-xl border border-emerald-100 shadow-sm p-8 text-center">
            <Users className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-emerald-600 text-sm">
              No pending staff requests.
            </p>
          </div>
        )}

        <div className="grid gap-4">
          {staff.map((s) => (
            <div
              key={s._id}
              className="bg-white border border-emerald-100 rounded-xl
                         shadow-sm p-5 flex flex-col sm:flex-row
                         sm:items-center sm:justify-between gap-4 hover:shadow-md transition"
            >
              {/* Info */}
              <div className="space-y-2">
                <p className="font-semibold text-emerald-800 text-lg">{s.name}</p>

                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <Phone size={14} />
                  {s.phone || "N/A"}
                </div>

                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <Building2 size={14} />
                  Requested Bay: {s.assignedBay?.bayName || "—"}
                </div>

                <div className="text-xs text-emerald-600">
                  Requested by:{" "}
                  <span className="font-medium text-emerald-800">
                    {s.requestSource === "supervisor"
                      ? s.createdBy?.name || "Supervisor"
                      : "Admin"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full w-fit">
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
                             text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                >
                  <CheckCircle size={16} />
                  Approve
                </button>

                <button
                  onClick={() => setRejectingStaff(s)}
                  className="flex items-center gap-2
                             bg-red-600 hover:bg-red-700
                             text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectingStaff && (
        <div className="fixed inset-0 z-50 bg-black/40
                        flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl">
            <div className="flex justify-between items-center
                            px-6 py-4 border-b border-emerald-100">
              <h2 className="font-semibold text-emerald-800">Reject Staff</h2>
              <button
                onClick={() => {
                  setRejectingStaff(null);
                  setRejectReason("");
                }}
                className="text-emerald-600 hover:bg-emerald-50 p-1 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-emerald-700 mb-2">
                Reason for rejection
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="w-full border border-emerald-200 rounded-lg p-3 text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-500
                           min-h-[100px]"
              />
            </div>

            <div className="px-6 py-4 border-t border-emerald-100 flex justify-end gap-3">
              <button
                onClick={() => {
                  setRejectingStaff(null);
                  setRejectReason("");
                }}
                className="text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-lg transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={rejectStaff}
                disabled={!rejectReason.trim()}
                className="bg-red-600 hover:bg-red-700 text-white
                           px-4 py-2 rounded-lg font-medium transition
                           disabled:opacity-50 disabled:cursor-not-allowed"
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