
'use client';

import { useEffect, useMemo, useState } from "react";
import { api, money } from "@/lib/api";
import { toast } from "sonner";

type Booking = {
  _id: string;
  ticketNumber?: string;
  serviceTitle: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  problemDescription: string;
  preferredDate: string;
  createdAt: string;
  basePrice: number;
  finalAmount?: number;
  status: string;
  paymentStatus: string;
};

const filters = [
  "all",
  "requested",
  "accepted",
  "in-progress",
  "completed",
  "rejected"
];

function ticketId(b: Booking) {
  return b.ticketNumber ||
    `FM-${b._id.slice(-6).toUpperCase()}`;
}

function dateFormat(date?: string) {
  if (!date) return "Not available";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) return "Not available";

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export default function Requests() {
  const [items, setItems] = useState<Booking[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    try {
      const data = await api("/api/bookings/technician");
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast.error(e.message || "Could not load requests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function update(
    id: string,
    status: string,
    amount?: number
  ) {
    if (busy) return;

    setBusy(id);

    try {
      await api(`/api/bookings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          ...(amount !== undefined ? { finalAmount: amount } : {})
        })
      });

      toast.success("Booking updated successfully");
      await load();
    } catch (e: any) {
      toast.error(e.message || "Booking update failed");
    } finally {
      setBusy(null);
    }
  }

  function completeBooking(b: Booking) {
    const value = prompt(
      "Enter final repair amount",
      String(b.basePrice)
    );

    if (value === null) return;

    const amount = Number(value);

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    update(b._id, "completed", amount);
  }

  const filteredItems = useMemo(() => {
    if (filter === "all") return items;
    return items.filter(b => b.status === filter);
  }, [items, filter]);

  function count(status: string) {
    if (status === "all") return items.length;
    return items.filter(b => b.status === status).length;
  }

  const statusLabel: Record<string, string> = {
    requested: "Requested",
    accepted: "Accepted",
    "in-progress": "In Progress",
    completed: "Completed",
    rejected: "Rejected"
  };

  return (
    <main className="requests-page">
      <div className="page-heading">
        <div>
          <h2>Manage Repair Requests</h2>
          <p>View and manage customer repair bookings.</p>
        </div>

        <button
          className="refresh-btn"
          onClick={() => {
            setLoading(true);
            load();
          }}
        >
          ↻ Refresh
        </button>
      </div>

      <div className="request-stats">
        {filters.map(status => (
          <button
            key={status}
            className={`filter-card ${filter === status ? "active" : ""}`}
            onClick={() => setFilter(status)}
          >
            <span>
              {status === "all"
                ? "All Requests"
                : statusLabel[status]}
            </span>
            <strong>{count(status)}</strong>
          </button>
        ))}
      </div>

      <div className="request-list-heading">
        <h3>
          {filter === "all"
            ? "All Repair Requests"
            : `${statusLabel[filter]} Requests`}
        </h3>
        <span>{filteredItems.length} bookings</span>
      </div>

      {loading ? (
        <div className="empty">Loading repair requests...</div>
      ) : filteredItems.length === 0 ? (
        <div className="empty">
          No repair requests found in this category.
        </div>
      ) : (
        <div className="request-list">
          {filteredItems.map(b => (
            <article className="request-card" key={b._id}>
              <div className="request-top">
                <div>
                  <span className="ticket-label">TICKET NUMBER</span>
                  <h3 className="ticket-number">
                    #{ticketId(b)}
                  </h3>
                </div>

                <span className={`status-badge ${b.status}`}>
                  {statusLabel[b.status] || b.status}
                </span>
              </div>

              <div className="request-service">
                <h3>{b.serviceTitle}</h3>
                <p>
                  Booking ID: {b._id}
                </p>
              </div>

              <div className="request-details">
                <div>
                  <span>Customer Name</span>
                  <strong>{b.customerName || "N/A"}</strong>
                </div>

                <div>
                  <span>Customer Email</span>
                  <strong>{b.customerEmail || "N/A"}</strong>
                </div>

                <div>
                  <span>Phone Number</span>
                  <strong>{b.customerPhone || "N/A"}</strong>
                </div>

                <div>
                  <span>Requested Date</span>
                  <strong>{dateFormat(b.createdAt)}</strong>
                </div>

                <div>
                  <span>Preferred Repair Date</span>
                  <strong>{dateFormat(b.preferredDate)}</strong>
                </div>

                <div>
                  <span>Service Price</span>
                  <strong>{money(b.basePrice)}</strong>
                </div>

                <div>
                  <span>Final Amount</span>
                  <strong>
                    {b.finalAmount
                      ? money(b.finalAmount)
                      : "Not finalized"}
                  </strong>
                </div>

                <div>
                  <span>Payment Status</span>
                  <strong>{b.paymentStatus || "unpaid"}</strong>
                </div>
              </div>

              <div className="request-address">
                <span>Service Address</span>
                <p>{b.address || "Not provided"}</p>
              </div>

              <div className="request-problem">
                <span>Problem Description</span>
                <p>{b.problemDescription || "No description"}</p>
              </div>

              <div className="request-actions">
                {b.status === "requested" && (
                  <>
                    <button
                      className="action-btn accept-btn"
                      disabled={busy === b._id}
                      onClick={() => update(b._id, "accepted")}
                    >
                      {busy === b._id ? "Updating..." : "✓ Accept Request"}
                    </button>

                    <button
                      className="action-btn reject-btn"
                      disabled={busy === b._id}
                      onClick={() => {
                        if (confirm("Are you sure you want to reject this request?")) {
                          update(b._id, "rejected");
                        }
                      }}
                    >
                      ✕ Reject
                    </button>
                  </>
                )}

                {b.status === "accepted" && (
                  <button
                    className="action-btn accept-btn"
                    disabled={busy === b._id}
                    onClick={() => update(b._id, "in-progress")}
                  >
                    {busy === b._id ? "Updating..." : "Start Work"}
                  </button>
                )}

                {b.status === "in-progress" && (
                  <button
                    className="action-btn complete-btn"
                    disabled={busy === b._id}
                    onClick={() => completeBooking(b)}
                  >
                    Mark Completed
                  </button>
                )}

                {b.status === "completed" && (
                  <span className="finished-label">
                    ✓ Repair Completed
                  </span>
                )}

                {b.status === "rejected" && (
                  <span className="rejected-label">
                    Request Rejected
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <style jsx>{`
        .requests-page {
          width: 100%;
          padding-bottom: 35px;
          color: var(--foreground, #1f2937);
        }

        .page-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 25px;
        }

        .page-heading h2 {
          font-size: 25px;
          margin: 0 0 7px;
        }

        .page-heading p {
          color: #888;
          margin: 0;
          font-size: 14px;
        }

        .refresh-btn {
          padding: 10px 17px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: transparent;
          cursor: pointer;
          font-weight: 600;
        }

        .request-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 13px;
          margin-bottom: 28px;
        }

        .filter-card {
          padding: 17px;
          border: 1px solid #e5e7eb;
          border-radius: 11px;
          background: var(--card, white);
          text-align: left;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          color: inherit;
        }

        .filter-card strong {
          font-size: 21px;
        }

        .filter-card.active {
          border: 2px solid #2563eb;
          background: #eff6ff;
          color: #1d4ed8;
        }

        .request-list-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .request-list-heading h3 {
          font-size: 19px;
          margin: 0;
        }

        .request-list-heading span {
          color: #888;
          font-size: 13px;
        }

        .request-list {
          display: grid;
          gap: 18px;
        }

        .request-card {
          border: 1px solid #e5e7eb;
          border-radius: 13px;
          padding: 22px;
          background: var(--card, white);
          box-shadow: 0 3px 12px rgba(0,0,0,.035);
        }

        .request-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding-bottom: 16px;
          border-bottom: 1px solid #eee;
        }

        .ticket-label, .request-details span,
        .request-address span, .request-problem span {
          display: block;
          color: #888;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .5px;
          margin-bottom: 6px;
        }

        .ticket-number {
          margin: 0;
          color: #2563eb;
          font-size: 20px;
        }

        .status-badge {
          padding: 7px 12px;
          border-radius: 20px;
          background: #f3f4f6;
          color: #374151;
          font-size: 12px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .status-badge.requested { background: #fff7ed; color: #c2410c; }
        .status-badge.accepted { background: #eff6ff; color: #1d4ed8; }
        .status-badge.in-progress { background: #fef3c7; color: #92400e; }
        .status-badge.completed { background: #dcfce7; color: #15803d; }
        .status-badge.rejected { background: #fee2e2; color: #b91c1c; }

        .request-service {
          margin: 17px 0;
        }

        .request-service h3 {
          margin: 0 0 5px;
          font-size: 18px;
        }

        .request-service p {
          margin: 0;
          font-size: 12px;
          color: #999;
          word-break: break-all;
        }

        .request-details {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          padding: 18px 0;
          border-top: 1px solid #eee;
          border-bottom: 1px solid #eee;
        }

        .request-details strong {
          display: block;
          font-size: 14px;
          overflow-wrap: anywhere;
        }

        .request-address, .request-problem {
          margin-top: 18px;
        }

        .request-address p, .request-problem p {
          margin: 0;
          line-height: 1.6;
          font-size: 14px;
          overflow-wrap: anywhere;
        }

        .request-problem {
          padding: 13px;
          background: var(--background, #f9fafb);
          border-radius: 8px;
        }

        .request-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #eee;
        }

        .action-btn {
          padding: 11px 17px;
          border: none;
          border-radius: 7px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
        }

        .action-btn:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .accept-btn { background: #2563eb; color: white; }
        .reject-btn { background: #fee2e2; color: #b91c1c; }
        .complete-btn { background: #16a34a; color: white; }

        .finished-label { color: #15803d; font-weight: 700; }
        .rejected-label { color: #b91c1c; font-weight: 700; }

        .empty {
          padding: 35px 15px;
          text-align: center;
          color: #888;
          background: var(--card, white);
          border: 1px solid #eee;
          border-radius: 10px;
        }

        @media(max-width: 650px) {
          .request-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .request-card {
            padding: 15px;
          }

          .request-details {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .page-heading h2 {
            font-size: 20px;
          }
        }
      `}</style>
    </main>
  );
}
