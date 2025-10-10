import "./Home.css";
import React, { useState, useEffect } from "react";
import axiosInstance from "./api/axiosConfig";
import { FaCopy, FaLink, FaChevronDown, FaChevronUp, FaTrash, FaExternalLinkAlt, FaCalendarAlt, FaClock } from "react-icons/fa";
import { toast } from 'react-toastify';


function Home() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(true);
  const [searchDate, setSearchDate] = useState("");
  const [historyLoading, setHistoryLoading] = useState(true);


  useEffect(() => {  fetchHistory()  }, []);

  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!originalUrl.trim()) {
      toast.error("Please enter a valid URL!");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post("/shorten", { originalUrl });
      const short = response.data.shortUrl;
      setShortUrl(short);
      await fetchHistory();
      setOriginalUrl("");
      toast.success("URL shortened successfully!");
    } catch (error) {
      console.error("Shortening error:", error);
      toast.error("Failed to shorten URL. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Link copied to clipboard!", { autoClose: 1500 });
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await axiosInstance.get("/history");

      if (Array.isArray(response.data)) {
        setHistory(response.data);
      } else {
        console.warn("Expected array, got:", response.data);
        setHistory([]);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };
  
  const handleDelete = async (shortCode) => {
    try {
      await axiosInstance.delete(`/delete/${shortCode}`);
      setHistory(prev => prev.filter(item => item.shortCode !== shortCode));
      toast.info("Link deleted successfully!", { autoClose: 1500 });
    } catch (error) {
      toast.error("Failed to delete link");
    }
  };
  


  const filteredHistory = history
    .slice()
    .reverse()
    .filter((item) => {
      if (!searchDate || !item.createdAt) return true;
      const itemDate = new Date(item.createdAt).toISOString().split("T")[0];
      return itemDate === searchDate;
    });

  return (
    <div className="home-page">
      <div className="home-container">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-content">
            <div className="hero-icon">
              <FaLink />
            </div>
            <h1 className="hero-title">Shorten Your Links</h1>
            <p className="hero-subtitle">Transform long URLs into short, shareable links in seconds</p>
          </div>

          {/* URL Shortener Card */}
          <div className="shortener-card">
            <form onSubmit={handleSubmit} className="shortener-form">
              <div className="input-wrapper">
                <FaLink className="input-prefix-icon" />
                <input
                  type="url"
                  placeholder="Paste your long URL here..."
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  className="url-input"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="shorten-btn">
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Shortening...
                  </>
                ) : (
                  <>
                    <FaExternalLinkAlt />
                    Shorten
                  </>
                )}
              </button>
            </form>

            {shortUrl && (
              <div className="result-section">
                <div className="result-label">
                  <FaLink className="result-icon" />
                  Your shortened URL:
                </div>
                <div className="result-box">
                  <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="result-link">
                    {shortUrl}
                  </a>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(shortUrl)}
                    title="Copy to clipboard"
                  >
                    <FaCopy />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History Section */}
        <div className="history-section">
          <div className="history-header-bar">
            <div className="history-title">
              <FaClock />
              <h2>Recent Links</h2>
              {history.length > 0 && (
                <span className="history-count">{history.length}</span>
              )}
            </div>

            <div className="history-controls">
              <div className="date-filter">
                <FaCalendarAlt className="filter-icon" />
                <input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="date-input"
                  placeholder="Filter by date"
                />
              </div>
              <button
                className="toggle-btn"
                onClick={() => setShowHistory(!showHistory)}
              >
                {showHistory ? <FaChevronUp /> : <FaChevronDown />}
              </button>
            </div>
          </div>

          {showHistory && (
            <div className="history-content">
              {historyLoading ? (
                <div className="loading-state">
                  <span className="spinner large"></span>
                  <p>Loading your links...</p>
                </div>
              ) : filteredHistory.length > 0 ? (
                <div className="history-grid">
                  {filteredHistory.map((item, index) => (
                    <div key={index} className="history-card">
                      <div className="card-content">
                        <div className="url-info">
                          <label className="url-label">Original URL</label>
                          <p className="original-url" title={item.originalUrl}>
                            {item.originalUrl}
                          </p>
                        </div>

                        <div className="url-info">
                          <label className="url-label">Short URL</label>
                          <div className="short-url-container">
                            <a
                              href={item.shortUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="short-url"
                            >
                              {item.shortUrl}
                            </a>
                          </div>
                        </div>

                        {item.createdAt && (
                          <div className="card-footer">
                            <span className="timestamp">
                              <FaClock />
                              {new Date(item.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="card-actions">
                        <button
                          className="action-btn copy"
                          onClick={() => copyToClipboard(item.shortUrl)}
                          title="Copy link"
                        >
                          <FaCopy />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(item.shortCode)}
                          title="Delete link"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FaLink className="empty-icon" />
                  <p className="empty-title">
                    {searchDate ? 'No links found for this date' : 'No links yet'}
                  </p>
                  <p className="empty-subtitle">
                    {searchDate
                      ? 'Try selecting a different date'
                      : 'Start by shortening your first URL above'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;