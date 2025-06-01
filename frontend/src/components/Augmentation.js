import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

// Define initialParameters OUTSIDE the component for stability
const INITIAL_PARAMETERS = {
    rotation_angle: 90, scaling_factor: 1.2, translation_x: 10, translation_y: 10,
    crop_left: 10, crop_top: 10, crop_right: 90, crop_bottom: 90,
    padding_size: 0, padding_color: "#000000",
    brightness_factor: 1.0, contrast_factor: 1.0, saturation_factor: 1.0,
    gaussian_variance: 0.01, sap_amount: 0.005, motion_blur_size: 9,
    cutout_size: 50, mixup_alpha: 0.2,
};

// Debounce function
function debounce(func, delay) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, delay);
    };
}

const Augmentation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { dataset, augmentationsToPreload } = location.state || {};

    const [techniques, setTechniques] = useState([]);
    const [parameters, setParameters] = useState(INITIAL_PARAMETERS);
    const [isLoading, setIsLoading] = useState(false);

    const [sampleImageFilename, setSampleImageFilename] = useState('');
    const [originalSampleImageSrc, setOriginalSampleImageSrc] = useState('');
    const [originalImageDimensions, setOriginalImageDimensions] = useState({ width: 0, height: 0 });

    const [singleTechniquePreviewSrc, setSingleTechniquePreviewSrc] = useState('');
    const [activePreviewTechnique, setActivePreviewTechnique] = useState(null);
    const [isSinglePreviewLoading, setIsSinglePreviewLoading] = useState(false);

    const [combinedPreviewSrc, setCombinedPreviewSrc] = useState('');
    const [isCombinedPreviewLoading, setIsCombinedPreviewLoading] = useState(false);

    const [activeTabKey, setActiveTabKey] = useState('Geometric');

    // Modal State for Images
    const [imageModal, setImageModal] = useState({ show: false, src: '', alt: '' });

    const prepareParametersForBackend = useCallback((currentParams) => {
        const backendParams = { ...currentParams };
        if (originalImageDimensions.width > 0 && originalImageDimensions.height > 0) {
            if (backendParams.crop_right < backendParams.crop_left) backendParams.crop_right = backendParams.crop_left + 1;
            if (backendParams.crop_bottom < backendParams.crop_top) backendParams.crop_bottom = backendParams.crop_top + 1;

            backendParams.crop_left = Math.max(0, Math.min(Number(backendParams.crop_left), originalImageDimensions.width -1 ));
            backendParams.crop_right = Math.max(0, Math.min(Number(backendParams.crop_right), originalImageDimensions.width));
            backendParams.crop_top = Math.max(0, Math.min(Number(backendParams.crop_top), originalImageDimensions.height -1));
            backendParams.crop_bottom = Math.max(0, Math.min(Number(backendParams.crop_bottom), originalImageDimensions.height));
            
             if (backendParams.crop_right <= backendParams.crop_left) {
                backendParams.crop_right = Math.min(originalImageDimensions.width, backendParams.crop_left + 1);
            }
            if (backendParams.crop_bottom <= backendParams.crop_top) {
                backendParams.crop_bottom = Math.min(originalImageDimensions.height, backendParams.crop_top + 1);
            }
        }
        return backendParams;
    }, [originalImageDimensions]);

    useEffect(() => {
        if (dataset && dataset.files && dataset.files.length > 0) {
            const firstImage = dataset.files.find(file => file.match(/\.(jpg|jpeg|png)$/i));
            if (firstImage) {
                setSampleImageFilename(firstImage);
                const src = `${process.env.REACT_APP_FlaskUrl}uploads/${dataset.name}/${encodeURIComponent(firstImage)}`;
                setOriginalSampleImageSrc(src);
                setSingleTechniquePreviewSrc(src);
                setCombinedPreviewSrc(src);
                const img = new Image();
                img.onload = () => {
                    setOriginalImageDimensions({ width: img.width, height: img.height });
                    setParameters(prevParams => { // Use current state for comparison before setting defaults
                        const newDefaults = { ...INITIAL_PARAMETERS }; // Start with base defaults
                        // Update crop_right/bottom based on loaded image dimensions if they are still the initial placeholder values
                        if (prevParams.crop_right === INITIAL_PARAMETERS.crop_right && img.width > 0) {
                            newDefaults.crop_right = img.width > 10 ? img.width - 10 : img.width;
                        } else {
                            newDefaults.crop_right = prevParams.crop_right; // Keep user's value if changed
                        }
                        if (prevParams.crop_bottom === INITIAL_PARAMETERS.crop_bottom && img.height > 0) {
                            newDefaults.crop_bottom = img.height > 10 ? img.height - 10 : img.height;
                        } else {
                            newDefaults.crop_bottom = prevParams.crop_bottom; // Keep user's value
                        }
                        // Merge with other potentially set parameters, prioritizing existing ones over new defaults
                        return { ...prevParams, ...newDefaults };
                    });
                };
                img.src = src;
            } else {
                setSampleImageFilename(''); setOriginalSampleImageSrc('');
                setSingleTechniquePreviewSrc(''); setCombinedPreviewSrc('');
                setOriginalImageDimensions({ width: 0, height: 0 });
            }
        } else {
             setSampleImageFilename(''); setOriginalSampleImageSrc('');
             setSingleTechniquePreviewSrc(''); setCombinedPreviewSrc('');
             setOriginalImageDimensions({ width: 0, height: 0 });
        }
    }, [dataset]);

    const fetchCombinedPreviewInternal = useCallback(async (currentTechniques, currentParamsToUse) => {
        if (!dataset || !sampleImageFilename || currentTechniques.length === 0) {
            setCombinedPreviewSrc(originalSampleImageSrc);
            return;
        }
        setIsCombinedPreviewLoading(true);
        try {
            const backendParams = prepareParametersForBackend(currentParamsToUse);
            const res = await axios.post(`${process.env.REACT_APP_FlaskUrl}preview_combined_augmentations`, {
                datasetName: dataset.name, imageFilename: sampleImageFilename,
                techniques: currentTechniques, parameters: backendParams,
            });
            setCombinedPreviewSrc(res.data.preview_image_base64);
        } catch (error) {
            console.error("Error fetching combined preview:", error);
            setCombinedPreviewSrc(originalSampleImageSrc);
        } finally {
            setIsCombinedPreviewLoading(false);
        }
    }, [dataset, sampleImageFilename, originalSampleImageSrc, prepareParametersForBackend]);

    useEffect(() => {
        if (augmentationsToPreload) {
            const preloadedTechniques = augmentationsToPreload.techniques || [];
            const mergedParameters = { ...INITIAL_PARAMETERS, ...(augmentationsToPreload.parameters || {}) };
            setTechniques(preloadedTechniques);
            setParameters(mergedParameters);

            if (preloadedTechniques.length > 0 && dataset && sampleImageFilename) {
                 fetchCombinedPreviewInternal(preloadedTechniques, mergedParameters);
            } else if (originalSampleImageSrc) {
                setCombinedPreviewSrc(originalSampleImageSrc);
            }
        } else {
            setTechniques([]);
            setParameters(INITIAL_PARAMETERS);
            if (originalSampleImageSrc) {
                setCombinedPreviewSrc(originalSampleImageSrc);
            }
        }
        setActivePreviewTechnique(null);
        if (originalSampleImageSrc) {
            setSingleTechniquePreviewSrc(originalSampleImageSrc);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [augmentationsToPreload, dataset, sampleImageFilename, originalSampleImageSrc, fetchCombinedPreviewInternal]);

    const fetchSingleTechniquePreview = useCallback(async (tech, currentParamsToUse) => {
        if (!dataset || !sampleImageFilename || !tech || (tech === "mixup" || tech === "cutmix")) {
            setSingleTechniquePreviewSrc(originalSampleImageSrc);
            if (tech === "mixup" || tech === "cutmix") setActivePreviewTechnique(null);
            return;
        }
        setIsSinglePreviewLoading(true);
        try {
            const backendParams = prepareParametersForBackend(currentParamsToUse);
            const res = await axios.post(`${process.env.REACT_APP_FlaskUrl}preview_augmentation`, {
                datasetName: dataset.name, imageFilename: sampleImageFilename,
                technique: tech, parameters: backendParams,
            });
            setSingleTechniquePreviewSrc(res.data.preview_image_base64);
        } catch (error) {
            console.error("Error fetching single technique preview for " + tech + ":", error);
            setSingleTechniquePreviewSrc(originalSampleImageSrc);
        } finally {
            setIsSinglePreviewLoading(false);
        }
    }, [dataset, sampleImageFilename, originalSampleImageSrc, prepareParametersForBackend]);
    
    const debouncedFetchSingleTechniquePreview = useCallback(debounce(fetchSingleTechniquePreview, 600), [fetchSingleTechniquePreview]);
    const debouncedFetchCombinedPreview = useCallback(debounce(fetchCombinedPreviewInternal, 600), [fetchCombinedPreviewInternal]);

    const handleTechniqueChange = (e) => {
        const { value: techValue, checked } = e.target;
        let newTechniquesList;
        if (checked) {
            newTechniquesList = [...techniques, techValue];
        } else {
            newTechniquesList = techniques.filter((item) => item !== techValue);
        }
        setTechniques(newTechniquesList);

        if (checked && techValue !== "mixup" && techValue !== "cutmix") {
            setActivePreviewTechnique(techValue);
            debouncedFetchSingleTechniquePreview(techValue, parameters);
        } else if (!checked && activePreviewTechnique === techValue) {
            setActivePreviewTechnique(null);
            setSingleTechniquePreviewSrc(originalSampleImageSrc);
        } else if (checked && (techValue === "mixup" || techValue === "cutmix")) {
             if (activePreviewTechnique) setActivePreviewTechnique(null);
             setSingleTechniquePreviewSrc(originalSampleImageSrc);
        }
        debouncedFetchCombinedPreview(newTechniquesList, parameters);
    };

    const handleParameterChange = (e) => {
        const { name, value, type } = e.target;
        const parsedValue = type === 'number' ? parseFloat(value) : value;
        const newParams = { ...parameters, [name]: parsedValue };
        setParameters(newParams);

        if (activePreviewTechnique && activePreviewTechnique !== "mixup" && activePreviewTechnique !== "cutmix") {
            debouncedFetchSingleTechniquePreview(activePreviewTechnique, newParams);
        }
        if (techniques.length > 0) {
            debouncedFetchCombinedPreview(techniques, newParams);
        }
    };

    const startAugment = async () => {
        if (techniques.length === 0) {
            alert("Please select at least one augmentation technique."); return;
        }
        setIsLoading(true);
        try {
            const backendParams = prepareParametersForBackend(parameters);
            const response = await axios.post(`${process.env.REACT_APP_FlaskUrl}/augment`, {
                datasetName: dataset.name, techniques: techniques, parameters: backendParams,
            });
            alert(`Augmentation complete! Run ID: ${response.data.run_id}, ZIP: ${response.data.zip_filename}`);
            navigate('/Uploads');
        } catch (error) {
            console.error("Augmentation error:", error);
            alert(`Augmentation failed: ${error.response?.data?.error || error.message}`);
        } finally { setIsLoading(false); }
    };

    const openImageModal = (src, alt) => setImageModal({ show: true, src, alt });
    const closeImageModal = () => setImageModal({ show: false, src: '', alt: '' });

    useEffect(() => {
        const body = document.body;
        if (imageModal.show) {
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = 'auto';
        }
        return () => { body.style.overflow = 'auto'; };
    }, [imageModal.show]);

    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                if (imageModal.show) closeImageModal();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => { window.removeEventListener('keydown', handleEsc); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imageModal.show]);


    const allTechniquesAndParams = [
        {
            category: "Geometric", fields: [
                { tech: "rotate", label: "Rotate", param: "rotation_angle", type: "number", defaultVal: INITIAL_PARAMETERS.rotation_angle, step: 1, unit: "°" },
                { tech: "scale", label: "Scale", param: "scaling_factor", type: "number", defaultVal: INITIAL_PARAMETERS.scaling_factor, step: 0.05, min: 0.1 },
                {
                    tech: "translate", label: "Translate", params: [
                        { name: "translation_x", label: "X:", type: "number", defaultVal: INITIAL_PARAMETERS.translation_x, step: 1, unit: "px" },
                        { name: "translation_y", label: "Y:", type: "number", defaultVal: INITIAL_PARAMETERS.translation_y, step: 1, unit: "px" }
                    ]
                },
                { tech: "flip_horizontal", label: "Flip Horizontal" }, { tech: "flip_vertical", label: "Flip Vertical" },
                {
                    tech: "crop", label: "Crop", params: [
                        { name: "crop_left", label: "L:", type: "number", defaultVal: INITIAL_PARAMETERS.crop_left, step: 1, unit: "px", min: 0, max: originalImageDimensions.width > 0 ? originalImageDimensions.width -1 : undefined },
                        { name: "crop_top", label: "T:", type: "number", defaultVal: INITIAL_PARAMETERS.crop_top, step: 1, unit: "px", min: 0, max: originalImageDimensions.height > 0 ? originalImageDimensions.height -1 : undefined },
                        { name: "crop_right", label: "R:", type: "number", defaultVal: INITIAL_PARAMETERS.crop_right, step: 1, unit: "px", min: 1, max: originalImageDimensions.width > 0 ? originalImageDimensions.width : undefined },
                        { name: "crop_bottom", label: "B:", type: "number", defaultVal: INITIAL_PARAMETERS.crop_bottom, step: 1, unit: "px", min: 1, max: originalImageDimensions.height > 0 ? originalImageDimensions.height : undefined }
                    ]
                },
                {
                    tech: "pad", label: "Pad", params: [
                        { name: "padding_size", label: "Size:", type: "number", defaultVal: INITIAL_PARAMETERS.padding_size, step: 1, min: 0, unit: "px" },
                        { name: "padding_color", label: "Color:", type: "color", defaultVal: INITIAL_PARAMETERS.padding_color, style: { width: '60px', height: '30px', padding: '2px' } }
                    ]
                }
            ]
        },
        {
            category: "Color", fields: [
                { tech: "brightness", label: "Brightness", param: "brightness_factor", type: "number", defaultVal: INITIAL_PARAMETERS.brightness_factor, step: 0.1, min: 0 },
                { tech: "contrast", label: "Contrast", param: "contrast_factor", type: "number", defaultVal: INITIAL_PARAMETERS.contrast_factor, step: 0.1, min: 0 },
                { tech: "saturation", label: "Saturation", param: "saturation_factor", type: "number", defaultVal: INITIAL_PARAMETERS.saturation_factor, step: 0.1, min: 0 },
                { tech: "grayscale", label: "Grayscale" }
            ]
        },
        {
            category: "Noise & Blur", fields: [
                { tech: "gaussian_noise", label: "Gaussian Noise", param: "gaussian_variance", type: "number", defaultVal: INITIAL_PARAMETERS.gaussian_variance, step: 0.001, min: 0, max: 0.1 },
                { tech: "salt_pepper_noise", label: "Salt & Pepper", param: "sap_amount", type: "number", defaultVal: INITIAL_PARAMETERS.sap_amount, step: 0.001, min: 0, max: 0.1 },
                { tech: "speckle_noise", label: "Speckle Noise" },
                { tech: "motion_blur", label: "Motion Blur", param: "motion_blur_size", type: "number", defaultVal: INITIAL_PARAMETERS.motion_blur_size, step: 2, min: 3 }
            ]
        },
        {
            category: "Occlusion", fields: [
                { tech: "cutout", label: "Cutout", param: "cutout_size", type: "number", defaultVal: INITIAL_PARAMETERS.cutout_size, step: 1, min: 0, unit: "px" },
                { tech: "random_erasing", label: "Random Erasing" }
            ]
        },
        {
            category: "Mix (Combined Preview Only)", fields: [
                { tech: "mixup", label: "MixUp", param: "mixup_alpha", type: "number", defaultVal: INITIAL_PARAMETERS.mixup_alpha, step: 0.1, min: 0 },
                { tech: "cutmix", label: "CutMix" }
            ], note: "MixUp/CutMix use random images from the dataset. Single technique preview is not applicable."
        }
    ];

    const renderSelectedTechniqueDetails = (techName) => {
        const techDefinition = allTechniquesAndParams
            .flatMap(group => group.fields)
            .find(field => field.tech === techName);

        if (!techDefinition) return <span className="text-muted fst-italic"> (No parameters)</span>;

        let details = [];
        if (techDefinition.param) {
            details.push(
                <span key={techDefinition.param}>
                    {parameters[techDefinition.param]}{techDefinition.unit || ''}
                </span>
            );
        } else if (techDefinition.params) {
            techDefinition.params.forEach(p => {
                details.push(
                    <span key={p.name} className="me-2">
                        {p.label} {String(parameters[p.name])}{p.unit || ''}
                    </span>
                );
            });
        }
        return details.length > 0 ? <>{details}</> : <span className="text-muted fst-italic"> (No parameters)</span>;
    };

    if (!dataset) {
        return (
            <div className="container mt-4">
                <div className="alert alert-warning" role="alert">
                    No dataset selected or dataset information is missing.
                </div>
                <button type="button" className="btn btn-primary" onClick={() => navigate('/Uploads')}>
                    Go to Uploads Page
                </button>
            </div>
        );
    }

    const previewBoxStyle = {
        width: '100%', minHeight: '180px', maxHeight: '200px',
        border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#f9f9f9', position: 'relative', overflow: 'hidden',
        borderRadius: '0.25rem', cursor: 'pointer'
    };
    const imageStyle = { maxWidth: '100%', maxHeight: '100%', display: 'block', objectFit: 'contain' };
    const previewLoadingStyle = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    const paramInputStyle = { width: '70px', fontSize: '0.9em', padding: '0.2rem 0.4rem' };
    const paramLabelStyle = { fontSize: '0.85em', marginRight: '3px', marginLeft:'5px' };

    return (
        <div className="container-fluid p-3 vh-100 d-flex flex-column">
            <div className="row">
                <div className="col">
                    <div className="card shadow-sm mb-3" style={{ backgroundColor: '#e9ecef' }}>
                        <div className="card-body">
                            <h2 className="card-title" style={{ color: '#0d6efd' }}>Augment Dataset: {dataset.name}</h2>
                            <p className="card-text text-muted small">
                                Select techniques and adjust parameters. Previews update on the right. <br/>
                                Sample Image: <strong>{sampleImageFilename || 'N/A'}</strong> ({originalImageDimensions.width}x{originalImageDimensions.height}px)
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row flex-grow-1" style={{ minHeight: 0 }}>
                <div className="col-md-7 d-flex flex-column" style={{ height: 'calc(100vh - 220px)' }}>
                    <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '15px' }}>
                        <ul className="nav nav-pills mb-3 flex-wrap" id="augmentation-tabs" role="tablist">
                            {allTechniquesAndParams.map(group => (
                                <li className="nav-item" role="presentation" key={group.category}>
                                    <button
                                        className={`nav-link ${activeTabKey === group.category ? 'active' : ''}`}
                                        type="button" role="tab" onClick={() => setActiveTabKey(group.category)}
                                        aria-selected={activeTabKey === group.category} >
                                        {group.category}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <div className="tab-content" id="augmentation-tabContent">
                            {allTechniquesAndParams.map(group => (
                                <div
                                    className={`tab-pane fade ${activeTabKey === group.category ? 'show active' : ''}`}
                                    role="tabpanel" key={group.category} >
                                    <div className="card">
                                        <div className="card-body">
                                            {group.fields.map(field => (
                                                <div key={field.tech} className="mb-3">
                                                    <div className="form-check">
                                                        <input className="form-check-input" type="checkbox" value={field.tech} id={`check-${field.tech}`}
                                                            onChange={handleTechniqueChange} checked={techniques.includes(field.tech)} />
                                                        <label className="form-check-label fw-medium" htmlFor={`check-${field.tech}`}>{field.label}</label>
                                                    </div>
                                                    {techniques.includes(field.tech) && (
                                                        <div className="d-flex align-items-center flex-wrap mt-1 ps-4">
                                                            {field.param && (
                                                                <>
                                                                    <input type={field.type} name={field.param} className="form-control form-control-sm"
                                                                        value={parameters[field.param] === undefined ? field.defaultVal : parameters[field.param]}
                                                                        onChange={handleParameterChange} step={field.step} min={field.min} max={field.max}
                                                                        style={{ ...paramInputStyle, ...field.style }} />
                                                                    {field.unit && <span className="ms-1 me-2 small text-muted">{field.unit}</span>}
                                                                </>
                                                            )}
                                                            {field.params && field.params.map(p => (
                                                                <React.Fragment key={p.name}>
                                                                    <label htmlFor={p.name} className="form-label mb-0" style={paramLabelStyle}>{p.label}</label>
                                                                    <input type={p.type} name={p.name} id={p.name} className="form-control form-control-sm"
                                                                        value={parameters[p.name] === undefined ? p.defaultVal : parameters[p.name]}
                                                                        onChange={handleParameterChange} step={p.step} min={p.min} max={p.max}
                                                                        style={{ ...paramInputStyle, width: p.type === 'color' ? '60px' : '60px', ...p.style }}/>
                                                                    {p.unit && <span className="ms-1 me-2 small text-muted">{p.unit}</span>}
                                                                </React.Fragment>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {group.note && <p className="small text-muted mt-2 mb-0">{group.note}</p>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="pt-3 mt-2 border-top bg-light sticky-bottom px-3">
                        <button type="button" className="btn btn-primary me-2" onClick={startAugment}
                            disabled={isLoading || isSinglePreviewLoading || isCombinedPreviewLoading || techniques.length === 0}>
                            {isLoading ? <><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Augmenting...</> : 'Start Full Augmentation'}
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/Uploads')} disabled={isLoading}>Cancel</button>
                    </div>
                </div>

                <div className="col-md-5 d-flex flex-column" style={{ height: 'calc(100vh - 220px)'}}>
                     <h5 className="text-center mb-2 mt-md-0 mt-3">Live Previews <small className="text-muted">(Click to enlarge)</small></h5>
                     <div className="row g-2 mb-2">
                        <div className="col-12 col-lg-4">
                            <div className="card h-100">
                                <div className="card-header py-1 px-2 small text-center fw-bold">Original</div>
                                <div className="card-body p-1" style={previewBoxStyle} onClick={() => originalSampleImageSrc && openImageModal(originalSampleImageSrc, 'Original Sample')}>
                                    {originalSampleImageSrc ? <img src={originalSampleImageSrc} alt="Original Sample" style={imageStyle} /> : (sampleImageFilename ? <div className="spinner-border spinner-border-sm" role="status"><span className="visually-hidden">Loading...</span></div> : <span className="small text-muted">No sample</span>)}
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-lg-4">
                            <div className="card h-100">
                                <div className="card-header py-1 px-2 small text-center fw-bold">Active: {activePreviewTechnique || "None"}</div>
                                <div className="card-body p-1" style={previewBoxStyle} onClick={() => singleTechniquePreviewSrc && singleTechniquePreviewSrc !== originalSampleImageSrc && activePreviewTechnique && openImageModal(singleTechniquePreviewSrc, `Active: ${activePreviewTechnique}`)}>
                                    {isSinglePreviewLoading && <div className="spinner-border" style={previewLoadingStyle} role="status"><span className="visually-hidden">Loading...</span></div>}
                                    {!isSinglePreviewLoading && singleTechniquePreviewSrc && singleTechniquePreviewSrc !== originalSampleImageSrc && activePreviewTechnique && activePreviewTechnique !== "mixup" && activePreviewTechnique !== "cutmix" ? (
                                        <img src={singleTechniquePreviewSrc} alt="Single Technique Preview" style={imageStyle} />
                                    ) : !isSinglePreviewLoading && (
                                        <span className="small text-muted p-2 text-center">
                                            {activePreviewTechnique === "mixup" || activePreviewTechnique === "cutmix" ? "Preview not applicable." : (activePreviewTechnique ? "Generating..." : "Select a technique.")}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-lg-4">
                             <div className="card h-100">
                                <div className="card-header py-1 px-2 small text-center fw-bold">Combined ({techniques.length})</div>
                                <div className="card-body p-1" style={previewBoxStyle} onClick={() => combinedPreviewSrc && combinedPreviewSrc !== originalSampleImageSrc && techniques.length > 0 && openImageModal(combinedPreviewSrc, 'Combined Techniques Preview')}>
                                    {isCombinedPreviewLoading && <div className="spinner-border" style={previewLoadingStyle} role="status"><span className="visually-hidden">Loading...</span></div>}
                                    {!isCombinedPreviewLoading && combinedPreviewSrc && combinedPreviewSrc !== originalSampleImageSrc && techniques.length > 0 ? (
                                        <img src={combinedPreviewSrc} alt="Combined Preview" style={imageStyle} />
                                    ) : !isCombinedPreviewLoading && (
                                         <span className="small text-muted p-2 text-center">{techniques.length > 0 ? "Generating..." : "Select techniques."}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="card mt-2 flex-grow-1" style={{ minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                        <div className="card-header fw-bold d-flex justify-content-between align-items-center">
                            <span>Selected Augmentations <span className="badge bg-primary rounded-pill ms-1">{techniques.length}</span></span>
                        </div>
                        <ul className="list-group list-group-flush" style={{ overflowY: 'auto', flexGrow: 1 }}>
                            {techniques.length === 0 && (
                                <li className="list-group-item text-center text-muted d-flex align-items-center justify-content-center" style={{minHeight: '100px'}}>
                                    No techniques selected.
                                </li>
                            )}
                            {techniques.map(tech => {
                                const techDef = allTechniquesAndParams.flatMap(g => g.fields).find(f => f.tech === tech);
                                return (
                                    <li key={tech} className="list-group-item py-2 px-2">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="fw-semibold small">{techDef?.label || tech}</span>
                                            <small className="text-muted text-end" style={{maxWidth: '60%'}}>{renderSelectedTechniqueDetails(tech)}</small>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>

            {imageModal.show && (
                <div className="modal fade show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.7)' }} onClick={closeImageModal}>
                    <div className="modal-dialog modal-xl modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{imageModal.alt}</h5>
                                <button type="button" className="btn-close" onClick={closeImageModal}></button>
                            </div>
                            <div className="modal-body text-center p-2">
                                <img src={imageModal.src} alt={imageModal.alt} className="img-fluid" style={{ maxHeight: '85vh' }} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Augmentation;