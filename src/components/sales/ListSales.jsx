import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
//import axiosWithAuth from "../../utils/axiosWithAuth";
import "./ListSales.css";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "http://localhost:8000";

const ListSales = () => {
  const today = new Date().toISOString().split("T")[0];

  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState({
    total_sales: 0,
    total_paid: 0,
    total_balance: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [show, setShow] = useState(true);

  // =========================
  // SAFE HELPERS
  // =========================
  const safeItems = (items) => (Array.isArray(items) ? items : []);

  const getSaleDiscountTotal = (items) =>
    safeItems(items).reduce(
      (sum, item) => sum + Number(item?.discount || 0),
      0
    );

  const getSaleGrossTotal = (items) =>
    safeItems(items).reduce(
      (sum, item) => sum + Number(item?.gross_amount || 0),
      0
    );

  const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-US");

  // =========================
  // FETCH SALES
  // =========================
  const fetchSales = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`${BASE_URL}/sales/`, {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });




      const data = response.data;

      console.log("Sales API response:", data);

      // ✅ FIX: handle all possible backend shapes
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

      setError("Failed to load sales records.");
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
  // UI
  // =========================
  return (
    <div className="list-sales-container">
      <button className="close-btn" onClick={() => setShow(false)}>
        ✖
      </button>

      <h2 className="list-sales-title">📄 Sales List Records</h2>

      {/* Filters */}
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

      {loading && <p className="status-text">Loading sales...</p>}
      {error && !loading && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <div className="table-wrapper">
          <table className="sales-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Invoice No</th>
                <th>Customer</th>
                <th>Phone No</th>
                <th>Reference No</th>
                <th>Product Name</th>
                <th className="text-right">Gross Amount</th>
                <th className="text-right">Discount</th>
                <th className="text-right">Total Amount</th>
                <th className="text-right">Total Paid</th>
                <th className="text-right">Balance Due</th>
                <th>Status</th>
                <th>Sold At</th>
              </tr>
            </thead>

            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan="13" className="empty-row">
                    No sales records found
                  </td>
                </tr>
              ) : (
                sales.map((sale, index) => {
                  const items = safeItems(sale?.items);

                  return (
                    <tr key={sale?.id ?? index}>
                      <td>{index + 1}</td>
                      <td>{sale?.invoice_no ?? "-"}</td>
                      <td>{sale?.customer_name || "Walk-in"}</td>
                      <td>{sale?.customer_phone || "-"}</td>
                      <td>{sale?.ref_no || "-"}</td>

                      <td>
                        {items.length > 0
                          ? items
                              .map((item) => item?.product_name || "")
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

            {/* TOTALS */}
            {sales.length > 0 && (
              <tfoot>
                <tr className="sales-total-row">
                  <td colSpan="6">TOTAL</td>

                  <td className="text-right">
                    {formatAmount(
                      sales.reduce(
                        (sum, s) => sum + getSaleGrossTotal(safeItems(s.items)),
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
