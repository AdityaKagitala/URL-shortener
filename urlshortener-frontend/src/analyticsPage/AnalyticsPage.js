import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { PlatformPieChart, DeviceBarChart,EngagementAreaChart} from "./Charts";
import "./AnalyticsPage.css";

const AnalyticsPage = () => {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:8080/viewLink/${shortCode}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAnalytics(response.data || []);
        setLoading(false);
      } catch (err) {
        setError("Error fetching data");
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [shortCode]);

  const handleClose = () => {
    setIsOpen(false);
    navigate("/");
  };

  if (!isOpen) return null;
  if (loading) return <p className="loading">Loading...</p>;
  if (error) return <p className="error" style={{ color: "red" }}>{error}</p>;

  // Platform stats for list
  const platformStats = analytics.reduce((acc, click) => {
    acc[click.platform] = (acc[click.platform] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="analytics-overlay">
      <div className="analytics-modal">

        <button className="analytics-close-btn" onClick={handleClose}>×</button>

        <h2 className="analytics-title">Analytics</h2>

        <ul className="analytics-platform-list">
          {Object.entries(platformStats).map(([platform, count]) => (
            <li key={platform} className="analytics-platform-item">
              {platform} : {count} clicks
            </li>
          ))}
        </ul>

        <div className="analytics-charts">

          <div className="chart-card">
            <h3 className="chart-title">Platform Distribution</h3>
            <PlatformPieChart data={analytics} />
          </div>

          <div className="chart-card">
            <h3 className="chart-title">Device Breakdown</h3>
            <DeviceBarChart data={analytics} />
          </div>

          <div className="chart-card" style={{ gridColumn: "1 / -1" }}>
          <h3 className="chart-title">Engagement Over Time</h3>
            <EngagementAreaChart data={analytics} />
          </div>

        </div>

        <table className="analytics-table">
          <thead>
            <tr>
              <th>Device</th>
              <th>Platform</th>
              <th>Browser</th>
              <th>Country</th>
              <th>Region</th>
              <th>Referrer</th>
              <th>Clicked At</th>
            </tr>
          </thead>
          <tbody>
            {analytics.map((click, index) => (
              <tr key={index} className="analytics-row">
                <td>{click.deviceType || "N/A"}</td>
                <td>{click.platform || "N/A"}</td>
                <td>{click.browser || "N/A"}</td>
                <td>{click.country || "N/A"}</td>
                <td>{click.region || "N/A"}</td>
                <td>{click.referrer || "N/A"}</td>
                <td>{click.clickedAt || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
};

export default AnalyticsPage;
