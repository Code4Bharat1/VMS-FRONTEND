"use client";
import * as yup from "yup";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Camera } from "lucide-react";
import Cropper from "react-easy-crop";

/* ================= IMAGE HELPERS ================= */

const loadImage = (src) =>
  new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
  });

const getCroppedImage = async (imageSrc, crop) => {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");

  const MAX_WIDTH = 600;
  let width = crop.width;
  let height = crop.height;

  if (width > MAX_WIDTH) {
    const scale = MAX_WIDTH / width;
    width = MAX_WIDTH;
    height = height * scale;
  }

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    width,
    height
  );

  return canvas.toDataURL("image/jpeg", 0.9);
};

const isBlurry = async (base64) => {
  const img = await loadImage(base64);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let sum = 0;
  for (let i = 0; i < data.length; i += 4) sum += data[i];
  return sum / (data.length / 4) < 20;
};

/* ================= COMPONENT ================= */

export default function ManualEntry() {
  const [visitorName, setVisitorName] = useState("");
  const [qidNumber, setQidNumber] = useState("");
  const [mobile, setMobile] = useState("");
  const [company, setCompany] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [purpose, setPurpose] = useState("");
  const [bayId, setBayId] = useState("");
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [ocrLoading, setOcrLoading] = useState(false);

  const [preview, setPreview] = useState(null);
  const [showCrop, setShowCrop] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.3);

  const [croppedArea, setCroppedArea] = useState(null);
  const [lastImage, setLastImage] = useState(null);

  const fileInputRef = useRef(null);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  const [vendors, setVendors] = useState([]);
  const [vendorLoading, setVendorLoading] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setStaff(JSON.parse(u));
  }, []);

  useEffect(() => {
    if (staff?.assignedBay?._id) setBayId(staff.assignedBay._id);
  }, [staff]);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  /* ================= FETCH VENDORS/TENANTS ================= */
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setVendorLoading(true);
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/vendors`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setVendors(res.data?.vendors || []);
      } catch (err) {
        console.error("Failed to fetch vendors:", err.response?.data || err);
        alert(err.response?.data?.message || "Failed to fetch tenants");
      } finally {
        setVendorLoading(false);
      }
    };

    if (token) fetchVendors();
  }, [token]);

  /* ================= OCR ================= */
  const handlePlateImage = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setLastImage(reader.result);
      setShowCrop(true);
    };
    reader.readAsDataURL(file);
  };

  const runOCR = async () => {
  if (!croppedArea || !preview) return;

  setOcrLoading(true);
  try {
    // 1️⃣ Crop + resize image (already optimized)
    const croppedBase64 = await getCroppedImage(preview, croppedArea);

    // 2️⃣ Blur check (unchanged)
    if (await isBlurry(croppedBase64)) {
      alert("Image is blurry. Please retake.");
      setShowCrop(false);
      return;
    }

    // 3️⃣ Call Plate Recognizer backend
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/ocr/scan`,
      {
        imageBase64: croppedBase64, // ✅ base64 to backend
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 90000, // frontend wait
      }
    );

    // 4️⃣ Handle response
    if (res.data?.success && res.data?.plate) {
      setVehicleNumber(res.data.plate); // ✅ AUTO-FILL
      setShowCrop(false);
    } else {
      alert(res.data?.message || "Plate not detected. Try again.");
    }
  } catch (err) {
    const status = err.response?.status;

    if (status === 413) {
      alert("Image too large. Retake closer.");
    } else if (!err.response) {
      alert("Network error. Please try again.");
    } else {
      alert(err.response?.data?.message || "Plate OCR failed.");
    }
  } finally {
    setOcrLoading(false);
  }
};


  /* ================= VALIDATION ================= */

  const schema = yup.object().shape({
    vehicleNumber: yup
      .string()
      .min(4, "Invalid vehicle number")
      .required("Vehicle number is required"),

    vehicleType: yup.string().required("Vehicle type is required"),
    bayId: yup.string().required(),
  });

  const validateForm = async () => {
    try {
      await schema.validate({ vehicleNumber, vehicleType, bayId });
      setErrors({});
      return true;
    } catch (err) {
      setErrors({ [err.path]: err.message });
      return false;
    }
  };

  /* ================= HELPERS ================= */

  const clearForm = () => {
    setVisitorName("");
    setQidNumber("");
    setMobile("");
    setCompany("");
    setTenantName("");
    setVehicleNumber("");
    setVehicleType("");
    setPurpose("");
    setErrors({});
  };


  /* ================= SAVE ================= */

  const saveEntry = async () => {
    if (!(await validateForm())) return;

    try {
      setLoading(true);
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/entries/manual`,
        {
          visitorName,
          visitorMobile: mobile,
          visitorCompany: company,
          tenantName,
          qidNumber,
          vehicleNumber,
          purpose,
          vehicleType,
          bayId,
          createdBy: staff._id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Manual entry saved");
      clearForm();
    } catch {
      alert("Failed to save entry");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-emerald-50/60">
      {/* NAVBAR */}
      <div className="sticky top-0 z-40 bg-white border-b border-emerald-100 px-4 sm:px-6 lg:px-8 py-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-emerald-800">Manual Entry</h1>
            <p className="text-sm text-emerald-600 mt-1">
              Enter vehicle and visitor information manually
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              {(staff?.name || "")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </div>
            <div className="leading-tight">
              <p className="text-sm sm:text-base font-semibold text-emerald-800">
                {staff?.name}
              </p>
              <p className="text-xs sm:text-sm text-emerald-600 capitalize">
                {staff?.role}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 sm:py-8">
        <div className="max-w-5xl bg-white border border-emerald-100 rounded-xl p-6 shadow-sm mx-auto">
          <Section title="Visitor Information">
            <Input
              label="Visitor Name"
              value={visitorName}
              onChange={setVisitorName}
            />
            <Input label="QID" value={qidNumber} onChange={setQidNumber} />
            <Input label="Mobile" value={mobile} onChange={setMobile} />

            <div>
              <label className="text-sm font-medium text-emerald-700 block mb-1">
                Company Name
              </label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Enter visitor's company name"
                className="h-11 w-full rounded-lg px-4 bg-white border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-emerald-700 block mb-1">
                Tenant / Destination
              </label>
              <select
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                className="h-11 w-full rounded-lg px-4 bg-white border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={vendorLoading}
              >
                <option value="">Select Tenant/Destination</option>
                {vendors.map((v) => (
                  <option key={v._id} value={v.companyName}>
                    {v.companyName} - {v.shopId}, Floor {v.floorNo}
                  </option>
                ))}
              </select>
              {vendorLoading && (
                <p className="text-xs text-emerald-600 mt-1">Loading tenants...</p>
              )}
            </div>
          </Section>

          <Section title="Vehicle Information">
            <div className="relative">
              <Input
                label="Vehicle Number"
                value={vehicleNumber}
                onChange={setVehicleNumber}
                error={errors.vehicleNumber}
                maxLength={10}
              />

              <button
                type="button"
                onClick={() => {
                  setVehicleNumber("");
                  setErrors((e) => ({ ...e, vehicleNumber: undefined }));
                  fileInputRef.current?.click();
                }}
                className="absolute right-3 top-[34px] p-2 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition"
              >
                <Camera size={18} className="text-emerald-600" />
              </button>

              {vehicleNumber && (
                <button
                  className="text-xs text-emerald-600 hover:text-emerald-700 mt-1 font-medium"
                  onClick={() => {
                    setVehicleNumber("");
                    setPreview(lastImage);
                    setShowCrop(true);
                  }}
                >
                  Retry scan
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handlePlateImage(e.target.files?.[0])}
              />
            </div>

            <Select
              label="Vehicle Type"
              value={vehicleType}
              onChange={setVehicleType}
              options={["Truck", "Van", "Car"]}
              error={errors.vehicleType}
            />
          </Section>

          <Section title="Visit Details">
            <Input label="Purpose" value={purpose} onChange={setPurpose} />
            <Input
              label="Assigned Bay"
              value={staff?.assignedBay?.bayName || ""}
              disabled
            />
          </Section>

          <div className="mt-6 border border-emerald-200 rounded-xl bg-emerald-50/60 p-5">
            <h3 className="text-sm font-semibold text-emerald-700 mb-3">
              System & Bay Metadata
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              {/* Logged-in staff */}
              <div>
                <p className="text-emerald-500 font-medium">Logged-in staff</p>
                <p className="text-emerald-800 font-semibold">
                  {staff?.name || "—"}
                </p>
              </div>

              {/* Entry method */}
              <div>
                <p className="text-emerald-500 font-medium">Entry method</p>
                <p className="text-emerald-800 font-semibold">Manual</p>
              </div>

              {/* Current time */}
              <div>
                <p className="text-emerald-500 font-medium">Current time</p>
                <p className="text-emerald-800 font-semibold">{currentTime}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left actions */}
            <button
              type="button"
              onClick={clearForm}
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition"
            >
              Clear form
            </button>

            {/* Right actions */}
            <div className="flex gap-3 justify-end">
             
              <button
                type="button"
                onClick={saveEntry}
                disabled={loading}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Entry"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCrop && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-emerald-800 mb-4">
              Crop License Plate
            </h3>
            <div className="relative h-[60vh] bg-black rounded-lg overflow-hidden">
              <Cropper
                image={preview}
                crop={crop}
                zoom={zoom}
                aspect={4 / 1}
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, area) => setCroppedArea(area)}
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowCrop(false)}
                className="px-6 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={runOCR}
                disabled={ocrLoading}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {ocrLoading ? "Scanning..." : "Scan Plate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= UI HELPERS ================= */

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h3 className="text-sm font-semibold text-emerald-700 mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, error, disabled, maxLength }) {
  return (
    <div>
      <label className="text-sm font-medium text-emerald-700 block mb-1">
        {label}
      </label>
      <input
        disabled={disabled}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange?.(e.target.value.toUpperCase())}
        className={`h-11 w-full rounded-lg px-4 pr-14 bg-white border transition focus:outline-none focus:ring-2 ${
          error
            ? "border-red-500 focus:ring-red-500"
            : disabled
            ? "border-emerald-200 bg-emerald-50"
            : "border-emerald-200 focus:ring-emerald-500"
        }`}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

function Select({ label, value, onChange, options, error }) {
  return (
    <div>
      <label className="text-sm font-medium text-emerald-700 block mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-11 w-full rounded-lg px-4 bg-white border transition focus:outline-none focus:ring-2 ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-emerald-200 focus:ring-emerald-500"
        }`}
      >
        <option value="">Select</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}