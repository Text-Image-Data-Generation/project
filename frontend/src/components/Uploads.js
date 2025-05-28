import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

    const fetchDatasets = async () => {
        try {
            const res = await axios.get("http://localhost:5001/datasets");
            setDatasets(res.data);
        } catch (error) {
            console.error("Error fetching datasets:", error);
        }
    };

    useEffect(() => {
        fetchDatasets();
    }, []);

    const handleFileChange = (e) => {
        setFiles(e.target.files);
    };

    const handleUpload = async () => {
        if (!datasetName.trim()) return alert("Please enter a dataset name.");
        if (files.length === 0) return alert("Please select files to upload.");

        const formData = new FormData();
        for (let file of files) formData.append("files", file);
        formData.append("dataset", datasetName.trim());

        try {
            await axios.post("http://localhost:5001/upload", formData);
            alert("Upload successful!");
            setFiles([]);
            setDatasetName("");
            fetchDatasets();
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

    const handleAugmentClick = (datasetToAugment) => {
        let dataToPass = { dataset: datasetToAugment };
        let preloadedSettings = null;
        let sourceMessage = "";

        if (selectedGlobalTemplateKey) {
            const globalTemplate = globalAugmentationTemplates.find(
                (gt) => gt.key === selectedGlobalTemplateKey
            );
            if (globalTemplate) {
                preloadedSettings = globalTemplate.settings;
                sourceMessage = `Preloading augmentations from: ${globalTemplate.name}`;
            }
        } else if (selectedTemplateKey) {
            const [dsName, runId] = selectedTemplateKey.split("|");
            const templateDs = datasets.find((d) => d.name === dsName);
            const templateRun = templateDs?.augmentation_runs.find(
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
            alert(sourceMessage);
        } else {
            alert("No template selected or found. Starting with default augmentation settings.");
        }

        navigate("/augmentation", { state: dataToPass });
    };

    return (
        <div className="container my-4" style={{ fontFamily: "Arial, sans-serif" }}>
            <h2 className="mb-4">Upload New Dataset</h2>

            <div className="d-flex flex-wrap align-items-center mb-4 gap-2">
                <input
                    type="text"
                    className="form-control flex-grow-1"
                    placeholder="New dataset name"
                    value={datasetName}
                    onChange={(e) => setDatasetName(e.target.value)}
                    style={{ maxWidth: "300px" }}
                />
                <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="form-control-file"
                    style={{ maxWidth: "300px" }}
                />
                <button
                    onClick={handleUpload}
                    className="btn btn-primary"
                    disabled={!datasetName.trim() || files.length === 0}
                >
                    Upload
                </button>
            </div>

            <div className="card mb-4 p-3 shadow-sm">
                <h4>Choose Augmentation Settings Template (Optional)</h4>
                <p className="text-muted small mb-3">
                    Select a template to pre-fill settings on the augmentation page. Choosing one will
                    deselect the other.
                </p>
                <div className="row gy-3 gx-4">
                    <div className="col-md-6">
                        <label htmlFor="globalTemplateSelect" className="form-label fw-semibold">
                            Global Presets:
                        </label>
                        <select
                            id="globalTemplateSelect"
                            value={selectedGlobalTemplateKey}
                            onChange={handleGlobalTemplateChange}
                            className="form-select"
                        >
                            <option value="">Don't use a Global Preset</option>
                            {globalAugmentationTemplates.map((gt) => (
                                <option key={gt.key} value={gt.key}>
                                    {gt.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-6">
                        <label htmlFor="datasetTemplateSelect" className="form-label fw-semibold">
                            Copy from Past Dataset Run:
                        </label>
                        <select
                            id="datasetTemplateSelect"
                            value={selectedTemplateKey}
                            onChange={handleDatasetTemplateChange}
                            className="form-select"
                        >
                            <option value="">Don't copy from a Past Run</option>
                            {datasets.flatMap((ds) =>
                                ds.augmentation_runs && ds.augmentation_runs.length > 0
                                    ? ds.augmentation_runs.map((run) => (
                                        <option key={`${ds.name}|${run.run_id}`} value={`${ds.name}|${run.run_id}`}>
                                            {ds.name} - {run.run_id} ({run.timestamp.substring(0, 10)})
                                        </option>
                                    ))
                                    : []
                            )}
                        </select>
                    </div>
                </div>
            </div>

            <h3 className="mb-3">Uploaded Datasets</h3>
            <div className="table-responsive shadow-sm rounded">
                <table className="table table-bordered table-hover align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>Dataset Name</th>
                            <th className="text-center" style={{ width: "8rem" }}>
                                # of Images
                            </th>
                            <th style={{ width: "25%" }}>Sample Files</th>
                            <th style={{ width: "35%" }}>Augmentation Runs (ZIPs & Info)</th>
                            <th className="text-center" style={{ width: "12rem" }}>
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {datasets.map((ds) => (
                            <tr key={ds.name}>
                                <td>{ds.name}</td>
                                <td className="text-center">{ds.count}</td>
                                <td style={{ wordBreak: "break-word" }}>
                                    {ds.files &&
                                        ds.files.slice(0, 3).map((file, j) => (
                                            <div key={j} className="d-flex align-items-center mb-1">
                                                {file.match(/\.(jpg|jpeg|png)$/i) ? (
                                                    <img
                                                        src={`http://localhost:5001/uploads/${ds.name}/${encodeURIComponent(file)}`}
                                                        alt={file.length > 20 ? file.substring(0, 17) + "..." : file}
                                                        title={file}
                                                        width="40"
                                                        className="me-2 border rounded"
                                                        onError={(e) => {
                                                            e.target.style.display = "none";
                                                            e.target.nextSibling.textContent = file + " (err)";
                                                        }}
                                                    />
                                                ) : null}
                                                <span>
                                                    {file.length > 20 ? file.substring(0, 17) + "..." : file}
                                                </span>
                                            </div>
                                        ))}
                                    {ds.files && ds.files.length > 3 && (
                                        <small className="text-muted">...{ds.files.length - 3} more</small>
                                    )}
                                </td>
                                <td>
                                    {ds.augmentation_runs && ds.augmentation_runs.length > 0 ? (
                                        <ul className="list-unstyled small mb-0">
                                            {ds.augmentation_runs
                                                .slice()
                                                .reverse()
                                                .map((run, index) => (
                                                    <li
                                                        key={index}
                                                        className="mb-2 pb-2 border-bottom"
                                                        style={{ borderColor: "#eee" }}
                                                    >
                                                        <strong>{run.run_id}</strong> ({run.timestamp}):&nbsp;
                                                        <a
                                                            href={`http://localhost:5001/augmented/${ds.name}/${encodeURIComponent(
                                                                run.augmented_zip
                                                            )}`}
                                                            download
                                                            className="text-decoration-none"
                                                        >
                                                            {run.augmented_zip}
                                                        </a>
                                                        <br />
                                                        <small className="text-muted">
                                                            Techniques: {run.techniques.join(", ")}
                                                        </small>
                                                    </li>
                                                ))}
                                        </ul>
                                    ) : (
                                        <span className="text-muted">N/A</span>
                                    )}
                                </td>
                                <td className="text-center">
                                    <button
                                        onClick={() => handleAugmentClick(ds)}
                                        className="btn btn-success btn-sm"
                                        title={`Augment dataset: ${ds.name}`}
                                    >
                                        Augment
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Uploads;
