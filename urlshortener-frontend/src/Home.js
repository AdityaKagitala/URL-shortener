import "./Home.css";
import React, { useState, useEffect } from "react";
import axiosInstance from "./api/axiosConfig";
import {
  FaCopy,
  FaLink,
  FaChevronDown,
  FaChevronUp,
  FaTrash,
  FaExternalLinkAlt,
  FaCalendarAlt,
  FaClock,
  FaShareAlt,FaBeer,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Home() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(true);
  const [searchDate, setSearchDate] = useState("");
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const navigate = useNavigate();

  const handleViewAnalytics = (shortCode) => {
    navigate(`/viewLink/${shortCode}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!originalUrl.trim()) {
      toast.error("Please enter a valid URL!");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post("/shorten", {
        originalUrl,
        customAlias, // SEND CUSTOM ALIAS
        linkTitle, // SEND LINK TITLE
      });

      const short = response.data.shortUrl;
      setShortUrl(short);

      await fetchHistory();
      setOriginalUrl("");
      setCustomAlias("");
      setLinkTitle("");

      toast.success("URL shortened successfully!");
    } catch (error) {
      console.error("Shortening error:", error);

      if (
        error.response &&
        error.response.data &&
        error.response.data.message?.includes("Custom alias already taken")
      ) {
        toast.error("Custom alias already taken. Try another one!");
      } else {
        toast.error("Failed to shorten URL. Please try again.");
      }
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
        setHistory([]);
      }
    } catch (error) {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDelete = async (shortCode) => {
    try {
      await axiosInstance.delete(`/delete/${shortCode}`);
      setHistory((prev) => prev.filter((item) => item.shortCode !== shortCode));
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
            <p className="hero-subtitle">
              Transform long URLs into short, shareable links in seconds
            </p>
          </div>

          {/* URL Shortener Card */}
          <div className="shortener-card">
            <form onSubmit={handleSubmit} className="shortener-form">

              {/* Custom Alias and New Field Row */}
              <div className="custom-fields-row">

                {/* Link Title Input */}
                <div className="link-title-wrapper">
                  <label className="link-title-label">Link Title:</label>
                  <div className="input-wrapper">
                    <FaBeer className="input-prefix-icon" />
                    <input
                      type="text"
                      placeholder="Enter title for your link (optional)"
                      value={linkTitle}
                      onChange={(e) => setLinkTitle(e.target.value)}
                      className="link-title-input"
                    />
                  </div>
                </div>
                
                {/* Custom Alias Input */}
                <div className="custom-alias-wrapper">
                  <label className="custom-alias-label">Custom Alias:</label>
                  <div className="input-wrapper">
                    <FaBeer className="input-prefix-icon" />
                    <input
                      type="text"
                      placeholder="Enter custom alias (optional) e.g. aditya123"
                      value={customAlias}
                      onChange={(e) => setCustomAlias(e.target.value)}
                      className="custom-alias-input"
                    />
                  </div>
                </div>
              </div>

              {/* Long URL Input and Submit Button */}
              <div className="url-submit-wrapper">
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
              </div>
            </form>

            {shortUrl && (
              <div className="result-section">
                <div className="result-label">
                  <FaLink className="result-icon" />
                  Your shortened URL:
                </div>
                <div className="result-box">
                  <a
                    href={shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="result-link"
                  >
                    {shortUrl}
                  </a>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(shortUrl)}
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

                          <p className="original-url">
                            <div className="history-item">
                              <img
                                src={item.faviconUrl}
                                alt="icon"
                                style={{
                                  width: 24,
                                  height: 24,
                                  marginRight: 10,
                                }}
                              />
                              {item.originalUrl}
                            </div>
                          </p>
                        </div>

                        <div className="url-info">
                          <label className="url-label">Short URL</label>
                          <a
                            href={item.shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="short-url"
                          >
                            {item.shortUrl}
                          </a>
                        </div>

                        {item.createdAt && (
                          <div className="card-footer">
                            <span className="timestamp">
                              <FaClock />
                              {new Date(item.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="card-actions">
                        <button
                          className="action-btn copy"
                          onClick={() => copyToClipboard(item.shortUrl)}
                        >
                          <FaCopy />
                        </button>

                        <button
                          className="action-btn share"
                          onClick={() => copyToClipboard(item.shortUrl)}
                        >
                          <FaShareAlt />
                        </button>

                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(item.shortCode)}
                        >
                          <FaTrash />
                        </button>

                        <button
                          className="view-tracking-btn"
                          onClick={() => handleViewAnalytics(item.shortCode)}
                        >
                          View Tracking
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FaLink className="empty-icon" />
                  <p>No links found</p>
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