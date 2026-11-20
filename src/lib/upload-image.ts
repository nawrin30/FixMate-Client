export async function uploadToImgBB(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please select an image file");
  if (file.size > 5 * 1024 * 1024) throw new Error("Image size must be less than 5 MB");
  const formData = new FormData();
  formData.append("image", file);
  const response = await fetch("/api/upload", { method: "POST", body: formData });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.url) throw new Error(result.message || "Image upload failed");
  return result.url;
}
