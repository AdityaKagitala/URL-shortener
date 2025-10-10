import "./App.css";
import React, { useState, useEffect } from "react";
import axiosInstance from "./api/axiosConfig";
import { FaCopy, FaLink, FaChevronDown, FaChevronUp ,FaTrash} from "react-icons/fa";
import { toast } from 'react-toastify';


function Home() {

  
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(true); 
  const [searchDate, setSearchDate] = useState("");


  useEffect(() => {  fetchHistory()  }, []);

  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!originalUrl.trim()) {
      alert("Please enter a valid URL ..!");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post("/shorten", { originalUrl });
      const short = response.data.shortUrl;
      setShortUrl(short);
      await fetchHistory();
      setOriginalUrl("");
    } catch (error) {
      console.error("Shortening error:", error);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Link Coppied..!", { autoClose: 1000 });
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const fetchHistory = async () => {
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
    }
  };
  
  const handleDelete = async (shortCode) => {
    try {
      await axiosInstance.delete(`/delete/${shortCode}`);
      setHistory(prev => prev.filter(item => item.shortCode !== shortCode));
      toast.error("Link Deleted Successfully!", { autoClose: 1000 });
    } catch (error) {
      alert("Error deleting URL:", error);
    }
  };
  


  return (
    <div className="app">
      <div className="card">
        <h1><FaLink style={{ color: "#007bff" }} /> URL Shortener</h1>
        <p className="subtitle">Paste your long URL below and get a short link instantly!</p>

        <form onSubmit={handleSubmit}>
          <input
            type="url"
            placeholder="Enter long URL..."
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Shortening..." : "Shorten URL"}
          </button>
        </form>

        {shortUrl && (
          <div className="result">
            <p>Shortened URL:</p>
            <div className="short-box">
              <a href={shortUrl} target="_blank" rel="noopener noreferrer">
                {shortUrl}
              </a>
              <FaCopy className="copy-icon" onClick={() => copyToClipboard(shortUrl)} />
            </div>
          </div>
        )}
      </div>

      <div className="history-container">
        <button className="toggle-history-btn" onClick={() => setShowHistory(!showHistory)}>
          {showHistory ? <FaChevronUp /> : <FaChevronDown />}
          {showHistory ? "Hide History" : "Show History"}
        </button>

        {showHistory && Array.isArray(history) && history.length > 0 && (
  <div className="history">
    <div className="history-header">
      <h2>Your History</h2>
      <input
        type="date"
        className="history-date-filter"
        value={searchDate}
        onChange={(e) => setSearchDate(e.target.value)}
      />
    </div>

    {history
      .slice()
      .reverse()
      .filter((item) => {
        if (!searchDate || !item.createdAt) return true;
        const itemDate = new Date(item.createdAt).toISOString().split("T")[0];
        return itemDate === searchDate;
      })
      .map((item, index) => (
        <div key={index} className="history-item">
          <div className="url-text">
            <span className="long-url">{item.originalUrl}</span>
            <a href={item.shortUrl} target="_blank" rel="noopener noreferrer">
              {item.shortUrl}
            </a>
          </div>
          <div className="history-actions">
            <div className="copy-delete">
              <FaCopy className="copy-icon" onClick={() => copyToClipboard(item.shortUrl)} />
              <FaTrash className="delete-icon" onClick={() => handleDelete(item.shortCode)} />
            </div>
            {item.createdAt && (
              <p className="timestamp">
                {new Date(item.createdAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      ))}
  </div>
)}

      </div>
    </div>
  );
}

export default Home;