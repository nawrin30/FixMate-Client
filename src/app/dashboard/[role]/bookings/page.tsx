
'use client';

import { useEffect, useMemo, useState } from "react";
import { api, money } from "@/lib/api";
import { toast } from "sonner";
import { useParams } from "next/navigation";

type Booking = {
  _id: string;
  ticketNumber?: string;
  serviceTitle?: string;
  customerEmail?: string;
  technicianName?: string;
  preferredDate?: string;
  basePrice?: number;
  finalAmount?: number;
  status: string;
  paymentStatus?: string;
};

const filters = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "to-pay", label: "To Pay" },
  { id: "paid", label: "Paid" },
  { id: "closed", label: "Closed" },
];

function ticketNumber(b: Booking) {
  return b.ticketNumber ||
    `FM-${String(b._id).slice(-6).toUpperCase()}`;
}

function dateFormat(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    requested: "Requested",
    accepted: "Accepted",
    "in-progress": "In Progress",
    completed: "Completed",
    rejected: "Rejected",
    cancelled: "Cancelled",
  };

  return labels[status] || status;
}

export default function Bookings() {
  const { role } = useParams<{ role: string }>();

  const [items, setItems] = useState<Booking[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    try {
      const data = await api(
        role === "admin"
          ? "/api/admin/bookings"
          : "/api/bookings/my"
      );

      setItems(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(error.message || "Could not load bookings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [role]);

  function matchesFilter(b: Booking) {
    const payment = (b.paymentStatus || "unpaid").toLowerCase();

    switch (filter) {
      case "active":
        return [
          "requested",
          "accepted",
          "in-progress",
        ].includes(b.status);

      case "to-pay":
        return b.status === "completed" && payment !== "paid";

      case "paid":
        return payment === "paid";

      case "closed":
        return [
          "completed",
          "rejected",
          "cancelled",
        ].includes(b.status);

      default:
        return true;
    }
  }

  const filteredItems = useMemo(
    () => items.filter(matchesFilter),
    [items, filter]
  );

  function count(filterId: string) {
    return items.filter((b) => {
      const payment = (b.paymentStatus || "unpaid").toLowerCase();

      switch (filterId) {
        case "active":
          return [
            "requested",
            "accepted",
            "in-progress",
          ].includes(b.status);

        case "to-pay":
          return b.status === "completed" && payment !== "paid";

        case "paid":
          return payment === "paid";

        case "closed":
          return [
            "completed",
            "rejected",
            "cancelled",
          ].includes(b.status);

        default:
          return true;
      }
    }).length;
  }

  async function cancel(id: string) {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      setBusy(id);

      await api(`/api/bookings/${id}/cancel`, {
        method: "PATCH",
      });

      toast.success("Booking cancelled successfully");
      await load();
    } catch (error: any) {
      toast.error(error.message || "Cancellation failed");
    } finally {
      setBusy(null);
    }
  }

  async function pay(id: string) {
    try {
      setBusy(id);

      const data = await api(
        "/api/payments/create-checkout-session",
        {
          method: "POST",
          body: JSON.stringify({ bookingId: id }),
        }
      );

      if (!data.url) {
        throw new Error("Payment URL was not generated");
      }

      window.location.href = data.url;
    } catch (error: any) {
      toast.error(error.message || "Payment failed");
      setBusy(null);
    }
  }

  return (
    <main className="booking-page">
      <div className="booking-heading">
        <div>
          <span className="eyebrow">BOOKING MANAGEMENT</span>
          <h2>{role === "admin" ? "All Bookings" : "My Bookings"}</h2>
          <p>Track your repair bookings and payment status.</p>
        </div>

        <button
          className="refresh-button"
          onClick={() => {
            setLoading(true);
            load();
          }}
          disabled={loading}
        >
          ↻ Refresh
        </button>
      </div>

      <div className="booking-filters">
        {filters.map((item) => (
          <button
            key={item.id}
            className={`filter-button ${
              filter === item.id ? "selected" : ""
            }`}
            onClick={() => setFilter(item.id)}
          >
            <span>{item.label}</span>
            <strong>{count(item.id)}</strong>
          </button>
        ))}
      </div>

      <div className="booking-list-heading">
        <h3>
          {filters.find((f) => f.id === filter)?.label} Bookings
        </h3>
        <span>{filteredItems.length} bookings</span>
      </div>

      {loading ? (
        <div className="empty">Loading bookings...</div>
      ) : filteredItems.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📋</div>
          <h3>No bookings found</h3>
          <p>There are no bookings in this category yet.</p>
        </div>
      ) : (
        <div className="booking-table-wrap">
          <table className="booking-table">
            <thead>
              <tr>
                <th>Ticket Number</th>
                <th>Service</th>
                {role === "admin" && <th>Customer</th>}
                <th>Technician</th>
                <th>Repair Date</th>
                <th>Amount</th>
                <th>Booking Status</th>
                <th>Payment</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredItems.map((b) => (
                <tr key={b._id}>
                  <td>
                    <strong className="ticket-number">
                      {ticketNumber(b)}
                    </strong>
                  </td>

                  <td>
                    <strong>{b.serviceTitle || "Repair Service"}</strong>
                  </td>

                  {role === "admin" && (
                    <td>{b.customerEmail || "—"}</td>
                  )}

                  <td>{b.technicianName || "—"}</td>

                  <td>{dateFormat(b.preferredDate)}</td>

                  <td>
                    <strong>
                      {money(b.finalAmount || b.basePrice || 0)}
                    </strong>
                  </td>

                  <td>
                    <span className={`status-badge ${b.status}`}>
                      {statusLabel(b.status)}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`payment-badge ${
                        (b.paymentStatus || "unpaid").toLowerCase()
                      }`}
                    >
                      {b.paymentStatus || "unpaid"}
                    </span>
                  </td>

                  <td>
                    {role === "customer" &&
                    b.status === "requested" ? (
                      <button
                        className="action-button cancel-button"
                        disabled={busy === b._id}
                        onClick={() => cancel(b._id)}
                      >
                        {busy === b._id ? "Please wait..." : "Cancel"}
                      </button>
                    ) : role === "customer" &&
                      b.status === "completed" &&
                      (b.paymentStatus || "unpaid").toLowerCase() !== "paid" ? (
                      <button
                        className="action-button pay-button"
                        disabled={busy === b._id}
                        onClick={() => pay(b._id)}
                      >
                        {busy === b._id ? "Please wait..." : "Pay Now"}
                      </button>
                    ) : (
                      <span className="no-action">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .booking-page {
          width: 100%;
          padding-bottom: 35px;
        }

        .booking-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 25px;
        }

        .booking-heading h2 {
          font-size: 25px;
          margin: 7px 0;
        }

        .booking-heading p {
          margin: 0;
          color: #888;
          font-size: 14px;
        }

        .refresh-button {
          padding: 10px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: transparent;
          cursor: pointer;
          font-weight: 600;
        }

        .booking-filters {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 28px;
        }

        .filter-button {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 17px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          background: var(--card, white);
          color: inherit;
          cursor: pointer;
          text-align: left;
        }

        .filter-button strong {
          font-size: 20px;
        }

        .filter-button.selected {
          border: 2px solid #2563eb;
          background: #eff6ff;
          color: #1d4ed8;
        }

        .booking-list-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 15px;
        }

        .booking-list-heading h3 {
          margin: 0;
          font-size: 19px;
        }

        .booking-list-heading span {
          color: #888;
          font-size: 13px;
        }

        .booking-table-wrap {
          width: 100%;
          overflow-x: auto;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: var(--card, white);
        }

        .booking-table {
          width: 100%;
          min-width: 1000px;
          border-collapse: collapse;
          text-align: left;
        }

        .booking-table th {
          padding: 15px 13px;
          background: var(--background, #f8fafc);
          color: #64748b;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: .4px;
          white-space: nowrap;
        }

        .booking-table td {
          padding: 16px 13px;
          border-top: 1px solid #eee;
          font-size: 13px;
          white-space: nowrap;
        }

        .ticket-number {
          color: #2563eb;
        }

        .status-badge,
        .payment-badge {
          display: inline-block;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .status-badge.requested {
          background: #fff7ed;
          color: #c2410c;
        }

        .status-badge.accepted {
          background: #eff6ff;
          color: #1d4ed8;
        }

        .status-badge.in-progress {
          background: #fef3c7;
          color: #92400e;
        }

        .status-badge.completed {
          background: #dcfce7;
          color: #15803d;
        }

        .status-badge.rejected,
        .status-badge.cancelled {
          background: #fee2e2;
          color: #b91c1c;
        }

        .payment-badge.paid {
          background: #dcfce7;
          color: #15803d;
        }

        .payment-badge.unpaid {
          background: #fff7ed;
          color: #c2410c;
        }

        .action-button {
          padding: 8px 12px;
          border: none;
          border-radius: 7px;
          cursor: pointer;
          font-weight: 700;
          font-size: 12px;
        }

        .action-button:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .pay-button {
          background: #2563eb;
          color: white;
        }

        .cancel-button {
          background: #fee2e2;
          color: #b91c1c;
        }

        .no-action {
          color: #999;
        }

        .empty {
          padding: 45px 15px;
          text-align: center;
          border: 1px solid #eee;
          border-radius: 12px;
          background: var(--card, white);
          color: #888;
        }

        .empty-icon {
          font-size: 32px;
          margin-bottom: 10px;
        }

        .empty h3 {
          color: inherit;
          margin: 5px 0;
        }

        .empty p {
          margin-bottom: 0;
          font-size: 13px;
        }

        @media(max-width: 850px) {
          .booking-filters {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media(max-width: 550px) {
          .booking-heading h2 {
            font-size: 21px;
          }

          .booking-filters {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </main>
  );
}
