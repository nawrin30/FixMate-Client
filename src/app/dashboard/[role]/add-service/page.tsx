
'use client';

import { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { uploadToImgBB } from "@/lib/upload-image";

export default function AddService() {
  const [v, setV] = useState<any>({
    title: "",
    category: "Smartphone",
    description: "",
    basePrice: "",
    estimatedDuration: "",
    serviceMode: "Home Visit",
    serviceArea: ""
  });

  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!file) {
      return toast.error("Please choose a service image");
    }

    if (!file.type.startsWith("image/")) {
      return toast.error("Please select a valid image");
    }

    if (file.size > 5 * 1024 * 1024) {
      return toast.error("Image size must be less than 5 MB");
    }

    if (Number(v.basePrice) <= 0) {
      return toast.error("Please enter a valid service price");
    }

    setBusy(true);

    try {
      const imageUrl = await uploadToImgBB(file);

      // Save service information and ImgBB image URL
      await api("/api/services", {
        method: "POST",
        body: JSON.stringify({
          ...v,
          basePrice: Number(v.basePrice),
          image: imageUrl
        })
      });

      toast.success("Service submitted for admin approval");

      setV({
        title: "",
        category: "Smartphone",
        description: "",
        basePrice: "",
        estimatedDuration: "",
        serviceMode: "Home Visit",
        serviceArea: ""
      });

      setFile(null);

      const fileInput = document.getElementById(
        "service-image"
      ) as HTMLInputElement | null;

      if (fileInput) fileInput.value = "";

    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form-card" onSubmit={submit}>
      <h2>Add a service</h2>

      {Object.entries({
        title: "Title",
        description: "Description",
        basePrice: "Starting price (USD)",
        estimatedDuration: "Estimated duration",
        serviceArea: "Service area"
      }).map(([k, l]) => (
        <div className="field" key={k}>
          <label>{l}</label>

          {k === "description" ? (
            <textarea
              required
              minLength={20}
              value={v[k]}
              onChange={(e) =>
                setV({ ...v, [k]: e.target.value })
              }
            />
          ) : (
            <input
              required
              type={k === "basePrice" ? "number" : "text"}
              min={k === "basePrice" ? "0.01" : undefined}
              step={k === "basePrice" ? "0.01" : undefined}
              value={v[k]}
              onChange={(e) =>
                setV({ ...v, [k]: e.target.value })
              }
            />
          )}
        </div>
      ))}

      <div className="field">
        <label>Category</label>

        <select
          value={v.category}
          onChange={(e) =>
            setV({ ...v, category: e.target.value })
          }
        >
          {[
            "Smartphone",
            "Laptop & PC",
            "AC",
            "Refrigerator",
            "TV",
            "Washing Machine",
            "Electrical"
          ].map((x) => (
            <option key={x} value={x}>{x}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Service mode</label>

        <select
          value={v.serviceMode}
          onChange={(e) =>
            setV({ ...v, serviceMode: e.target.value })
          }
        >
          <option>Home Visit</option>
          <option>Shop Drop-off</option>
        </select>
      </div>

      <div className="field">
        <label>Service image (ImgBB)</label>

        <input
          id="service-image"
          type="file"
          accept="image/*"
          required
          onChange={(e) =>
            setFile(e.target.files?.[0] || null)
          }
        />

        {file && (
          <p className="text-sm">
            Selected: {file.name}
          </p>
        )}
      </div>

      <button
        className="btn btn-primary"
        disabled={busy}
        type="submit"
      >
        {busy ? "Uploading & Submitting..." : "Submit for approval"}
      </button>
    </form>
  );
}
