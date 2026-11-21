
'use client';

import { useEffect, useState } from "react";
import { authClient } from "@/lib/client-auth";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { uploadToImgBB } from "@/lib/upload-image";
import DashboardShell from "@/components/dashboard";

export default function Profile() {
  const [u, setU] = useState<any>({});
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState("");

  useEffect(() => {
    authClient.getSession().then((r: any) => {
      const user = r.data?.user;

      if (user) {
        setU(user);

        const userRole = user.role || "customer";
        setRole(
          ["customer", "technician", "admin"].includes(userRole)
            ? userRole
            : "customer"
        );
      } else {
        setRole("customer");
      }
    });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();

    try {
      let image = u.image;

      if (file) {
        image = await uploadToImgBB(file);
      }

      await api("/api/users/profile", {
        method: "PATCH",
        body: JSON.stringify({ ...u, image }),
      });

      await authClient.updateUser({
        name: u.name,
        image,
        phone: u.phone,
        area: u.area,
        bio: u.bio,
      } as any);

      const fresh = await authClient.getSession();
      setU(fresh.data?.user || { ...u, image });

      toast.success("Profile updated");
      window.location.reload();
    } catch (e: any) {
      toast.error(e.message || "Profile update failed");
    }
  }

  if (!role) {
    return <main className="container page-head">Loading profile...</main>;
  }

  return (
    <DashboardShell role={role}>
      <form className="form-card" onSubmit={save}>
        <h2>Update profile</h2>

        {["name", "phone", "area", "bio"].map((k) => (
          <div className="field" key={k}>
            <label>{k}</label>

            {k === "bio" ? (
              <textarea
                value={u[k] || ""}
                onChange={(e) =>
                  setU({ ...u, [k]: e.target.value })
                }
              />
            ) : (
              <input
                value={u[k] || ""}
                onChange={(e) =>
                  setU({ ...u, [k]: e.target.value })
                }
              />
            )}
          </div>
        ))}

        <div className="field">
          <label>Email (read only)</label>
          <input readOnly value={u.email || ""} />
        </div>

        <div className="field">
          <label>Profile photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setFile(e.target.files?.[0] || null)
            }
          />
        </div>

        <button className="btn btn-primary" type="submit">
          Save profile
        </button>
      </form>
    </DashboardShell>
  );
}
