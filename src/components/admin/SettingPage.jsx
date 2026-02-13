"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import * as yup from "yup";

const SECTIONS = [
  { id: "profile", label: "Edit Profile", icon: "👤" },
  { id: "staff", label: "Add Staff", icon: "👥" },
  { id: "supervisor", label: "Add Supervisor", icon: "🎯" },
  { id: "vendor", label: "Add Tenant", icon: "🏢" },
  { id: "bay", label: "Add Bay", icon: "📍" },
];

export default function AdminSettings() {
  const [active, setActive] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [bays, setBays] = useState([]);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const updateProfile = async () => {
    try {
      setErrors({});
      await profileSchema.validate(profile, { abortEarly: false });

      setProfileSaving(true);

      await put(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/users/profile`,
        profile
      );

      alert("Profile updated successfully");

      // update local storage user
      const updatedUser = { ...user, ...profile };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err) {
      if (err.inner) {
        const e = {};
        err.inner.forEach((x) => (e[x.path] = x.message));
        setErrors(e);
      } else {
        alert(err.response?.data?.message || "Failed");
      }
    } finally {
      setProfileSaving(false);
    }
  };

  const updatePassword = async () => {
    try {
      setErrors({});
      await passwordSchema.validate(passwordForm, { abortEarly: false });

      setPasswordSaving(true);

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/users/update-password`,
        passwordForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Password updated. Please login again.");
      localStorage.clear();
      window.location.href = "/login";
    } catch (err) {
      if (err.inner) {
        const e = {};
        err.inner.forEach((x) => (e[x.path] = x.message));
        setErrors(e);
      } else {
        alert(err.response?.data?.message || "Password update failed");
      }
    } finally {
      setPasswordSaving(false);
    }
  };

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
  const put = (url, data) =>
    axios.put(url, data, {
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
    Category: "",
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
    Category: yup.string().required("Category is required"),
  });

  const baySchema = yup.object().shape({
    bayName: yup.string().required("Bay name is required"),
    bayType: yup.string().required("Bay type is required"),
  });

  const passwordSchema = yup.object().shape({
    currentPassword: yup.string().required("Current password is required"),
    newPassword: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("New password is required"),
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

  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/vendors/categories/list`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };
  useEffect(() => {
    fetchCategories();
  }, []);

  const resetVendorForm = () => {
    setVendor({
      companyName: "",
      contactPerson: "",
      mobile: "",
      crNo: "",
      shopId: "",
      floorNo: "",
      Category: "",
    });

    setCategorySearch("");
    setShowCategoryDropdown(false);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-emerald-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-emerald-900">
                Settings
              </h1>
              <p className="text-sm text-emerald-600 mt-1">
                Manage your account and system configurations
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-emerald-900">
                  {user?.name || "Admin"}
                </p>
                <p className="text-xs text-emerald-600">{user?.email}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">
                  {user?.name?.charAt(0) || "A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ================= SIDEBAR ================= */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-lg sticky top-24">
              <div className="space-y-2">
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActive(s.id);
                      setErrors({});
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active === s.id
                        ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md scale-105"
                        : "text-emerald-700 hover:bg-emerald-50 hover:scale-102"
                    }`}
                  >
                    <span className="text-lg">{s.icon}</span>
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ================= CONTENT ================= */}
          <section className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-emerald-100 shadow-lg p-6 sm:p-8">
              {active === "profile" && (
                <div>
                  <div className="mb-8 pb-6 border-b border-emerald-100">
                    <h2 className="text-2xl font-bold text-emerald-900">
                      Edit Profile
                    </h2>
                    <p className="text-sm text-emerald-600 mt-2">
                      Update your personal information and security settings
                    </p>
                  </div>

                  {/* Profile Information Card */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 mb-6 border border-emerald-100">
                    <h3 className="text-lg font-semibold text-emerald-900 mb-4">
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Input
                        label="Full Name"
                        value={profile.name}
                        onChange={(v) => setProfile({ ...profile, name: v })}
                        error={errors.name}
                      />
                      <Input
                        label="Email Address"
                        value={profile.email}
                        onChange={(v) => setProfile({ ...profile, email: v })}
                        error={errors.email}
                      />
                    </div>
                    <div className="flex justify-end mt-6">
                      <button
                        onClick={updateProfile}
                        disabled={profileSaving}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        {profileSaving ? (
                          <span className="flex items-center gap-2">
                            <svg
                              className="animate-spin h-4 w-4"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Updating...
                          </span>
                        ) : (
                          "Update Profile"
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Security Settings Card */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-emerald-900 mb-1">
                          Security Settings
                        </h3>
                        <p className="text-sm text-emerald-600">
                          Keep your account secure by updating your password
                          regularly
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setShowPasswordModal(true);
                          setErrors({});
                          setPasswordForm({
                            currentPassword: "",
                            newPassword: "",
                          });
                        }}
                        className="px-5 py-2.5 rounded-xl bg-white border-2 border-emerald-600 text-emerald-700 font-medium hover:bg-emerald-50 transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
                      >
                        🔒 Change Password
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {active === "staff" && (
                <FormCard
                  title="Add Staff Member"
                  description="Add a new staff member to your team with bay assignment"
                  icon="👥"
                >
                  <Input
                    label="Full Name"
                    value={staff.name}
                    onChange={(v) => setStaff({ ...staff, name: v })}
                    error={errors.name}
                  />
                  <Input
                    label="Email Address"
                    value={staff.email}
                    onChange={(v) => setStaff({ ...staff, email: v })}
                    error={errors.email}
                  />
                  <Input
                    label="Phone Number"
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
                  <Select
                    label="Assigned Bay"
                    value={staff.assignedBay}
                    onChange={(v) => setStaff({ ...staff, assignedBay: v })}
                    options={bays}
                    error={errors.assignedBay}
                  />

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
                </FormCard>
              )}

              {active === "supervisor" && (
                <FormCard
                  title="Add Supervisor"
                  description="Register a new supervisor account with management access"
                  icon="🎯"
                >
                  <Input
                    label="Full Name"
                    value={supervisor.name}
                    onChange={(v) => setSupervisor({ ...supervisor, name: v })}
                    error={errors.name}
                  />
                  <Input
                    label="Email Address"
                    value={supervisor.email}
                    onChange={(v) => setSupervisor({ ...supervisor, email: v })}
                    error={errors.email}
                  />
                  <Input
                    label="Phone Number"
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
                  <Select
                    label="Assigned Bay"
                    value={supervisor.assignedBay}
                    onChange={(v) =>
                      setSupervisor({ ...supervisor, assignedBay: v })
                    }
                    options={bays}
                    error={errors.assignedBay}
                  />

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
                </FormCard>
              )}

              {active === "vendor" && (
                <FormCard
                  title="Add Tenant"
                  description="Register a new tenant in the system with business details"
                  icon="🏢"
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
                    label="Mobile Number"
                    value={vendor.mobile}
                    onChange={(v) => setVendor({ ...vendor, mobile: v })}
                    error={errors.mobile}
                  />
                  <Input
                    label="CR Number"
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
                    label="Floor Number"
                    value={vendor.floorNo}
                    onChange={(v) => setVendor({ ...vendor, floorNo: v })}
                    error={errors.floorNo}
                  />
                  
                  {/* Category Dropdown */}
                  <div className="md:col-span-2 relative">
                    <label className="block text-sm font-semibold text-emerald-800 mb-2">
                      Business Category
                    </label>

                    <input
                      type="text"
                      value={categorySearch}
                      onFocus={() => setShowCategoryDropdown(true)}
                      onChange={(e) => {
                        setCategorySearch(e.target.value);
                        setVendor({ ...vendor, Category: e.target.value });
                        setShowCategoryDropdown(true);
                      }}
                      placeholder="Select or type category"
                      className={`w-full h-12 rounded-xl px-4 border-2 bg-white focus:outline-none focus:ring-2 transition-all ${
                        errors.Category
                          ? "border-red-400 focus:ring-red-300"
                          : "border-emerald-200 focus:ring-emerald-300 focus:border-emerald-400"
                      }`}
                    />

                    {showCategoryDropdown && (
                      <div className="absolute z-50 w-full bg-white border-2 border-emerald-200 mt-2 rounded-xl shadow-2xl max-h-60 overflow-auto">
                        {categories
                          .filter((c) =>
                            c
                              .toLowerCase()
                              .includes(categorySearch.toLowerCase())
                          )
                          .map((c, idx) => (
                            <div
                              key={c}
                              onClick={() => {
                                setVendor({ ...vendor, Category: c });
                                setCategorySearch(c);
                                setShowCategoryDropdown(false);
                              }}
                              className={`px-5 py-3 hover:bg-emerald-50 cursor-pointer transition-colors ${
                                idx !== 0 ? "border-t border-emerald-100" : ""
                              }`}
                            >
                              <span className="text-emerald-900 font-medium">
                                {c}
                              </span>
                            </div>
                          ))}

                        {categorySearch &&
                          !categories.some(
                            (c) =>
                              c.toLowerCase() === categorySearch.toLowerCase()
                          ) && (
                            <div
                              onClick={() => {
                                const newCategory = categorySearch.trim();
                                setVendor({ ...vendor, Category: newCategory });
                                setCategorySearch(newCategory);
                                setShowCategoryDropdown(false);
                              }}
                              className="px-5 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 cursor-pointer border-t-2 border-emerald-200"
                            >
                              <span className="text-emerald-700 font-semibold">
                                ➕ Add "{categorySearch}" as new category
                              </span>
                            </div>
                          )}
                      </div>
                    )}

                    {errors.Category && (
                      <p className="text-red-600 text-xs mt-2 font-medium">
                        {errors.Category}
                      </p>
                    )}
                  </div>

                  <ActionButton
                    saving={saving}
                    onClick={() =>
                      validateAndSubmit(
                        vendorSchema,
                        vendor,
                        "/vendors",
                        resetVendorForm
                      )
                    }
                  />
                </FormCard>
              )}

              {active === "bay" && (
                <FormCard
                  title="Add Bay Location"
                  description="Create a new bay location for staff assignment"
                  icon="📍"
                >
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
                </FormCard>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* ================= PASSWORD MODAL ================= */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Change Password
                    </h3>
                    <p className="text-emerald-100 text-sm mt-0.5">
                      Update your account password
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setErrors({});
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                    });
                  }}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6 space-y-5">
              <Input
                label="Current Password"
                type="password"
                value={passwordForm.currentPassword}
                error={errors.currentPassword}
                onChange={(v) =>
                  setPasswordForm({ ...passwordForm, currentPassword: v })
                }
              />

              <Input
                label="New Password"
                type="password"
                value={passwordForm.newPassword}
                error={errors.newPassword}
                onChange={(v) =>
                  setPasswordForm({ ...passwordForm, newPassword: v })
                }
              />

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <span className="text-amber-600 text-xl">⚠️</span>
                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      Security Notice
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      You will be logged out after changing your password and
                      need to login again with the new credentials.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-5 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setErrors({});
                  setPasswordForm({
                    currentPassword: "",
                    newPassword: "",
                  });
                }}
                className="px-5 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={updatePassword}
                disabled={passwordSaving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {passwordSaving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Updating...
                  </span>
                ) : (
                  "Update Password"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= UI COMPONENTS ================= */

function FormCard({ title, description, icon, children }) {
  return (
    <div>
      <div className="mb-8 pb-6 border-b border-emerald-100 flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-2xl">
          {icon}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-emerald-900">{title}</h2>
          <p className="text-sm text-emerald-600 mt-2">{description}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", error }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-emerald-800 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-12 rounded-xl px-4 border-2 bg-white focus:outline-none focus:ring-2 transition-all ${
          error
            ? "border-red-400 focus:ring-red-300"
            : "border-emerald-200 focus:ring-emerald-300 focus:border-emerald-400"
        }`}
        placeholder={`Enter ${label.toLowerCase()}`}
      />
      {error && <p className="text-red-600 text-xs mt-2 font-medium">{error}</p>}
    </div>
  );
}

function Select({ label, value, onChange, options, error }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-emerald-800 mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-12 border-2 rounded-xl px-4 bg-white focus:outline-none focus:ring-2 transition-all ${
          error
            ? "border-red-400 focus:ring-red-300"
            : "border-emerald-200 focus:ring-emerald-300 focus:border-emerald-400"
        }`}
      >
        <option value="">Select {label}</option>
        {options.map((b) => (
          <option key={b._id} value={b._id}>
            {b.bayName}
          </option>
        ))}
      </select>
      {error && <p className="text-red-600 text-xs mt-2 font-medium">{error}</p>}
    </div>
  );
}

function ActionButton({ onClick, saving, label = "Save Changes" }) {
  return (
    <div className="md:col-span-2 flex justify-end mt-8 pt-6 border-t border-emerald-100">
      <button
        onClick={onClick}
        disabled={saving}
        className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
      >
        {saving ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Saving...
          </span>
        ) : (
          label
        )}
      </button>
    </div>
  );
}