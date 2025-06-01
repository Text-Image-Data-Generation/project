import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';

const CtganUploader = () => {
    const [file, setFile] = useState(null);
    const [epochs, setEpochs] = useState(5);
    const [samples, setSamples] = useState(100);
    const [history, setHistory] = useState([]);
    const [previewData, setPreviewData] = useState(null);
    const [previewColumns, setPreviewColumns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [previewTitle, setPreviewTitle] = useState('');

    const BASE = process.env.REACT_APP_FlaskUrl;
    const modalRef = useRef(null);

    const formatTimestamp = (ts) => {
        const year = ts.slice(0, 4);
        const month = ts.slice(4, 6);
        const day = ts.slice(6, 8);
        const hour = ts.slice(8, 10);
        const minute = ts.slice(10, 12);
        const second = ts.slice(12, 14);
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    };

    const fetchHistory = async () => {
        try {
            const res = await axios.get(`${BASE}/get-csv-history`);
            const formatted = res.data.reverse().map(entry => ({
                ...entry,
                timestampFormatted: formatTimestamp(entry.timestamp)
            }));
            setHistory(formatted);
        } catch (err) {
            showToastMessage("Error fetching history: " + err.message);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const showToastMessage = (msg) => {
        setToastMessage(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleEpochsChange = (e) => {
        setEpochs(parseInt(e.target.value, 10) || 1);
    };

    const handleSamplesChange = (e) => {
        setSamples(parseInt(e.target.value, 10) || 1);
    };

    const handleGenerate = async () => {
        if (!file) {
            showToastMessage("Please select a CSV file to generate synthetic data.");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('epochs', epochs);
        formData.append('samples', samples);

        setLoading(true);
        try {
            await axios.post(`${BASE}/generate-synthetic`, formData);
            await fetchHistory();
            showToastMessage("Synthetic CSV generated successfully!");
            setFile(null);
            setEpochs(5);
            setSamples(100);

            const modalEl = modalRef.current;
            if (modalEl) {
                const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
                if (modalInstance) {
                    modalInstance.hide();
                }
            }
        } catch (err) {
            showToastMessage("Failed to generate synthetic data: " + (err.response?.data?.error || err.message));
        }
        setLoading(false);
    };

    const handlePreview = async (type, filename) => {
        try {
            const res = await axios.get(`${BASE}/preview-csv/${type}/${filename}`);
            const { columns, data } = res.data;
            setPreviewColumns(
                columns.map(col => ({
                    name: col,
                    selector: row => row[col],
                    sortable: true
                }))
            );
            const uniqueData = data.map((row, index) => ({ id: index + 1, ...row }));
            setPreviewData(uniqueData);
            setPreviewTitle(type === 'uploaded' ? 'Original Data Preview' : 'Generated Data Preview');
        } catch (err) {
            showToastMessage("Failed to preview CSV: " + err.message);
        }
    };

    const handleDownload = (type, filename) => {
        window.open(`${BASE}/download-csv/${type}/${filename}`, '_blank');
    };

    return (
        <div className="container mt-4" style={{ fontFamily: 'sans-serif' }}>

            {/* Toast */}
            <div
                className={`toast align-items-center text-white bg-primary border-0 position-fixed bottom-0 end-0 m-3 ${showToast ? 'show' : 'hide'}`}
                role="alert" aria-live="assertive" aria-atomic="true"
                style={{ minWidth: '280px', zIndex: 1055 }}
            >
                <div className="d-flex">
                    <div className="toast-body">{toastMessage}</div>
                    <button type="button" className="btn-close btn-close-white me-2 m-auto"
                        onClick={() => setShowToast(false)}></button>
                </div>
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                        <h3 className="fw-bold text-primary mb-0">
                            CTGAN CSV Generator
                        </h3>
                        <p className="text-muted mt-1 mb-0">Generate synthetic tabular data using CTGAN.</p>
                    </div>
                    <button
                        type="button"
                        className="btn btn-success btn-lg"
                        data-bs-toggle="modal"
                        data-bs-target="#uploadModal"
                    >
                        Generate Synthetic CSV
                    </button>
                </div>
            </div>

            {/* Modal */}
            <div className="modal fade" id="uploadModal" tabIndex="-1" aria-labelledby="uploadModalLabel" aria-hidden="true" ref={modalRef}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header bg-light">
                            <h5 className="modal-title text-primary" id="uploadModalLabel">
                                Generate Synthetic CSV
                            </h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" disabled={loading}></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label htmlFor="csvFile" className="form-label">Select CSV File:</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    id="csvFile"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    disabled={loading}
                                />
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label htmlFor="epochs" className="form-label">Epochs:</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="epochs"
                                        value={epochs}
                                        onChange={handleEpochsChange}
                                        disabled={loading}
                                        min={1}
                                    />
                                    <small className="form-text text-muted">Number of training iterations.</small>
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="samples" className="form-label">Samples:</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="samples"
                                        value={samples}
                                        onChange={handleSamplesChange}
                                        disabled={loading}
                                        min={1}
                                    />
                                    <small className="form-text text-muted">Number of synthetic rows to generate.</small>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer bg-light">
                            <button className="btn btn-secondary" data-bs-dismiss="modal" disabled={loading}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
                                {loading && <span className="spinner-border spinner-border-sm me-2" />}
                                Generate
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* CSV History */}
            <div className="mt-4">
                <h5 className="fw-semibold text-info mb-3">
                    Generation History
                </h5>
                {history.length === 0 ? (
                    <div className="alert alert-info">
                        No CSV generation history available.
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-bordered table-striped align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Original File</th>
                                    <th>Generated File</th>
                                    <th>Shape</th>
                                    <th>Timestamp</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((entry, i) => (
                                    <tr key={i}>
                                        <td>{entry.original_file}</td>
                                        <td>{entry.generated_file}</td>
                                        <td>
                                            <span className="badge bg-secondary me-1" title="Original Shape">
                                                Original: {entry.input_shape.rows}×{entry.input_shape.cols}
                                            </span>
                                            <span className="badge bg-success" title="Generated Shape">
                                                Generated: {entry.output_shape.rows}×{entry.output_shape.cols}
                                            </span>
                                        </td>
                                        <td>{entry.timestampFormatted}</td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <button
                                                    className="btn btn-sm btn-outline-success"
                                                    onClick={() => handleDownload('uploaded', entry.original_file)}
                                                    title="Download Original CSV"
                                                >
                                                    Download Original
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-info"
                                                    onClick={() => handlePreview('uploaded', entry.original_file)}
                                                    title="Preview Original CSV"
                                                >
                                                    Preview Original
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => handleDownload('generated', entry.generated_file)}
                                                    title="Download Generated CSV"
                                                >
                                                    Download Generated
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-warning"
                                                    onClick={() => handlePreview('generated', entry.generated_file)}
                                                    title="Preview Generated CSV"
                                                >
                                                    Preview Generated
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Preview Data Table */}
            {previewData && (
                <div className="card shadow-sm p-3 mt-4">
                    <h5 className="fw-semibold text-primary mb-3">
                        {previewTitle}
                    </h5>
                    <DataTable
                        columns={previewColumns}
                        data={previewData}
                        pagination
                        dense
                        highlightOnHover
                        striped
                        persistTableHead
                        responsive
                    />
                </div>
            )}
        </div>
    );
};

export default CtganUploader;