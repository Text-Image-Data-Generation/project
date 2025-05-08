// // // // Augmentation.js
// // // import React, { useState } from 'react';
// // // import axios from 'axios';
// // // import { useLocation, useNavigate } from 'react-router-dom';

// // // const Augmentation = () => {
// // //   const { state } = useLocation();
// // //   const { dataset } = state;
// // //   const [augmentations, setAugmentations] = useState([]);
// // //   const navigate = useNavigate();

// // //   const handleChange = (e) => {
// // //     const { value, checked } = e.target;
// // //     setAugmentations((prev) =>
// // //       checked ? [...prev, value] : prev.filter((item) => item !== value)
// // //     );
// // //   };

// // //   const startAugment = async () => {
// // //     await axios.post('http://localhost:5001/augment', {
// // //       datasetName: dataset.name,
// // //       augmentations,
// // //     });
// // //     alert("Augmentation complete!");
// // //     navigate('/Uploads');
// // //   };

// // //   return (
// // //     <div>
// // //       <h2>Augment Dataset: {dataset.name}</h2>
// // //       <label><input type="checkbox" value="rotate" onChange={handleChange} /> Rotate</label>
// // //       <label><input type="checkbox" value="scale" onChange={handleChange} /> Scale</label>
// // //       <label><input type="checkbox" value="flip_horizontal" onChange={handleChange} /> Flip Horizontal</label>
// // //       <label><input type="checkbox" value="flip_vertical" onChange={handleChange} /> Flip Vertical</label>
// // //       <br />
// // //       <button onClick={startAugment}>Start Augment</button>
// // //     </div>
// // //   );
// // // };

// // // export default Augmentation;



// // import React, { useState, useEffect } from 'react';
// // import axios from 'axios';
// // import { useLocation, useNavigate } from 'react-router-dom';

// // const Augmentation = () => {
// //   const location = useLocation();
// //   const navigate = useNavigate();
// //   const { dataset, augmentationsToPreload } = location.state || {};

// //   const initialParameters = {
// //     rotation_angle: 90,
// //     scaling_factor: 1.2,
// //     translation_x: 0,
// //     translation_y: 0,
// //     crop_left: 0,
// //     crop_top: 0,
// //     crop_right: 100, // Assuming percentage or to be replaced by actual image width
// //     crop_bottom: 100, // Assuming percentage or to be replaced by actual image height
// //     padding_size: 0,
// //     brightness_factor: 1.0,
// //     contrast_factor: 1.0,
// //     saturation_factor: 1.0,
// //     gaussian_variance: 0.01,
// //     sap_amount: 0.005,
// //     motion_blur_size: 9,
// //     cutout_size: 50,
// //     mixup_alpha: 0.2,
// //   };

// //   const [techniques, setTechniques] = useState([]);
// //   const [parameters, setParameters] = useState(initialParameters);
// //   const [isLoading, setIsLoading] = useState(false);

// //   useEffect(() => {
// //     if (augmentationsToPreload) {
// //       setTechniques(augmentationsToPreload.techniques || []);
// //       setParameters(prevParams => ({ ...initialParameters, ...prevParams, ...(augmentationsToPreload.parameters || {}) }));
// //     }
// //   }, [augmentationsToPreload]);

// //   if (!dataset) {
// //     return (
// //         <div>
// //             <p>No dataset selected. Please go back to Uploads and select a dataset to augment.</p>
// //             <button onClick={() => navigate('/Uploads')}>Go to Uploads</button>
// //         </div>
// //     );
// //   }


// //   const handleTechniqueChange = (e) => {
// //     const { value, checked } = e.target;
// //     setTechniques((prev) =>
// //       checked ? [...prev, value] : prev.filter((item) => item !== value)
// //     );
// //   };

// //   const handleParameterChange = (e) => {
// //     const { name, value, type } = e.target;
// //     setParameters(prev => ({
// //       ...prev,
// //       [name]: type === 'number' ? parseFloat(value) : value
// //     }));
// //   };

// //   const startAugment = async () => {
// //     if (techniques.length === 0) {
// //       alert("Please select at least one augmentation technique.");
// //       return;
// //     }
// //     setIsLoading(true);
// //     try {
// //       const response = await axios.post('http://localhost:5001/augment', {
// //         datasetName: dataset.name,
// //         techniques: techniques,
// //         parameters: parameters,
// //       });
// //       alert(`Augmentation complete! Augmented ZIP: ${response.data.zip_filename}`);
// //       navigate('/Uploads');
// //     } catch (error) {
// //       console.error("Augmentation error:", error);
// //       alert(`Augmentation failed: ${error.response?.data?.error || error.message}`);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   const inputStyle = { marginLeft: '5px', marginRight: '15px', width: '60px' };
// //   const labelStyle = { display: 'inline-block', marginRight: '20px', marginBottom: '10px', width: 'auto' };

// //   return (
// //     <div>
// //       <h2>Augment Dataset: {dataset.name}</h2>
// //       <p>Select techniques and adjust parameters as needed.</p>

// //       <fieldset style={{ marginBottom: '15px' }}>
// //         <legend>Geometric Transformations</legend>
// //         <div>
// //           <label style={labelStyle}>
// //             <input type="checkbox" value="rotate" onChange={handleTechniqueChange} checked={techniques.includes('rotate')} /> Rotate
// //             {techniques.includes('rotate') && (
// //               <> Angle: <input type="number" name="rotation_angle" value={parameters.rotation_angle} onChange={handleParameterChange} style={inputStyle} /></>
// //             )}
// //           </label>
// //           <label style={labelStyle}>
// //             <input type="checkbox" value="scale" onChange={handleTechniqueChange} checked={techniques.includes('scale')} /> Scale
// //             {techniques.includes('scale') && (
// //               <> Factor: <input type="number" step="0.1" name="scaling_factor" value={parameters.scaling_factor} onChange={handleParameterChange} style={inputStyle} /></>
// //             )}
// //           </label>
// //         </div>
// //         <div>
// //           <label style={labelStyle}><input type="checkbox" value="flip_horizontal" onChange={handleTechniqueChange} checked={techniques.includes('flip_horizontal')} /> Flip Horizontal</label>
// //           <label style={labelStyle}><input type="checkbox" value="flip_vertical" onChange={handleTechniqueChange} checked={techniques.includes('flip_vertical')} /> Flip Vertical</label>
// //         </div>
// //         {/* Add Translate, Crop, Pad later if complex UI is desired for them, for now params can be set via copied settings */}
// //       </fieldset>

// //       <fieldset style={{ marginBottom: '15px' }}>
// //         <legend>Color Transformations</legend>
// //         <div>
// //           <label style={labelStyle}>
// //             <input type="checkbox" value="brightness" onChange={handleTechniqueChange} checked={techniques.includes('brightness')} /> Brightness
// //             {techniques.includes('brightness') && (
// //               <> Factor: <input type="number" step="0.1" name="brightness_factor" value={parameters.brightness_factor} onChange={handleParameterChange} style={inputStyle} /></>
// //             )}
// //           </label>
// //           <label style={labelStyle}>
// //             <input type="checkbox" value="contrast" onChange={handleTechniqueChange} checked={techniques.includes('contrast')} /> Contrast
// //             {techniques.includes('contrast') && (
// //               <> Factor: <input type="number" step="0.1" name="contrast_factor" value={parameters.contrast_factor} onChange={handleParameterChange} style={inputStyle} /></>
// //             )}
// //           </label>
// //         </div>
// //         <div>
// //           <label style={labelStyle}>
// //             <input type="checkbox" value="saturation" onChange={handleTechniqueChange} checked={techniques.includes('saturation')} /> Saturation
// //             {techniques.includes('saturation') && (
// //               <> Factor: <input type="number" step="0.1" name="saturation_factor" value={parameters.saturation_factor} onChange={handleParameterChange} style={inputStyle} /></>
// //             )}
// //           </label>
// //           <label style={labelStyle}><input type="checkbox" value="grayscale" onChange={handleTechniqueChange} checked={techniques.includes('grayscale')} /> Grayscale</label>
// //         </div>
// //       </fieldset>

// //       <fieldset style={{ marginBottom: '15px' }}>
// //         <legend>Noise & Blur</legend>
// //         <div>
// //           <label style={labelStyle}>
// //             <input type="checkbox" value="gaussian_noise" onChange={handleTechniqueChange} checked={techniques.includes('gaussian_noise')} /> Gaussian Noise
// //             {techniques.includes('gaussian_noise') && (
// //               <> Variance: <input type="number" step="0.001" name="gaussian_variance" value={parameters.gaussian_variance} onChange={handleParameterChange} style={inputStyle} /></>
// //             )}
// //           </label>
// //           <label style={labelStyle}>
// //             <input type="checkbox" value="salt_pepper_noise" onChange={handleTechniqueChange} checked={techniques.includes('salt_pepper_noise')} /> Salt & Pepper
// //             {techniques.includes('salt_pepper_noise') && (
// //               <> Amount: <input type="number" step="0.001" name="sap_amount" value={parameters.sap_amount} onChange={handleParameterChange} style={inputStyle} /></>
// //             )}
// //           </label>
// //         </div>
// //         <div>
// //           <label style={labelStyle}><input type="checkbox" value="speckle_noise" onChange={handleTechniqueChange} checked={techniques.includes('speckle_noise')} /> Speckle Noise</label>
// //           <label style={labelStyle}>
// //             <input type="checkbox" value="motion_blur" onChange={handleTechniqueChange} checked={techniques.includes('motion_blur')} /> Motion Blur
// //             {techniques.includes('motion_blur') && (
// //               <> Size: <input type="number" name="motion_blur_size" value={parameters.motion_blur_size} onChange={handleParameterChange} style={inputStyle} /></>
// //             )}
// //           </label>
// //         </div>
// //       </fieldset>

// //       <fieldset style={{ marginBottom: '15px' }}>
// //         <legend>Occlusion</legend>
// //         <div>
// //           <label style={labelStyle}>
// //             <input type="checkbox" value="cutout" onChange={handleTechniqueChange} checked={techniques.includes('cutout')} /> Cutout
// //             {techniques.includes('cutout') && (
// //               <> Size: <input type="number" name="cutout_size" value={parameters.cutout_size} onChange={handleParameterChange} style={inputStyle} /></>
// //             )}
// //           </label>
// //           <label style={labelStyle}><input type="checkbox" value="random_erasing" onChange={handleTechniqueChange} checked={techniques.includes('random_erasing')} /> Random Erasing</label>
// //         </div>
// //       </fieldset>

// //       <fieldset style={{ marginBottom: '15px' }}>
// //         <legend>Mix Augmentations</legend>
// //         <div>
// //         <label style={labelStyle}>
// //             <input type="checkbox" value="mixup" onChange={handleTechniqueChange} checked={techniques.includes('mixup')} /> MixUp
// //             {techniques.includes('mixup') && (
// //               <> Alpha: <input type="number" step="0.1" name="mixup_alpha" value={parameters.mixup_alpha} onChange={handleParameterChange} style={inputStyle} /></>
// //             )}
// //           </label>
// //           <label style={labelStyle}><input type="checkbox" value="cutmix" onChange={handleTechniqueChange} checked={techniques.includes('cutmix')} /> CutMix</label>
// //         </div>
// //         <small>MixUp and CutMix require multiple images in the dataset.</small>
// //       </fieldset>
// //       <br />
// //       <button onClick={startAugment} disabled={isLoading}>
// //         {isLoading ? 'Augmenting...' : 'Start Augmentation'}
// //       </button>
// //       <button onClick={() => navigate('/Uploads')} style={{ marginLeft: '10px' }} disabled={isLoading}>
// //         Cancel
// //       </button>
// //     </div>
// //   );
// // };

// // export default Augmentation;




// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useLocation, useNavigate } from 'react-router-dom';

// const Augmentation = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { dataset, augmentationsToPreload } = location.state || {};

//   const initialParameters = {
//     rotation_angle: 90,
//     scaling_factor: 1.2,
//     translation_x: 0,
//     translation_y: 0,
//     crop_left: 0,
//     crop_top: 0,
//     crop_right: 100, 
//     crop_bottom: 100,
//     padding_size: 0,
//     brightness_factor: 1.0,
//     contrast_factor: 1.0,
//     saturation_factor: 1.0,
//     gaussian_variance: 0.01,
//     sap_amount: 0.005,
//     motion_blur_size: 9,
//     cutout_size: 50,
//     mixup_alpha: 0.2,
//   };

//   const [techniques, setTechniques] = useState([]);
//   const [parameters, setParameters] = useState(initialParameters);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     if (augmentationsToPreload) {
//       setTechniques(augmentationsToPreload.techniques || []);
//       // Ensure initialParameters are spread first to provide defaults for any missing params
//       setParameters(prevParams => ({ ...initialParameters, ...(augmentationsToPreload.parameters || {}) }));
//     } else {
//       // If not preloading, ensure techniques are clear and params are reset to initial
//       setTechniques([]);
//       setParameters(initialParameters);
//     }
//   }, [augmentationsToPreload, dataset]); // Rerun if dataset changes or preload info changes


//   if (!dataset) {
//     return (
//         <div>
//             <p>No dataset selected. Please go back to Uploads and select a dataset to augment.</p>
//             <button onClick={() => navigate('/Uploads')}>Go to Uploads</button>
//         </div>
//     );
//   }


//   const handleTechniqueChange = (e) => {
//     const { value, checked } = e.target;
//     setTechniques((prev) =>
//       checked ? [...prev, value] : prev.filter((item) => item !== value)
//     );
//   };

//   const handleParameterChange = (e) => {
//     const { name, value, type } = e.target;
//     setParameters(prev => ({
//       ...prev,
//       [name]: type === 'number' ? parseFloat(value) : (type === 'checkbox' ? e.target.checked : value) // Handle checkbox type if any param is a boolean
//     }));
//   };

//   const startAugment = async () => {
//     if (techniques.length === 0) {
//       alert("Please select at least one augmentation technique.");
//       return;
//     }
//     setIsLoading(true);
//     try {
//       const response = await axios.post('http://localhost:5001/augment', {
//         datasetName: dataset.name,
//         techniques: techniques,
//         parameters: parameters,
//       });
//       alert(`Augmentation complete! Run ID: ${response.data.run_id}, ZIP: ${response.data.zip_filename}`);
//       navigate('/Uploads');
//     } catch (error) {
//       console.error("Augmentation error:", error);
//       alert(`Augmentation failed: ${error.response?.data?.error || error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const inputStyle = { marginLeft: '5px', marginRight: '15px', width: '60px' };
//   const labelStyle = { display: 'inline-block', marginRight: '20px', marginBottom: '10px', width: 'auto', verticalAlign: 'top' };
//   const fieldsetStyle = { marginBottom: '15px', border: '1px solid #ccc', padding: '10px' };
//   const legendStyle = { fontWeight: 'bold' };


//   return (
//     <div>
//       <h2>Augment Dataset: {dataset.name}</h2>
//       <p>Select techniques and adjust parameters as needed.</p>

//       <fieldset style={fieldsetStyle}>
//         <legend style={legendStyle}>Geometric Transformations</legend>
//         <div>
//           <label style={labelStyle}>
//             <input type="checkbox" value="rotate" onChange={handleTechniqueChange} checked={techniques.includes('rotate')} /> Rotate
//             {techniques.includes('rotate') && (
//               <> Angle: <input type="number" name="rotation_angle" value={parameters.rotation_angle} onChange={handleParameterChange} style={inputStyle} /></>
//             )}
//           </label>
//           <label style={labelStyle}>
//             <input type="checkbox" value="scale" onChange={handleTechniqueChange} checked={techniques.includes('scale')} /> Scale
//             {techniques.includes('scale') && (
//               <> Factor: <input type="number" step="0.1" name="scaling_factor" value={parameters.scaling_factor} onChange={handleParameterChange} style={inputStyle} /></>
//             )}
//           </label>
//         </div>
//         <div>
//           <label style={labelStyle}><input type="checkbox" value="flip_horizontal" onChange={handleTechniqueChange} checked={techniques.includes('flip_horizontal')} /> Flip Horizontal</label>
//           <label style={labelStyle}><input type="checkbox" value="flip_vertical" onChange={handleTechniqueChange} checked={techniques.includes('flip_vertical')} /> Flip Vertical</label>
//         </div>
//       </fieldset>

//       <fieldset style={fieldsetStyle}>
//         <legend style={legendStyle}>Color Transformations</legend>
//         <div>
//           <label style={labelStyle}>
//             <input type="checkbox" value="brightness" onChange={handleTechniqueChange} checked={techniques.includes('brightness')} /> Brightness
//             {techniques.includes('brightness') && (
//               <> Factor: <input type="number" step="0.1" name="brightness_factor" value={parameters.brightness_factor} onChange={handleParameterChange} style={inputStyle} /></>
//             )}
//           </label>
//           <label style={labelStyle}>
//             <input type="checkbox" value="contrast" onChange={handleTechniqueChange} checked={techniques.includes('contrast')} /> Contrast
//             {techniques.includes('contrast') && (
//               <> Factor: <input type="number" step="0.1" name="contrast_factor" value={parameters.contrast_factor} onChange={handleParameterChange} style={inputStyle} /></>
//             )}
//           </label>
//         </div>
//         <div>
//           <label style={labelStyle}>
//             <input type="checkbox" value="saturation" onChange={handleTechniqueChange} checked={techniques.includes('saturation')} /> Saturation
//             {techniques.includes('saturation') && (
//               <> Factor: <input type="number" step="0.1" name="saturation_factor" value={parameters.saturation_factor} onChange={handleParameterChange} style={inputStyle} /></>
//             )}
//           </label>
//           <label style={labelStyle}><input type="checkbox" value="grayscale" onChange={handleTechniqueChange} checked={techniques.includes('grayscale')} /> Grayscale</label>
//         </div>
//       </fieldset>

//       <fieldset style={fieldsetStyle}>
//         <legend style={legendStyle}>Noise & Blur</legend>
//         <div>
//           <label style={labelStyle}>
//             <input type="checkbox" value="gaussian_noise" onChange={handleTechniqueChange} checked={techniques.includes('gaussian_noise')} /> Gaussian Noise
//             {techniques.includes('gaussian_noise') && (
//               <> Variance: <input type="number" step="0.001" name="gaussian_variance" value={parameters.gaussian_variance} onChange={handleParameterChange} style={inputStyle} /></>
//             )}
//           </label>
//           <label style={labelStyle}>
//             <input type="checkbox" value="salt_pepper_noise" onChange={handleTechniqueChange} checked={techniques.includes('salt_pepper_noise')} /> Salt & Pepper
//             {techniques.includes('salt_pepper_noise') && (
//               <> Amount: <input type="number" step="0.001" name="sap_amount" value={parameters.sap_amount} onChange={handleParameterChange} style={inputStyle} /></>
//             )}
//           </label>
//         </div>
//         <div>
//           <label style={labelStyle}><input type="checkbox" value="speckle_noise" onChange={handleTechniqueChange} checked={techniques.includes('speckle_noise')} /> Speckle Noise</label>
//           <label style={labelStyle}>
//             <input type="checkbox" value="motion_blur" onChange={handleTechniqueChange} checked={techniques.includes('motion_blur')} /> Motion Blur
//             {techniques.includes('motion_blur') && (
//               <> Size: <input type="number" name="motion_blur_size" value={parameters.motion_blur_size} onChange={handleParameterChange} style={inputStyle} /></>
//             )}
//           </label>
//         </div>
//       </fieldset>

//       <fieldset style={fieldsetStyle}>
//         <legend style={legendStyle}>Occlusion</legend>
//         <div>
//           <label style={labelStyle}>
//             <input type="checkbox" value="cutout" onChange={handleTechniqueChange} checked={techniques.includes('cutout')} /> Cutout
//             {techniques.includes('cutout') && (
//               <> Size: <input type="number" name="cutout_size" value={parameters.cutout_size} onChange={handleParameterChange} style={inputStyle} /></>
//             )}
//           </label>
//           <label style={labelStyle}><input type="checkbox" value="random_erasing" onChange={handleTechniqueChange} checked={techniques.includes('random_erasing')} /> Random Erasing</label>
//         </div>
//       </fieldset>

//       <fieldset style={fieldsetStyle}>
//         <legend style={legendStyle}>Mix Augmentations</legend>
//         <div>
//         <label style={labelStyle}>
//             <input type="checkbox" value="mixup" onChange={handleTechniqueChange} checked={techniques.includes('mixup')} /> MixUp
//             {techniques.includes('mixup') && (
//               <> Alpha: <input type="number" step="0.1" name="mixup_alpha" value={parameters.mixup_alpha} onChange={handleParameterChange} style={inputStyle} /></>
//             )}
//           </label>
//           <label style={labelStyle}><input type="checkbox" value="cutmix" onChange={handleTechniqueChange} checked={techniques.includes('cutmix')} /> CutMix</label>
//         </div>
//         <small>MixUp and CutMix require multiple images in the dataset.</small>
//       </fieldset>
//       <br />
//       <button onClick={startAugment} disabled={isLoading}>
//         {isLoading ? 'Augmenting...' : 'Start Augmentation'}
//       </button>
//       <button onClick={() => navigate('/Uploads')} style={{ marginLeft: '10px' }} disabled={isLoading}>
//         Cancel
//       </button>
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
    rotation_angle: 90, scaling_factor: 1.2, translation_x: 0, translation_y: 0,
    crop_left: 0, crop_top: 0, crop_right: 100, crop_bottom: 100, padding_size: 0,
    brightness_factor: 1.0, contrast_factor: 1.0, saturation_factor: 1.0,
    gaussian_variance: 0.01, sap_amount: 0.005, motion_blur_size: 9,
    cutout_size: 50, mixup_alpha: 0.2,
  };

  const [techniques, setTechniques] = useState([]);
  const [parameters, setParameters] = useState(initialParameters);
  const [isLoading, setIsLoading] = useState(false);

  // --- Preview State ---
  const [sampleImageFilename, setSampleImageFilename] = useState('');
  const [originalSampleImageSrc, setOriginalSampleImageSrc] = useState('');
  const [previewImageSrc, setPreviewImageSrc] = useState(''); // This will hold the base64 of the preview
  const [activePreviewTechnique, setActivePreviewTechnique] = useState(null); // Track which technique is actively being previewed
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  // --- End Preview State ---


  // Effect to load initial sample image for preview
  useEffect(() => {
    if (dataset && dataset.files && dataset.files.length > 0) {
      // Find the first valid image file
      const firstImage = dataset.files.find(file => file.match(/\.(jpg|jpeg|png)$/i));
      if (firstImage) {
        setSampleImageFilename(firstImage);
        const src = `http://localhost:5001/uploads/${dataset.name}/${encodeURIComponent(firstImage)}`;
        setOriginalSampleImageSrc(src);
        setPreviewImageSrc(src); // Initially, preview shows the original
      } else {
        setSampleImageFilename('');
        setOriginalSampleImageSrc('');
        setPreviewImageSrc('');
      }
    }
  }, [dataset]);

  // Effect to handle preloading augmentations
  useEffect(() => {
    if (augmentationsToPreload) {
      setTechniques(augmentationsToPreload.techniques || []);
      setParameters(prevParams => ({ ...initialParameters, ...(augmentationsToPreload.parameters || {}) }));
    } else {
      // Reset if no preload or if dataset changes without preload info
      setTechniques([]);
      setParameters(initialParameters);
    }
     // Clear active preview when preloads change (or dataset changes)
    setActivePreviewTechnique(null);
    if (originalSampleImageSrc) setPreviewImageSrc(originalSampleImageSrc);

  }, [augmentationsToPreload, dataset, originalSampleImageSrc]);


  // Debounced function to fetch preview
  const fetchPreview = async (tech, currentParams) => {
    if (!dataset || !sampleImageFilename || !tech) {
      setPreviewImageSrc(originalSampleImageSrc); // Revert to original if no tech for preview
      return;
    }
    setIsPreviewLoading(true);
    try {
      const res = await axios.post('http://localhost:5001/preview_augmentation', {
        datasetName: dataset.name,
        imageFilename: sampleImageFilename,
        technique: tech,
        parameters: currentParams, // Send all current params, backend will pick relevant ones
      });
      setPreviewImageSrc(res.data.preview_image_base64);
    } catch (error) {
      console.error("Error fetching preview for " + tech + ":", error);
      setPreviewImageSrc(originalSampleImageSrc); // Revert to original on error
    } finally {
      setIsPreviewLoading(false);
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetchPreview = useCallback(debounce(fetchPreview, 600), [dataset, sampleImageFilename, originalSampleImageSrc]);


  const handleTechniqueChange = (e) => {
    const { value: techValue, checked } = e.target;
    setTechniques((prev) =>
      checked ? [...prev, techValue] : prev.filter((item) => item !== techValue)
    );
    if (checked) {
      setActivePreviewTechnique(techValue);
      debouncedFetchPreview(techValue, parameters);
    } else if (activePreviewTechnique === techValue) {
      // If the unchecked technique was the one being previewed, clear preview or revert
      setActivePreviewTechnique(null);
      setPreviewImageSrc(originalSampleImageSrc);
    }
  };

  const handleParameterChange = (e) => {
    const { name, value, type } = e.target;
    const newParams = {
      ...parameters,
      [name]: type === 'number' ? parseFloat(value) : value
    };
    setParameters(newParams);

    // If the parameter changed is for the currently active preview technique, update preview
    // This requires knowing which parameters belong to which technique, or simply re-triggering for the active one.
    if (activePreviewTechnique) {
        // A simple check: does the param name start with the active technique? (e.g. "rotation_angle" for "rotate")
        // This is a heuristic. A more robust way would be to map params to techniques.
        // For now, if any param changes and a preview is active, we assume it might be relevant.
        debouncedFetchPreview(activePreviewTechnique, newParams);
    }
  };

  const startAugment = async () => {
    if (techniques.length === 0) {
      alert("Please select at least one augmentation technique."); return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5001/augment', {
        datasetName: dataset.name, techniques: techniques, parameters: parameters,
      });
      alert(`Augmentation complete! Run ID: ${response.data.run_id}, ZIP: ${response.data.zip_filename}`);
      navigate('/Uploads');
    } catch (error) {
      console.error("Augmentation error:", error);
      alert(`Augmentation failed: ${error.response?.data?.error || error.message}`);
    } finally { setIsLoading(false); }
  };

  if (!dataset) {
    return (<div> <p>No dataset selected...</p> <button onClick={() => navigate('/Uploads')}>Go to Uploads</button> </div>);
  }

  const inputStyle = { marginLeft: '5px', marginRight: '5px', width: '60px', padding: '4px', fontSize: '0.9em' };
  const labelStyle = { display: 'inline-block', marginRight: '15px', marginBottom: '10px', verticalAlign: 'top', minWidth: '200px' };
  const fieldsetStyle = { marginBottom: '15px', border: '1px solid #ccc', padding: '10px 15px', borderRadius: '4px' };
  const legendStyle = { fontWeight: 'bold', padding: '0 5px' };
  const previewContainerStyle = { 
    width: '320px', height: '320px', border: '1px solid #ddd', 
    display: 'flex', alignItems: 'center', justifyContent: 'center', 
    marginTop: '10px', backgroundColor: '#f9f9f9', position: 'relative',
    overflow: 'hidden' // Ensure image fits
  };
  const imageStyle = { maxWidth: '100%', maxHeight: '100%', display: 'block' };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', display: 'flex', gap: '20px', padding: '20px' }}>
      <div style={{ flex: 2 }}>
        <h2>Augment Dataset: {dataset.name}</h2>
        <p>Select techniques, adjust parameters, and see a live preview on a sample image.</p>
        {/* Fieldsets for augmentations */}
        <fieldset style={fieldsetStyle}> <legend style={legendStyle}>Geometric</legend> {/* ... existing inputs ... */} 
            <div>
              <label style={labelStyle}>
                <input type="checkbox" value="rotate" onChange={handleTechniqueChange} checked={techniques.includes('rotate')} /> Rotate
                {techniques.includes('rotate') && (<> Angle: <input type="number" name="rotation_angle" value={parameters.rotation_angle} onChange={handleParameterChange} style={inputStyle} /></>)}
              </label>
              <label style={labelStyle}>
                <input type="checkbox" value="scale" onChange={handleTechniqueChange} checked={techniques.includes('scale')} /> Scale
                {techniques.includes('scale') && (<> Factor: <input type="number" step="0.1" name="scaling_factor" value={parameters.scaling_factor} onChange={handleParameterChange} style={inputStyle} /></>)}
              </label>
            </div>
            <div>
              <label style={labelStyle}><input type="checkbox" value="flip_horizontal" onChange={handleTechniqueChange} checked={techniques.includes('flip_horizontal')} /> Flip Horizontal</label>
              <label style={labelStyle}><input type="checkbox" value="flip_vertical" onChange={handleTechniqueChange} checked={techniques.includes('flip_vertical')} /> Flip Vertical</label>
            </div>
        </fieldset>
        <fieldset style={fieldsetStyle}> <legend style={legendStyle}>Color</legend> {/* ... existing inputs ... */} 
            <div>
              <label style={labelStyle}>
                <input type="checkbox" value="brightness" onChange={handleTechniqueChange} checked={techniques.includes('brightness')} /> Brightness
                {techniques.includes('brightness') && (<> Factor: <input type="number" step="0.1" name="brightness_factor" value={parameters.brightness_factor} onChange={handleParameterChange} style={inputStyle} /></>)}
              </label>
              <label style={labelStyle}>
                <input type="checkbox" value="contrast" onChange={handleTechniqueChange} checked={techniques.includes('contrast')} /> Contrast
                {techniques.includes('contrast') && (<> Factor: <input type="number" step="0.1" name="contrast_factor" value={parameters.contrast_factor} onChange={handleParameterChange} style={inputStyle} /></>)}
              </label>
            </div>
            <div>
              <label style={labelStyle}>
                <input type="checkbox" value="saturation" onChange={handleTechniqueChange} checked={techniques.includes('saturation')} /> Saturation
                {techniques.includes('saturation') && (<> Factor: <input type="number" step="0.1" name="saturation_factor" value={parameters.saturation_factor} onChange={handleParameterChange} style={inputStyle} /></>)}
              </label>
              <label style={labelStyle}><input type="checkbox" value="grayscale" onChange={handleTechniqueChange} checked={techniques.includes('grayscale')} /> Grayscale</label>
            </div>
        </fieldset>
        <fieldset style={fieldsetStyle}> <legend style={legendStyle}>Noise & Blur</legend> {/* ... existing inputs ... */} 
            <div>
                <label style={labelStyle}>
                    <input type="checkbox" value="gaussian_noise" onChange={handleTechniqueChange} checked={techniques.includes('gaussian_noise')} /> Gaussian Noise
                    {techniques.includes('gaussian_noise') && (<> Var: <input type="number" step="0.001" name="gaussian_variance" value={parameters.gaussian_variance} onChange={handleParameterChange} style={inputStyle} /></>)}
                </label>
                <label style={labelStyle}>
                    <input type="checkbox" value="salt_pepper_noise" onChange={handleTechniqueChange} checked={techniques.includes('salt_pepper_noise')} /> Salt & Pepper
                    {techniques.includes('salt_pepper_noise') && (<> Amount: <input type="number" step="0.001" name="sap_amount" value={parameters.sap_amount} onChange={handleParameterChange} style={inputStyle} /></>)}
                </label>
            </div>
            <div>
                <label style={labelStyle}><input type="checkbox" value="speckle_noise" onChange={handleTechniqueChange} checked={techniques.includes('speckle_noise')} /> Speckle Noise</label>
                <label style={labelStyle}>
                    <input type="checkbox" value="motion_blur" onChange={handleTechniqueChange} checked={techniques.includes('motion_blur')} /> Motion Blur
                    {techniques.includes('motion_blur') && (<> Size: <input type="number" name="motion_blur_size" value={parameters.motion_blur_size} onChange={handleParameterChange} style={inputStyle} /></>)}
                </label>
            </div>
        </fieldset>
        <fieldset style={fieldsetStyle}> <legend style={legendStyle}>Occlusion</legend> {/* ... existing inputs ... */} 
            <div>
                <label style={labelStyle}>
                    <input type="checkbox" value="cutout" onChange={handleTechniqueChange} checked={techniques.includes('cutout')} /> Cutout
                    {techniques.includes('cutout') && (<> Size: <input type="number" name="cutout_size" value={parameters.cutout_size} onChange={handleParameterChange} style={inputStyle} /></>)}
                </label>
                <label style={labelStyle}><input type="checkbox" value="random_erasing" onChange={handleTechniqueChange} checked={techniques.includes('random_erasing')} /> Random Erasing</label>
            </div>
        </fieldset>
        <fieldset style={fieldsetStyle}> <legend style={legendStyle}>Mix (No Live Preview)</legend> {/* ... existing inputs ... */} 
            <div>
                <label style={labelStyle}>
                    <input type="checkbox" value="mixup" onChange={handleTechniqueChange} checked={techniques.includes('mixup')} /> MixUp
                    {techniques.includes('mixup') && (<> Alpha: <input type="number" step="0.1" name="mixup_alpha" value={parameters.mixup_alpha} onChange={handleParameterChange} style={inputStyle} /></>)}
                </label>
                <label style={labelStyle}><input type="checkbox" value="cutmix" onChange={handleTechniqueChange} checked={techniques.includes('cutmix')} /> CutMix</label>
            </div>
            <small>MixUp/CutMix affect the whole dataset processing; single image preview not applicable here.</small>
        </fieldset>
        <br />
        <button onClick={startAugment} disabled={isLoading} style={{ padding: '10px 20px', fontSize: '1em', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {isLoading ? 'Augmenting...' : 'Start Full Augmentation'}
        </button>
        <button onClick={() => navigate('/Uploads')} style={{ marginLeft: '10px', padding: '10px 15px', fontSize: '1em', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }} disabled={isLoading}>
          Cancel
        </button>
      </div>

      <div style={{ flex: 1, position: 'sticky', top: '20px' /* For sticky preview */ }}>
        <h4>Live Preview on "{sampleImageFilename || 'Sample'}"</h4>
        <div style={previewContainerStyle}>
          {isPreviewLoading && <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#555'}}>Loading Preview...</div>}
          {previewImageSrc ? (
            <img src={previewImageSrc} alt="Preview" style={imageStyle} />
          ) : (
            sampleImageFilename ? <span>No preview active.</span> : <span>No sample image loaded.</span>
          )}
        </div>
        {activePreviewTechnique && <p style={{textAlign: 'center', fontSize: '0.9em', color: '#333'}}>Previewing: <strong>{activePreviewTechnique}</strong></p>}
        {!activePreviewTechnique && previewImageSrc === originalSampleImageSrc && sampleImageFilename &&
            <p style={{textAlign: 'center', fontSize: '0.9em', color: '#333'}}>Original Sample</p>
        }
      </div>
    </div>
  );
};

export default Augmentation;