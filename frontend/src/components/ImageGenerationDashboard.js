import React, { useEffect, useState } from "react";
import axios from "axios";

const ImageGenerationDashboard = () => {
    const [truncation, setTruncation] = useState(0.7);
    const [seedStart, setSeedStart] = useState(0);
    const [seedEnd, setSeedEnd] = useState(24);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const flaskUrl = process.env.REACT_APP_FlaskUrl;

    const generateImages = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("truncation", truncation);
            formData.append("seed_start", seedStart);
            formData.append("seed_end", seedEnd);

            await axios.post(`${flaskUrl}/generate-images`, formData);
            fetchHistory();
        } catch (error) {
            alert("Generation failed");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await axios.get(`${flaskUrl}/image-generation-history`);
            setHistory(res.data.reverse());
        } catch (err) {
            console.error("Failed to fetch history", err);
        }
    };

    const downloadZip = async (filename) => {
        try {
            const response = await axios.get(`${flaskUrl}/download-image-zip/${filename}`, {
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert("Download failed");
            console.error(err);
        }
    };

    const formatTimestamp = (timestampStr) => {
        if (!timestampStr || timestampStr.length !== 14) return timestampStr;

        const year = timestampStr.slice(0, 4);
        const month = timestampStr.slice(4, 6);
        const day = timestampStr.slice(6, 8);
        const hour = timestampStr.slice(8, 10);
        const minute = timestampStr.slice(10, 12);
        const second = timestampStr.slice(12, 14);

        const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
        return date.toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    return (
        <div style={{ padding: "2rem", maxWidth: "800px", margin: "auto", fontFamily: "Arial, sans-serif" }}>
            <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>🧠 Generate Lung Synthetic Images</h2>

            <div style={{ background: "#f1f1f1", padding: "1.5rem", borderRadius: "8px", marginBottom: "2rem" }}>
                <div style={{ marginBottom: "1rem" }}>
                    <label>Truncation: </label>
                    <input
                        type="number"
                        value={truncation}
                        onChange={(e) => setTruncation(e.target.value)}
                        step="0.1"
                        min="0"
                        max="1"
                        style={inputStyle}
                    />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                    <label>Seed Start: </label>
                    <input
                        type="number"
                        value={seedStart}
                        onChange={(e) => setSeedStart(e.target.value)}
                        style={inputStyle}
                    />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                    <label>Seed End: </label>
                    <input
                        type="number"
                        value={seedEnd}
                        onChange={(e) => setSeedEnd(e.target.value)}
                        style={inputStyle}
                    />
                </div>
                <button onClick={generateImages} disabled={loading} style={buttonStyle}>
                    {loading ? "Generating..." : "Generate Images"}
                </button>
            </div>

            <h3 style={{ marginBottom: "1rem", textAlign: "center" }}>📂 Generation History</h3>

            {history.length === 0 ? (
                <p style={{ textAlign: "center" }}>No generation history available.</p>
            ) : (
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Generated At</th>
                            <th style={thStyle}>Truncation</th>
                            <th style={thStyle}>Seed Start</th>
                            <th style={thStyle}>Seed End</th>
                            <th style={thStyle}>Download</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((entry, idx) => (
                            <tr key={idx}>
                                <td style={tdStyle}>{formatTimestamp(entry.timestamp)}</td>
                                <td style={tdStyle}>{entry.truncation}</td>
                                <td style={tdStyle}>{entry.seed_start}</td>
                                <td style={tdStyle}>{entry.seed_end}</td>
                                <td style={tdStyle}>
                                    <button onClick={() => downloadZip(entry.filename)} style={buttonStyle}>
                                        Download ZIP
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

// 🔧 Styling
const inputStyle = {
    marginLeft: "0.5rem",
    padding: "0.4rem",
    width: "100px",
    borderRadius: "4px",
    border: "1px solid #ccc",
};

const buttonStyle = {
    padding: "0.5rem 1rem",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
};

const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0,0,0,0.05)",
    overflow: "hidden",
};

const thStyle = {
    background: "#f0f0f0",
    padding: "12px",
    textAlign: "left",
    fontWeight: "bold",
    borderBottom: "2px solid #ddd",
};

const tdStyle = {
    padding: "10px 12px",
    borderBottom: "1px solid #eee",
    color: "#333",
};

export default ImageGenerationDashboard;
