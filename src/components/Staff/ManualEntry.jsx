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

  return canvas.toDataURL("image/jpeg", 0.55);
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
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState(null);
  const [lastImage, setLastImage] = useState(null);
  const fileInputRef = useRef(null);

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
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  /* ================= OCR ================= */
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
      console.error("Failed to load vendors", err);
    } finally {
      setVendorLoading(false);
    }
  };

  if (token) fetchVendors();
}, [token]);
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
      const croppedBase64 = await getCroppedImage(preview, croppedArea);

      if (await isBlurry(croppedBase64)) {
        alert("Image is blurry. Please retake.");
        return;
      }

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/ocr/scan`,
        { imageBase64: croppedBase64 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.vehicleNumber) {
        setVehicleNumber(res.data.vehicleNumber);
        setShowCrop(false);
      } else {
        alert("Plate not detected. Try again.");
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 413) alert("Image too large. Retake closer.");
      else if (!err.response) alert("Network error.");
      else alert(err.response?.data?.message || "OCR failed.");
    } finally {
      setOcrLoading(false);
    }
  };

  /* ================= VALIDATION ================= */

  const schema = yup.object().shape({
    vehicleNumber: yup
      .string()
      .matches(/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{3,4}$/)
      .required(),
    vehicleType: yup.string().required(),
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
          qidNumber,
          vehicleNumber,
          vehicleType,
          bayId,
          createdBy: staff._id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Manual entry saved");
      setVehicleNumber("");
    } catch {
      alert("Failed to save entry");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-teal-50 px-4 py-8">
      <div className="max-w-5xl bg-white rounded-xl p-6 shadow mx-auto">

        <Section title="Visitor Information">
          <Input label="Visitor Name" value={visitorName} onChange={setVisitorName} />
          <Input label="QID" value={qidNumber} onChange={setQidNumber} />
          <Input label="Mobile" value={mobile} onChange={setMobile} />

          <div>
  <label className="text-xs text-gray-500">Company</label>
  <select
    value={company}
    onChange={(e) => setCompany(e.target.value)}
    className="h-11 w-full rounded-xl px-4 bg-gray-50 border"
    disabled={vendorLoading}
  >
    <option value="">Select Company</option>
    {vendors.map((v) => (
      <option key={v._id} value={v.companyName}>
        {v.companyName}
      </option>
    ))}
  </select>
</div>

        </Section>

        <Section title="Vehicle Information">
          <div className="relative">
            <Input
              label="Vehicle Number"
              value={vehicleNumber}
              onChange={setVehicleNumber}
              error={errors.vehicleNumber}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute right-3 top-[34px] p-2 bg-emerald-100 rounded-lg"
            >
              <Camera size={18} />
            </button>

            {vehicleNumber && (
              <button
                className="text-xs text-emerald-600 mt-1"
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
          />
        </Section>

        <Section title="Visit Details">
          <Input label="Purpose" value={purpose} onChange={setPurpose} />
          <Input label="Assigned Bay" value={staff?.assignedBay?.bayName || ""} disabled />
        </Section>

        <div className="flex justify-end">
          <button
            onClick={saveEntry}
            disabled={loading}
            className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl"
          >
            {loading ? "Saving..." : "Save Entry"}
          </button>
        </div>
      </div>

      {showCrop && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-xl max-w-md w-full">
            <div className="relative h-64 bg-black">
              <Cropper
                image={preview}
                crop={crop}
                zoom={zoom}
                aspect={4 / 1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, area) => setCroppedArea(area)}
              />
            </div>
            <div className="flex justify-between mt-4">
              <button onClick={() => setShowCrop(false)}>Cancel</button>
              <button onClick={runOCR} disabled={ocrLoading}>
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
      <h3 className="text-sm font-semibold mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, error, disabled }) {
  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      <input
        disabled={disabled}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="h-11 w-full rounded-xl px-4 bg-gray-50 border"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl px-4 bg-gray-50 border"
      >
        <option value="">Select</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
