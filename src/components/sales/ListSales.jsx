import React, { useEffect, useState, useCallback } from "react";
import axiosWithAuth from "../../utils/axiosWithAuth";
import "./ListSales.css";

const ListSales = () => {
  const today = new Date().toISOString().split("T")[0];

  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState({
    total_sales: 0,
    total_paid: 0,
    total_balance: 0,
  });

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState(true);

  const formatAmount = (value) =>
    Number(value || 0).toLocaleString("en-US");

  // =========================
  // SAFE API FETCH (ANALYSIS STYLE)
  // =========================
  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const api = axiosWithAuth();

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const isSuperAdmin = user?.roles?.includes("super_admin");

      const params = {
        start_date: startDate,
        end_date: endDate,
      };

      // 🔥 match backend requirement
      if (isSuperAdmin && user?.business_id) {
        params.business_id = user.business_id;
      }

      const res = await api.get("/sales/", { params });

      console.log("Sales API response:", res.data);

      const data = res.data;

      // =========================
      // MATCH ALL POSSIBLE SHAPES
      // =========================
      let salesData = [];

      if (Array.isArray(data)) {
        salesData = data;
      } else if (Array.isArray(data?.sales)) {
        salesData = data.sales;
      } else if (Array.isArray(data?.items)) {
        salesData = data.items;
      }

      setSales(salesData);

      setSummary(
        data?.summary || {
          total_sales: 0,
          total_paid: 0,
          total_balance: 0,
        }
      );
    } catch (err) {
      console.error("Fetch sales error:", err);

      setError(
        err.response?.data?.detail || "Failed to load sales records."
      );

      setSales([]);
      setSummary({
        total_sales: 0,
        total_paid: 0,
        total_balance: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  if (!show) return null;

  // =========================
  // SAFE HELPERS (ANALYSIS STYLE)
  // =========================
  const safeItems = (items) => Array.isArray(items) ? items : [];

  const getSaleGrossTotal = (items) =>
    safeItems(items).reduce(
      (sum, item) => sum + Number(item?.gross_amount || 0),
      0
    );

  const getSaleDiscountTotal = (items) =>
    safeItems(items).reduce(
      (sum, item) => sum + Number(item?.discount || 0),
      0
    );

  return (
    <div className="list-sales-container">
      <button className="close-btn" onClick={() => setShow(false)}>
        ✖
      </button>

      <h2>📄 Sales List Records</h2>

      {/* FILTERS */}
      <div className="sales-filters">
        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>

        <label>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>

        <button onClick={fetchSales}>Filter</button>
      </div>

      {loading && <p>Loading sales...</p>}
      {error && !loading && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <div className="table-wrapper">
          <table className="sales-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Invoice No</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Ref</th>
                <th>Products</th>
                <th className="text-right">Gross</th>
                <th className="text-right">Discount</th>
                <th className="text-right">Total</th>
                <th className="text-right">Paid</th>
                <th className="text-right">Balance</th>
                <th>Status</th>
                <th>Sold At</th>
              </tr>
            </thead>

            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan="13">No sales records found</td>
                </tr>
              ) : (
                sales.map((sale, index) => {
                  const items = safeItems(sale?.items);

                  return (
                    <tr key={sale?.id || index}>
                      <td>{index + 1}</td>
                      <td>{sale?.invoice_no || "-"}</td>
                      <td>{sale?.customer_name || "Walk-in"}</td>
                      <td>{sale?.customer_phone || "-"}</td>
                      <td>{sale?.ref_no || "-"}</td>

                      <td>
                        {items.length
                          ? items
                              .map((i) => i?.product_name)
                              .filter(Boolean)
                              .join(", ")
                          : "-"}
                      </td>

                      <td className="text-right">
                        {formatAmount(getSaleGrossTotal(items))}
                      </td>

                      <td className="text-right">
                        {formatAmount(getSaleDiscountTotal(items))}
                      </td>

                      <td className="text-right">
                        {formatAmount(sale?.total_amount)}
                      </td>

                      <td className="text-right">
                        {formatAmount(sale?.total_paid)}
                      </td>

                      <td className="text-right">
                        {formatAmount(sale?.balance_due)}
                      </td>

                      <td>{sale?.payment_status || "-"}</td>

                      <td>
                        {sale?.sold_at
                          ? new Date(sale.sold_at).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* TOTALS (ANALYSIS STYLE LOGIC) */}
            {sales.length > 0 && (
              <tfoot>
                <tr className="sales-total-row">
                  <td colSpan="6">TOTAL</td>

                  <td className="text-right">
                    {formatAmount(
                      sales.reduce(
                        (sum, s) =>
                          sum + getSaleGrossTotal(safeItems(s.items)),
                        0
                      )
                    )}
                  </td>

                  <td className="text-right">
                    {formatAmount(
                      sales.reduce(
                        (sum, s) =>
                          sum + getSaleDiscountTotal(safeItems(s.items)),
                        0
                      )
                    )}
                  </td>

                  <td className="text-right">
                    {formatAmount(summary.total_sales)}
                  </td>

                  <td className="text-right">
                    {formatAmount(summary.total_paid)}
                  </td>

                  <td className="text-right">
                    {formatAmount(summary.total_balance)}
                  </td>

                  <td colSpan="2"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
};

export default ListSales;
