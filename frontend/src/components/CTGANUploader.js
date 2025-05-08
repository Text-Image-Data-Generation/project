import React, { useState } from "react";

function CTGANUploader() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const flaskUrl = process.env.REACT_APP_FlaskUrl;

    const handleUpload = async () => {
        console.log(flaskUrl);
        if (!file || !flaskUrl) {
            alert("Please provide a CSV file and make sure Flask URL is set in .env");
            return;
        }

        
        const formData = new FormData();
        formData.append("file", file);
        formData.append("epochs", 5); // Or make it dynamic
        formData.append("samples", 100);
        
        console.log(formData);
        setLoading(true);

        try {
            const response = await fetch(`${flaskUrl}/generate-synthetic`, {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (result.error) {
                throw new Error(result.error);
            }

            const downloadResponse = await fetch(`${flaskUrl}/${result.output_file}`);
            const blob = await downloadResponse.blob();
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = "synthetic_data.csv";
            link.click();
        } catch (error) {
            alert("Failed to generate or download synthetic data.");
            console.error(error);
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
