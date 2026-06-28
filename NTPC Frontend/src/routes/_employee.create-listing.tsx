import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "../components/common";
import { ImagePlus, CheckCircle2, Trash2, AlertCircle } from "lucide-react";
import api from "../lib/api";

export const Route = createFileRoute("/_employee/create-listing")({
  component: CreateListing,
});

function CreateListing() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [townships, setTownships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category_id: "",
    price: "",
    condition: "Like New",
    township_id: "",
    is_negotiable: false,
  });

  const set = (k: keyof typeof form, v: any) =>
    setForm((f) => ({ ...f, [k]: v }));

  const normalizeCondition = (value: string) => {
    switch (value) {
      case "Excellent":
      case "Like New":
        return "LIKE_NEW";
      case "Good":
        return "GOOD";
      case "Fair":
        return "FAIR";
      default:
        return "LIKE_NEW";
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [catRes, townRes] = await Promise.all([
        api.get("/categories"),
        api.get("/townships"),
      ]);

      const cats = Array.isArray(catRes.data)
        ? catRes.data
        : catRes.data?.categories || [];
      const towns = Array.isArray(townRes.data)
        ? townRes.data
        : townRes.data?.townships || [];

      setCategories(cats);
      setTownships(towns);

      if (cats.length > 0)
        set("category_id", String(cats[0].category_id ?? cats[0].id ?? ""));
      if (towns.length > 0)
        set("township_id", String(towns[0].id ?? towns[0].township_id ?? ""));
    } catch (err) {
      setError("Failed to load categories and townships");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 10) {
      setError("Maximum 10 images allowed");
      return;
    }

    setSelectedFiles(files);

    // Generate preview URLs
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(previews);
    setError(null);
  };

  const removePreview = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadImages = async () => {
    if (selectedFiles.length === 0) return [];

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("images", file));

    try {
      const res = await api.post("/listings/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.imageUrls || [];
    } catch (err: any) {
      throw new Error(err?.response?.data?.message || "Image upload failed");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.title.trim() ||
      !form.price ||
      !form.category_id ||
      !form.township_id
    ) {
      setError("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const listingRes = await api.post("/listings", {
        title: form.title,
        description: form.description || "Listed on NTPC Marketplace.",
        category_id: Number(form.category_id),
        township_id: Number(form.township_id),
        price: Number(form.price),
        condition: normalizeCondition(form.condition),
        is_negotiable: form.is_negotiable,
      });

      if (selectedFiles.length > 0 && listingRes.data?.listing_id) {
        try {
          const images = await uploadImages();
          if (images.length > 0) {
            await api.post(`/listings/${listingRes.data.listing_id}/images`, {
              imageUrls: images,
            });
          }
        } catch (imgErr: any) {
          setError(
            "Listing created successfully, but images could not be uploaded.",
          );
        }
      }

      setDone(true);
      setTimeout(() => navigate({ to: "/my-listings" }), 1000);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to create listing",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div>
      <PageHeader
        title="Create Listing"
        subtitle="Post an item for fellow NTPC employees."
      />
      <form onSubmit={submit} className="ntpc-card p-5 max-w-3xl space-y-4">
        {done && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 flex items-center gap-2 text-sm">
            <CheckCircle2 size={16} /> Listing created. Redirecting to My
            Listings…
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 p-3 flex items-center gap-2 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Title" required>
            <input
              required
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className="ntpc-input"
              placeholder='e.g. Sony Bravia 43" LED TV'
              disabled={submitting}
            />
          </Field>
          <Field label="Price (₹)" required>
            <input
              required
              type="number"
              min={1}
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              className="ntpc-input"
              placeholder="12000"
              disabled={submitting}
            />
          </Field>
          <Field label="Category" required>
            <select
              value={form.category_id}
              onChange={(e) => set("category_id", e.target.value)}
              className="ntpc-input"
              disabled={submitting}
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option
                  key={c.category_id ?? c.id}
                  value={String(c.category_id ?? c.id)}
                >
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Condition">
            <select
              value={form.condition}
              onChange={(e) => set("condition", e.target.value)}
              className="ntpc-input"
              disabled={submitting}
            >
              {["Like New", "Excellent", "Good", "Fair"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Township" required>
            <select
              value={form.township_id}
              onChange={(e) => set("township_id", e.target.value)}
              className="ntpc-input"
              disabled={submitting}
            >
              <option value="">Select a township</option>
              {townships.map((t) => (
                <option
                  key={t.id ?? t.township_id}
                  value={String(t.id ?? t.township_id)}
                >
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Negotiable">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_negotiable}
                onChange={(e) => set("is_negotiable", e.target.checked)}
                className="rounded border-border"
                disabled={submitting}
              />
              <span className="text-sm">Price is negotiable</span>
            </label>
          </Field>
        </div>
        <Field label="Description">
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="ntpc-input"
            placeholder="Condition details, reason for sale, pickup info…"
            disabled={submitting}
          />
        </Field>
        <Field label="Upload Images">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90 text-sm font-medium">
              <ImagePlus size={16} /> Upload Images
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={submitting}
              />
            </label>
            <span className="text-xs text-muted-foreground">
              {selectedFiles.length > 0 &&
                `${selectedFiles.length} file(s) selected`}
            </span>
          </div>
        </Field>
        {previewUrls.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-2">
              Image Previews ({previewUrls.length})
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {previewUrls.map((url, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={url}
                    alt={`preview-${idx}`}
                    className="h-24 w-24 rounded-lg object-cover border"
                  />
                  <button
                    type="button"
                    onClick={() => removePreview(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={submitting}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate({ to: "/marketplace" })}
            className="ntpc-btn-secondary"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="ntpc-btn-primary"
            disabled={submitting}
          >
            {submitting ? "Publishing..." : "Publish Listing"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-muted-foreground mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </div>
      {children}
    </label>
  );
}
