
'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, money } from "@/lib/api";
import { toast } from "sonner";

type Service = {
  _id: string;
  title: string;
  category: string;
  description?: string;
  image?: string;
  basePrice: number;
  estimatedDuration?: string;
  serviceMode?: string;
  serviceArea?: string;
  approvalStatus?: string;
  isAvailable?: boolean;
};

export default function MyServices() {
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const [editing, setEditing] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    image: "",
    basePrice: "",
    estimatedDuration: "",
    serviceMode: "Home Visit",
    serviceArea: "",
  });

  async function load() {
    try {
      const data = await api("/api/services/mine");
      setItems(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(error.message || "Could not load services");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openEdit(service: Service) {
    setEditing(service);

    setForm({
      title: service.title || "",
      category: service.category || "",
      description: service.description || "",
      image: service.image || "",
      basePrice: String(service.basePrice ?? ""),
      estimatedDuration: service.estimatedDuration || "",
      serviceMode: service.serviceMode || "Home Visit",
      serviceArea: service.serviceArea || "",
    });
  }

  function closeEdit() {
    if (saving) return;
    setEditing(null);
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();

    if (!editing) return;

    if (
      !form.title.trim() ||
      !form.category.trim() ||
      !form.basePrice ||
      Number(form.basePrice) <= 0
    ) {
      toast.error("Please enter valid service details");
      return;
    }

    try {
      setSaving(true);

      await api(`/api/services/${editing._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...form,
          title: form.title.trim(),
          category: form.category.trim(),
          basePrice: Number(form.basePrice),
        }),
      });

      toast.success("Service updated. Waiting for admin approval.");
      setEditing(null);
      await load();
    } catch (error: any) {
      toast.error(error.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function del(id: string) {
    if (!confirm("Are you sure you want to delete this service?")) {
      return;
    }

    try {
      setBusy(id);

      await api(`/api/services/${id}`, {
        method: "DELETE",
      });

      toast.success("Service deleted successfully");
      await load();
    } catch (error: any) {
      toast.error(error.message || "Delete failed");
    } finally {
      setBusy(null);
    }
  }

  async function toggle(service: Service) {
    try {
      setBusy(service._id);

      await api(`/api/services/${service._id}/availability`, {
        method: "PATCH",
        body: JSON.stringify({
          isAvailable: !service.isAvailable,
        }),
      });

      toast.success("Availability updated");
      await load();
    } catch (error: any) {
      toast.error(error.message || "Availability update failed");
    } finally {
      setBusy(null);
    }
  }

  function approvalClass(status?: string) {
    const value = (status || "pending").toLowerCase();

    if (value === "approved") return "approved";
    if (value === "rejected") return "rejected";

    return "pending";
  }

  return (
    <section className="my-services-page">
      <div className="services-heading">
        <div>
          <span className="eyebrow">SERVICE MANAGEMENT</span>
          <h2>My Services</h2>
          <p className="meta">
            Manage your services, prices and availability.
          </p>
        </div>

        <Link
          href="/dashboard/technician/add-service"
          className="btn btn-primary"
        >
          + Add Service
        </Link>
      </div>

      <div className="service-summary">
        <div className="summary-card">
          <span>Total Services</span>
          <strong>{items.length}</strong>
        </div>

        <div className="summary-card">
          <span>Approved</span>
          <strong>
            {items.filter(s => s.approvalStatus === "approved").length}
          </strong>
        </div>

        <div className="summary-card">
          <span>Pending Review</span>
          <strong>
            {items.filter(s => !s.approvalStatus || s.approvalStatus === "pending").length}
          </strong>
        </div>

        <div className="summary-card">
          <span>Available</span>
          <strong>
            {items.filter(s => s.isAvailable).length}
          </strong>
        </div>
      </div>

      <div className="table-title">
        <h3>All Services</h3>
        <span>{items.length} services</span>
      </div>

      {loading ? (
        <div className="empty">Loading services...</div>
      ) : items.length === 0 ? (
        <div className="empty">
          <div style={{ fontSize: 35 }}>🔧</div>
          <h3>No services found</h3>
          <p>You have not added any services yet.</p>
          <Link
            href="/dashboard/technician/add-service"
            className="btn btn-primary"
          >
            Add your first service
          </Link>
        </div>
      ) : (
        <div className="services-table-wrap">
          <table className="services-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Category</th>
                <th>Price</th>
                <th>Approval Status</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.map(service => (
                <tr key={service._id}>
                  <td>
                    <div className="service-info">
                      {service.image ? (
                        <img
                          src={service.image}
                          alt={service.title}
                        />
                      ) : (
                        <div className="service-placeholder">🔧</div>
                      )}

                      <div>
                        <strong>{service.title}</strong>
                        <small>
                          {service.serviceMode || "Service"}
                        </small>
                      </div>
                    </div>
                  </td>

                  <td>{service.category}</td>

                  <td>
                    <strong>{money(service.basePrice)}</strong>
                  </td>

                  <td>
                    <span className={`approval-badge ${approvalClass(service.approvalStatus)}`}>
                      {service.approvalStatus || "pending"}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className={`availability-toggle ${service.isAvailable ? "on" : "off"}`}
                      disabled={busy === service._id}
                      onClick={() => toggle(service)}
                    >
                      <span className="toggle-dot" />
                      {service.isAvailable ? "Available" : "Unavailable"}
                    </button>
                  </td>

                  <td>
                    <div className="service-actions">
                      <button
                        type="button"
                        className="edit-button"
                        onClick={() => openEdit(service)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-button"
                        disabled={busy === service._id}
                        onClick={() => del(service._id)}
                      >
                        {busy === service._id ? "Wait..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="modal-overlay" onClick={closeEdit}>
          <div
            className="edit-modal"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <span className="eyebrow">SERVICE MANAGEMENT</span>
                <h3>Edit Service</h3>
              </div>

              <button
                type="button"
                className="close-button"
                onClick={closeEdit}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form onSubmit={saveEdit}>
              <label>Service Title</label>
              <input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
              />

              <label>Category</label>
              <input
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                required
              />

              <label>Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />

              <label>Image URL</label>
              <input
                value={form.image}
                onChange={e => setForm({ ...form, image: e.target.value })}
              />

              <label>Price</label>
              <input
                type="number"
                min="1"
                value={form.basePrice}
                onChange={e => setForm({ ...form, basePrice: e.target.value })}
                required
              />

              <label>Estimated Duration</label>
              <input
                value={form.estimatedDuration}
                onChange={e => setForm({ ...form, estimatedDuration: e.target.value })}
              />

              <label>Service Mode</label>
              <select
                value={form.serviceMode}
                onChange={e => setForm({ ...form, serviceMode: e.target.value })}
              >
                <option value="Home Visit">Home Visit</option>
                <option value="Shop Drop-off">Shop Drop-off</option>
              </select>

              <label>Service Area</label>
              <input
                value={form.serviceArea}
                onChange={e => setForm({ ...form, serviceArea: e.target.value })}
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-edit"
                  onClick={closeEdit}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-edit"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>

              <p className="edit-note">
                After editing, this service will be sent to Admin for approval again.
              </p>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .my-services-page {
          width: 100%;
          padding-bottom: 35px;
        }

        .services-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 25px;
        }

        .services-heading h2 {
          margin: 7px 0;
          font-size: 25px;
        }

        .services-heading p {
          margin: 0;
        }

        .service-summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 28px;
        }

        .summary-card {
          padding: 19px;
          border: 1px solid #e5e7eb;
          border-radius: 11px;
          background: var(--card, white);
        }

        .summary-card span {
          display: block;
          color: #64748b;
          font-size: 13px;
          margin-bottom: 9px;
        }

        .summary-card strong {
          font-size: 25px;
        }

        .table-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .table-title h3 {
          margin: 0;
          font-size: 19px;
        }

        .table-title span {
          color: #888;
          font-size: 13px;
        }

        .services-table-wrap {
          width: 100%;
          overflow-x: auto;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: var(--card, white);
        }

        .services-table {
          width: 100%;
          min-width: 850px;
          border-collapse: collapse;
          text-align: left;
        }

        .services-table th {
          padding: 16px;
          background: var(--background, #f8fafc);
          color: #64748b;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: .4px;
          white-space: nowrap;
        }

        .services-table td {
          padding: 15px 16px;
          border-top: 1px solid #eee;
          font-size: 13px;
        }

        .service-info {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 180px;
        }

        .service-info img,
        .service-placeholder {
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          border-radius: 8px;
          object-fit: cover;
        }

        .service-placeholder {
          display: grid;
          place-items: center;
          background: #f1f5f9;
          font-size: 22px;
        }

        .service-info strong,
        .service-info small {
          display: block;
        }

        .service-info strong {
          font-size: 13px;
        }

        .service-info small {
          margin-top: 5px;
          color: #888;
          font-size: 11px;
        }

        .approval-badge {
          display: inline-block;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .approval-badge.approved {
          background: #dcfce7;
          color: #15803d;
        }

        .approval-badge.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .approval-badge.rejected {
          background: #fee2e2;
          color: #b91c1c;
        }

        .availability-toggle {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 10px;
          border: 1px solid #ddd;
          border-radius: 20px;
          background: transparent;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        .availability-toggle.on {
          color: #15803d;
          border-color: #86efac;
          background: #f0fdf4;
        }

        .availability-toggle.off {
          color: #b91c1c;
          border-color: #fecaca;
          background: #fef2f2;
        }

        .toggle-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
        }

        .service-actions {
          display: flex;
          gap: 7px;
        }

        .edit-button,
        .delete-button {
          padding: 8px 12px;
          border: 0;
          border-radius: 7px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .edit-button {
          color: #1d4ed8;
          background: #eff6ff;
        }

        .delete-button {
          color: #b91c1c;
          background: #fee2e2;
        }

        .delete-button:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .empty {
          padding: 45px 15px;
          text-align: center;
          border: 1px solid #eee;
          border-radius: 12px;
          background: var(--card, white);
          color: #888;
        }

        .empty h3 {
          margin: 10px 0;
        }

        .empty p {
          margin-bottom: 18px;
          font-size: 13px;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 18px;
          background: rgba(15, 23, 42, .65);
          overflow-y: auto;
        }

        .edit-modal {
          width: 100%;
          max-width: 520px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 25px;
          border-radius: 14px;
          background: var(--card, white);
          color: var(--foreground, #172b28);
        }

        .modal-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-heading h3 {
          margin: 6px 0 0;
          font-size: 22px;
        }

        .close-button {
          width: 34px;
          height: 34px;
          border: 0;
          border-radius: 50%;
          background: #f1f5f9;
          font-size: 24px;
          cursor: pointer;
        }

        .edit-modal label {
          display: block;
          margin: 13px 0 6px;
          font-size: 13px;
          font-weight: 700;
        }

        .edit-modal input,
        .edit-modal textarea,
        .edit-modal select {
          display: block;
          width: 100%;
          padding: 11px 12px;
          border: 1px solid #d1d5db;
          border-radius: 7px;
          background: transparent;
          color: inherit;
          font: inherit;
          font-size: 13px;
        }

        .edit-modal textarea {
          resize: vertical;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 22px;
        }

        .cancel-edit,
        .save-edit {
          padding: 11px 17px;
          border: 0;
          border-radius: 7px;
          font-weight: 700;
          cursor: pointer;
        }

        .cancel-edit {
          background: #f1f5f9;
          color: #334155;
        }

        .save-edit {
          background: #2563eb;
          color: white;
        }

        .save-edit:disabled,
        .cancel-edit:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .edit-note {
          margin: 13px 0 0;
          color: #888;
          font-size: 11px;
          line-height: 1.5;
        }

        @media(max-width: 850px) {
          .service-summary {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media(max-width: 550px) {
          .services-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .services-heading h2 {
            font-size: 21px;
          }

          .service-summary {
            gap: 9px;
          }

          .summary-card {
            padding: 14px;
          }

          .summary-card strong {
            font-size: 21px;
          }

          .edit-modal {
            padding: 18px;
          }
        }
      `}</style>
    </section>
  );
}
