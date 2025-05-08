// // // // // // Augmentation.js
// // // // // import React, { useState } from 'react';
// // // // // import axios from 'axios';
// // // // // import { useLocation, useNavigate } from 'react-router-dom';

// // // // // const Augmentation = () => {
// // // // //   const { state } = useLocation();
// // // // //   const { dataset } = state;
// // // // //   const [augmentations, setAugmentations] = useState([]);
// // // // //   const navigate = useNavigate();

// // // // //   const handleChange = (e) => {
// // // // //     const { value, checked } = e.target;
// // // // //     setAugmentations((prev) =>
// // // // //       checked ? [...prev, value] : prev.filter((item) => item !== value)
// // // // //     );
// // // // //   };

// // // // //   const startAugment = async () => {
// // // // //     await axios.post('http://localhost:5001/augment', {
// // // // //       datasetName: dataset.name,
// // // // //       augmentations,
// // // // //     });
// // // // //     alert("Augmentation complete!");
// // // // //     navigate('/Uploads');
// // // // //   };

// // // // //   return (
// // // // //     <div>
// // // // //       <h2>Augment Dataset: {dataset.name}</h2>
// // // // //       <label><input type="checkbox" value="rotate" onChange={handleChange} /> Rotate</label>
// // // // //       <label><input type="checkbox" value="scale" onChange={handleChange} /> Scale</label>
// // // // //       <label><input type="checkbox" value="flip_horizontal" onChange={handleChange} /> Flip Horizontal</label>
// // // // //       <label><input type="checkbox" value="flip_vertical" onChange={handleChange} /> Flip Vertical</label>
// // // // //       <br />
// // // // //       <button onClick={startAugment}>Start Augment</button>
// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // export default Augmentation;



// // // // import React, { useState, useEffect } from 'react';
// // // // import axios from 'axios';
// // // // import { useLocation, useNavigate } from 'react-router-dom';

// // // // const Augmentation = () => {
// // // //   const location = useLocation();
// // // //   const navigate = useNavigate();
// // // //   const { dataset, augmentationsToPreload } = location.state || {};

// // // //   const initialParameters = {
// // // //     rotation_angle: 90,
// // // //     scaling_factor: 1.2,
// // // //     translation_x: 0,
// // // //     translation_y: 0,
// // // //     crop_left: 0,
// // // //     crop_top: 0,
// // // //     crop_right: 100, // Assuming percentage or to be replaced by actual image width
// // // //     crop_bottom: 100, // Assuming percentage or to be replaced by actual image height
// // // //     padding_size: 0,
// // // //     brightness_factor: 1.0,
// // // //     contrast_factor: 1.0,
// // // //     saturation_factor: 1.0,
// // // //     gaussian_variance: 0.01,
// // // //     sap_amount: 0.005,
// // // //     motion_blur_size: 9,
// // // //     cutout_size: 50,
// // // //     mixup_alpha: 0.2,
// // // //   };

// // // //   const [techniques, setTechniques] = useState([]);
// // // //   const [parameters, setParameters] = useState(initialParameters);
// // // //   const [isLoading, setIsLoading] = useState(false);

// // // //   useEffect(() => {
// // // //     if (augmentationsToPreload) {
// // // //       setTechniques(augmentationsToPreload.techniques || []);
// // // //       setParameters(prevParams => ({ ...initialParameters, ...prevParams, ...(augmentationsToPreload.parameters || {}) }));
// // // //     }
// // // //   }, [augmentationsToPreload]);

// // // //   if (!dataset) {
// // // //     return (
// // // //         <div>
// // // //             <p>No dataset selected. Please go back to Uploads and select a dataset to augment.</p>
// // // //             <button onClick={() => navigate('/Uploads')}>Go to Uploads</button>
// // // //         </div>
// // // //     );
// // // //   }


// // // //   const handleTechniqueChange = (e) => {
// // // //     const { value, checked } = e.target;
// // // //     setTechniques((prev) =>
// // // //       checked ? [...prev, value] : prev.filter((item) => item !== value)
// // // //     );
// // // //   };

// // // //   const handleParameterChange = (e) => {
// // // //     const { name, value, type } = e.target;
// // // //     setParameters(prev => ({
// // // //       ...prev,
// // // //       [name]: type === 'number' ? parseFloat(value) : value
// // // //     }));
// // // //   };

// // // //   const startAugment = async () => {
// // // //     if (techniques.length === 0) {
// // // //       alert("Please select at least one augmentation technique.");
// // // //       return;
// // // //     }
// // // //     setIsLoading(true);
// // // //     try {
// // // //       const response = await axios.post('http://localhost:5001/augment', {
// // // //         datasetName: dataset.name,
// // // //         techniques: techniques,
// // // //         parameters: parameters,
// // // //       });
// // // //       alert(`Augmentation complete! Augmented ZIP: ${response.data.zip_filename}`);
// // // //       navigate('/Uploads');
// // // //     } catch (error) {
// // // //       console.error("Augmentation error:", error);
// // // //       alert(`Augmentation failed: ${error.response?.data?.error || error.message}`);
// // // //     } finally {
// // // //       setIsLoading(false);
// // // //     }
// // // //   };

// // // //   const inputStyle = { marginLeft: '5px', marginRight: '15px', width: '60px' };
// // // //   const labelStyle = { display: 'inline-block', marginRight: '20px', marginBottom: '10px', width: 'auto' };

// // // //   return (
// // // //     <div>
// // // //       <h2>Augment Dataset: {dataset.name}</h2>
// // // //       <p>Select techniques and adjust parameters as needed.</p>

// // // //       <fieldset style={{ marginBottom: '15px' }}>
// // // //         <legend>Geometric Transformations</legend>
// // // //         <div>
// // // //           <label style={labelStyle}>
// // // //             <input type="checkbox" value="rotate" onChange={handleTechniqueChange} checked={techniques.includes('rotate')} /> Rotate
// // // //             {techniques.includes('rotate') && (
// // // //               <> Angle: <input type="number" name="rotation_angle" value={parameters.rotation_angle} onChange={handleParameterChange} style={inputStyle} /></>
// // // //             )}
// // // //           </label>
// // // //           <label style={labelStyle}>
// // // //             <input type="checkbox" value="scale" onChange={handleTechniqueChange} checked={techniques.includes('scale')} /> Scale
// // // //             {techniques.includes('scale') && (
// // // //               <> Factor: <input type="number" step="0.1" name="scaling_factor" value={parameters.scaling_factor} onChange={handleParameterChange} style={inputStyle} /></>
// // // //             )}
// // // //           </label>
// // // //         </div>
// // // //         <div>
// // // //           <label style={labelStyle}><input type="checkbox" value="flip_horizontal" onChange={handleTechniqueChange} checked={techniques.includes('flip_horizontal')} /> Flip Horizontal</label>
// // // //           <label style={labelStyle}><input type="checkbox" value="flip_vertical" onChange={handleTechniqueChange} checked={techniques.includes('flip_vertical')} /> Flip Vertical</label>
// // // //         </div>
// // // //         {/* Add Translate, Crop, Pad later if complex UI is desired for them, for now params can be set via copied settings */}
// // // //       </fieldset>

// // // //       <fieldset style={{ marginBottom: '15px' }}>
// // // //         <legend>Color Transformations</legend>
// // // //         <div>
// // // //           <label style={labelStyle}>
// // // //             <input type="checkbox" value="brightness" onChange={handleTechniqueChange} checked={techniques.includes('brightness')} /> Brightness
// // // //             {techniques.includes('brightness') && (
// // // //               <> Factor: <input type="number" step="0.1" name="brightness_factor" value={parameters.brightness_factor} onChange={handleParameterChange} style={inputStyle} /></>
// // // //             )}
// // // //           </label>
// // // //           <label style={labelStyle}>
// // // //             <input type="checkbox" value="contrast" onChange={handleTechniqueChange} checked={techniques.includes('contrast')} /> Contrast
// // // //             {techniques.includes('contrast') && (
// // // //               <> Factor: <input type="number" step="0.1" name="contrast_factor" value={parameters.contrast_factor} onChange={handleParameterChange} style={inputStyle} /></>
// // // //             )}
// // // //           </label>
// // // //         </div>
// // // //         <div>
// // // //           <label style={labelStyle}>
// // // //             <input type="checkbox" value="saturation" onChange={handleTechniqueChange} checked={techniques.includes('saturation')} /> Saturation
// // // //             {techniques.includes('saturation') && (
// // // //               <> Factor: <input type="number" step="0.1" name="saturation_factor" value={parameters.saturation_factor} onChange={handleParameterChange} style={inputStyle} /></>
// // // //             )}
// // // //           </label>
// // // //           <label style={labelStyle}><input type="checkbox" value="grayscale" onChange={handleTechniqueChange} checked={techniques.includes('grayscale')} /> Grayscale</label>
// // // //         </div>
// // // //       </fieldset>

// // // //       <fieldset style={{ marginBottom: '15px' }}>
// // // //         <legend>Noise & Blur</legend>
// // // //         <div>
// // // //           <label style={labelStyle}>
// // // //             <input type="checkbox" value="gaussian_noise" onChange={handleTechniqueChange} checked={techniques.includes('gaussian_noise')} /> Gaussian Noise
// // // //             {techniques.includes('gaussian_noise') && (
// // // //               <> Variance: <input type="number" step="0.001" name="gaussian_variance" value={parameters.gaussian_variance} onChange={handleParameterChange} style={inputStyle} /></>
// // // //             )}
// // // //           </label>
// // // //           <label style={labelStyle}>
// // // //             <input type="checkbox" value="salt_pepper_noise" onChange={handleTechniqueChange} checked={techniques.includes('salt_pepper_noise')} /> Salt & Pepper
// // // //             {techniques.includes('salt_pepper_noise') && (
// // // //               <> Amount: <input type="number" step="0.001" name="sap_amount" value={parameters.sap_amount} onChange={handleParameterChange} style={inputStyle} /></>
// // // //             )}
// // // //           </label>
// // // //         </div>
// // // //         <div>
// // // //           <label style={labelStyle}><input type="checkbox" value="speckle_noise" onChange={handleTechniqueChange} checked={techniques.includes('speckle_noise')} /> Speckle Noise</label>
// // // //           <label style={labelStyle}>
// // // //             <input type="checkbox" value="motion_blur" onChange={handleTechniqueChange} checked={techniques.includes('motion_blur')} /> Motion Blur
// // // //             {techniques.includes('motion_blur') && (
// // // //               <> Size: <input type="number" name="motion_blur_size" value={parameters.motion_blur_size} onChange={handleParameterChange} style={inputStyle} /></>
// // // //             )}
// // // //           </label>
// // // //         </div>
// // // //       </fieldset>

// // // //       <fieldset style={{ marginBottom: '15px' }}>
// // // //         <legend>Occlusion</legend>
// // // //         <div>
// // // //           <label style={labelStyle}>
// // // //             <input type="checkbox" value="cutout" onChange={handleTechniqueChange} checked={techniques.includes('cutout')} /> Cutout
// // // //             {techniques.includes('cutout') && (
// // // //               <> Size: <input type="number" name="cutout_size" value={parameters.cutout_size} onChange={handleParameterChange} style={inputStyle} /></>
// // // //             )}
// // // //           </label>
// // // //           <label style={labelStyle}><input type="checkbox" value="random_erasing" onChange={handleTechniqueChange} checked={techniques.includes('random_erasing')} /> Random Erasing</label>
// // // //         </div>
// // // //       </fieldset>

// // // //       <fieldset style={{ marginBottom: '15px' }}>
// // // //         <legend>Mix Augmentations</legend>
// // // //         <div>
// // // //         <label style={labelStyle}>
// // // //             <input type="checkbox" value="mixup" onChange={handleTechniqueChange} checked={techniques.includes('mixup')} /> MixUp
// // // //             {techniques.includes('mixup') && (
// // // //               <> Alpha: <input type="number" step="0.1" name="mixup_alpha" value={parameters.mixup_alpha} onChange={handleParameterChange} style={inputStyle} /></>
// // // //             )}
// // // //           </label>
// // // //           <label style={labelStyle}><input type="checkbox" value="cutmix" onChange={handleTechniqueChange} checked={techniques.includes('cutmix')} /> CutMix</label>
// // // //         </div>
// // // //         <small>MixUp and CutMix require multiple images in the dataset.</small>
// // // //       </fieldset>
// // // //       <br />
// // // //       <button onClick={startAugment} disabled={isLoading}>
// // // //         {isLoading ? 'Augmenting...' : 'Start Augmentation'}
// // // //       </button>
// // // //       <button onClick={() => navigate('/Uploads')} style={{ marginLeft: '10px' }} disabled={isLoading}>
// // // //         Cancel
// // // //       </button>
// // // //     </div>
// // // //   );
// // // // };

// // // // export default Augmentation;




// // // import React, { useState, useEffect } from 'react';
// // // import axios from 'axios';
// // // import { useLocation, useNavigate } from 'react-router-dom';

// // // const Augmentation = () => {
// // //   const location = useLocation();
// // //   const navigate = useNavigate();
// // //   const { dataset, augmentationsToPreload } = location.state || {};

// // //   const initialParameters = {
// // //     rotation_angle: 90,
// // //     scaling_factor: 1.2,
// // //     translation_x: 0,
// // //     translation_y: 0,
// // //     crop_left: 0,
// // //     crop_top: 0,
// // //     crop_right: 100, 
// // //     crop_bottom: 100,
// // //     padding_size: 0,
// // //     brightness_factor: 1.0,
// // //     contrast_factor: 1.0,
// // //     saturation_factor: 1.0,
// // //     gaussian_variance: 0.01,
// // //     sap_amount: 0.005,
// // //     motion_blur_size: 9,
// // //     cutout_size: 50,
// // //     mixup_alpha: 0.2,
// // //   };

// // //   const [techniques, setTechniques] = useState([]);
// // //   const [parameters, setParameters] = useState(initialParameters);
// // //   const [isLoading, setIsLoading] = useState(false);

// // //   useEffect(() => {
// // //     if (augmentationsToPreload) {
// // //       setTechniques(augmentationsToPreload.techniques || []);
// // //       // Ensure initialParameters are spread first to provide defaults for any missing params
// // //       setParameters(prevParams => ({ ...initialParameters, ...(augmentationsToPreload.parameters || {}) }));
// // //     } else {
// // //       // If not preloading, ensure techniques are clear and params are reset to initial
// // //       setTechniques([]);
// // //       setParameters(initialParameters);
// // //     }
// // //   }, [augmentationsToPreload, dataset]); // Rerun if dataset changes or preload info changes


// // //   if (!dataset) {
// // //     return (
// // //         <div>
// // //             <p>No dataset selected. Please go back to Uploads and select a dataset to augment.</p>
// // //             <button onClick={() => navigate('/Uploads')}>Go to Uploads</button>
// // //         </div>
// // //     );
// // //   }


// // //   const handleTechniqueChange = (e) => {
// // //     const { value, checked } = e.target;
// // //     setTechniques((prev) =>
// // //       checked ? [...prev, value] : prev.filter((item) => item !== value)
// // //     );
// // //   };

// // //   const handleParameterChange = (e) => {
// // //     const { name, value, type } = e.target;
// // //     setParameters(prev => ({
// // //       ...prev,
// // //       [name]: type === 'number' ? parseFloat(value) : (type === 'checkbox' ? e.target.checked : value) // Handle checkbox type if any param is a boolean
// // //     }));
// // //   };

// // //   const startAugment = async () => {
// // //     if (techniques.length === 0) {
// // //       alert("Please select at least one augmentation technique.");
// // //       return;
// // //     }
// // //     setIsLoading(true);
// // //     try {
// // //       const response = await axios.post('http://localhost:5001/augment', {
// // //         datasetName: dataset.name,
// // //         techniques: techniques,
// // //         parameters: parameters,
// // //       });
// // //       alert(`Augmentation complete! Run ID: ${response.data.run_id}, ZIP: ${response.data.zip_filename}`);
// // //       navigate('/Uploads');
// // //     } catch (error) {
// // //       console.error("Augmentation error:", error);
// // //       alert(`Augmentation failed: ${error.response?.data?.error || error.message}`);
// // //     } finally {
// // //       setIsLoading(false);
// // //     }
// // //   };

// // //   const inputStyle = { marginLeft: '5px', marginRight: '15px', width: '60px' };
// // //   const labelStyle = { display: 'inline-block', marginRight: '20px', marginBottom: '10px', width: 'auto', verticalAlign: 'top' };
// // //   const fieldsetStyle = { marginBottom: '15px', border: '1px solid #ccc', padding: '10px' };
// // //   const legendStyle = { fontWeight: 'bold' };


// // //   return (
// // //     <div>
// // //       <h2>Augment Dataset: {dataset.name}</h2>
// // //       <p>Select techniques and adjust parameters as needed.</p>

// // //       <fieldset style={fieldsetStyle}>
// // //         <legend style={legendStyle}>Geometric Transformations</legend>
// // //         <div>
// // //           <label style={labelStyle}>
// // //             <input type="checkbox" value="rotate" onChange={handleTechniqueChange} checked={techniques.includes('rotate')} /> Rotate
// // //             {techniques.includes('rotate') && (
// // //               <> Angle: <input type="number" name="rotation_angle" value={parameters.rotation_angle} onChange={handleParameterChange} style={inputStyle} /></>
// // //             )}
// // //           </label>
// // //           <label style={labelStyle}>
// // //             <input type="checkbox" value="scale" onChange={handleTechniqueChange} checked={techniques.includes('scale')} /> Scale
// // //             {techniques.includes('scale') && (
// // //               <> Factor: <input type="number" step="0.1" name="scaling_factor" value={parameters.scaling_factor} onChange={handleParameterChange} style={inputStyle} /></>
// // //             )}
// // //           </label>
// // //         </div>
// // //         <div>
// // //           <label style={labelStyle}><input type="checkbox" value="flip_horizontal" onChange={handleTechniqueChange} checked={techniques.includes('flip_horizontal')} /> Flip Horizontal</label>
// // //           <label style={labelStyle}><input type="checkbox" value="flip_vertical" onChange={handleTechniqueChange} checked={techniques.includes('flip_vertical')} /> Flip Vertical</label>
// // //         </div>
// // //       </fieldset>

// // //       <fieldset style={fieldsetStyle}>
// // //         <legend style={legendStyle}>Color Transformations</legend>
// // //         <div>
// // //           <label style={labelStyle}>
// // //             <input type="checkbox" value="brightness" onChange={handleTechniqueChange} checked={techniques.includes('brightness')} /> Brightness
// // //             {techniques.includes('brightness') && (
// // //               <> Factor: <input type="number" step="0.1" name="brightness_factor" value={parameters.brightness_factor} onChange={handleParameterChange} style={inputStyle} /></>
// // //             )}
// // //           </label>
// // //           <label style={labelStyle}>
// // //             <input type="checkbox" value="contrast" onChange={handleTechniqueChange} checked={techniques.includes('contrast')} /> Contrast
// // //             {techniques.includes('contrast') && (
// // //               <> Factor: <input type="number" step="0.1" name="contrast_factor" value={parameters.contrast_factor} onChange={handleParameterChange} style={inputStyle} /></>
// // //             )}
// // //           </label>
// // //         </div>
// // //         <div>
// // //           <label style={labelStyle}>
// // //             <input type="checkbox" value="saturation" onChange={handleTechniqueChange} checked={techniques.includes('saturation')} /> Saturation
// // //             {techniques.includes('saturation') && (
// // //               <> Factor: <input type="number" step="0.1" name="saturation_factor" value={parameters.saturation_factor} onChange={handleParameterChange} style={inputStyle} /></>
// // //             )}
// // //           </label>
// // //           <label style={labelStyle}><input type="checkbox" value="grayscale" onChange={handleTechniqueChange} checked={techniques.includes('grayscale')} /> Grayscale</label>
// // //         </div>
// // //       </fieldset>

// // //       <fieldset style={fieldsetStyle}>
// // //         <legend style={legendStyle}>Noise & Blur</legend>
// // //         <div>
// // //           <label style={labelStyle}>
// // //             <input type="checkbox" value="gaussian_noise" onChange={handleTechniqueChange} checked={techniques.includes('gaussian_noise')} /> Gaussian Noise
// // //             {techniques.includes('gaussian_noise') && (
// // //               <> Variance: <input type="number" step="0.001" name="gaussian_variance" value={parameters.gaussian_variance} onChange={handleParameterChange} style={inputStyle} /></>
// // //             )}
// // //           </label>
// // //           <label style={labelStyle}>
// // //             <input type="checkbox" value="salt_pepper_noise" onChange={handleTechniqueChange} checked={techniques.includes('salt_pepper_noise')} /> Salt & Pepper
// // //             {techniques.includes('salt_pepper_noise') && (
// // //               <> Amount: <input type="number" step="0.001" name="sap_amount" value={parameters.sap_amount} onChange={handleParameterChange} style={inputStyle} /></>
// // //             )}
// // //           </label>
// // //         </div>
// // //         <div>
// // //           <label style={labelStyle}><input type="checkbox" value="speckle_noise" onChange={handleTechniqueChange} checked={techniques.includes('speckle_noise')} /> Speckle Noise</label>
// // //           <label style={labelStyle}>
// // //             <input type="checkbox" value="motion_blur" onChange={handleTechniqueChange} checked={techniques.includes('motion_blur')} /> Motion Blur
// // //             {techniques.includes('motion_blur') && (
// // //               <> Size: <input type="number" name="motion_blur_size" value={parameters.motion_blur_size} onChange={handleParameterChange} style={inputStyle} /></>
// // //             )}
// // //           </label>
// // //         </div>
// // //       </fieldset>

// // //       <fieldset style={fieldsetStyle}>
// // //         <legend style={legendStyle}>Occlusion</legend>
// // //         <div>
// // //           <label style={labelStyle}>
// // //             <input type="checkbox" value="cutout" onChange={handleTechniqueChange} checked={techniques.includes('cutout')} /> Cutout
// // //             {techniques.includes('cutout') && (
// // //               <> Size: <input type="number" name="cutout_size" value={parameters.cutout_size} onChange={handleParameterChange} style={inputStyle} /></>
// // //             )}
// // //           </label>
// // //           <label style={labelStyle}><input type="checkbox" value="random_erasing" onChange={handleTechniqueChange} checked={techniques.includes('random_erasing')} /> Random Erasing</label>
// // //         </div>
// // //       </fieldset>

// // //       <fieldset style={fieldsetStyle}>
// // //         <legend style={legendStyle}>Mix Augmentations</legend>
// // //         <div>
// // //         <label style={labelStyle}>
// // //             <input type="checkbox" value="mixup" onChange={handleTechniqueChange} checked={techniques.includes('mixup')} /> MixUp
// // //             {techniques.includes('mixup') && (
// // //               <> Alpha: <input type="number" step="0.1" name="mixup_alpha" value={parameters.mixup_alpha} onChange={handleParameterChange} style={inputStyle} /></>
// // //             )}
// // //           </label>
// // //           <label style={labelStyle}><input type="checkbox" value="cutmix" onChange={handleTechniqueChange} checked={techniques.includes('cutmix')} /> CutMix</label>
// // //         </div>
// // //         <small>MixUp and CutMix require multiple images in the dataset.</small>
// // //       </fieldset>
// // //       <br />
// // //       <button onClick={startAugment} disabled={isLoading}>
// // //         {isLoading ? 'Augmenting...' : 'Start Augmentation'}
// // //       </button>
// // //       <button onClick={() => navigate('/Uploads')} style={{ marginLeft: '10px' }} disabled={isLoading}>
// // //         Cancel
// // //       </button>
// // //     </div>
// // //   );
// // // };

// // // export default Augmentation;


// // import React, { useState, useEffect, useCallback } from 'react';
// // import axios from 'axios';
// // import { useLocation, useNavigate } from 'react-router-dom';

// // // Debounce function
// // function debounce(func, delay) {
// //   let timeout;
// //   return function executedFunction(...args) {
// //     const later = () => {
// //       clearTimeout(timeout);
// //       func(...args);
// //     };
// //     clearTimeout(timeout);
// //     timeout = setTimeout(later, delay);
// //   };
// // }

// // const Augmentation = () => {
// //   const location = useLocation();
// //   const navigate = useNavigate();
// //   const { dataset, augmentationsToPreload } = location.state || {};

// //   const initialParameters = {
// //     rotation_angle: 90, scaling_factor: 1.2, translation_x: 0, translation_y: 0,
// //     crop_left: 0, crop_top: 0, crop_right: 100, crop_bottom: 100, padding_size: 0,
// //     brightness_factor: 1.0, contrast_factor: 1.0, saturation_factor: 1.0,
// //     gaussian_variance: 0.01, sap_amount: 0.005, motion_blur_size: 9,
// //     cutout_size: 50, mixup_alpha: 0.2,
// //   };

// //   const [techniques, setTechniques] = useState([]);
// //   const [parameters, setParameters] = useState(initialParameters);
// //   const [isLoading, setIsLoading] = useState(false);

// //   // --- Preview State ---
// //   const [sampleImageFilename, setSampleImageFilename] = useState('');
// //   const [originalSampleImageSrc, setOriginalSampleImageSrc] = useState('');
// //   const [previewImageSrc, setPreviewImageSrc] = useState(''); // This will hold the base64 of the preview
// //   const [activePreviewTechnique, setActivePreviewTechnique] = useState(null); // Track which technique is actively being previewed
// //   const [isPreviewLoading, setIsPreviewLoading] = useState(false);
// //   // --- End Preview State ---


// //   // Effect to load initial sample image for preview
// //   useEffect(() => {
// //     if (dataset && dataset.files && dataset.files.length > 0) {
// //       // Find the first valid image file
// //       const firstImage = dataset.files.find(file => file.match(/\.(jpg|jpeg|png)$/i));
// //       if (firstImage) {
// //         setSampleImageFilename(firstImage);
// //         const src = `http://localhost:5001/uploads/${dataset.name}/${encodeURIComponent(firstImage)}`;
// //         setOriginalSampleImageSrc(src);
// //         setPreviewImageSrc(src); // Initially, preview shows the original
// //       } else {
// //         setSampleImageFilename('');
// //         setOriginalSampleImageSrc('');
// //         setPreviewImageSrc('');
// //       }
// //     }
// //   }, [dataset]);

// //   // Effect to handle preloading augmentations
// //   useEffect(() => {
// //     if (augmentationsToPreload) {
// //       setTechniques(augmentationsToPreload.techniques || []);
// //       setParameters(prevParams => ({ ...initialParameters, ...(augmentationsToPreload.parameters || {}) }));
// //     } else {
// //       // Reset if no preload or if dataset changes without preload info
// //       setTechniques([]);
// //       setParameters(initialParameters);
// //     }
// //      // Clear active preview when preloads change (or dataset changes)
// //     setActivePreviewTechnique(null);
// //     if (originalSampleImageSrc) setPreviewImageSrc(originalSampleImageSrc);

// //   }, [augmentationsToPreload, dataset, originalSampleImageSrc]);


// //   // Debounced function to fetch preview
// //   const fetchPreview = async (tech, currentParams) => {
// //     if (!dataset || !sampleImageFilename || !tech) {
// //       setPreviewImageSrc(originalSampleImageSrc); // Revert to original if no tech for preview
// //       return;
// //     }
// //     setIsPreviewLoading(true);
// //     try {
// //       const res = await axios.post('http://localhost:5001/preview_augmentation', {
// //         datasetName: dataset.name,
// //         imageFilename: sampleImageFilename,
// //         technique: tech,
// //         parameters: currentParams, // Send all current params, backend will pick relevant ones
// //       });
// //       setPreviewImageSrc(res.data.preview_image_base64);
// //     } catch (error) {
// //       console.error("Error fetching preview for " + tech + ":", error);
// //       setPreviewImageSrc(originalSampleImageSrc); // Revert to original on error
// //     } finally {
// //       setIsPreviewLoading(false);
// //     }
// //   };
// //   // eslint-disable-next-line react-hooks/exhaustive-deps
// //   const debouncedFetchPreview = useCallback(debounce(fetchPreview, 600), [dataset, sampleImageFilename, originalSampleImageSrc]);


// //   const handleTechniqueChange = (e) => {
// //     const { value: techValue, checked } = e.target;
// //     setTechniques((prev) =>
// //       checked ? [...prev, techValue] : prev.filter((item) => item !== techValue)
// //     );
// //     if (checked) {
// //       setActivePreviewTechnique(techValue);
// //       debouncedFetchPreview(techValue, parameters);
// //     } else if (activePreviewTechnique === techValue) {
// //       // If the unchecked technique was the one being previewed, clear preview or revert
// //       setActivePreviewTechnique(null);
// //       setPreviewImageSrc(originalSampleImageSrc);
// //     }
// //   };

// //   const handleParameterChange = (e) => {
// //     const { name, value, type } = e.target;
// //     const newParams = {
// //       ...parameters,
// //       [name]: type === 'number' ? parseFloat(value) : value
// //     };
// //     setParameters(newParams);

// //     // If the parameter changed is for the currently active preview technique, update preview
// //     // This requires knowing which parameters belong to which technique, or simply re-triggering for the active one.
// //     if (activePreviewTechnique) {
// //         // A simple check: does the param name start with the active technique? (e.g. "rotation_angle" for "rotate")
// //         // This is a heuristic. A more robust way would be to map params to techniques.
// //         // For now, if any param changes and a preview is active, we assume it might be relevant.
// //         debouncedFetchPreview(activePreviewTechnique, newParams);
// //     }
// //   };

// //   const startAugment = async () => {
// //     if (techniques.length === 0) {
// //       alert("Please select at least one augmentation technique."); return;
// //     }
// //     setIsLoading(true);
// //     try {
// //       const response = await axios.post('http://localhost:5001/augment', {
// //         datasetName: dataset.name, techniques: techniques, parameters: parameters,
// //       });
// //       alert(`Augmentation complete! Run ID: ${response.data.run_id}, ZIP: ${response.data.zip_filename}`);
// //       navigate('/Uploads');
// //     } catch (error) {
// //       console.error("Augmentation error:", error);
// //       alert(`Augmentation failed: ${error.response?.data?.error || error.message}`);
// //     } finally { setIsLoading(false); }
// //   };

// //   if (!dataset) {
// //     return (<div> <p>No dataset selected...</p> <button onClick={() => navigate('/Uploads')}>Go to Uploads</button> </div>);
// //   }

// //   const inputStyle = { marginLeft: '5px', marginRight: '5px', width: '60px', padding: '4px', fontSize: '0.9em' };
// //   const labelStyle = { display: 'inline-block', marginRight: '15px', marginBottom: '10px', verticalAlign: 'top', minWidth: '200px' };
// //   const fieldsetStyle = { marginBottom: '15px', border: '1px solid #ccc', padding: '10px 15px', borderRadius: '4px' };
// //   const legendStyle = { fontWeight: 'bold', padding: '0 5px' };
// //   const previewContainerStyle = { 
// //     width: '320px', height: '320px', border: '1px solid #ddd', 
// //     display: 'flex', alignItems: 'center', justifyContent: 'center', 
// //     marginTop: '10px', backgroundColor: '#f9f9f9', position: 'relative',
// //     overflow: 'hidden' // Ensure image fits
// //   };
// //   const imageStyle = { maxWidth: '100%', maxHeight: '100%', display: 'block' };

// //   return (
// //     <div style={{ fontFamily: 'Arial, sans-serif', display: 'flex', gap: '20px', padding: '20px' }}>
// //       <div style={{ flex: 2 }}>
// //         <h2>Augment Dataset: {dataset.name}</h2>
// //         <p>Select techniques, adjust parameters, and see a live preview on a sample image.</p>
// //         {/* Fieldsets for augmentations */}
// //         <fieldset style={fieldsetStyle}> <legend style={legendStyle}>Geometric</legend> {/* ... existing inputs ... */} 
// //             <div>
// //               <label style={labelStyle}>
// //                 <input type="checkbox" value="rotate" onChange={handleTechniqueChange} checked={techniques.includes('rotate')} /> Rotate
// //                 {techniques.includes('rotate') && (<> Angle: <input type="number" name="rotation_angle" value={parameters.rotation_angle} onChange={handleParameterChange} style={inputStyle} /></>)}
// //               </label>
// //               <label style={labelStyle}>
// //                 <input type="checkbox" value="scale" onChange={handleTechniqueChange} checked={techniques.includes('scale')} /> Scale
// //                 {techniques.includes('scale') && (<> Factor: <input type="number" step="0.1" name="scaling_factor" value={parameters.scaling_factor} onChange={handleParameterChange} style={inputStyle} /></>)}
// //               </label>
// //             </div>
// //             <div>
// //               <label style={labelStyle}><input type="checkbox" value="flip_horizontal" onChange={handleTechniqueChange} checked={techniques.includes('flip_horizontal')} /> Flip Horizontal</label>
// //               <label style={labelStyle}><input type="checkbox" value="flip_vertical" onChange={handleTechniqueChange} checked={techniques.includes('flip_vertical')} /> Flip Vertical</label>
// //             </div>
// //         </fieldset>
// //         <fieldset style={fieldsetStyle}> <legend style={legendStyle}>Color</legend> {/* ... existing inputs ... */} 
// //             <div>
// //               <label style={labelStyle}>
// //                 <input type="checkbox" value="brightness" onChange={handleTechniqueChange} checked={techniques.includes('brightness')} /> Brightness
// //                 {techniques.includes('brightness') && (<> Factor: <input type="number" step="0.1" name="brightness_factor" value={parameters.brightness_factor} onChange={handleParameterChange} style={inputStyle} /></>)}
// //               </label>
// //               <label style={labelStyle}>
// //                 <input type="checkbox" value="contrast" onChange={handleTechniqueChange} checked={techniques.includes('contrast')} /> Contrast
// //                 {techniques.includes('contrast') && (<> Factor: <input type="number" step="0.1" name="contrast_factor" value={parameters.contrast_factor} onChange={handleParameterChange} style={inputStyle} /></>)}
// //               </label>
// //             </div>
// //             <div>
// //               <label style={labelStyle}>
// //                 <input type="checkbox" value="saturation" onChange={handleTechniqueChange} checked={techniques.includes('saturation')} /> Saturation
// //                 {techniques.includes('saturation') && (<> Factor: <input type="number" step="0.1" name="saturation_factor" value={parameters.saturation_factor} onChange={handleParameterChange} style={inputStyle} /></>)}
// //               </label>
// //               <label style={labelStyle}><input type="checkbox" value="grayscale" onChange={handleTechniqueChange} checked={techniques.includes('grayscale')} /> Grayscale</label>
// //             </div>
// //         </fieldset>
// //         <fieldset style={fieldsetStyle}> <legend style={legendStyle}>Noise & Blur</legend> {/* ... existing inputs ... */} 
// //             <div>
// //                 <label style={labelStyle}>
// //                     <input type="checkbox" value="gaussian_noise" onChange={handleTechniqueChange} checked={techniques.includes('gaussian_noise')} /> Gaussian Noise
// //                     {techniques.includes('gaussian_noise') && (<> Var: <input type="number" step="0.001" name="gaussian_variance" value={parameters.gaussian_variance} onChange={handleParameterChange} style={inputStyle} /></>)}
// //                 </label>
// //                 <label style={labelStyle}>
// //                     <input type="checkbox" value="salt_pepper_noise" onChange={handleTechniqueChange} checked={techniques.includes('salt_pepper_noise')} /> Salt & Pepper
// //                     {techniques.includes('salt_pepper_noise') && (<> Amount: <input type="number" step="0.001" name="sap_amount" value={parameters.sap_amount} onChange={handleParameterChange} style={inputStyle} /></>)}
// //                 </label>
// //             </div>
// //             <div>
// //                 <label style={labelStyle}><input type="checkbox" value="speckle_noise" onChange={handleTechniqueChange} checked={techniques.includes('speckle_noise')} /> Speckle Noise</label>
// //                 <label style={labelStyle}>
// //                     <input type="checkbox" value="motion_blur" onChange={handleTechniqueChange} checked={techniques.includes('motion_blur')} /> Motion Blur
// //                     {techniques.includes('motion_blur') && (<> Size: <input type="number" name="motion_blur_size" value={parameters.motion_blur_size} onChange={handleParameterChange} style={inputStyle} /></>)}
// //                 </label>
// //             </div>
// //         </fieldset>
// //         <fieldset style={fieldsetStyle}> <legend style={legendStyle}>Occlusion</legend> {/* ... existing inputs ... */} 
// //             <div>
// //                 <label style={labelStyle}>
// //                     <input type="checkbox" value="cutout" onChange={handleTechniqueChange} checked={techniques.includes('cutout')} /> Cutout
// //                     {techniques.includes('cutout') && (<> Size: <input type="number" name="cutout_size" value={parameters.cutout_size} onChange={handleParameterChange} style={inputStyle} /></>)}
// //                 </label>
// //                 <label style={labelStyle}><input type="checkbox" value="random_erasing" onChange={handleTechniqueChange} checked={techniques.includes('random_erasing')} /> Random Erasing</label>
// //             </div>
// //         </fieldset>
// //         <fieldset style={fieldsetStyle}> <legend style={legendStyle}>Mix (No Live Preview)</legend> {/* ... existing inputs ... */} 
// //             <div>
// //                 <label style={labelStyle}>
// //                     <input type="checkbox" value="mixup" onChange={handleTechniqueChange} checked={techniques.includes('mixup')} /> MixUp
// //                     {techniques.includes('mixup') && (<> Alpha: <input type="number" step="0.1" name="mixup_alpha" value={parameters.mixup_alpha} onChange={handleParameterChange} style={inputStyle} /></>)}
// //                 </label>
// //                 <label style={labelStyle}><input type="checkbox" value="cutmix" onChange={handleTechniqueChange} checked={techniques.includes('cutmix')} /> CutMix</label>
// //             </div>
// //             <small>MixUp/CutMix affect the whole dataset processing; single image preview not applicable here.</small>
// //         </fieldset>
// //         <br />
// //         <button onClick={startAugment} disabled={isLoading} style={{ padding: '10px 20px', fontSize: '1em', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
// //           {isLoading ? 'Augmenting...' : 'Start Full Augmentation'}
// //         </button>
// //         <button onClick={() => navigate('/Uploads')} style={{ marginLeft: '10px', padding: '10px 15px', fontSize: '1em', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }} disabled={isLoading}>
// //           Cancel
// //         </button>
// //       </div>

// //       <div style={{ flex: 1, position: 'sticky', top: '20px' /* For sticky preview */ }}>
// //         <h4>Live Preview on "{sampleImageFilename || 'Sample'}"</h4>
// //         <div style={previewContainerStyle}>
// //           {isPreviewLoading && <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#555'}}>Loading Preview...</div>}
// //           {previewImageSrc ? (
// //             <img src={previewImageSrc} alt="Preview" style={imageStyle} />
// //           ) : (
// //             sampleImageFilename ? <span>No preview active.</span> : <span>No sample image loaded.</span>
// //           )}
// //         </div>
// //         {activePreviewTechnique && <p style={{textAlign: 'center', fontSize: '0.9em', color: '#333'}}>Previewing: <strong>{activePreviewTechnique}</strong></p>}
// //         {!activePreviewTechnique && previewImageSrc === originalSampleImageSrc && sampleImageFilename &&
// //             <p style={{textAlign: 'center', fontSize: '0.9em', color: '#333'}}>Original Sample</p>
// //         }
// //       </div>
// //     </div>
// //   );
// // };

// // export default Augmentation;




// import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import { useLocation, useNavigate } from 'react-router-dom';

// // Debounce function
// function debounce(func, delay) {
//   let timeout;
//   return function executedFunction(...args) {
//     const later = () => {
//       clearTimeout(timeout);
//       func(...args);
//     };
//     clearTimeout(timeout);
//     timeout = setTimeout(later, delay);
//   };
// }

// const Augmentation = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { dataset, augmentationsToPreload } = location.state || {};

//   const initialParameters = {
//     rotation_angle: 90, scaling_factor: 1.2, translation_x: 10, translation_y: 10,
//     crop_left: 10, crop_top: 10, crop_right: 90, crop_bottom: 90, // Assuming these are % initially, backend expects pixels.
//     padding_size: 0, padding_color: "#000000",
//     brightness_factor: 1.0, contrast_factor: 1.0, saturation_factor: 1.0,
//     gaussian_variance: 0.01, sap_amount: 0.005, motion_blur_size: 9,
//     cutout_size: 50, mixup_alpha: 0.2,
//   };

//   const [techniques, setTechniques] = useState([]);
//   const [parameters, setParameters] = useState(initialParameters);
//   const [isLoading, setIsLoading] = useState(false); // For full augmentation process

//   // --- Preview State ---
//   const [sampleImageFilename, setSampleImageFilename] = useState('');
//   const [originalSampleImageSrc, setOriginalSampleImageSrc] = useState('');
//   const [originalImageDimensions, setOriginalImageDimensions] = useState({ width: 0, height: 0 });

//   const [singleTechniquePreviewSrc, setSingleTechniquePreviewSrc] = useState('');
//   const [activePreviewTechnique, setActivePreviewTechnique] = useState(null);
//   const [isSinglePreviewLoading, setIsSinglePreviewLoading] = useState(false);

//   const [combinedPreviewSrc, setCombinedPreviewSrc] = useState('');
//   const [isCombinedPreviewLoading, setIsCombinedPreviewLoading] = useState(false);
//   // --- End Preview State ---

//   // Load initial sample image & its dimensions
//   useEffect(() => {
//     if (dataset && dataset.files && dataset.files.length > 0) {
//       const firstImage = dataset.files.find(file => file.match(/\.(jpg|jpeg|png)$/i));
//       if (firstImage) {
//         setSampleImageFilename(firstImage);
//         const src = `http://localhost:5001/uploads/${dataset.name}/${encodeURIComponent(firstImage)}`;
//         setOriginalSampleImageSrc(src);
//         setSingleTechniquePreviewSrc(src);
//         setCombinedPreviewSrc(src);

//         const img = new Image();
//         img.onload = () => {
//           setOriginalImageDimensions({ width: img.width, height: img.height });
//           // Potentially adjust crop parameters if they are meant to be % of actual dimensions
//           // For now, assuming backend handles pixel values and frontend sends numbers
//         };
//         img.src = src;

//       } else { // No valid image found in dataset files
//         setSampleImageFilename('');
//         setOriginalSampleImageSrc('');
//         setSingleTechniquePreviewSrc('');
//         setCombinedPreviewSrc('');
//         setOriginalImageDimensions({ width: 0, height: 0 });
//       }
//     } else { // No dataset or no files
//         setSampleImageFilename('');
//         setOriginalSampleImageSrc('');
//         setSingleTechniquePreviewSrc('');
//         setCombinedPreviewSrc('');
//         setOriginalImageDimensions({ width: 0, height: 0 });
//     }
//   }, [dataset]);

//   // Prepare parameters for backend, especially for crop (convert % to pixels if needed)
//   const prepareParametersForBackend = (currentParams) => {
//     const backendParams = { ...currentParams };
//     // If crop parameters are intended as percentages:
//     // backendParams.crop_left = Math.round(currentParams.crop_left / 100 * originalImageDimensions.width);
//     // backendParams.crop_top = Math.round(currentParams.crop_top / 100 * originalImageDimensions.height);
//     // backendParams.crop_right = Math.round(currentParams.crop_right / 100 * originalImageDimensions.width);
//     // backendParams.crop_bottom = Math.round(currentParams.crop_bottom / 100 * originalImageDimensions.height);
//     // For now, sending them as is, assuming backend expects pixel values passed directly.
//     // The initialParameters for crop_right/bottom should ideally be image.width/height.
//     // If you use % in UI, ensure they are converted before sending to backend.
//     // The backend /preview_augmentation and run_augmentations for 'crop' expect pixel values.
//     return backendParams;
//   };


//   // Effect to handle preloading augmentations
//   useEffect(() => {
//     if (augmentationsToPreload) {
//       const preloadedTechniques = augmentationsToPreload.techniques || [];
//       // Merge with initialParameters to ensure all keys exist, then override with preloaded ones
//       const mergedParameters = { ...initialParameters, ...(augmentationsToPreload.parameters || {}) };
      
//       setTechniques(preloadedTechniques);
//       setParameters(mergedParameters);
      
//       if (preloadedTechniques.length > 0 && dataset && sampleImageFilename) {
//         debouncedFetchCombinedPreview(preloadedTechniques, mergedParameters);
//       } else if (originalSampleImageSrc) {
//         setCombinedPreviewSrc(originalSampleImageSrc);
//       }
//     } else {
//       setTechniques([]);
//       setParameters(initialParameters);
//       if (originalSampleImageSrc) {
//         setCombinedPreviewSrc(originalSampleImageSrc);
//       }
//     }
//     setActivePreviewTechnique(null);
//     if (originalSampleImageSrc) {
//       setSingleTechniquePreviewSrc(originalSampleImageSrc);
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [augmentationsToPreload, dataset, originalSampleImageSrc, sampleImageFilename]);


//   const fetchSingleTechniquePreview = async (tech, currentParams) => {
//     if (!dataset || !sampleImageFilename || !tech || (tech === "mixup" || tech === "cutmix")) { // Mixup/Cutmix not for single preview
//       setSingleTechniquePreviewSrc(originalSampleImageSrc);
//       setActivePreviewTechnique(null); // Clear active if not applicable
//       return;
//     }
//     setIsSinglePreviewLoading(true);
//     try {
//       const backendParams = prepareParametersForBackend(currentParams);
//       const res = await axios.post('http://localhost:5001/preview_augmentation', {
//         datasetName: dataset.name,
//         imageFilename: sampleImageFilename,
//         technique: tech,
//         parameters: backendParams,
//       });
//       setSingleTechniquePreviewSrc(res.data.preview_image_base64);
//     } catch (error) {
//       console.error("Error fetching single technique preview for " + tech + ":", error);
//       setSingleTechniquePreviewSrc(originalSampleImageSrc);
//     } finally {
//       setIsSinglePreviewLoading(false);
//     }
//   };
//   const debouncedFetchSingleTechniquePreview = useCallback(debounce(fetchSingleTechniquePreview, 600), [dataset, sampleImageFilename, originalSampleImageSrc, originalImageDimensions]);


//   const fetchCombinedPreview = async (currentTechniques, currentParams) => {
//     if (!dataset || !sampleImageFilename || currentTechniques.length === 0) {
//       setCombinedPreviewSrc(originalSampleImageSrc);
//       return;
//     }
//     setIsCombinedPreviewLoading(true);
//     try {
//       const backendParams = prepareParametersForBackend(currentParams);
//       const res = await axios.post('http://localhost:5001/preview_combined_augmentations', {
//         datasetName: dataset.name,
//         imageFilename: sampleImageFilename,
//         techniques: currentTechniques,
//         parameters: backendParams,
//       });
//       setCombinedPreviewSrc(res.data.preview_image_base64);
//     } catch (error) {
//       console.error("Error fetching combined preview:", error);
//       setCombinedPreviewSrc(originalSampleImageSrc);
//     } finally {
//       setIsCombinedPreviewLoading(false);
//     }
//   };
//   const debouncedFetchCombinedPreview = useCallback(debounce(fetchCombinedPreview, 600), [dataset, sampleImageFilename, originalSampleImageSrc, originalImageDimensions]);


//   const handleTechniqueChange = (e) => {
//     const { value: techValue, checked } = e.target;
//     let newTechniquesList;

//     if (checked) {
//       newTechniquesList = [...techniques, techValue];
//       setTechniques(newTechniquesList);
//       if (techValue !== "mixup" && techValue !== "cutmix") { // Don't set mixup/cutmix as active single preview
//           setActivePreviewTechnique(techValue);
//           debouncedFetchSingleTechniquePreview(techValue, parameters);
//       } else {
//         // If mixup/cutmix is checked, clear single active preview or revert it
//         if (activePreviewTechnique) setActivePreviewTechnique(null);
//         setSingleTechniquePreviewSrc(originalSampleImageSrc);
//       }
//     } else {
//       newTechniquesList = techniques.filter((item) => item !== techValue);
//       setTechniques(newTechniquesList);
//       if (activePreviewTechnique === techValue) {
//         setActivePreviewTechnique(null);
//         setSingleTechniquePreviewSrc(originalSampleImageSrc);
//       }
//     }
//     debouncedFetchCombinedPreview(newTechniquesList, parameters);
//   };

//   const handleParameterChange = (e) => {
//     const { name, value, type } = e.target;
//     const parsedValue = type === 'number' ? parseFloat(value) : value;
    
//     const newParams = { ...parameters, [name]: parsedValue };
//     setParameters(newParams);

//     if (activePreviewTechnique && activePreviewTechnique !== "mixup" && activePreviewTechnique !== "cutmix") {
//       debouncedFetchSingleTechniquePreview(activePreviewTechnique, newParams);
//     }
//     if (techniques.length > 0) {
//       debouncedFetchCombinedPreview(techniques, newParams);
//     }
//   };

//   const startAugment = async () => {
//     if (techniques.length === 0) {
//       alert("Please select at least one augmentation technique."); return;
//     }
//     setIsLoading(true);
//     try {
//       const backendParams = prepareParametersForBackend(parameters);
//       const response = await axios.post('http://localhost:5001/augment', {
//         datasetName: dataset.name, techniques: techniques, parameters: backendParams,
//       });
//       alert(`Augmentation complete! Run ID: ${response.data.run_id}, ZIP: ${response.data.zip_filename}`);
//       navigate('/Uploads');
//     } catch (error) {
//       console.error("Augmentation error:", error);
//       alert(`Augmentation failed: ${error.response?.data?.error || error.message}`);
//     } finally { setIsLoading(false); }
//   };

//   if (!dataset) {
//     return (
//       <div style={{ padding: '20px' }}>
//         <p>No dataset selected or dataset information is missing.</p>
//         <button onClick={() => navigate('/Uploads')}>Go to Uploads Page</button>
//       </div>
//     );
//   }

//   const inputStyle = { marginLeft: '5px', marginRight: '5px', width: '70px', padding: '4px', fontSize: '0.9em', borderRadius: '3px', border: '1px solid #ccc' };
//   const labelStyle = { display: 'flex', alignItems: 'center', marginRight: '15px', marginBottom: '10px', verticalAlign: 'top', minWidth: '230px' };
//   const fieldsetStyle = { marginBottom: '15px', border: '1px solid #ccc', padding: '10px 15px', borderRadius: '4px' };
//   const legendStyle = { fontWeight: 'bold', padding: '0 5px' };
  
//   const previewBoxStyle = {
//     width: '100%', 
//     minHeight: '200px',
//     maxHeight: '280px', // Max height for consistency
//     border: '1px solid #ddd',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#f9f9f9',
//     position: 'relative',
//     overflow: 'hidden',
//     marginBottom: '15px',
//     borderRadius: '4px',
//   };
//   const imageStyle = { maxWidth: '100%', maxHeight: '100%', display: 'block', objectFit: 'contain' };
//   const previewLoadingStyle = {position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#555', background: 'rgba(255,255,255,0.7)', padding: '10px', borderRadius: '4px'};
//   const previewTitleStyle = {textAlign: 'center', fontWeight:'bold', marginBottom:'5px', fontSize: '0.95em', color: '#333'};

//   // Define techniques and their parameters for dynamic form generation
//   const allTechniquesAndParams = [
//     {
//         category: "Geometric",
//         fields: [
//             { tech: "rotate", label: "Rotate", param: "rotation_angle", type: "number", defaultVal: 90, step: 1, unit: "°" },
//             { tech: "scale", label: "Scale", param: "scaling_factor", type: "number", defaultVal: 1.2, step: 0.05, min:0.1 },
//             { tech: "translate", label: "Translate", params: [
//                 { name: "translation_x", label: "X:", type: "number", defaultVal: 10, step: 1, unit: "px" },
//                 { name: "translation_y", label: "Y:", type: "number", defaultVal: 10, step: 1, unit: "px" }
//             ]},
//             { tech: "flip_horizontal", label: "Flip Horizontal" },
//             { tech: "flip_vertical", label: "Flip Vertical" },
//             { tech: "crop", label: "Crop", params: [ // Assuming pixel values.
//                 { name: "crop_left", label: "L:", type: "number", defaultVal: 10, step: 1, unit: "px" },
//                 { name: "crop_top", label: "T:", type: "number", defaultVal: 10, step: 1, unit: "px" },
//                 { name: "crop_right", label: "R:", type: "number", defaultVal: originalImageDimensions.width > 0 ? originalImageDimensions.width - 10 : 90, step: 1, unit: "px" },
//                 { name: "crop_bottom", label: "B:", type: "number", defaultVal: originalImageDimensions.height > 0 ? originalImageDimensions.height - 10 : 90, step: 1, unit: "px" }
//             ]},
//             { tech: "pad", label: "Pad", params: [
//                 { name: "padding_size", label: "Size:", type: "number", defaultVal: 10, step: 1, min: 0, unit: "px" },
//                 { name: "padding_color", label: "Color:", type: "text", defaultVal: "#000000", style: {width: '80px'} }
//             ]}
//         ]
//     },
//     {
//         category: "Color",
//         fields: [
//             { tech: "brightness", label: "Brightness", param: "brightness_factor", type: "number", defaultVal: 1.0, step: 0.1, min:0 },
//             { tech: "contrast", label: "Contrast", param: "contrast_factor", type: "number", defaultVal: 1.0, step: 0.1, min:0 },
//             { tech: "saturation", label: "Saturation", param: "saturation_factor", type: "number", defaultVal: 1.0, step: 0.1, min:0 },
//             { tech: "grayscale", label: "Grayscale" }
//         ]
//     },
//     {
//         category: "Noise & Blur",
//         fields: [
//             { tech: "gaussian_noise", label: "Gaussian Noise", param: "gaussian_variance", type: "number", defaultVal: 0.01, step: 0.001, min: 0, max: 0.1},
//             { tech: "salt_pepper_noise", label: "Salt & Pepper", param: "sap_amount", type: "number", defaultVal: 0.005, step: 0.001, min: 0, max: 0.1 },
//             { tech: "speckle_noise", label: "Speckle Noise" },
//             { tech: "motion_blur", label: "Motion Blur", param: "motion_blur_size", type: "number", defaultVal: 9, step: 2, min: 3 }
//         ]
//     },
//     {
//         category: "Occlusion",
//         fields: [
//             { tech: "cutout", label: "Cutout", param: "cutout_size", type: "number", defaultVal: 50, step: 1, min: 0, unit: "px" },
//             { tech: "random_erasing", label: "Random Erasing" } 
//         ]
//     },
//     {
//         category: "Mix (Combined Preview Only)",
//         fields: [
//             { tech: "mixup", label: "MixUp", param: "mixup_alpha", type: "number", defaultVal: 0.2, step: 0.1, min: 0 },
//             { tech: "cutmix", label: "CutMix" }
//         ],
//         note: "MixUp/CutMix use random images from the dataset. Single technique preview is not applicable."
//     }
//   ];

//   return (
//     <div style={{ fontFamily: 'Arial, sans-serif', display: 'flex', gap: '20px', padding: '20px', flexDirection: window.innerWidth < 900 ? 'column' : 'row' }}>
//       <div style={{ flex: 2, minWidth: '350px', overflowY: 'auto', maxHeight: '90vh' }}>
//         <h2>Augment Dataset: {dataset.name}</h2>
//         <p style={{fontSize: '0.9em', color: '#555'}}>Select techniques and adjust parameters. Previews will update on the right (or below on smaller screens).</p>

//         {allTechniquesAndParams.map(group => (
//             <fieldset key={group.category} style={fieldsetStyle}>
//                 <legend style={legendStyle}>{group.category}</legend>
//                 {group.fields.map(field => (
//                     <div key={field.tech} style={{ marginBottom: '8px' }}>
//                         <label style={{...labelStyle, cursor: 'pointer'}}>
//                             <input
//                                 type="checkbox"
//                                 value={field.tech}
//                                 onChange={handleTechniqueChange}
//                                 checked={techniques.includes(field.tech)}
//                                 style={{ marginRight: '8px', transform: 'scale(1.1)' }}
//                             />
//                             <span style={{fontWeight: '500', minWidth: '130px', display:'inline-block'}}>{field.label}</span>
//                             {techniques.includes(field.tech) && (
//                                 <div style={{display: 'flex', alignItems: 'center', flexWrap: 'wrap', marginLeft: '10px'}}>
//                                     {field.param && ( /* Single parameter */
//                                         <>
//                                         <input
//                                             type={field.type}
//                                             name={field.param}
//                                             value={parameters[field.param] === undefined ? field.defaultVal : parameters[field.param]}
//                                             onChange={handleParameterChange}
//                                             style={{...inputStyle, ...field.style}}
//                                             step={field.step}
//                                             min={field.min}
//                                             max={field.max}
//                                         />
//                                         {field.unit && <span style={{fontSize:'0.8em', marginLeft:'3px'}}>{field.unit}</span>}
//                                         </>
//                                     )}
//                                     {field.params && field.params.map(p => ( /* Multiple parameters */
//                                       <React.Fragment key={p.name}>
//                                         <label htmlFor={p.name} style={{ marginLeft: '5px', fontSize: '0.85em', marginRight: '3px' }}>{p.label}</label>
//                                         <input
//                                             type={p.type}
//                                             name={p.name}
//                                             id={p.name}
//                                             value={parameters[p.name] === undefined ? p.defaultVal : parameters[p.name]}
//                                             onChange={handleParameterChange}
//                                             style={{...inputStyle, width: p.type === 'text' || p.type ==='color' ? '80px': '50px', marginRight: '3px', ...p.style }}
//                                             step={p.step}
//                                             min={p.min}
//                                             max={p.max}
//                                         />
//                                         {p.unit && <span style={{fontSize:'0.8em', marginRight:'5px'}}>{p.unit}</span>}
//                                       </React.Fragment>
//                                     ))}
//                                 </div>
//                             )}
//                         </label>
//                     </div>
//                 ))}
//                 {group.note && <small style={{ display: 'block', marginTop: '5px', color: '#555', fontSize: '0.85em' }}>{group.note}</small>}
//             </fieldset>
//         ))}
//         <br />
//         <button 
//           onClick={startAugment} 
//           disabled={isLoading || isSinglePreviewLoading || isCombinedPreviewLoading} 
//           style={{ padding: '10px 20px', fontSize: '1em', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: (isLoading || isSinglePreviewLoading || isCombinedPreviewLoading) ? 0.6 : 1 }}
//         >
//           {isLoading ? 'Augmenting...' : 'Start Full Augmentation'}
//         </button>
//         <button 
//           onClick={() => navigate('/Uploads')} 
//           style={{ marginLeft: '10px', padding: '10px 15px', fontSize: '1em', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }} 
//           disabled={isLoading}
//         >
//           Cancel
//         </button>
//       </div>

//       <div style={{ flex: 1, position: 'sticky', top: '20px', minWidth: '280px', maxHeight: '90vh', overflowY: 'auto', paddingLeft: '10px' }}>
//         <h4 style={{textAlign: 'center', marginBottom: '15px'}}>Live Previews on "{sampleImageFilename || 'Sample'}"</h4>
        
//         <div>
//             <p style={previewTitleStyle}>Original Image</p>
//             <div style={previewBoxStyle}>
//             {originalSampleImageSrc ? (
//                 <img src={originalSampleImageSrc} alt="Original Sample" style={imageStyle} />
//             ) : (
//                 sampleImageFilename ? <span>Loading original...</span> : <span>No sample image loaded.</span>
//             )}
//             </div>
//         </div>

//         <div>
//             <p style={previewTitleStyle}>
//                 Active Technique: {activePreviewTechnique ? <strong>{activePreviewTechnique}</strong> : "None"}
//             </p>
//             <div style={previewBoxStyle}>
//             {isSinglePreviewLoading && <div style={previewLoadingStyle}>Loading...</div>}
//             {!isSinglePreviewLoading && singleTechniquePreviewSrc && singleTechniquePreviewSrc !== originalSampleImageSrc ? (
//                 <img src={singleTechniquePreviewSrc} alt="Single Technique Preview" style={imageStyle} />
//             ) : (
//                 !isSinglePreviewLoading && (activePreviewTechnique ? <span>Preview will appear here.</span> : <span>Select a technique (not MixUp/CutMix) or adjust its parameters.</span>)
//             )}
//             </div>
//         </div>

//         <div>
//             <p style={previewTitleStyle}>
//                 Combined (All Selected Techniques)
//             </p>
//             <div style={previewBoxStyle}>
//             {isCombinedPreviewLoading && <div style={previewLoadingStyle}>Loading...</div>}
//             {!isCombinedPreviewLoading && combinedPreviewSrc && combinedPreviewSrc !== originalSampleImageSrc ? (
//                 <img src={combinedPreviewSrc} alt="Combined Techniques Preview" style={imageStyle} />
//             ) : (
//                  !isCombinedPreviewLoading && (techniques.length > 0 ? <span>Preview will appear here.</span> : <span>Select one or more techniques.</span>)
//             )}
//             </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Augmentation;



import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

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

  const initialParameters = {
    rotation_angle: 90, scaling_factor: 1.2, translation_x: 10, translation_y: 10,
    crop_left: 10, crop_top: 10, crop_right: 90, crop_bottom: 90, 
    padding_size: 0, padding_color: "#000000",
    brightness_factor: 1.0, contrast_factor: 1.0, saturation_factor: 1.0,
    gaussian_variance: 0.01, sap_amount: 0.005, motion_blur_size: 9,
    cutout_size: 50, mixup_alpha: 0.2,
  };

  const [techniques, setTechniques] = useState([]);
  const [parameters, setParameters] = useState(initialParameters);
  const [isLoading, setIsLoading] = useState(false);

  const [sampleImageFilename, setSampleImageFilename] = useState('');
  const [originalSampleImageSrc, setOriginalSampleImageSrc] = useState('');
  const [originalImageDimensions, setOriginalImageDimensions] = useState({ width: 0, height: 0 });

  const [singleTechniquePreviewSrc, setSingleTechniquePreviewSrc] = useState('');
  const [activePreviewTechnique, setActivePreviewTechnique] = useState(null);
  const [isSinglePreviewLoading, setIsSinglePreviewLoading] = useState(false);

  const [combinedPreviewSrc, setCombinedPreviewSrc] = useState('');
  const [isCombinedPreviewLoading, setIsCombinedPreviewLoading] = useState(false);

  useEffect(() => {
    if (dataset && dataset.files && dataset.files.length > 0) {
      const firstImage = dataset.files.find(file => file.match(/\.(jpg|jpeg|png)$/i));
      if (firstImage) {
        setSampleImageFilename(firstImage);
        const src = `http://localhost:5001/uploads/${dataset.name}/${encodeURIComponent(firstImage)}`;
        setOriginalSampleImageSrc(src);
        setSingleTechniquePreviewSrc(src);
        setCombinedPreviewSrc(src);
        const img = new Image();
        img.onload = () => {
          setOriginalImageDimensions({ width: img.width, height: img.height });
          // Update initial crop_right/bottom based on loaded image dimensions if they are default
          setParameters(prevParams => {
            const updatedParams = {...prevParams};
            if (prevParams.crop_right === 90 && img.width > 0) { // Assuming 90 was a placeholder
                updatedParams.crop_right = img.width - 10 > 0 ? img.width -10 : img.width;
            }
            if (prevParams.crop_bottom === 90 && img.height > 0) { // Assuming 90 was a placeholder
                updatedParams.crop_bottom = img.height - 10 > 0 ? img.height - 10 : img.height;
            }
            return updatedParams;
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

  const prepareParametersForBackend = (currentParams) => {
    const backendParams = { ...currentParams };
    // Ensure crop parameters are pixel values and within bounds, if they were %
    // For 'crop_right' and 'crop_bottom', they should be absolute pixel coordinates.
    // Example: if UI used percentages for crop_left=10%, crop_right=90% (of width)
    // backendParams.crop_left = Math.round(currentParams.crop_left / 100 * originalImageDimensions.width);
    // backendParams.crop_right = Math.round(currentParams.crop_right / 100 * originalImageDimensions.width);
    // This example assumes crop_right was a percentage point, not a width.
    // The current setup assumes direct pixel values are managed and sent.
    // Let's ensure crop_right and crop_bottom are at least as large as left/top
    if (backendParams.crop_right < backendParams.crop_left) backendParams.crop_right = backendParams.crop_left +1;
    if (backendParams.crop_bottom < backendParams.crop_top) backendParams.crop_bottom = backendParams.crop_top +1;

    // Ensure crop values are within image dimensions (backend also clips, but good practice)
    if (originalImageDimensions.width > 0) {
        backendParams.crop_left = Math.max(0, Math.min(backendParams.crop_left, originalImageDimensions.width));
        backendParams.crop_right = Math.max(0, Math.min(backendParams.crop_right, originalImageDimensions.width));
    }
    if (originalImageDimensions.height > 0) {
        backendParams.crop_top = Math.max(0, Math.min(backendParams.crop_top, originalImageDimensions.height));
        backendParams.crop_bottom = Math.max(0, Math.min(backendParams.crop_bottom, originalImageDimensions.height));
    }
    return backendParams;
  };

  useEffect(() => {
    if (augmentationsToPreload) {
      const preloadedTechniques = augmentationsToPreload.techniques || [];
      const mergedParameters = { ...initialParameters, ...(augmentationsToPreload.parameters || {}) };
      setTechniques(preloadedTechniques);
      setParameters(mergedParameters);
      if (preloadedTechniques.length > 0 && dataset && sampleImageFilename) {
        debouncedFetchCombinedPreview(preloadedTechniques, mergedParameters);
      } else if (originalSampleImageSrc) {
        setCombinedPreviewSrc(originalSampleImageSrc);
      }
    } else {
      setTechniques([]);
      setParameters(initialParameters); // Reset to initial defaults
      if (originalSampleImageSrc) {
        setCombinedPreviewSrc(originalSampleImageSrc);
      }
    }
    setActivePreviewTechnique(null);
    if (originalSampleImageSrc) {
      setSingleTechniquePreviewSrc(originalSampleImageSrc);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [augmentationsToPreload, dataset, originalSampleImageSrc, sampleImageFilename]);

  const fetchSingleTechniquePreview = async (tech, currentParams) => {
    if (!dataset || !sampleImageFilename || !tech || (tech === "mixup" || tech === "cutmix")) {
      setSingleTechniquePreviewSrc(originalSampleImageSrc);
      if (tech === "mixup" || tech === "cutmix") setActivePreviewTechnique(null);
      return;
    }
    setIsSinglePreviewLoading(true);
    try {
      const backendParams = prepareParametersForBackend(currentParams);
      const res = await axios.post('http://localhost:5001/preview_augmentation', {
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
  };
  const debouncedFetchSingleTechniquePreview = useCallback(debounce(fetchSingleTechniquePreview, 600), [dataset, sampleImageFilename, originalSampleImageSrc, originalImageDimensions]);

  const fetchCombinedPreview = async (currentTechniques, currentParams) => {
    if (!dataset || !sampleImageFilename || currentTechniques.length === 0) {
      setCombinedPreviewSrc(originalSampleImageSrc);
      return;
    }
    setIsCombinedPreviewLoading(true);
    try {
      const backendParams = prepareParametersForBackend(currentParams);
      const res = await axios.post('http://localhost:5001/preview_combined_augmentations', {
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
  };
  const debouncedFetchCombinedPreview = useCallback(debounce(fetchCombinedPreview, 600), [dataset, sampleImageFilename, originalSampleImageSrc, originalImageDimensions]);

  const handleTechniqueChange = (e) => {
    const { value: techValue, checked } = e.target;
    let newTechniquesList;
    if (checked) {
      newTechniquesList = [...techniques, techValue];
      setTechniques(newTechniquesList);
      if (techValue !== "mixup" && techValue !== "cutmix") {
          setActivePreviewTechnique(techValue);
          debouncedFetchSingleTechniquePreview(techValue, parameters);
      } else {
        if (activePreviewTechnique) setActivePreviewTechnique(null);
        setSingleTechniquePreviewSrc(originalSampleImageSrc);
      }
    } else {
      newTechniquesList = techniques.filter((item) => item !== techValue);
      setTechniques(newTechniquesList);
      if (activePreviewTechnique === techValue) {
        setActivePreviewTechnique(null);
        setSingleTechniquePreviewSrc(originalSampleImageSrc);
      }
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
      const response = await axios.post('http://localhost:5001/augment', {
        datasetName: dataset.name, techniques: techniques, parameters: backendParams,
      });
      alert(`Augmentation complete! Run ID: ${response.data.run_id}, ZIP: ${response.data.zip_filename}`);
      navigate('/Uploads');
    } catch (error) {
      console.error("Augmentation error:", error);
      alert(`Augmentation failed: ${error.response?.data?.error || error.message}`);
    } finally { setIsLoading(false); }
  };

  if (!dataset) {
    return (
      <div style={{ padding: '20px' }}>
        <p>No dataset selected or dataset information is missing.</p>
        <button onClick={() => navigate('/Uploads')}>Go to Uploads Page</button>
      </div>
    );
  }

  const inputStyle = { marginLeft: '5px', marginRight: '5px', width: '70px', padding: '4px', fontSize: '0.9em', borderRadius: '3px', border: '1px solid #ccc' };
  const labelStyle = { display: 'flex', alignItems: 'center', marginRight: '15px', marginBottom: '10px', verticalAlign: 'top', minWidth: '230px' };
  const fieldsetStyle = { marginBottom: '15px', border: '1px solid #ccc', padding: '10px 15px', borderRadius: '4px' };
  const legendStyle = { fontWeight: 'bold', padding: '0 5px' };
  const previewBoxStyle = {
    width: '100%', minHeight: '200px', maxHeight: '280px', border: '1px solid #ddd',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#f9f9f9', position: 'relative', overflow: 'hidden',
    marginBottom: '15px', borderRadius: '4px',
  };
  const imageStyle = { maxWidth: '100%', maxHeight: '100%', display: 'block', objectFit: 'contain' };
  const previewLoadingStyle = {position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#555', background: 'rgba(255,255,255,0.7)', padding: '10px', borderRadius: '4px'};
  const previewTitleStyle = {textAlign: 'center', fontWeight:'bold', marginBottom:'5px', fontSize: '0.95em', color: '#333'};

  const allTechniquesAndParams = [
    { category: "Geometric", fields: [
        { tech: "rotate", label: "Rotate", param: "rotation_angle", type: "number", defaultVal: parameters.rotation_angle, step: 1, unit: "°" },
        { tech: "scale", label: "Scale", param: "scaling_factor", type: "number", defaultVal: parameters.scaling_factor, step: 0.05, min:0.1 },
        { tech: "translate", label: "Translate", params: [
            { name: "translation_x", label: "X:", type: "number", defaultVal: parameters.translation_x, step: 1, unit: "px" },
            { name: "translation_y", label: "Y:", type: "number", defaultVal: parameters.translation_y, step: 1, unit: "px" }
        ]},
        { tech: "flip_horizontal", label: "Flip Horizontal" }, { tech: "flip_vertical", label: "Flip Vertical" },
        { tech: "crop", label: "Crop", params: [
            { name: "crop_left", label: "L:", type: "number", defaultVal: parameters.crop_left, step: 1, unit: "px", max: originalImageDimensions.width-1 },
            { name: "crop_top", label: "T:", type: "number", defaultVal: parameters.crop_top, step: 1, unit: "px", max: originalImageDimensions.height-1 },
            { name: "crop_right", label: "R:", type: "number", defaultVal: parameters.crop_right, step: 1, unit: "px", max: originalImageDimensions.width },
            { name: "crop_bottom", label: "B:", type: "number", defaultVal: parameters.crop_bottom, step: 1, unit: "px", max: originalImageDimensions.height }
        ]},
        { tech: "pad", label: "Pad", params: [
            { name: "padding_size", label: "Size:", type: "number", defaultVal: parameters.padding_size, step: 1, min: 0, unit: "px" },
            { name: "padding_color", label: "Color:", type: "text", defaultVal: parameters.padding_color, style: {width: '80px'} }
        ]}
    ]},
    { category: "Color", fields: [
        { tech: "brightness", label: "Brightness", param: "brightness_factor", type: "number", defaultVal: parameters.brightness_factor, step: 0.1, min:0 },
        { tech: "contrast", label: "Contrast", param: "contrast_factor", type: "number", defaultVal: parameters.contrast_factor, step: 0.1, min:0 },
        { tech: "saturation", label: "Saturation", param: "saturation_factor", type: "number", defaultVal: parameters.saturation_factor, step: 0.1, min:0 },
        { tech: "grayscale", label: "Grayscale" }
    ]},
    { category: "Noise & Blur", fields: [
        { tech: "gaussian_noise", label: "Gaussian Noise", param: "gaussian_variance", type: "number", defaultVal: parameters.gaussian_variance, step: 0.001, min: 0, max: 0.1},
        { tech: "salt_pepper_noise", label: "Salt & Pepper", param: "sap_amount", type: "number", defaultVal: parameters.sap_amount, step: 0.001, min: 0, max: 0.1 },
        { tech: "speckle_noise", label: "Speckle Noise" },
        { tech: "motion_blur", label: "Motion Blur", param: "motion_blur_size", type: "number", defaultVal: parameters.motion_blur_size, step: 2, min: 3 }
    ]},
    { category: "Occlusion", fields: [
        { tech: "cutout", label: "Cutout", param: "cutout_size", type: "number", defaultVal: parameters.cutout_size, step: 1, min: 0, unit: "px" },
        { tech: "random_erasing", label: "Random Erasing" }
    ]},
    { category: "Mix (Combined Preview Only)", fields: [
        { tech: "mixup", label: "MixUp", param: "mixup_alpha", type: "number", defaultVal: parameters.mixup_alpha, step: 0.1, min: 0 },
        { tech: "cutmix", label: "CutMix" }
    ], note: "MixUp/CutMix use random images from the dataset. Single technique preview is not applicable." }
  ];

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', display: 'flex', gap: '20px', padding: '20px', flexDirection: window.innerWidth < 900 ? 'column' : 'row' }}>
      <div style={{ flex: 2, minWidth: '350px', overflowY: 'auto', maxHeight: '90vh', paddingRight:'10px' }}>
        <h2>Augment Dataset: {dataset.name}</h2>
        <p style={{fontSize: '0.9em', color: '#555'}}>Select techniques and adjust parameters. Previews will update on the right (or below on smaller screens).</p>
        {allTechniquesAndParams.map(group => (
            <fieldset key={group.category} style={fieldsetStyle}>
                <legend style={legendStyle}>{group.category}</legend>
                {group.fields.map(field => (
                    <div key={field.tech} style={{ marginBottom: '8px' }}>
                        <label style={{...labelStyle, cursor: 'pointer'}}>
                            <input type="checkbox" value={field.tech} onChange={handleTechniqueChange} checked={techniques.includes(field.tech)} style={{ marginRight: '8px', transform: 'scale(1.1)' }}/>
                            <span style={{fontWeight: '500', minWidth: '130px', display:'inline-block'}}>{field.label}</span>
                            {techniques.includes(field.tech) && (
                                <div style={{display: 'flex', alignItems: 'center', flexWrap: 'wrap', marginLeft: '10px'}}>
                                    {field.param && (
                                        <>
                                        <input type={field.type} name={field.param} value={parameters[field.param] === undefined ? field.defaultVal : parameters[field.param]} onChange={handleParameterChange} style={{...inputStyle, ...field.style}} step={field.step} min={field.min} max={field.max}/>
                                        {field.unit && <span style={{fontSize:'0.8em', marginLeft:'3px'}}>{field.unit}</span>}
                                        </>
                                    )}
                                    {field.params && field.params.map(p => (
                                      <React.Fragment key={p.name}>
                                        <label htmlFor={p.name} style={{ marginLeft: '5px', fontSize: '0.85em', marginRight: '3px' }}>{p.label}</label>
                                        <input type={p.type} name={p.name} id={p.name} value={parameters[p.name] === undefined ? p.defaultVal : parameters[p.name]} onChange={handleParameterChange} style={{...inputStyle, width: p.type === 'text' || p.type ==='color' ? '80px': '50px', marginRight: '3px', ...p.style }} step={p.step} min={p.min} max={p.max}/>
                                        {p.unit && <span style={{fontSize:'0.8em', marginRight:'5px'}}>{p.unit}</span>}
                                      </React.Fragment>
                                    ))}
                                </div>
                            )}
                        </label>
                    </div>
                ))}
                {group.note && <small style={{ display: 'block', marginTop: '5px', color: '#555', fontSize: '0.85em' }}>{group.note}</small>}
            </fieldset>
        ))}
        <br />
        <button onClick={startAugment} disabled={isLoading || isSinglePreviewLoading || isCombinedPreviewLoading} style={{ padding: '10px 20px', fontSize: '1em', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: (isLoading || isSinglePreviewLoading || isCombinedPreviewLoading) ? 0.6 : 1 }}>
          {isLoading ? 'Augmenting...' : 'Start Full Augmentation'}
        </button>
        <button onClick={() => navigate('/Uploads')} style={{ marginLeft: '10px', padding: '10px 15px', fontSize: '1em', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }} disabled={isLoading}>
          Cancel
        </button>
      </div>
      <div style={{ flex: 1, position: 'sticky', top: '20px', minWidth: '280px', maxHeight: '90vh', overflowY: 'auto', paddingLeft: '10px' }}>
        <h4 style={{textAlign: 'center', marginBottom: '15px'}}>Live Previews on "{sampleImageFilename || 'Sample'}"</h4>
        <div>
            <p style={previewTitleStyle}>Original Image</p>
            <div style={previewBoxStyle}>
            {originalSampleImageSrc ? (<img src={originalSampleImageSrc} alt="Original Sample" style={imageStyle} />) : (sampleImageFilename ? <span>Loading original...</span> : <span>No sample image loaded.</span>)}
            </div>
        </div>
        <div>
            <p style={previewTitleStyle}>Active Technique: {activePreviewTechnique ? <strong>{activePreviewTechnique}</strong> : "None"}</p>
            <div style={previewBoxStyle}>
            {isSinglePreviewLoading && <div style={previewLoadingStyle}>Loading...</div>}
            {!isSinglePreviewLoading && singleTechniquePreviewSrc && singleTechniquePreviewSrc !== originalSampleImageSrc ? (<img src={singleTechniquePreviewSrc} alt="Single Technique Preview" style={imageStyle} />) : (!isSinglePreviewLoading && (activePreviewTechnique ? <span>Preview will appear here.</span> : <span>Select a technique (not MixUp/CutMix) or adjust its parameters.</span>))}
            </div>
        </div>
        <div>
            <p style={previewTitleStyle}>Combined (All Selected Techniques)</p>
            <div style={previewBoxStyle}>
            {isCombinedPreviewLoading && <div style={previewLoadingStyle}>Loading...</div>}
            {!isCombinedPreviewLoading && combinedPreviewSrc && combinedPreviewSrc !== originalSampleImageSrc ? (<img src={combinedPreviewSrc} alt="Combined Techniques Preview" style={imageStyle} />) : (!isCombinedPreviewLoading && (techniques.length > 0 ? <span>Preview will appear here.</span> : <span>Select one or more techniques.</span>))}
            </div>
        </div>
      </div>
    </div>
  );
};
export default Augmentation;