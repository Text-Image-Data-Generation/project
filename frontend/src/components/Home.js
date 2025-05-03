import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const Home = () => {
  const { userId } = useAuth();
  const { showSuccessToast, showErrorToast } = useToast();

  const [uploads, setUploads] = useState({ images: [], csv: [] });
  const [datasetName, setDatasetName] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [files, setFiles] = useState([null]);

  const fetchUserUploads = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_ServerUrl}/user/uploads/${userId}`);
      const data = res.data;

      const images = data.filter(item => item.type === 'images' || item.type === 'zip_images');
      const csv = data.filter(item => item.type === 'csv' || item.type === 'zip_csv');

      setUploads({ images, csv });
    } catch (error) {
      showErrorToast("Failed to load datasets.");
    }
  };

  useEffect(() => {
    if (userId) fetchUserUploads();
  }, [userId]);

  const handleFileChange = (index, file) => {
    const updated = [...files];
    updated[index] = file;
    setFiles(updated);
  };

  const addFileInput = () => setFiles([...files, null]);
  const removeFileInput = (index) => setFiles(files.filter((_, i) => i !== index));

  const handleUpload = async () => {
    if (!datasetName || !selectedType || files.length === 0 || !files.some(f => f)) {
      showErrorToast("Please fill all fields and select at least one file.");
      return;
    }

    const formData = new FormData();
    formData.append("name", datasetName);
    formData.append("type", selectedType);
    files.forEach(file => {
      if (file) formData.append("files", file);
    });

    try {
      const res = await axios.post(`${process.env.REACT_APP_FLASKURL}/upload`, formData);
      const { hash } = res.data;

      await axios.post(`${process.env.REACT_APP_ServerUrl}/user/upload`, {
        userId,
        hash,
        type: selectedType,
        name: datasetName,
      });

      showSuccessToast("Upload successful!");
      setDatasetName('');
      setSelectedType('');
      setFiles([null]);
      fetchUserUploads();
    } catch (error) {
      showErrorToast("Upload failed.");
    }
  };

  const renderDatasetCard = (dataset, index) => (
    <div className="card m-2 p-3 shadow-sm" key={index} style={{ minWidth: '250px' }}>
      <div className="card-body">
        <h5 className="card-title">{dataset.name || "Unnamed Dataset"}</h5>
        <p className="card-text">Hash: {dataset.hash}</p>
        <p className="card-text">Type: {dataset.type}</p>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary btn-sm">View Dataset</button>
          <button className="btn btn-outline-secondary btn-sm">Augment</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container py-4">
      <h2 className="mb-4">Your Uploaded Datasets</h2>

      {/* Upload buttons */}
      <div className="mb-4 d-flex flex-wrap gap-2">
        <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#uploadModal" onClick={() => setSelectedType("images")}>
          Upload Images
        </button>
        <button className="btn btn-success" data-bs-toggle="modal" data-bs-target="#uploadModal" onClick={() => setSelectedType("zip_images")}>
          Upload ZIP Images
        </button>
        <button className="btn btn-warning" data-bs-toggle="modal" data-bs-target="#uploadModal" onClick={() => setSelectedType("csv")}>
          Upload CSV
        </button>
        <button className="btn btn-danger" data-bs-toggle="modal" data-bs-target="#uploadModal" onClick={() => setSelectedType("zip_csv")}>
          Upload CSV ZIP
        </button>
      </div>

      {/* Hero: Images */}
      <div className="mb-5">
        <h4 className="text-primary">Images</h4>
        <div className="d-flex flex-wrap">{uploads.images.map(renderDatasetCard)}</div>
      </div>

      {/* Hero: CSV */}
      <div className="mb-5">
        <h4 className="text-success">CSV</h4>
        <div className="d-flex flex-wrap">{uploads.csv.map(renderDatasetCard)}</div>
      </div>

      {/* Upload Modal */}
      <div className="modal fade" id="uploadModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Upload Dataset</h5>
              <button className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label>Dataset Name</label>
                <input type="text" className="form-control" value={datasetName} onChange={(e) => setDatasetName(e.target.value)} />
              </div>
              <div className="mb-3">
                <label>Upload Type</label>
                <input type="text" className="form-control" value={selectedType} disabled />
              </div>
              <div className="mb-3">
                <label>Files</label>
                {files.map((file, index) => (
                  <div key={index} className="input-group mb-2">
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) => handleFileChange(index, e.target.files[0])}
                    />
                    {index > 0 && (
                      <button className="btn btn-outline-danger" onClick={() => removeFileInput(index)}>X</button>
                    )}
                  </div>
                ))}
                <button className="btn btn-outline-secondary" onClick={addFileInput}>+ Add Another File</button>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button className="btn btn-primary" onClick={handleUpload}>Upload</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
