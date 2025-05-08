import React, { useState, useEffect, useCallback } from 'react';

// Base URL for your Flask API
const API_BASE_URL = process.env.REACT_APP_FlaskUrl ||'http://localhost:5000'; // Adjust if your Flask Augmentation runs on a different port

// Define the available augmentation options and their parameters
// This should mirror the capabilities of your backend
const AUGMENTATION_OPTIONS = [
    // Geometric
    { id: 'rotation', name: 'Rotation', params: [{ id: 'rotation_angle', name: 'Angle (°)', type: 'number', defaultValue: 30, step: 1 }] },
    { id: 'scaling', name: 'Scaling', params: [{ id: 'scaling_factor', name: 'Factor', type: 'number', defaultValue: 0.8, step: 0.05, min:0.1, max:2.0 }] },
    { id: 'translation', name: 'Translation', params: [
        { id: 'translation_x', name: 'X Offset (px)', type: 'number', defaultValue: 10, step: 1 },
        { id: 'translation_y', name: 'Y Offset (px)', type: 'number', defaultValue: 10, step: 1 }
    ]},
    { id: 'flipping_horizontal', name: 'Horizontal Flip', params: [] },
    { id: 'flipping_vertical', name: 'Vertical Flip', params: [] },
    { id: 'cropping', name: 'Cropping (from edges)', params: [
        { id: 'crop_left', name: 'Left (px)', type: 'number', defaultValue: 10, step: 1, min:0 },
        { id: 'crop_top', name: 'Top (px)', type: 'number', defaultValue: 10, step: 1, min:0 },
        { id: 'crop_right', name: 'Right (px)', type: 'number', defaultValue: 10, step: 1, min:0 },
        { id: 'crop_bottom', name: 'Bottom (px)', type: 'number', defaultValue: 10, step: 1, min:0 }
    ]},
    { id: 'padding', name: 'Padding', params: [
        { id: 'padding_size', name: 'Size (px)', type: 'number', defaultValue: 10, step: 1, min:0 },
        { id: 'padding_color', name: 'Color (hex)', type: 'text', defaultValue: '#000000' }
    ]},
    // Color
    { id: 'brightness', name: 'Brightness', params: [{ id: 'brightness_factor', name: 'Factor', type: 'number', defaultValue: 1.5, step: 0.1, min:0, max:3.0 }] },
    { id: 'contrast', name: 'Contrast', params: [{ id: 'contrast_factor', name: 'Factor', type: 'number', defaultValue: 1.5, step: 0.1, min:0, max:3.0 }] },
    { id: 'grayscale', name: 'Grayscale', params: [] },
    { id: 'saturation', name: 'Saturation', params: [{ id: 'saturation_factor', name: 'Factor', type: 'number', defaultValue: 1.5, step: 0.1, min:0, max:3.0 }] },
    // Noise
    { id: 'gaussian_noise', name: 'Gaussian Noise', params: [{ id: 'gaussian_variance', name: 'Variance', type: 'number', defaultValue: 0.01, step: 0.001, min:0 }] },
    { id: 'salt_pepper_noise', name: 'Salt & Pepper Noise', params: [{ id: 'sap_amount', name: 'Amount', type: 'number', defaultValue: 0.005, step: 0.001, min:0, max:0.1 }] },
    { id: 'speckle_noise', name: 'Speckle Noise', params: [] },
    { id: 'motion_blur', name: 'Motion Blur', params: [{ id: 'motion_blur_size', name: 'Kernel Size', type: 'number', defaultValue: 9, step: 2, min:3 }] }, // Often odd
    // Occlusion
    { id: 'cutout', name: 'Cutout', params: [{ id: 'cutout_size', name: 'Mask Size (px)', type: 'number', defaultValue: 50, step: 1, min:10 }] },
    { id: 'random_erasing', name: 'Random Erasing', params: [] }, // Backend uses default sl, sh, r1
    // Mix (These require other images from the uploaded batch, handled by backend)
    { id: 'mixup', name: 'Mixup', params: [{ id: 'mixup_alpha', name: 'Alpha', type: 'number', defaultValue: 0.4, step: 0.1, min:0.1, max:1.0 }] },
    { id: 'cutmix', name: 'CutMix', params: [] },
];

// Main Application Component
function Augmentation() {
    // State variables
    const [currentStep, setCurrentStep] = useState('upload'); // upload, selectAugmentations, setAugmentationCount, viewResults
    const [uploadedImages, setUploadedImages] = useState([]); // Array of File objects
    const [uploadedImageCount, setUploadedImageCount] = useState(0); // Count from backend session
    const [selectedAugmentations, setSelectedAugmentations] = useState({}); // { rotation: { enabled: true, rotation_angle: 30 }}
    const [numToAugment, setNumToAugment] = useState(1);
    const [augmentedVersions, setAugmentedVersions] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Helper to clear messages
    const clearMessages = () => {
        setError('');
        setSuccessMessage('');
    };

    // Fetch augmented versions from the backend
    const fetchAugmentedVersions = useCallback(async () => {
        setIsLoading(true);
        clearMessages();
        try {
            const response = await fetch(`${API_BASE_URL}/download`);
            if (!response.ok) {
                const errData = await response.json().catch(() => ({ message: 'Failed to fetch versions' }));
                throw new Error(errData.message || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setAugmentedVersions(data.versions || {}); // Assuming backend sends { versions: { ... } }
        } catch (err) {
            setError(`Error fetching versions: ${err.message}`);
            setAugmentedVersions({});
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch versions on initial load if starting at results, or after augmentation
    useEffect(() => {
        if (currentStep === 'viewResults') {
            fetchAugmentedVersions();
        }
    }, [currentStep, fetchAugmentedVersions]);

    // Handler for file input changes
    const handleFileChange = (event) => {
        clearMessages();
        const files = Array.from(event.target.files);
         // Basic client-side validation for image types
        const allowedTypes = ['image/png', 'image/jpeg', 'image/gif'];
        const validFiles = files.filter(file => allowedTypes.includes(file.type));
        if (validFiles.length !== files.length) {
            setError('Some files were not valid image types (PNG, JPG, GIF).');
        }
        setUploadedImages(validFiles);
    };

    // Handler for uploading images
    const handleImageUpload = async () => {
        if (uploadedImages.length === 0) {
            setError('Please select images to upload.');
            return;
        }
        setIsLoading(true);
        clearMessages();
        const formData = new FormData();
        uploadedImages.forEach(file => {
            formData.append('images', file);
        });

        try {
            const response = await fetch(`${API_BASE_URL}/upload`, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({ message: 'Upload failed' }));
                throw new Error(errData.message || `HTTP error! status: ${response.status}`);
            }
            // Assuming the backend response after /upload doesn't directly give count
            // but sets it in session. We'll get this count implicitly later or rely on uploadedImages.length
            // For now, let's use the length of successfully uploaded files on client side
            setUploadedImageCount(uploadedImages.length); 
            setSuccessMessage(`${uploadedImages.length} image(s) uploaded successfully.`);
            setCurrentStep('selectAugmentations');
        } catch (err) {
            setError(`Upload error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Handler for augmentation selection changes
    const handleAugmentationChange = (augId, paramId, value) => {
        clearMessages();
        setSelectedAugmentations(prev => {
            const newAugs = { ...prev };
            if (!newAugs[augId]) newAugs[augId] = { enabled: false }; // Initialize if not present

            if (paramId === 'enabled') {
                newAugs[augId].enabled = value;
                // If disabling, remove params, otherwise initialize with defaults
                if (!value) {
                    const { enabled, ...rest } = newAugs[augId];
                    Object.keys(rest).forEach(pKey => delete newAugs[augId][pKey]);
                } else {
                    const augOption = AUGMENTATION_OPTIONS.find(opt => opt.id === augId);
                    if (augOption) {
                        augOption.params.forEach(p => {
                            if (newAugs[augId][p.id] === undefined) { // Only set if not already set by user
                                newAugs[augId][p.id] = p.defaultValue;
                            }
                        });
                    }
                }
            } else {
                newAugs[augId][paramId] = value;
                newAugs[augId].enabled = true; // Ensure it's enabled if a param is changed
            }
            return newAugs;
        });
    };
    
    // Initialize selectedAugmentations with default values for all options
    useEffect(() => {
        const initialAugs = {};
        AUGMENTATION_OPTIONS.forEach(opt => {
            initialAugs[opt.id] = { enabled: false };
            opt.params.forEach(param => {
                initialAugs[opt.id][param.id] = param.defaultValue;
            });
        });
        setSelectedAugmentations(initialAugs);
    }, []);


    // Handler for submitting selected augmentations
    const handleSubmitAugmentations = async () => {
        setIsLoading(true);
        clearMessages();
        const activeAugmentations = {};
        for (const augId in selectedAugmentations) {
            if (selectedAugmentations[augId].enabled) {
                activeAugmentations[augId] = 'yes'; // As per backend: request.form.to_dict()
                const augOption = AUGMENTATION_OPTIONS.find(opt => opt.id === augId);
                if (augOption) {
                    augOption.params.forEach(param => {
                        // Ensure param value is taken from state, not default if changed
                        activeAugmentations[param.id] = String(selectedAugmentations[augId][param.id] ?? param.defaultValue);
                    });
                }
            }
        }

        if (Object.keys(activeAugmentations).length === 0) {
            setError('Please select at least one augmentation technique.');
            setIsLoading(false);
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/select_augmentations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }, // Or 'application/x-www-form-urlencoded' if backend expects that
                body: JSON.stringify(activeAugmentations), // Flask's request.form works with urlencoded or form-data. JSON needs request.get_json()
                                                          // For simplicity, assuming backend can handle JSON or we adjust backend.
                                                          // If Flask strictly uses request.form, this needs to be form-urlencoded.
                                                          // Let's try with URLSearchParams for form-like data
            });
            
            // Re-constructing for form-urlencoded
            const formBody = new URLSearchParams();
            for (const key in activeAugmentations) {
                formBody.append(key, activeAugmentations[key]);
            }

            const responseForm = await fetch(`${API_BASE_URL}/select_augmentations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formBody.toString(),
            });


            if (!responseForm.ok) {
                const errData = await responseForm.json().catch(() => ({ message: 'Failed to set augmentations' }));
                throw new Error(errData.message || `HTTP error! status: ${responseForm.status}`);
            }
            setSuccessMessage('Augmentation preferences saved.');
            setCurrentStep('setAugmentationCount');
        } catch (err) {
            setError(`Error setting augmentations: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Handler for setting augmentation count and triggering the process
    const handleApplyAugmentations = async () => {
        if (numToAugment <= 0 || numToAugment > uploadedImageCount) {
            setError(`Number of images to augment must be between 1 and ${uploadedImageCount}.`);
            return;
        }
        setIsLoading(true);
        clearMessages();

        try {
            // 1. Set augmentation count
            const formBodyCount = new URLSearchParams();
            formBodyCount.append('images_to_augment', numToAugment);

            const responseCount = await fetch(`${API_BASE_URL}/set_augmentation_count`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formBodyCount.toString(),
            });

            if (!responseCount.ok) {
                const errData = await responseCount.json().catch(() => ({ message: 'Failed to set augmentation count' }));
                throw new Error(errData.message || `HTTP error! status: ${responseCount.status}`);
            }

            // 2. Apply augmentations (GET request as per backend)
            const responseApply = await fetch(`${API_BASE_URL}/apply_augmentations`);
            if (!responseApply.ok) {
                 const errData = await responseApply.json().catch(() => ({ message: 'Failed to apply augmentations' }));
                throw new Error(errData.message || `HTTP error! status: ${responseApply.status}`);
            }
            
            // The backend /apply_augmentations redirects to /download.
            // Here, we'll transition and fetch versions.
            setSuccessMessage('Augmentations applied successfully! Fetching results...');
            // Reset uploaded images state as backend clears them
            setUploadedImages([]);
            setUploadedImageCount(0); 
            setCurrentStep('viewResults'); // This will trigger fetchAugmentedVersions via useEffect

        } catch (err) {
            setError(`Error applying augmentations: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Handler for downloading a ZIP file
    const handleDownloadZip = (versionKey) => {
        // versionKey is like "1", "2", etc. Backend expects "version_1" in URL path for folder
        // but the download_zip/<version> in Flask takes the number.
        window.open(`${API_BASE_URL}/download_zip/${versionKey}`, '_blank');
    };
    
    // Reset to start a new augmentation process
    const handleStartNew = () => {
        clearMessages();
        setUploadedImages([]);
        setUploadedImageCount(0);
        setSelectedAugmentations({});
         // Re-initialize selectedAugmentations with defaults
        const initialAugs = {};
        AUGMENTATION_OPTIONS.forEach(opt => {
            initialAugs[opt.id] = { enabled: false };
            opt.params.forEach(param => {
                initialAugs[opt.id][param.id] = param.defaultValue;
            });
        });
        setSelectedAugmentations(initialAugs);
        setNumToAugment(1);
        setCurrentStep('upload');
    };

    // Render helper for loading spinner
    const renderLoading = () => isLoading && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        </div>
    );

    // Render helper for messages
    const renderMessages = () => (
        <>
            {error && <div className="my-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded">{error}</div>}
            {successMessage && <div className="my-4 p-3 bg-green-100 text-green-700 border border-green-400 rounded">{successMessage}</div>}
        </>
    );
    
    // Common button style
    const buttonClass = "px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-150 ease-in-out disabled:opacity-50";
    const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
    const labelClass = "block text-sm font-medium text-gray-700";

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 font-sans bg-gray-50 min-h-screen">
            {renderLoading()}
            <header className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-gray-800">Image Augmentation Tool</h1>
                <p className="text-lg text-gray-600 mt-2">Upload, configure, and augment your images with ease.</p>
            </header>

            {renderMessages()}

            {/* Step 1: File Upload */}
            {currentStep === 'upload' && (
                <section className="bg-white p-6 rounded-xl shadow-xl mb-8">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">1. Upload Images</h2>
                    <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg, image/gif"
                        className={`w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${inputClass}`}
                    />
                    {uploadedImages.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-md font-medium text-gray-700">Selected files:</h3>
                            <ul className="list-disc list-inside text-sm text-gray-600">
                                {uploadedImages.map(file => <li key={file.name}>{file.name} ({Math.round(file.size / 1024)} KB)</li>)}
                            </ul>
                        </div>
                    )}
                    <button onClick={handleImageUpload} disabled={isLoading || uploadedImages.length === 0} className={`${buttonClass} mt-6 w-full sm:w-auto`}>
                        Confirm Upload & Proceed
                    </button>
                </section>
            )}

            {/* Step 2: Select Augmentations */}
            {currentStep === 'selectAugmentations' && (
                <section className="bg-white p-6 rounded-xl shadow-xl mb-8">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-1">2. Configure Augmentations</h2>
                    <p className="text-sm text-gray-500 mb-6">You have {uploadedImageCount} image(s) ready for augmentation.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {AUGMENTATION_OPTIONS.map(aug => (
                            <div key={aug.id} className="p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedAugmentations[aug.id]?.enabled || false}
                                        onChange={(e) => handleAugmentationChange(aug.id, 'enabled', e.target.checked)}
                                        className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-lg font-medium text-gray-800">{aug.name}</span>
                                </label>
                                {selectedAugmentations[aug.id]?.enabled && aug.params.length > 0 && (
                                    <div className="mt-3 pl-2 space-y-3 border-l-2 border-blue-200 ml-2">
                                        {aug.params.map(param => (
                                            <div key={param.id}>
                                                <label htmlFor={`${aug.id}-${param.id}`} className={`${labelClass} mb-1`}>{param.name}:</label>
                                                <input
                                                    type={param.type}
                                                    id={`${aug.id}-${param.id}`}
                                                    value={selectedAugmentations[aug.id]?.[param.id] ?? param.defaultValue}
                                                    onChange={(e) => handleAugmentationChange(aug.id, param.id, param.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                                                    min={param.min}
                                                    max={param.max}
                                                    step={param.step}
                                                    className={`${inputClass} w-full`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <button onClick={handleSubmitAugmentations} disabled={isLoading} className={`${buttonClass} mt-8 w-full sm:w-auto`}>
                        Save Augmentations & Set Count
                    </button>
                </section>
            )}

            {/* Step 3: Set Augmentation Count */}
            {currentStep === 'setAugmentationCount' && (
                <section className="bg-white p-6 rounded-xl shadow-xl mb-8">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">3. Set Number of Images to Augment</h2>
                     <p className="text-sm text-gray-600 mb-4">
                        You have {uploadedImageCount} image(s) uploaded.
                        The backend will randomly select this many images from your uploaded set to apply the chosen augmentations.
                    </p>
                    <div>
                        <label htmlFor="numToAugment" className={`${labelClass} mb-1`}>Number of images to augment:</label>
                        <input
                            type="number"
                            id="numToAugment"
                            value={numToAugment}
                            onChange={(e) => setNumToAugment(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            min="1"
                            max={uploadedImageCount > 0 ? uploadedImageCount : undefined} // Max can be set if count is known
                            className={`${inputClass} w-full sm:w-1/3`}
                        />
                         {uploadedImageCount > 0 && <p className="text-xs text-gray-500 mt-1">Max: {uploadedImageCount}</p>}
                    </div>
                    <button onClick={handleApplyAugmentations} disabled={isLoading} className={`${buttonClass} mt-6 w-full sm:w-auto`}>
                        Apply Augmentations
                    </button>
                </section>
            )}

            {/* Step 4: View Results / Download */}
            {(currentStep === 'viewResults' || Object.keys(augmentedVersions).length > 0) && (
                 <section className="bg-white p-6 rounded-xl shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-700">4. Augmented Image Versions</h2>
                        <button onClick={handleStartNew} disabled={isLoading} className={`${buttonClass} bg-green-600 hover:bg-green-700 focus:ring-green-500`}>
                            Start New Augmentation
                        </button>
                    </div>
                    {Object.keys(augmentedVersions).length === 0 && !isLoading && (
                        <p className="text-gray-600">No augmented versions found. Try applying some augmentations!</p>
                    )}
                    {Object.keys(augmentedVersions).length > 0 && (
                        <div className="space-y-6">
                            {Object.entries(augmentedVersions)
                                .sort(([vA], [vB]) => parseInt(vB) - parseInt(vA)) // Sort by version number descending
                                .map(([versionKey, details]) => (
                                <div key={versionKey} className="p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                    <h3 className="text-xl font-semibold text-blue-700 mb-2">Version {versionKey}</h3>
                                    <p className="text-sm text-gray-600">
                                        <strong className="font-medium">Total Augmented Images:</strong> {details.total_augmented_images}
                                    </p>
                                    {details.selected_augmentations && details.selected_augmentations.length > 0 && (
                                        <div className="mt-2">
                                            <strong className="text-sm font-medium text-gray-600">Applied Techniques:</strong>
                                            <ul className="list-disc list-inside ml-4 text-sm text-gray-500">
                                                {details.selected_augmentations.map(aug => <li key={aug}>{aug}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                     {details.augmentation_params && Object.keys(details.augmentation_params).length > 0 && (
                                        <div className="mt-2">
                                            <strong className="text-sm font-medium text-gray-600">Parameters:</strong>
                                            <pre className="mt-1 p-2 bg-gray-100 rounded text-xs text-gray-700 overflow-x-auto">
                                                {JSON.stringify(details.augmentation_params, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => handleDownloadZip(versionKey)}
                                        disabled={isLoading}
                                        className={`${buttonClass} mt-4 bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 text-sm`}
                                    >
                                        Download Version {versionKey} (ZIP)
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    {/* Button to refresh versions list */}
                    <button onClick={fetchAugmentedVersions} disabled={isLoading} className={`${buttonClass} mt-6 bg-gray-500 hover:bg-gray-600 focus:ring-gray-400`}>
                        Refresh Versions List
                    </button>
                </section>
            )}
             <footer className="text-center mt-12 py-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">Image Augmentation Tool &copy; {new Date().getFullYear()}</p>
            </footer>
        </div>
    );
}

export default Augmentation;

