
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import saleService from "../services/saleService";
import pharmacySettingsService from "../services/pharmacySettingsService";
import salesInvoiceSettingsService from "../services/salesInvoiceSettingsService";
import "./SaleDetails.css";

export default function SaleDetails() {
  const { id } = useParams();

  const [sale, setSale] = useState(null);
  const [profile, setProfile] = useState(null);
  const [invoiceSettings, setInvoiceSettings] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadInvoice() {
      try {
        setLoading(true);
        setError("");

        const results = await Promise.allSettled([
          saleService.getById(id),
          pharmacySettingsService.get(),
          salesInvoiceSettingsService.get(),
        ]);

        if (!active) return;

        // Sale details are essential.
        if (results[0].status === "rejected") {
          throw results[0].reason;
        }

        setSale(results[0].value);

        // Settings are optional for displaying the invoice.
        if (results[1].status === "fulfilled") {
          setProfile(results[1].value);
        } else {
          console.error("Unable to load pharmacy profile:", results[1].reason);
        }

        if (results[2].status === "fulfilled") {
          setInvoiceSettings(results[2].value);
        } else {
          console.error("Unable to load invoice settings:", results[2].reason);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message || "Unable to load this invoice."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadInvoice();

    return () => {
      active = false;
    };
  }, [id]);

  function currency(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  function formatDate(value) {
    if (!value) return "—";

    return new Date(value).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  if (loading) {
    return (
      <div className="ns-page">
        <p>Loading invoice...</p>
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="ns-page">
        <div className="ns-alert ns-alert-error">
          {error || "Invoice not found."}
        </div>

        <Link to="/sales">← Back to Sales History</Link>
      </div>
    );
  }

  const pharmacyName =
    profile?.pharmacyName?.trim() || "PharmaCare Pharmacy";

  const invoiceFooter =
    invoiceSettings?.invoiceFooter?.trim() ||
    "Thank you for your purchase!";

  return (
    <div className="ns-page invoice-page">
      <div className="invoice-actions no-print">
        <Link className="ns-secondary-button" to="/sales">
          ← Sales History
        </Link>

        <button
          type="button"
          className="ns-primary-button"
          onClick={() => window.print()}
        >
          ⎙ Print Invoice
        </button>
      </div>

      <article className="invoice-paper">

        {/* PHARMACY HEADER */}

        <header className="invoice-header">
          <div>
            <h1>{pharmacyName}</h1>

            {profile?.address && (
              <p>{profile.address}</p>
            )}

            {profile?.phone && (
              <p>Phone: {profile.phone}</p>
            )}

            {profile?.email && (
              <p>Email: {profile.email}</p>
            )}

            {profile?.gstNumber && (
              <p>GSTIN: {profile.gstNumber}</p>
            )}

            <p>Sales Invoice</p>
          </div>

          <div className="invoice-number">
            <span>INVOICE</span>

            <strong>
              {sale.invoiceNumber || `INV-${sale.id}`}
            </strong>

            <span className="invoice-status">
              {sale.status || "COMPLETED"}
            </span>
          </div>
        </header>

        <div className="invoice-divider" />

        {/* CUSTOMER AND INVOICE DETAILS */}

        <section className="invoice-meta">
          <div>
            <span>Customer</span>
            <strong>
              {sale.customerName || "Walk-in customer"}
            </strong>
          </div>

          <div>
            <span>Invoice Date</span>
            <strong>{formatDate(sale.saleDate)}</strong>
          </div>

          <div>
            <span>Sale ID</span>
            <strong>#{sale.id}</strong>
          </div>
        </section>

        {/* MEDICINE DETAILS */}

        <h2 className="invoice-section-title">
          Medicine Details
        </h2>

        <div className="invoice-table-wrapper">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Medicine</th>
                <th>Batch Number</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Line Total</th>
              </tr>
            </thead>

            <tbody>
              {(sale.items || []).map((item, index) => (
                <tr key={item.id ?? `${item.batchId}-${index}`}>
                  <td>{index + 1}</td>

                  <td>
                    <strong>
                      {item.medicineName || "Medicine"}
                    </strong>
                  </td>

                  <td>
                    {item.batchNumber || `Batch #${item.batchId}`}
                  </td>

                  <td>{item.quantity}</td>

                  <td>{currency(item.sellingPrice)}</td>

                  <td>{currency(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTALS */}

        <div className="invoice-bottom">
          <div className="invoice-thankyou">
            <h3>{invoiceFooter}</h3>

            <p>Please retain this invoice for your records.</p>

            <p>Stock allocation follows the FEFO method.</p>
          </div>

          <div className="invoice-totals">
            <div>
              <span>Subtotal</span>
              <strong>{currency(sale.subtotal)}</strong>
            </div>

            <div>
              <span>Discount</span>
              <strong>{currency(sale.discount)}</strong>
            </div>

            <div>
              <span>Tax</span>
              <strong>{currency(sale.tax)}</strong>
            </div>

            <div className="invoice-grand-total">
              <span>Total Amount</span>
              <strong>{currency(sale.totalAmount)}</strong>
            </div>
          </div>
        </div>

        {/* INVOICE FOOTER */}

        <footer className="invoice-footer">
          {pharmacyName} | Generated by PharmaCare
        </footer>

      </article>
    </div>
  );
}
