
'use client';

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, money } from "@/lib/api";
import { authClient } from "@/lib/client-auth";
import { toast } from "sonner";

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [s, setS] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const repairFormRef = useRef<HTMLFormElement>(null);

  const [form, setForm] = useState({
    customerPhone: "",
    address: "",
    preferredDate: "",
    problemDescription: ""
  });

  useEffect(() => {
    let active = true;

    api(`/api/services/${id}`)
      .then((data) => {
        if (active) setS(data);
      })
      .catch(() => {
        if (active) setS(false);
      });

    authClient.getSession().then((r: any) => {
      if (active) setUser(r.data?.user || null);
    });

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (show) {
      repairFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }, [show]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);

    try {
      await api("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          serviceId: id,
          ...form
        })
      });

      toast.success("Repair request sent");
      setShow(false);
      router.push("/dashboard/customer/bookings");

    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (s === false) {
    return (
      <main className="container page-head">
        <h1>Service not found</h1>
      </main>
    );
  }

  if (!s) {
    return (
      <main className="container page-head">
        Loading service...
      </main>
    );
  }

  return (
    <main className="container service-detail-page">

      {/* REPAIR REQUEST FORM - TOP */}
      {show && (
        <form
          ref={repairFormRef}
          className="repair-form"
          onSubmit={submit}
        >
          <h2>Request Repair</h2>

          <p className="form-user">
            {user?.name} · {user?.email}
          </p>

          <div className="field">
            <label>Phone</label>
            <input
              required
              type="text"
              value={form.customerPhone}
              onChange={(e) =>
                setForm({
                  ...form,
                  customerPhone: e.target.value
                })
              }
            />
          </div>

          <div className="field">
            <label>Address</label>
            <input
              required
              type="text"
              value={form.address}
              onChange={(e) =>
                setForm({
                  ...form,
                  address: e.target.value
                })
              }
            />
          </div>

          <div className="field">
            <label>Preferred date</label>
            <input
              required
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              value={form.preferredDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  preferredDate: e.target.value
                })
              }
            />
          </div>

          <div className="field">
            <label>
              Describe the problem (minimum 20 characters)
            </label>

            <textarea
              required
              minLength={20}
              value={form.problemDescription}
              onChange={(e) =>
                setForm({
                  ...form,
                  problemDescription: e.target.value
                })
              }
            />
          </div>

          <div className="form-actions">
            <button
              disabled={busy}
              type="submit"
              className="request-btn"
            >
              {busy ? "Submitting..." : "Submit Request"}
            </button>

            <button
              type="button"
              className="cancel-btn"
              onClick={() => setShow(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* SERVICE DETAILS */}
      <div className="service-layout">

        {/* LEFT SIDE */}
        <section className="service-main">

          <div className="service-image">
            <img src={s.image} alt={s.title} />
          </div>

          <h1>{s.title}</h1>

          <p className="service-description">
            {s.description}
          </p>

          <div className="service-info-grid">

            <div className="info-item">
              <small>Category</small>
              <strong>{s.category}</strong>
            </div>

            <div className="info-item">
              <small>Estimated time</small>
              <strong>{s.estimatedDuration}</strong>
            </div>

            <div className="info-item">
              <small>Service type</small>
              <strong>{s.serviceMode}</strong>
            </div>

            <div className="info-item">
              <small>Area covered</small>
              <strong>{s.serviceArea}</strong>
            </div>

          </div>

        </section>

        {/* RIGHT SIDE */}
        <aside className="service-sidebar">

          {/* PRICE CARD */}
          <div className="price-card">

            <small>Starting price</small>

            <h2>{money(s.basePrice)}</h2>

            <p>
              The technician confirms the final price when the job is done.
              You pay only after that.
            </p>

            {!user ? (
              <button
                type="button"
                className="request-btn"
                onClick={() =>
                  router.push(`/sign-in?callbackURL=/services/${id}`)
                }
              >
                Request Repair
              </button>
            ) : user.role !== "customer" ? (
              <div className="role-notice">
                Only customers can request a repair.
              </div>
            ) : (
              <button
                type="button"
                className="request-btn"
                onClick={() => setShow(true)}
              >
                Request Repair
              </button>
            )}

          </div>

          {/* TECHNICIAN CARD */}
          <div className="technician-card">

            <small>Your technician</small>

            <div className="technician-profile">

              <div className="technician-avatar">
                {(s.technicianName || "T").charAt(0).toUpperCase()}
              </div>

              <div>
                <h3>{s.technicianName}</h3>
                <p>{s.serviceArea}</p>
              </div>

            </div>

            <p className="technician-email">
              {s.technicianEmail}
            </p>

          </div>

        </aside>

      </div>

      {/* PAGE DESIGN */}
      <style jsx>{`

        .service-detail-page {
          padding-top: 38px;
          padding-bottom: 75px;
        }

        .service-layout {
          display: grid;
          grid-template-columns: 1.35fr 0.9fr;
          gap: 30px;
          align-items: start;
        }

        /* SERVICE IMAGE */

        .service-image {
          width: 100%;
          height: 340px;
          border-radius: 18px;
          overflow: hidden;
          background: #edf3f1;
        }

        .service-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* SERVICE DETAILS */

        .service-main h1 {
          font-size: 32px;
          font-weight: 750;
          color: #102f2c;
          margin: 25px 0 12px;
        }

        .service-description {
          font-size: 15px;
          line-height: 1.8;
          color: #64748b;
          margin-bottom: 25px;
        }

        .service-info-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          background: white;
        }

        .info-item {
          padding: 17px 12px;
          border-right: 1px solid #e5e7eb;
        }

        .info-item:last-child {
          border-right: none;
        }

        .info-item small {
          display: block;
          color: #84918f;
          font-size: 12px;
          margin-bottom: 8px;
        }

        .info-item strong {
          display: block;
          font-size: 14px;
          color: #183b36;
        }

        /* SIDEBAR */

        .service-sidebar {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .price-card,
        .technician-card {
          background: #fff;
          border: 1px solid #e8eeeb;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.04);
        }

        .price-card > small,
        .technician-card > small {
          display: block;
          color: #84918f;
          font-size: 13px;
          margin-bottom: 10px;
        }

        .price-card h2 {
          font-size: 35px;
          font-weight: 750;
          color: #087f70;
          margin: 0 0 10px;
        }

        .price-card p {
          color: #718096;
          font-size: 14px;
          line-height: 1.7;
          margin-bottom: 20px;
        }

        /* REQUEST BUTTON */

        .request-btn {
          display: block;
          width: 100%;
          border: none;
          border-radius: 9px;
          background: #d97706;
          color: white;
          padding: 14px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
        }

        .request-btn:hover {
          background: #b45309;
        }

        .request-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .role-notice {
          background: #fff8e8;
          color: #a34b08;
          border-radius: 9px;
          padding: 14px;
          font-size: 14px;
        }

        /* TECHNICIAN */

        .technician-profile {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-top: 15px;
        }

        .technician-avatar {
          width: 48px;
          height: 48px;
          min-width: 48px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #123b36;
          color: white;
          font-weight: 700;
          font-size: 19px;
        }

        .technician-profile h3 {
          font-size: 15px;
          color: #173b35;
          margin: 0 0 5px;
        }

        .technician-profile p,
        .technician-email {
          color: #84918f;
          font-size: 13px;
          margin: 0;
        }

        .technician-email {
          margin-top: 16px;
        }

        /* REPAIR FORM */

        .repair-form {
          max-width: 650px;
          margin: 0 auto 35px;
          padding: 28px;
          border: 1px solid #e5e7eb;
          border-radius: 15px;
          background: white;
          box-shadow: 0 5px 20px rgba(0,0,0,0.04);
          scroll-margin-top: 25px;
        }

        .repair-form h2 {
          color: #123b36;
          margin: 0 0 10px;
        }

        .form-user {
          color: #84918f;
          margin-bottom: 22px;
        }

        .repair-form .field {
          margin-bottom: 17px;
        }

        .repair-form label {
          display: block;
          margin-bottom: 7px;
          font-weight: 600;
          color: #183b36;
        }

        .repair-form input,
        .repair-form textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #d8e0dd;
          border-radius: 8px;
          font: inherit;
        }

        .repair-form textarea {
          min-height: 100px;
          resize: vertical;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .form-actions .request-btn {
          flex: 1;
        }

        .cancel-btn {
          padding: 12px 20px;
          border: 1px solid #d8e0dd;
          background: white;
          border-radius: 8px;
          cursor: pointer;
        }

        /* RESPONSIVE */

        @media (max-width: 850px) {
          .service-layout {
            grid-template-columns: 1fr;
          }

          .service-image {
            height: 300px;
          }
        }

        @media (max-width: 550px) {
          .service-info-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .info-item:nth-child(2) {
            border-right: none;
          }

          .info-item:nth-child(1),
          .info-item:nth-child(2) {
            border-bottom: 1px solid #e5e7eb;
          }

          .service-main h1 {
            font-size: 25px;
          }

          .service-image {
            height: 230px;
          }

          .repair-form {
            padding: 20px;
          }
        }

      `}</style>

    </main>
  );
}
