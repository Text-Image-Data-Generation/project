import React, { useState } from "react";
import axios from "axios";

function CTGANUploader() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const flaskUrl = process.env.REACT_APP_FlaskUrl;

    const handleUpload = async () => {
        if (!file || !flaskUrl) {
            alert("Please provide a CSV file and ensure Flask URL is set.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("epochs", "5");
        formData.append("samples", "100");

        setLoading(true);

        try {
            const response = await axios.post(
                `${flaskUrl}/generate-synthetic`,
                formData // No need to set headers
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
            link.download = output_file+"synthetic_data.csv";
            link.click();
        } catch (error) {
            console.error("Upload or download failed:", error);
            alert("Failed to generate or download synthetic data.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "2rem", maxWidth: "500px", margin: "auto" }}>
            <h2>Upload CSV to Generate Synthetic Data</h2>
            <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ marginBottom: "1rem" }}
            />
            <br />
            <button onClick={handleUpload} disabled={loading}>
                {loading ? "Processing..." : "Generate Synthetic Data"}
            </button>
        </div>
    );
}

export default CTGANUploader;
