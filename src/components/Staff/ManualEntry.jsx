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

  // ✅ strong compression to avoid 413
  return canvas.toDataURL("image/jpeg", 0.55);
};

// Simple blur detection
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
  const variance = sum / (data.length / 4);

  return variance < 20;
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

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setStaff(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    if (staff?.role === "staff" && staff?.assignedBay?._id) {
      setBayId(staff.assignedBay._id);
    }
  }, [staff]);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  /* ================= OCR FLOW ================= */

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

      const blurry = await isBlurry(croppedBase64);
      if (blurry) {
        alert("Image is blurry. Please retake.");
        return;
      }

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/ocr/scan`, // ✅ FIXED PATH
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

      if (status === 413) {
        alert("Image too large. Please retake closer photo.");
      } else if (!err.response) {
        alert("Network error. Check internet.");
      } else {
        alert(err.response?.data?.message || "OCR failed. Try again.");
      }
    } finally {
      setOcrLoading(false);
    }
  };

  /* ================= VALIDATION ================= */

  const entrySchema = yup.object().shape({
    visitorName: yup.string().matches(/^[A-Za-z ]*$/, "Only alphabets allowed"),
    qidNumber: yup.string().nullable(),
    mobile: yup.string().matches(/^[0-9]{10}$/, "Mobile number must be 10 digits"),
    company: yup.string().nullable(),
    vehicleNumber: yup
      .string()
      .matches(
        /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{3,4}$/,
        "Vehicle number must be in format like KA01AB1234"
      )
      .required("Vehicle number is required"),
    vehicleType: yup.string().required("Vehicle type is required"),
    bayId: yup.string().required("Please select a bay"),
    purpose: yup.string().nullable(),
  });

  const validateForm = async () => {
    try {
      await entrySchema.validate(
        {
          visitorName,
          qidNumber,
          mobile,
          company,
          vehicleNumber,
          vehicleType,
          bayId,
          purpose,
        },
        { abortEarly: false }
      );
      setErrors({});
      return true;
    } catch (err) {
      const newErrors = {};
      err.inner.forEach((e) => (newErrors[e.path] = e.message));
      setErrors(newErrors);
      return false;
    }
  };

  /* ================= SAVE ================= */

  const saveEntry = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    try {
      setLoading(true);
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/entries/manual`,
        {
          visitorName,
          visitorMobile: mobile,
          visitorCompany: company,
          qidNumber,
          vehicleNumber: vehicleNumber.toUpperCase(),
          vehicleType,
          bayId,
          createdBy: staff._id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Manual entry saved successfully");
      setVehicleNumber("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save entry");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-teal-50 px-4 py-8">
      <div className="max-w-5xl bg-white rounded-xl p-6 shadow-sm mx-auto">

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
              className="absolute right-3 top-[34px] p-2 rounded-lg bg-emerald-100 text-emerald-700"
            >
              <Camera size={18} />
            </button>

            {vehicleNumber && (
              <button
                onClick={() => {
                  setVehicleNumber("");
                  setPreview(lastImage);
                  setShowCrop(true);
                }}
                className="text-xs text-emerald-600 mt-1"
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
        </Section>

        <div className="flex justify-end mt-10">
          <button
            onClick={saveEntry}
            disabled={loading}
            className="px-8 py-2.5 rounded-xl bg-emerald-600 text-white"
          >
            {loading ? "Saving..." : "Save Entry"}
          </button>
        </div>
      </div>

      {showCrop && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-md p-4 rounded-xl">
            <div className="relative w-full h-64 bg-black">
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
              <button
                onClick={() => setShowCrop(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={runOCR}
                disabled={ocrLoading}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
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
      <h3 className="text-sm font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, error }) {
  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl px-4 bg-gray-50 border"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
