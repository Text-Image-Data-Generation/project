import React, { useState } from "react";

function CTGANUploader() {
  const [file, setFile] = useState(null);
  const [gradioUrl, setGradioUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file || !gradioUrl) {
      alert("Please provide both a file and Gradio link");
      return;
    }

    const formData = new FormData();
    formData.append("data", file); // 'data' is the expected key in Gradio
    formData.append("data", 5);    // Epochs
    formData.append("data", 100);  // Number of Samples

    setLoading(true);
    try {
      const response = await fetch(`${gradioUrl}/api/predict/`, {
        method: "POST",
        body: formData
      });

      const result = await response.json();
      const fileUrl = result.data[0]; // Gradio returns file path in data[0]

      // Download the file
      const downloadResponse = await fetch(fileUrl);
      const blob = await downloadResponse.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "synthetic_data.csv";
      link.click();

    } catch (error) {
      alert("Upload or download failed.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Upload CSV to CTGAN (Gradio API)</h2>
      <input
        type="text"
        placeholder="Paste Gradio link e.g. https://xxxx.gradio.live"
        value={gradioUrl}
        onChange={(e) => setGradioUrl(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
      />
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
