// ImageGenerationDashboard 
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
                responseType: "blob"
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

    useEffect(() => {
        fetchHistory();
    }, []);

    return (
        <div style={{ padding: "2rem", maxWidth: "700px", margin: "auto" }}>
            <h2>Generate Synthetic Images</h2>
            <div>
                <label>Truncation: </label>
                <input type="number" value={truncation} onChange={(e) => setTruncation(e.target.value)} step="0.1" min="0" max="1" />
            </div>
            <div>
                <label>Seed Start: </label>
                <input type="number" value={seedStart} onChange={(e) => setSeedStart(e.target.value)} />
            </div>
            <div>
                <label>Seed End: </label>
                <input type="number" value={seedEnd} onChange={(e) => setSeedEnd(e.target.value)} />
            </div>
            <button onClick={generateImages} disabled={loading}>
                {loading ? "Generating..." : "Generate Images"}
            </button>

            <h3 style={{ marginTop: "2rem" }}>Generation History</h3>
            <table border="1" cellPadding="8" cellSpacing="0" style={{ width: "100%" }}>
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>Truncation</th>
                        <th>Seed Start</th>
                        <th>Seed End</th>
                        <th>Download</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map((entry, idx) => (
                        <tr key={idx}>
                            <td>{entry.timestamp}</td>
                            <td>{entry.truncation}</td>
                            <td>{entry.seed_start}</td>
                            <td>{entry.seed_end}</td>
                            <td>
                                <button onClick={() => downloadZip(entry.filename)}>Download ZIP</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ImageGenerationDashboard;
