import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EnhancedManager = () => {
    const [datasets, setDatasets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [datasetName, setDatasetName] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchDatasets();
    }, []);

    const fetchDatasets = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_FlaskUrl}/enhanced_datasets`);
            setDatasets(res.data);
        } catch (e) {
            console.error("Failed to fetch datasets", e);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setSelectedFiles(e.target.files);
    };

    const handleUpload = async () => {
        if (!datasetName.trim() || selectedFiles.length === 0) {
            alert("Please enter a dataset name and select files.");
            return;
        }

        const formData = new FormData();
        formData.append('dataset', datasetName.trim());
        for (let i = 0; i < selectedFiles.length; i++) {
            formData.append('files', selectedFiles[i]);
        }

        setUploading(true);
        try {
            const res = await axios.post(`${process.env.REACT_APP_FlaskUrl}/upload_and_enhance`, formData);
            alert(`Enhancement complete: ${res.data.enhanced_count} images processed`);
            setSelectedFiles([]);
            setDatasetName('');
            fetchDatasets();
            // Bootstrap will handle closing the modal due to the data-bs-dismiss attribute
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed: " + (error.response?.data?.error || error.message));
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (dataset) => {
        if (!window.confirm(`Are you sure you want to delete dataset "${dataset}"?`)) return;

        try {
            await axios.delete(`${process.env.REACT_APP_FlaskUrl}/delete_enhanced_dataset/${dataset}`);
            alert(`Dataset "${dataset}" deleted successfully.`);
            fetchDatasets();
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete dataset.");
        }
    };

    const downloadZip = (dataset, type) => {
        window.open(`${process.env.REACT_APP_FlaskUrl}/download_enhanced/${type}/${dataset}`, '_blank');
    };

    const handlePreviewRun = (datasetName) => {
        const encoded = btoa(datasetName);
        window.open(`/preview_enhanced/${encoded}`, '_blank');
    };

    return (
        <div className="container py-4">
            <h2 className="text-center mb-4">ESRGAN Image Enhancement</h2>

            <div className="text-center mb-4">
                <button
                    className="btn btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#uploadModal"
                >
                    Upload & Enhance Images
                </button>
            </div>

            <h4 className="text-center">Enhanced Datasets</h4>
            {loading ? (
                <div className="text-center">Loading datasets...</div>
            ) : datasets.length === 0 ? (
                <div className="text-center text-muted">No datasets found.</div>
            ) : (
                <div className="table-responsive">

                    <table className="table table-bordered align-middle table-striped table-hover text-center">
                        <thead className="table-primary">
                            <tr>
                                <th>Dataset</th>
                                <th>Total Images</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {datasets.map((ds) => (
                                <tr key={ds.dataset}>
                                    <td>{ds.dataset}</td>
                                    <td>{ds.original_count}</td>
                                    <td>
                                        <div className="d-flex justify-content-center gap-2 flex-wrap">
                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={() => downloadZip(ds.dataset, 'enhanced')}
                                            >
                                                Download Enhanced
                                            </button>
                                            <button
                                                className="btn btn-outline-secondary btn-sm"
                                                onClick={() => downloadZip(ds.dataset, 'original')}
                                            >
                                                Download Original
                                            </button>
                                            <button
                                                className="btn btn-outline-info btn-sm"
                                                onClick={() => handlePreviewRun(ds.dataset)}
                                            >
                                                Preview
                                            </button>
                                            <button
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => handleDelete(ds.dataset)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Upload Modal */}
            <div
                className="modal fade"
                id="uploadModal"
                tabIndex="-1"
                aria-labelledby="uploadModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="uploadModalLabel">Upload & Enhance</h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Dataset Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={datasetName}
                                    onChange={(e) => setDatasetName(e.target.value)}
                                    placeholder="Enter Dataset Name"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Select Images</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-primary"
                                onClick={handleUpload}
                                disabled={uploading}
                            >
                                {uploading ? 'Uploading...' : 'Upload & Enhance'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnhancedManager;