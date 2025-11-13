import React, { useEffect, useState } from 'react';
import { useParams,  useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AnalyticsPage.css'; // Import CSS

const AnalyticsPage = () => {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:8080/viewLink/${shortCode}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setAnalytics(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching data');
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [shortCode]);

  const handleClose = () => {
    setIsOpen(false);
    navigate('/');
  };

  if (!isOpen) return null;

  if (loading) return <p className="loading">Loading...</p>;
  if (error) return <p className="error" style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="popup-overlay">
  <div className="popup-container">
    <button className="popup-close-btn" onClick={handleClose}>×</button>
    <h2>Analytics for: {shortCode}</h2>
    <p className="total-clicks">Total Clicks : {analytics.clickCount} out of 50</p>
    <h3>Platform Clicks:</h3>
    <ul className="platform-list">
      {Object.entries(analytics.platformStats).map(([platform, count]) => (
        <li key={platform}>{platform} : {count} clicks</li>
      ))}
    </ul>
  </div>
</div>


  );
};

export default AnalyticsPage;
