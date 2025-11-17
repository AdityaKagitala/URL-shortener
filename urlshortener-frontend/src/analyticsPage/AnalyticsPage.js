import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  PlatformPieChart,
  DeviceBarChart,
  EngagementAreaChart,
} from "./Charts";
import "./AnalyticsPage.css";

const AnalyticsPage = () => {
  const { shortCode } = useParams();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState([]);
  const [preview, setPreview] = useState(null); // ⭐ Preview data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // 1️⃣ First fetch analytics (click data)
        const analyticsRes = await axios.get(
          `http://localhost:8080/viewLink/${shortCode}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const analyticsData = analyticsRes.data || [];
        setAnalytics(analyticsData);

        // 2️⃣ If NO CLICKS → Fetch preview only from DB
        if (analyticsData.length === 0) {
          try {
            const previewRes = await axios.get(
              `http://localhost:8080/api/preview/${shortCode}`
            );
            setPreview(previewRes.data);
          } catch (e) {
            console.log("Preview API error:", e);
          }
        } else {
          // 3️⃣ Use preview from analytics[0]
          const first = analyticsData[0];
          setPreview({
            title: first.title,
            description: first.description,
            image: first.imageUrl,
            favicon: first.faviconUrl,
            originalUrl: first.originalUrl,
          });
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Error fetching analytics");
        setLoading(false);
      }
    };

    fetchData();
  }, [shortCode]);

  // ⭐ Platform stats for list
  const platformStats = analytics.reduce((acc, click) => {
    acc[click.platform] = (acc[click.platform] || 0) + 1;
    return acc;
  }, {});

  const handleClose = () => {
    setIsOpen(false);
    navigate("/");
  };

  if (!isOpen) return null;
  if (loading) return <p className="loading">Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="analytics-overlay">
      <div className="analytics-modal">
        <button className="analytics-close-btn" onClick={handleClose}>
          ×
        </button>

        <h2 className="analytics-title">Analytics Overview</h2>

        {/* ====================== PREVIEW CARD ====================== */}
        {preview && (
          <div className="preview-card-analytics">
            <div className="preview-left">
              <img
                src={preview.image || preview.favicon}
                alt="preview"
                className="preview-card-image"
              />
            </div>

            <div className="preview-right">
              <h3 className="preview-card-title">
                {preview.title || "No Title Available"}
              </h3>

              <p className="preview-card-description">
                {preview.description || "No Description Available"}
              </p>

              <div className="preview-card-domain">
                <img
                  src={preview.favicon}
                  alt="favicon"
                  className="preview-card-favicon"
                />
                <span>{preview.originalUrl}</span>
              </div>
            </div>
          </div>
        )}

        {/* ====================== CHARTS ====================== */}
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

        {/* ====================== PLATFORM LIST ====================== */}
        <ul className="analytics-platform-list">
          {Object.entries(platformStats).map(([platform, count]) => (
            <li key={platform} className="analytics-platform-item">
              {platform} : {count} clicks
            </li>
          ))}
        </ul>

        {/* ====================== TABLE ====================== */}
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
              <tr key={index}>
                <td>{click.deviceType}</td>
                <td>{click.platform}</td>
                <td>{click.browser}</td>
                <td>{click.country}</td>
                <td>{click.region}</td>
                <td>{click.referrer}</td>
                <td>{click.clickedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
};

export default AnalyticsPage;