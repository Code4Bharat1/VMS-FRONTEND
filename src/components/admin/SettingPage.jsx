"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import * as yup from "yup";

const SECTIONS = [
  { id: "profile", label: "Edit Profile" },
  { id: "staff", label: "Add Staff" },
  { id: "supervisor", label: "Add Supervisor" },
  { id: "vendor", label: "Add Vendor" },
  { id: "bay", label: "Add Bay" },
];

export default function AdminSettings() {
  const [active, setActive] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [bays, setBays] = useState([]);
  const [errors, setErrors] = useState({});

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  useEffect(() => {
    const fetchBays = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/bays`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBays(res.data.bays || res.data || []);
      } catch (err) {
        console.error("Failed to load bays", err);
      }
    };

    fetchBays();
  }, []);

  /* ---------------- API HELPERS ---------------- */
  const post = (url, data) =>
    axios.post(url, data, {
      headers: { Authorization: `Bearer ${token}` },
    });

  /* ---------------- FORMS ---------------- */
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [staff, setStaff] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    assignedBay: "",
  });
  const [supervisor, setSupervisor] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    assignedBay: "",
  });

  const [vendor, setVendor] = useState({
    companyName: "",
    contactPerson: "",
    mobile: "",
    crNo: "",
    shopId: "",
    floorNo: "",
  });
  const [bay, setBay] = useState({ bayName: "", bayType: "" });

  useEffect(() => {
    if (user) setProfile({ name: user.name, email: user.email });
  }, [user]);

  /* ---------------- VALIDATION SCHEMAS ---------------- */
  const profileSchema = yup.object().shape({
     name: yup
      .string()
      .matches(/^[A-Za-z ]+$/, "Only alphabets are allowed")
      .required("Name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
  });

  const staffSchema = yup.object().shape({
    name: yup
      .string()
      .matches(/^[A-Za-z ]+$/, "Only alphabets are allowed")
      .required("Name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    phone: yup
      .string()
      .matches(/^[0-9]{10}$/, "Phone must be exactly 10 digits")
      .required("Phone is required"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    assignedBay: yup.string().required("Assigned bay is required"),
  });

  const supervisorSchema = yup.object().shape({
    name: yup.string().required("Name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    phone: yup
      .string()
      .matches(/^[0-9]{10}$/, "Phone must be exactly 10 digits")
      .required("Phone is required"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    assignedBay: yup.string().required("Assigned bay is required"),
  });

  const vendorSchema = yup.object().shape({
    companyName: yup.string().required("Company name is required"),
    contactPerson: yup.string().required("Contact person is required"),
    mobile: yup
      .string()
      .matches(/^[0-9]{10}$/, "Mobile must be exactly 10 digits")
      .required("Mobile is required"),
    crNo: yup.string(),
    shopId: yup.string(),
    floorNo: yup.string(),
  });

  const baySchema = yup.object().shape({
    bayName: yup.string().required("Bay name is required"),
    bayType: yup.string().required("Bay type is required"),
  });

  /* ---------------- SUBMIT HANDLERS ---------------- */
  const validateAndSubmit = async (schema, data, endpoint, resetForm) => {
    try {
      setErrors({});
      await schema.validate(data, { abortEarly: false });

      setSaving(true);
      await post(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, data);
      alert("Saved successfully");
      resetForm();
    } catch (err) {
      if (err.inner) {
        const newErrors = {};
        err.inner.forEach((e) => {
          newErrors[e.path] = e.message;
        });
        setErrors(newErrors);
      } else {
        alert(err.response?.data?.message || "Failed");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50/60">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-emerald-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-emerald-800">
                Settings Page
              </h1>
              <p className="text-sm text-emerald-600 mt-1">
                Manage your account and system configurations
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user?.name?.charAt(0) || "A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ================= SIDEBAR ================= */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-emerald-100 p-3 shadow-sm">
              <div className="space-y-1">
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActive(s.id);
                      setErrors({});
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      active === s.id
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-emerald-700 hover:bg-emerald-50"
                    }`}
                  >
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ================= CONTENT ================= */}
          <section className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-emerald-100 shadow-sm p-6 sm:p-8">
              {active === "profile" && (
                <Card
                  title="Edit Profile"
                  description="Update your personal information"
                >
                  <Input
                    label="Name"
                    value={profile.name}
                    onChange={(v) => setProfile({ ...profile, name: v })}
                    error={errors.name}
                  />
                  <Input
                    label="Email"
                    value={profile.email}
                    onChange={(v) => setProfile({ ...profile, email: v })}
                    error={errors.email}
                  />
                  <ActionButton
                    saving={saving}
                    onClick={() =>
                      validateAndSubmit(
                        profileSchema,
                        profile,
                        "/users/profile",
                        () => {}
                      )
                    }
                  />
                </Card>
              )}

              {active === "staff" && (
                <Card
                  title="Add Staff"
                  description="Add a new staff member to your team"
                >
                  <Input
                    label="Name"
                    value={staff.name}
                    onChange={(v) => setStaff({ ...staff, name: v })}
                    error={errors.name}
                  />
                  <Input
                    label="Email"
                    value={staff.email}
                    onChange={(v) => setStaff({ ...staff, email: v })}
                    error={errors.email}
                  />
                  <Input
                    label="Phone"
                    value={staff.phone}
                    onChange={(v) => setStaff({ ...staff, phone: v })}
                    error={errors.phone}
                  />
                  <Input
                    label="Password"
                    type="password"
                    value={staff.password}
                    onChange={(v) => setStaff({ ...staff, password: v })}
                    error={errors.password}
                  />
                  <div>
                    <label className="block mb-1 text-sm font-medium text-emerald-700">
                      Assigned Bay
                    </label>
                    <select
                      value={staff.assignedBay}
                      onChange={(e) =>
                        setStaff({ ...staff, assignedBay: e.target.value })
                      }
                      className={`w-full h-11 border rounded-lg px-4 bg-white focus:outline-none focus:ring-2 transition ${
                        errors.assignedBay
                          ? "border-red-500 focus:ring-red-500"
                          : "border-emerald-200 focus:ring-emerald-500"
                      }`}
                    >
                      <option value="">Select Bay</option>
                      {bays.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.bayName}
                        </option>
                      ))}
                    </select>
                    {errors.assignedBay && (
                      <p className="text-red-600 text-xs mt-1">
                        {errors.assignedBay}
                      </p>
                    )}
                  </div>

                  <ActionButton
                    saving={saving}
                    onClick={() =>
                      validateAndSubmit(staffSchema, staff, "/staff", () =>
                        setStaff({
                          name: "",
                          email: "",
                          phone: "",
                          password: "",
                          assignedBay: "",
                        })
                      )
                    }
                  />
                </Card>
              )}

              {active === "supervisor" && (
                <Card
                  title="Add Supervisor"
                  description="Register a new supervisor account"
                >
                  <Input
                    label="Name"
                    value={supervisor.name}
                    onChange={(v) => setSupervisor({ ...supervisor, name: v })}
                    error={errors.name}
                  />
                  <Input
                    label="Email"
                    value={supervisor.email}
                    onChange={(v) => setSupervisor({ ...supervisor, email: v })}
                    error={errors.email}
                  />
                  <Input
                    label="Phone"
                    value={supervisor.phone}
                    onChange={(v) => setSupervisor({ ...supervisor, phone: v })}
                    error={errors.phone}
                  />
                  <Input
                    label="Password"
                    type="password"
                    value={supervisor.password}
                    onChange={(v) =>
                      setSupervisor({ ...supervisor, password: v })
                    }
                    error={errors.password}
                  />
                  <div>
                    <label className="block mb-1 text-sm font-medium text-emerald-700">
                      Assigned Bay
                    </label>
                    <select
                      value={supervisor.assignedBay}
                      onChange={(e) =>
                        setSupervisor({
                          ...supervisor,
                          assignedBay: e.target.value,
                        })
                      }
                      className={`w-full h-11 border rounded-lg px-4 bg-white focus:outline-none focus:ring-2 transition ${
                        errors.assignedBay
                          ? "border-red-500 focus:ring-red-500"
                          : "border-emerald-200 focus:ring-emerald-500"
                      }`}
                    >
                      <option value="">Select Bay</option>
                      {bays.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.bayName}
                        </option>
                      ))}
                    </select>
                    {errors.assignedBay && (
                      <p className="text-red-600 text-xs mt-1">
                        {errors.assignedBay}
                      </p>
                    )}
                  </div>

                  <ActionButton
                    saving={saving}
                    onClick={() =>
                      validateAndSubmit(
                        supervisorSchema,
                        supervisor,
                        "/supervisors",
                        () =>
                          setSupervisor({
                            name: "",
                            email: "",
                            phone: "",
                            password: "",
                            assignedBay: "",
                          })
                      )
                    }
                  />
                </Card>
              )}

              {active === "vendor" && (
                <Card
                  title="Add Vendor"
                  description="Register a new vendor in the system"
                >
                  <Input
                    label="Company Name"
                    value={vendor.companyName}
                    onChange={(v) => setVendor({ ...vendor, companyName: v })}
                    error={errors.companyName}
                  />
                  <Input
                    label="Contact Person"
                    value={vendor.contactPerson}
                    onChange={(v) => setVendor({ ...vendor, contactPerson: v })}
                    error={errors.contactPerson}
                  />
                  <Input
                    label="Mobile"
                    value={vendor.mobile}
                    onChange={(v) => setVendor({ ...vendor, mobile: v })}
                    error={errors.mobile}
                  />
                  <Input
                    label="CR No"
                    value={vendor.crNo}
                    onChange={(v) => setVendor({ ...vendor, crNo: v })}
                    error={errors.crNo}
                  />
                  <Input
                    label="Shop ID"
                    value={vendor.shopId}
                    onChange={(v) => setVendor({ ...vendor, shopId: v })}
                    error={errors.shopId}
                  />
                  <Input
                    label="Floor No"
                    value={vendor.floorNo}
                    onChange={(v) => setVendor({ ...vendor, floorNo: v })}
                    error={errors.floorNo}
                  />
                  <ActionButton
                    saving={saving}
                    onClick={() =>
                      validateAndSubmit(vendorSchema, vendor, "/vendors", () =>
                        setVendor({
                          companyName: "",
                          contactPerson: "",
                          mobile: "",
                          crNo: "",
                          shopId: "",
                          floorNo: "",
                        })
                      )
                    }
                  />
                </Card>
              )}

              {active === "bay" && (
                <Card title="Add Bay" description="Create a new bay location">
                  <Input
                    label="Bay Name"
                    value={bay.bayName}
                    onChange={(v) => setBay({ ...bay, bayName: v })}
                    error={errors.bayName}
                  />
                  <Input
                    label="Bay Type"
                    value={bay.bayType}
                    onChange={(v) => setBay({ ...bay, bayType: v })}
                    error={errors.bayType}
                  />
                  <ActionButton
                    saving={saving}
                    onClick={() =>
                      validateAndSubmit(baySchema, bay, "/bays", () =>
                        setBay({ bayName: "", bayType: "" })
                      )
                    }
                  />
                </Card>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ================= UI COMPONENTS ================= */

function Card({ title, description, children }) {
  return (
    <div>
      <div className="mb-6 pb-4 border-b border-emerald-100">
        <h2 className="text-xl font-bold text-emerald-800">{title}</h2>
        <p className="text-sm text-emerald-600 mt-1">{description}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-emerald-700 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-11 rounded-lg px-4 border bg-white focus:outline-none focus:ring-2 transition ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-emerald-200 focus:ring-emerald-500"
        }`}
        placeholder={`Enter ${label.toLowerCase()}`}
      />
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}

function ActionButton({ onClick, saving }) {
  return (
    <div className="md:col-span-2 flex justify-end mt-8 pt-6 border-t border-emerald-100">
      <button
        onClick={onClick}
        disabled={saving}
        className="px-8 py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}