import React, { useState, useEffect, useCallback ,useRef  } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// Ensure Bootstrap CSS is imported, typically in App.js or index.js
// import 'bootstrap/dist/css/bootstrap.min.css';

// Global augmentation templates remain unchanged
const globalAugmentationTemplates = [
    {
        key: "global_color_boost",
        name: "Global Preset: Quick Color Boost",
        settings: {
            techniques: ["brightness", "contrast", "saturation"],
            parameters: {
                brightness_factor: 1.2,
                contrast_factor: 1.2,
                saturation_factor: 1.2,
            },
        },
    },
    {
        key: "global_geometric_variety",
        name: "Global Preset: Geometric Variety",
        settings: {
            techniques: ["rotate", "scale", "flip_horizontal"],
            parameters: {
                rotation_angle: 45,
                scaling_factor: 1.1,
            },
        },
    },
    {
        key: "global_noise_occlusion",
        name: "Global Preset: Noise & Occlusion",
        settings: {
            techniques: ["gaussian_noise", "salt_pepper_noise", "cutout"],
            parameters: {
                gaussian_variance: 0.02,
                sap_amount: 0.006,
                cutout_size: 40,
            },
        },
    },
];




const Uploads = () => {
    const [files, setFiles] = useState([]);
    const [datasets, setDatasets] = useState([]);
    const [datasetName, setDatasetName] = useState("");
    const [selectedTemplateKey, setSelectedTemplateKey] = useState("");
    const [selectedGlobalTemplateKey, setSelectedGlobalTemplateKey] = useState("");
    const navigate = useNavigate();

    const flaskUrl = process.env.REACT_APP_FlaskUrl;

    // --- Refs for Bootstrap Modal elements and instances ---
    const uploadModalRef = useRef(null);
    const templateModalRef = useRef(null);
    const bsUploadModalInstance = useRef(null);
    const bsTemplateModalInstance = useRef(null);

    // --- Initialize Bootstrap Modals ---
    useEffect(() => {
        if (window.bootstrap && window.bootstrap.Modal) {
            if (uploadModalRef.current && !bsUploadModalInstance.current) {
                bsUploadModalInstance.current = new window.bootstrap.Modal(uploadModalRef.current);
            }
            if (templateModalRef.current && !bsTemplateModalInstance.current) {
                bsTemplateModalInstance.current = new window.bootstrap.Modal(templateModalRef.current);
            }
        } else {
            console.warn("Bootstrap Modal JavaScript is not loaded. Modals may not work.");
        }

        // Cleanup: Dispose modals when component unmounts
        return () => {
            if (bsUploadModalInstance.current && typeof bsUploadModalInstance.current.dispose === 'function') {
                bsUploadModalInstance.current.dispose();
                bsUploadModalInstance.current = null;
            }
            if (bsTemplateModalInstance.current && typeof bsTemplateModalInstance.current.dispose === 'function') {
                bsTemplateModalInstance.current.dispose();
                bsTemplateModalInstance.current = null;
            }
        };
    }, []); // Empty dependency array ensures this runs once on mount and cleanup on unmount

    // --- Modal Control Functions ---
    const handleShowUploadModal = () => {
        // Reset state for a fresh modal
        setDatasetName("");
        setFiles([]);
        const fileInput = document.getElementById('fileUploadInputModal'); // Get by ID
        if (fileInput) {
            fileInput.value = ""; // Reset file input
        }
        if (bsUploadModalInstance.current) {
            bsUploadModalInstance.current.show();
        }
    };
    const handleCloseUploadModal = () => {
        if (bsUploadModalInstance.current) {
            bsUploadModalInstance.current.hide();
        }
    };

    const handleShowTemplateModal = () => {
        if (bsTemplateModalInstance.current) {
            bsTemplateModalInstance.current.show();
        }
    };
    const handleCloseTemplateModal = () => {
        if (bsTemplateModalInstance.current) {
            bsTemplateModalInstance.current.hide();
        }
    };

    const fetchDatasets = useCallback(async () => {
        // ... (fetchDatasets logic remains the same)
        if (!flaskUrl) {
            console.error("Flask URL is not defined. Please check your .env file.");
            alert("Configuration error: The backend server address is not set. Please contact support.");
            return;
        }
        try {
            const res = await axios.get(`${flaskUrl}/datasets`);
            setDatasets(res.data);
        } catch (error) {
            console.error("Error fetching datasets:", error);
        }
    }, [flaskUrl]);

    useEffect(() => {
        fetchDatasets();
    }, [fetchDatasets]);

    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
    };

    const handleDatasetNameChange = (e) => {
        setDatasetName(e.target.value);
    };

    const handleUpload = async () => {
        // ... (validation logic remains the same)
        if (!datasetName.trim()) {
            alert("Please enter a dataset name.");
            return;
        }
        if (files.length === 0) {
            alert("Please select files to upload.");
            return;
        }
        if (!flaskUrl) {
            alert("Configuration error: The backend server address is not set.");
            return;
        }

        const formData = new FormData();
        formData.append("dataset", datasetName.trim());
        for (let file of files) {
            formData.append("files", file);
        }

        try {
            await axios.post(`${flaskUrl}/upload`, formData, { /* ... headers ... */ });
            alert("Upload successful!");
            // setFiles([]); // Already reset in handleShowUploadModal
            // setDatasetName(""); // Already reset in handleShowUploadModal
            // const fileInput = document.getElementById('fileUploadInputModal'); // Already reset
            // if (fileInput) fileInput.value = "";
            fetchDatasets();
            handleCloseUploadModal(); // Close modal on successful upload
        } catch (error) {
            console.error("Upload error:", error);
            alert(`Upload failed: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleDatasetTemplateChange = (e) => {
        setSelectedTemplateKey(e.target.value);
        if (e.target.value) setSelectedGlobalTemplateKey("");
    };

    const handleGlobalTemplateChange = (e) => {
        setSelectedGlobalTemplateKey(e.target.value);
        if (e.target.value) setSelectedTemplateKey("");
    };

    const handleApplyTemplateAndCloseModal = () => {
        let message = "No template selected to apply.";
        if (selectedGlobalTemplateKey) {
            const globalTemplate = globalAugmentationTemplates.find(gt => gt.key === selectedGlobalTemplateKey);
            message = `Global preset '${globalTemplate?.name}' selected. This will be used when you click 'Augment' on a dataset.`;
        } else if (selectedTemplateKey) {
            const [dsName, runId] = selectedTemplateKey.split("|");
            message = `Template from dataset run '${dsName} - ${runId}' selected. This will be used when you click 'Augment' on a dataset.`;
        }
        alert(message);
        handleCloseTemplateModal();
    };

    const handleAugmentClick = (datasetToAugment) => {
        // ... (handleAugmentClick logic remains the same)
        let dataToPass = { dataset: datasetToAugment };
        let preloadedSettings = null;
        let sourceMessage = "";

        if (selectedGlobalTemplateKey) {
            const globalTemplate = globalAugmentationTemplates.find(
                (gt) => gt.key === selectedGlobalTemplateKey
            );
            if (globalTemplate) {
                preloadedSettings = globalTemplate.settings;
                sourceMessage = `Preloading augmentations from Global Preset: ${globalTemplate.name}`;
            }
        } else if (selectedTemplateKey) {
            const [dsName, runId] = selectedTemplateKey.split("|");
            const templateDs = datasets.find((d) => d.name === dsName);
            const templateRun = templateDs?.augmentation_runs?.find(
                (r) => r.run_id === runId
            );
            if (templateRun) {
                preloadedSettings = {
                    techniques: templateRun.techniques,
                    parameters: templateRun.parameters || {},
                };
                sourceMessage = `Preloading augmentations from dataset run: ${dsName} - ${runId}`;
            }
        }

        if (preloadedSettings) {
            dataToPass.augmentationsToPreload = preloadedSettings;
             // Optionally alert here or rely on the selection confirmation from modal
            // alert(sourceMessage);
        } else if (!selectedGlobalTemplateKey && !selectedTemplateKey) {
            alert("No template selected. You can choose one via the 'Select Augmentation Template' button before augmenting. Starting with default augmentation settings.");
        }
        navigate("/augmentation", { state: dataToPass });
    };

    // ... (downloadFullDataset, downloadUploadedData, handleDeleteDataset, handleDeleteRun, handlePreviewUploads, handlePreviewRun remain the same) ...
    const downloadFullDataset = (datasetName) => {
        if (!flaskUrl) { alert("Configuration error."); return; }
        window.location.href = `${flaskUrl}/download_full_dataset/${datasetName}`;
    };

    const downloadUploadedData = (datasetName) => {
        if (!flaskUrl) { alert("Configuration error."); return; }
        window.location.href = `${flaskUrl}/download_uploads/${datasetName}`;
    };

    const handleDeleteDataset = async (datasetNameToDelete) => {
        if (!flaskUrl) { alert("Configuration error."); return; }
        if (window.confirm(`Are you sure you want to delete the dataset "${datasetNameToDelete}"? This action is irreversible.`)) {
            try {
                await axios.delete(`${flaskUrl}/delete_dataset/${datasetNameToDelete}`);
                alert(`Dataset "${datasetNameToDelete}" deleted successfully.`);
                fetchDatasets();
            } catch (error) {
                console.error("Error deleting dataset:", error);
                alert(`Error deleting dataset: ${error.response?.data?.error || error.message}`);
            }
        }
    };

    const handleDeleteRun = async (datasetNameToDeleteFrom, runIdToDelete) => {
        if (!flaskUrl) { alert("Configuration error."); return; }
        if (window.confirm(`Are you sure you want to delete run "${runIdToDelete}" from dataset "${datasetNameToDeleteFrom}"?`)) {
            try {
                await axios.delete(`${flaskUrl}/delete_run/${datasetNameToDeleteFrom}/${runIdToDelete}`);
                alert(`Run "${runIdToDelete}" from dataset "${datasetNameToDeleteFrom}" deleted successfully.`);
                fetchDatasets();
            } catch (error) {
                console.error("Error deleting run:", error);
                alert(`Error deleting run: ${error.response?.data?.error || error.message}`);
            }
        }
    };

    const handlePreviewUploads = (datasetName) => {
        const encoded = btoa(datasetName);
        window.open(`/preview/${encoded}/uploads`, '_blank');
    };

    const handlePreviewRun = (datasetName, runId) => {
        const encodedDatasetName = btoa(datasetName);
        window.open(`/preview/${encodedDatasetName}/run/${runId}`, '_blank');
    };


    return (
        <div className="container my-4">
            <h1 className="mb-4 text-center fw-bold" style={{ color: "#4A90E2" }}>🖼️ Image Augmentation ✨</h1>

            <div className="d-flex justify-content-center gap-2 mb-4">
                {/* MODIFICATION: Trigger buttons call programmatic show functions */}
                <button type="button" className="btn btn-primary btn-lg" onClick={handleShowUploadModal}>
                    ➕ Create New Dataset
                </button>
                <button type="button" className="btn btn-outline-secondary btn-lg" onClick={handleShowTemplateModal}>
                    ⚙️ Select Augmentation Template
                </button>
            </div>

            {/* MODIFICATION: Upload New Dataset Modal (Vanilla Bootstrap HTML) */}
            <div className="modal fade" id="uploadDatasetModal" tabIndex="-1" aria-labelledby="uploadDatasetModalLabel" aria-hidden="true" ref={uploadModalRef}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="uploadDatasetModalLabel">Upload New Dataset</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={handleCloseUploadModal}></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label htmlFor="datasetNameInputModal" className="form-label">Dataset Name:</label>
                                <input
                                    type="text"
                                    id="datasetNameInputModal"
                                    className="form-control"
                                    placeholder="Enter a unique dataset name"
                                    value={datasetName}
                                    onChange={handleDatasetNameChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="fileUploadInputModal" className="form-label">Select Files:</label>
                                <input
                                    type="file"
                                    id="fileUploadInputModal"
                                    multiple
                                    onChange={handleFileChange}
                                    className="form-control"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={handleCloseUploadModal}>Close</button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleUpload}
                                disabled={!datasetName.trim() || files.length === 0}
                            >
                                Upload
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODIFICATION: Choose Augmentation Settings Template Modal (Vanilla Bootstrap HTML) */}
            <div className="modal fade" id="templateSettingsModal" tabIndex="-1" aria-labelledby="templateSettingsModalLabel" aria-hidden="true" ref={templateModalRef}>
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="templateSettingsModalLabel">
                                Choose Augmentation Settings Template <small className="text-muted fw-normal">(Optional)</small>
                            </h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={handleCloseTemplateModal}></button>
                        </div>
                        <div className="modal-body">
                            <p className="text-muted small mb-3">
                                Select a template to pre-fill settings on the augmentation page. This selection will be applied when you click 'Augment' for a dataset. Choosing one will deselect the other.
                            </p>
                            <div className="row gy-3 gx-lg-4">
                                <div className="col-md-6">
                                    <label htmlFor="globalTemplateSelectModal" className="form-label fw-semibold">Global Presets:</label>
                                    <select
                                        id="globalTemplateSelectModal"
                                        value={selectedGlobalTemplateKey}
                                        onChange={handleGlobalTemplateChange}
                                        className="form-select"
                                        aria-label="Select a Global Preset Template"
                                    >
                                        <option value="">Don't use a Global Preset</option>
                                        {globalAugmentationTemplates.map((gt) => (
                                            <option key={gt.key} value={gt.key}>{gt.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="datasetTemplateSelectModal" className="form-label fw-semibold">Copy from Past Dataset Run:</label>
                                    <select
                                        id="datasetTemplateSelectModal"
                                        value={selectedTemplateKey}
                                        onChange={handleDatasetTemplateChange}
                                        className="form-select"
                                        aria-label="Select a Past Dataset Run as Template"
                                    >
                                        <option value="">Don't copy from a Past Run</option>
                                        {datasets.flatMap((ds) =>
                                            ds.augmentation_runs && ds.augmentation_runs.length > 0
                                                ? ds.augmentation_runs.map((run) => (
                                                    <option key={`${ds.name}|${run.run_id}`} value={`${ds.name}|${run.run_id}`}>
                                                        {ds.name} - {run.run_id} ({new Date(run.timestamp).toLocaleDateString()})
                                                    </option>
                                                ))
                                                : []
                                        )}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={handleCloseTemplateModal}>Close</button>
                            <button type="button" className="btn btn-primary" onClick={handleApplyTemplateAndCloseModal}>Apply & Close</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 3: Uploaded Datasets (Main Table - Remains as is) */}
            <div className="card shadow-sm">
                <div className="card-header bg-light">
                    <h3 className="h5 mb-0">📚 Uploaded Datasets</h3>
                </div>
                <div className="card-body">
                    {/* ... Table structure remains the same ... */}
                     {datasets.length === 0 ? (
                        <div className="alert alert-info" role="alert">
                            No datasets have been uploaded yet. Start by clicking "➕ Create New Dataset" above.
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover align-middle mb-0" style={{minWidth: "1000px"}}>
                                <thead className="table-light">
                                    <tr>
                                        <th scope="col">Dataset Name</th>
                                        <th scope="col" className="text-center">Images</th>
                                        <th scope="col" style={{ width: "20%" }}>Sample Files</th>
                                        <th scope="col" style={{ width: "30%" }}>Augmentation Runs</th>
                                        <th scope="col" className="text-center" style={{ width: "260px" }}>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {datasets.map((ds) => (
                                        <tr key={ds.name}>
                                            <td><strong>{ds.name}</strong></td>
                                            <td className="text-center">{ds.count}</td>
                                            <td className="small" style={{ wordBreak: "break-all" }}>
                                                {ds.files &&
                                                    ds.files.slice(0, 3).map((file, j) => (
                                                        <div key={j} className="d-flex align-items-center mb-1 text-truncate">
                                                            {file.match(/\.(jpg|jpeg|png|gif)$/i) && flaskUrl ? (
                                                                <img
                                                                    src={`${flaskUrl}/uploads/${ds.name}/${encodeURIComponent(file)}`}
                                                                    alt={file}
                                                                    title={file}
                                                                    style={{ width: "30px", height: "30px", objectFit: "cover" }}
                                                                    className="me-2 border rounded flex-shrink-0"
                                                                    loading="lazy"
                                                                    onError={(e) => {
                                                                        e.target.style.display = "none";
                                                                        const parent = e.target.parentNode;
                                                                        if (parent) {
                                                                            const errorText = document.createElement('span');
                                                                            errorText.className = 'text-danger small';
                                                                            errorText.textContent = ' (img err)';
                                                                            if(!parent.textContent.includes('(img err)')) {
                                                                                parent.appendChild(errorText);
                                                                            }
                                                                        }
                                                                    }}
                                                                />
                                                            ) : <span className="me-2 flex-shrink-0">&#128196;</span> }
                                                            <span className="text-truncate" title={file}>
                                                                {file}
                                                            </span>
                                                        </div>
                                                    ))}
                                                {ds.files && ds.files.length > 3 && (
                                                    <div className="text-muted small mt-1">...and {ds.files.length - 3} more</div>
                                                )}
                                            </td>
                                            <td className="small">
                                                {ds.augmentation_runs && ds.augmentation_runs.length > 0 ? (
                                                    <ul className="list-unstyled mb-0">
                                                        {ds.augmentation_runs
                                                            .slice()
                                                            .reverse()
                                                            .map((run) => (
                                                                <li
                                                                    key={run.run_id}
                                                                    className="mb-2 pb-2 border-bottom" /* Removed last-child specific style as it's less critical */
                                                                >
                                                                    <div>
                                                                        <strong>{run.run_id}</strong>
                                                                        <div className="text-muted">
                                                                            ({new Date(run.timestamp).toLocaleString()})
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-truncate my-1" title={run.augmented_zip}>
                                                                        <span role="img" aria-label="zip file">📦</span> <code>{run.augmented_zip}</code>
                                                                    </div>
                                                                    <div className="text-muted" style={{fontSize: "0.85em"}}>
                                                                        Techniques: {run.techniques.join(", ")}
                                                                    </div>
                                                                    <div className="d-flex flex-wrap gap-1 mt-2">
                                                                        <a
                                                                            href={flaskUrl ? `${flaskUrl}/augmented/${ds.name}/${encodeURIComponent(run.augmented_zip)}` : '#'}
                                                                            download
                                                                            className={`btn btn-outline-primary btn-sm ${!flaskUrl ? 'disabled' : ''}`}
                                                                            title={`Download ${run.augmented_zip}`}
                                                                        >
                                                                           <i className="bi bi-download"></i> Download
                                                                        </a>
                                                                        <button type="button"
                                                                            onClick={() => handlePreviewRun(ds.name, run.run_id)}
                                                                            className="btn btn-outline-secondary btn-sm"
                                                                            title={`Preview run ${run.run_id}`}
                                                                        >
                                                                           <i className="bi bi-eye"></i> Preview
                                                                        </button>
                                                                        <button type="button"
                                                                            onClick={() => handleDeleteRun(ds.name, run.run_id)}
                                                                            className={`btn btn-outline-danger btn-sm ${!flaskUrl ? 'disabled' : ''}`}
                                                                            title={`Delete run ${run.run_id}`}
                                                                            disabled={!flaskUrl}
                                                                        >
                                                                           <i className="bi bi-trash"></i> Delete
                                                                        </button>
                                                                    </div>
                                                                </li>
                                                            ))}
                                                    </ul>
                                                ) : (
                                                    <span className="text-muted">No augmentation runs yet.</span>
                                                )}
                                            </td>
                                            <td className="text-center">
                                                <div className="d-flex flex-column gap-2">
                                                    <button type="button"
                                                        onClick={() => handleAugmentClick(ds)}
                                                        className="btn btn-success btn-sm"
                                                        title={`Augment dataset: ${ds.name}`}
                                                    >
                                                       <i className="bi bi-magic"></i> Augment
                                                    </button>
                                                    <button type="button"
                                                        onClick={() => handlePreviewUploads(ds.name)}
                                                        className="btn btn-info btn-sm text-white"
                                                        title={`Preview uploaded images for ${ds.name}`}
                                                    >
                                                       <i className="bi bi-images"></i> Preview Uploads
                                                    </button>
                                                    <button type="button"
                                                        onClick={() => downloadUploadedData(ds.name)}
                                                        className={`btn btn-secondary btn-sm ${!flaskUrl ? 'disabled' : ''}`}
                                                        title={`Download original uploaded images for ${ds.name}`}
                                                        disabled={!flaskUrl}
                                                    >
                                                       <i className="bi bi-cloud-download"></i> Download Uploads
                                                    </button>
                                                    <button type="button"
                                                        onClick={() => downloadFullDataset(ds.name)}
                                                        className={`btn btn-primary btn-sm ${!flaskUrl ? 'disabled' : ''}`}
                                                        title={`Download full dataset (uploads + all augmentations) ${ds.name}`}
                                                        disabled={!flaskUrl}
                                                    >
                                                       <i className="bi bi-archive"></i> Download Full Dataset
                                                    </button>
                                                    <button type="button"
                                                        onClick={() => handleDeleteDataset(ds.name)}
                                                        className={`btn btn-danger btn-sm ${!flaskUrl ? 'disabled' : ''}`}
                                                        title={`Delete dataset ${ds.name}`}
                                                        disabled={!flaskUrl}
                                                    >
                                                        <i className="bi bi-x-circle"></i> Delete Dataset
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
            </div>
        </div>
    );
};

export default Uploads;