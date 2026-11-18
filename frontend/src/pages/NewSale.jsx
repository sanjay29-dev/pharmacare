
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import saleService from "../services/saleService";
import { useCart } from "../context/CartContext";
import "./NewSale.css";

export default function NewSale() {
  const {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [customerName, setCustomerName] = useState("");

  // Discount is entered manually in rupees.
  const [discount, setDiscount] = useState("0");

  // Tax percentage is loaded from saved settings.
  const [settings, setSettings] = useState({
    defaultTaxRate: 0,
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load saved Sales & Invoice settings.
  useEffect(() => {
    let active = true;

    async function loadSalesSettings() {
      try {
        const response = await api.get("/settings/sales-invoice");

        if (active) {
          setSettings({
            defaultTaxRate: Number(
              response.data.defaultTaxRate || 0
            ),
          });
        }
      } catch (err) {
        console.error(
          "Unable to load sales invoice settings:",
          err
        );
      }
    }

    loadSalesSettings();

    return () => {
      active = false;
    };
  }, []);

  // Automatically hide error after 5 seconds.
  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => {
      setError("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [error]);

  // Calculate subtotal from cart.
  const subtotal = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.sellingPrice || 0) *
        Number(item.quantity || 0),
    0
  );

  // Manual discount amount in rupees.
  const discountAmount = Math.max(
    0,
    Number(discount) || 0
  );

  // Automatically calculate tax using saved percentage.
  const taxAmount =
    Math.round(
      (
        subtotal * settings.defaultTaxRate / 100 +
        Number.EPSILON
      ) * 100
    ) / 100;

  // Calculate final bill.
  const total = Math.max(
    0,
    subtotal - discountAmount + taxAmount
  );

  async function searchMedicines(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!keyword.trim()) {
      setResults([]);
      setError("Enter a medicine name or barcode.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.get("/medicines/search", {
        params: {
          keyword: keyword.trim(),
        },
      });

      setResults(
        Array.isArray(response.data) ? response.data : []
      );

      if (!response.data?.length) {
        setSuccess("No matching medicines found.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to search medicines."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleAddMedicine(medicine) {
    if (medicine.availableQty <= 0) {
      setError("This medicine is out of stock.");
      return;
    }

    const existing = cart.find(
      (item) => item.medicineId === medicine.medicineId
    );

    if (
      existing &&
      existing.quantity >= medicine.availableQty
    ) {
      setError(
        `Only ${medicine.availableQty} units are available.`
      );
      return;
    }

    addToCart(medicine);

    setError("");
    setSuccess(
      `${medicine.name} added to the sale cart.`
    );
  }

  async function handleCompleteSale() {
    setError("");
    setSuccess("");

    if (cart.length === 0) {
      setError(
        "Add at least one medicine before completing the sale."
      );
      return;
    }

    if (discountAmount > subtotal) {
      setError(
        "Discount cannot exceed the displayed subtotal."
      );
      return;
    }

    // Prevent completing a sale with missing medicine prices.
    const hasInvalidPrice = cart.some(
      (item) =>
        !Number.isFinite(Number(item.sellingPrice)) ||
        Number(item.sellingPrice) <= 0
    );

    if (hasInvalidPrice) {
      setError(
        "One or more medicines have an invalid selling price. Please check the medicine price."
      );
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        customerName: customerName.trim() || "Walk-in",
        discount: discountAmount,
        tax: taxAmount,
        items: cart.map((item) => ({
          medicineId: item.medicineId,
          quantity: Number(item.quantity),
        })),
      };

      const sale = await saleService.create(payload);

      clearCart();

      navigate(`/sales/${sale.id}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Sale failed. Check stock availability and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="ns-page">

      <div className="ns-page-heading">
        <div>
          <div className="ns-breadcrumb">
            Home / Sales / New Sale
          </div>

          <h1>New Sale</h1>

          <p>
            Search medicines, prepare the cart, and complete the sale.
          </p>
        </div>

        <button
          type="button"
          className="ns-secondary-button"
          onClick={() => navigate("/find-medicine")}
        >
          <span>⌕</span> Find Medicine
        </button>
      </div>

      {/* Floating error warning */}
      {error && (
        <div className="ns-floating-error" role="alert">
          <span>⚠</span>

          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Close warning"
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="ns-alert ns-alert-success">
          {success}
        </div>
      )}

      {/* Medicine Search */}
      <section className="ns-search-card">

        <div className="ns-section-heading">
          <span className="ns-heading-icon">⌕</span>

          <div>
            <h2>Add Medicines</h2>
            <p>
              Search by medicine name, generic name or barcode
            </p>
          </div>
        </div>

        <form
          className="ns-search-form"
          onSubmit={searchMedicines}
        >
          <div className="ns-search-input-wrap">
            <span>⌕</span>

            <input
              type="search"
              value={keyword}
              onChange={(event) =>
                setKeyword(event.target.value)
              }
              placeholder="Enter medicine name, generic name or barcode..."
              aria-label="Search medicines"
            />
          </div>

          <button
            type="submit"
            className="ns-primary-button"
            disabled={loading}
          >
            {loading ? "Searching..." : "⌕ Search"}
          </button>
        </form>

        {results.length > 0 && (
          <div className="ns-results">
            <h3>Matching Medicines</h3>

            {results.map((medicine) => (
              <div
                className="ns-result-row"
                key={medicine.medicineId}
              >
                <div>
                  <strong>{medicine.name}</strong>

                  <span>
                    {medicine.genericName ||
                      "Generic name unavailable"}
                    {" · "}
                    {medicine.availableQty} available
                  </span>
                </div>

                <button
                  type="button"
                  className="ns-add-button"
                  disabled={medicine.availableQty <= 0}
                  onClick={() =>
                    handleAddMedicine(medicine)
                  }
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Cart and Bill Summary */}
      <div className="ns-main-grid">

        <section className="ns-cart-card">

          <div className="ns-card-heading">
            <div className="ns-section-heading">
              <span className="ns-heading-icon">🛒</span>

              <h2>
                Sale Cart ({cart.length}{" "}
                {cart.length === 1 ? "medicine" : "medicines"})
              </h2>
            </div>

            {cart.length > 0 && (
              <button
                type="button"
                className="ns-clear-button"
                onClick={() => {
                  clearCart();
                  setDiscount("0");
                }}
              >
                ♲ Clear Cart
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="ns-empty-cart">
              <span>🛒</span>
              <h3>Your cart is empty</h3>
              <p>
                Search for a medicine above and click Add.
              </p>
            </div>
          ) : (
            <div className="ns-table-wrapper">
              <table className="ns-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Medicine</th>
                    <th>Available</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Line Total</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {cart.map((item, index) => {
                    const unitPrice = Number(
                      item.sellingPrice || 0
                    );

                    return (
                      <tr key={item.medicineId}>
                        <td>{index + 1}</td>

                        <td>
                          <div className="ns-medicine-name">
                            {item.name}
                          </div>

                          <div className="ns-medicine-generic">
                            {item.genericName ||
                              item.categoryName ||
                              "Medicine"}
                          </div>

                          <span className="ns-stock-badge">
                            ● In Cart
                          </span>
                        </td>

                        <td>{item.availableQty}</td>

                        <td>
                          <input
                            className="ns-quantity-input"
                            type="number"
                            min="1"
                            max={item.availableQty}
                            value={item.quantity}
                            onChange={(event) => {
                              const value = Number(
                                event.target.value
                              );

                              if (
                                Number.isInteger(value) &&
                                value >= 1 &&
                                value <= item.availableQty
                              ) {
                                updateQuantity(
                                  item.medicineId,
                                  value
                                );
                              }
                            }}
                          />
                        </td>

                        <td>
                          ₹{unitPrice.toFixed(2)}
                        </td>

                        <td className="ns-line-total">
                          ₹
                          {(
                            unitPrice * item.quantity
                          ).toFixed(2)}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="ns-remove-button"
                            aria-label={`Remove ${item.name}`}
                            title="Remove medicine"
                            onClick={() =>
                              removeFromCart(item.medicineId)
                            }
                          >
                            ♲
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Customer and Bill Inputs */}
          <div className="ns-customer-panel">

            <label className="ns-field ns-customer-field">
              <span>
                <b>♙</b> Customer Name
              </span>

              <input
                type="text"
                value={customerName}
                onChange={(event) =>
                  setCustomerName(event.target.value)
                }
                placeholder="Walk-in customer"
                maxLength={150}
              />
            </label>

            <div className="ns-field-grid">

              {/* Manual discount */}
              <label className="ns-field">
                <span>
                  <b>%</b> Discount (₹)
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(event) =>
                    setDiscount(event.target.value)
                  }
                  placeholder="Enter discount amount"
                />
              </label>

              {/* Automatically calculated tax */}
              <label className="ns-field">
                <span>
                  <b>▤</b> Tax (₹)
                  {" "}
                  <small>
                    ({settings.defaultTaxRate}%)
                  </small>
                </span>

                <input
                  type="number"
                  value={taxAmount.toFixed(2)}
                  readOnly
                  aria-label="Automatically calculated tax"
                />
              </label>

            </div>
          </div>

          <div className="ns-fefo-note">
            <span>i</span>

            <p>
              Stock will be deducted from the earliest-expiry
              batches (FEFO) when the sale is completed.
            </p>
          </div>

        </section>

        {/* Bill Summary */}
        <aside className="ns-summary-card">

          <div className="ns-summary-heading">
            <span className="ns-heading-icon">▦</span>
            <h2>Bill Summary</h2>
          </div>

          <div className="ns-summary-line">
            <span>Subtotal</span>
            <strong>
              ₹{subtotal.toFixed(2)}
            </strong>
          </div>

          <div className="ns-summary-line">
            <span>Discount</span>

            <strong className="ns-discount-value">
              - ₹{discountAmount.toFixed(2)}
            </strong>
          </div>

          <div className="ns-summary-line">
            <span>
              Tax ({settings.defaultTaxRate}%)
            </span>

            <strong>
              ₹{taxAmount.toFixed(2)}
            </strong>
          </div>

          <div className="ns-summary-total">
            <span>Total Amount</span>

            <strong>
              ₹{total.toFixed(2)}
            </strong>
          </div>

          <button
            type="button"
            className="ns-complete-button"
            disabled={submitting || cart.length === 0}
            onClick={handleCompleteSale}
          >
            {submitting
              ? "Processing Sale..."
              : "✓ Complete Sale"}
          </button>

          <p className="ns-summary-footnote">
            Please verify quantities before completing the sale.
          </p>

        </aside>
      </div>
    </div>
  );
}
