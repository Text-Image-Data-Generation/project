import React, { useState, useEffect } from "react";
import axios from "axios";

function CTGANUploader() {
    const [file, setFile] = useState(null);
    const [samples, setSamples] = useState(100);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const flaskUrl = process.env.REACT_APP_FlaskUrl;

    const fetchHistory = async () => {
        try {
            const res = await axios.get(`${flaskUrl}/get-csv-history`);
            setHistory(res.data.reverse());
        } catch (err) {
            console.error("Failed to fetch history", err);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleUpload = async () => {
        if (!file || !flaskUrl) {
            alert("Please provide a CSV file and ensure Flask URL is set.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("epochs", "5");
        formData.append("samples", samples);

        setLoading(true);

        try {
            const response = await axios.post(
                `${flaskUrl}/generate-synthetic`,
                formData
            );

            const { output_file } = response.data;

            const downloadResponse = await axios.get(
                `${flaskUrl}/download-csv/${encodeURIComponent(output_file)}`,
                { responseType: "blob" }
            );

            const blob = new Blob([downloadResponse.data], { type: "text/csv" });
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = output_file;
            link.click();

            fetchHistory(); // Refresh history
        } catch (error) {
            console.error("Upload or download failed:", error);
            alert("Failed to generate or download synthetic data.");
        } finally {
            setLoading(false);
        }
    };
    function formatTimestamp(ts) {
        // Expecting ts like "20250528115152"
        if (!ts || ts.length !== 14) return ts; // fallback

        const year = ts.slice(0, 4);
        const month = ts.slice(4, 6);
        const day = ts.slice(6, 8);
        const hour = ts.slice(8, 10);
        const minute = ts.slice(10, 12);
        const second = ts.slice(12, 14);

        // Create a Date object (note: months are 0-indexed in JS Date)
        const date = new Date(
            year,
            parseInt(month, 10) - 1,
            day,
            hour,
            minute,
            second
        );

        // Format date using toLocaleString (customize as needed)
        return date.toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });
    }


    return (
        <div
            style={{
                padding: "2rem",
                maxWidth: "900px",
                margin: "auto",
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                lineHeight: 1.5,
            }}
        >
            <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                Upload CSV to Generate Synthetic Data
            </h2>

            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "1rem",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.5rem",
                }}
            >
                <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setFile(e.target.files[0])}
                    style={{
                        flex: "1 1 250px",
                        maxWidth: "300px",
                        padding: "0.5rem",
                        fontSize: "1rem",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                    }}
                />

                <label
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "1rem",
                    }}
                >
                    Number of Samples:
                    <input
                        type="number"
                        value={samples}
                        onChange={(e) => setSamples(e.target.value)}
                        min="1"
                        style={{
                            width: "100px",
                            padding: "0.3rem 0.5rem",
                            fontSize: "1rem",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                        }}
                    />
                </label>

                <button
                    onClick={handleUpload}
                    disabled={loading}
                    style={{
                        flexShrink: 0,
                        padding: "0.6rem 1.2rem",
                        fontSize: "1rem",
                        backgroundColor: loading ? "#888" : "#007BFF",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: loading ? "not-allowed" : "pointer",
                        transition: "background-color 0.3s ease",
                    }}
                >
                    {loading ? "Processing..." : "Generate Synthetic Data"}
                </button>
            </div>

            <h3 style={{ marginBottom: "1rem", textAlign: "center" }}>History</h3>

            <div style={{ overflowX: "auto" }}>
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "0.9rem",
                        minWidth: "700px",
                    }}
                >
                    <thead>
                        <tr
                            style={{
                                backgroundColor: "#007BFF",
                                color: "white",
                                textAlign: "left",
                            }}
                        >
                            <th style={{ padding: "8px" }}>Original File</th>
                            <th style={{ padding: "8px" }}>Generated File</th>
                            <th style={{ padding: "8px" }}>Epochs</th>
                            <th style={{ padding: "8px" }}>Samples</th>
                            <th style={{ padding: "8px" }}>Timestamp</th>
                            <th style={{ padding: "8px" }}>Download</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: "12px", textAlign: "center" }}>
                                    No history found.
                                </td>
                            </tr>
                        ) : (
                            history.map((item, index) => (
                                <tr
                                    key={index}
                                    style={{
                                        borderBottom: "1px solid #ddd",
                                        backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white",
                                    }}
                                >
                                    <td style={{ padding: "8px", wordBreak: "break-word" }}>
                                        {item.original_file}
                                    </td>
                                    <td style={{ padding: "8px", wordBreak: "break-word" }}>
                                        {item.filename}
                                    </td>
                                    <td style={{ padding: "8px", textAlign: "center" }}>
                                        {item.epochs}
                                    </td>
                                    <td style={{ padding: "8px", textAlign: "center" }}>
                                        {item.samples}
                                    </td>
                                    {/* <td style={{ padding: "8px", whiteSpace: "nowrap" }}>
                                        {item.timestamp}
                                    </td> */}
                                    <td style={{ padding: "8px", whiteSpace: "nowrap" }}>
                                        {formatTimestamp(item.timestamp)}
                                    </td>

                                    <td style={{ padding: "8px", textAlign: "center" }}>
                                        <a
                                            href={`${flaskUrl}/download-csv/${encodeURIComponent(
                                                item.filename
                                            )}`}
                                            download
                                            style={{
                                                color: "#007BFF",
                                                textDecoration: "none",
                                                fontWeight: "600",
                                            }}
                                        >
                                            Download
                                        </a>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default CTGANUploader;
