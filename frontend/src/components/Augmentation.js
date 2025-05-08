// // Augmentation.js
// import React, { useState } from 'react';
// import axios from 'axios';
// import { useLocation, useNavigate } from 'react-router-dom';

// const Augmentation = () => {
//   const { state } = useLocation();
//   const { dataset } = state;
//   const [augmentations, setAugmentations] = useState([]);
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     const { value, checked } = e.target;
//     setAugmentations((prev) =>
//       checked ? [...prev, value] : prev.filter((item) => item !== value)
//     );
//   };

//   const startAugment = async () => {
//     await axios.post('http://localhost:5001/augment', {
//       datasetName: dataset.name,
//       augmentations,
//     });
//     alert("Augmentation complete!");
//     navigate('/Uploads');
//   };

//   return (
//     <div>
//       <h2>Augment Dataset: {dataset.name}</h2>
//       <label><input type="checkbox" value="rotate" onChange={handleChange} /> Rotate</label>
//       <label><input type="checkbox" value="scale" onChange={handleChange} /> Scale</label>
//       <label><input type="checkbox" value="flip_horizontal" onChange={handleChange} /> Flip Horizontal</label>
//       <label><input type="checkbox" value="flip_vertical" onChange={handleChange} /> Flip Vertical</label>
//       <br />
//       <button onClick={startAugment}>Start Augment</button>
//     </div>
//   );
// };

// export default Augmentation;



import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const Augmentation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { dataset, augmentationsToPreload } = location.state || {};

  const initialParameters = {
    rotation_angle: 90,
    scaling_factor: 1.2,
    translation_x: 0,
    translation_y: 0,
    crop_left: 0,
    crop_top: 0,
    crop_right: 100, // Assuming percentage or to be replaced by actual image width
    crop_bottom: 100, // Assuming percentage or to be replaced by actual image height
    padding_size: 0,
    brightness_factor: 1.0,
    contrast_factor: 1.0,
    saturation_factor: 1.0,
    gaussian_variance: 0.01,
    sap_amount: 0.005,
    motion_blur_size: 9,
    cutout_size: 50,
    mixup_alpha: 0.2,
  };

  const [techniques, setTechniques] = useState([]);
  const [parameters, setParameters] = useState(initialParameters);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (augmentationsToPreload) {
      setTechniques(augmentationsToPreload.techniques || []);
      setParameters(prevParams => ({ ...initialParameters, ...prevParams, ...(augmentationsToPreload.parameters || {}) }));
    }
  }, [augmentationsToPreload]);

  if (!dataset) {
    return (
        <div>
            <p>No dataset selected. Please go back to Uploads and select a dataset to augment.</p>
            <button onClick={() => navigate('/Uploads')}>Go to Uploads</button>
        </div>
    );
  }


  const handleTechniqueChange = (e) => {
    const { value, checked } = e.target;
    setTechniques((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };

  const handleParameterChange = (e) => {
    const { name, value, type } = e.target;
    setParameters(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const startAugment = async () => {
    if (techniques.length === 0) {
      alert("Please select at least one augmentation technique.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5001/augment', {
        datasetName: dataset.name,
        techniques: techniques,
        parameters: parameters,
      });
      alert(`Augmentation complete! Augmented ZIP: ${response.data.zip_filename}`);
      navigate('/Uploads');
    } catch (error) {
      console.error("Augmentation error:", error);
      alert(`Augmentation failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = { marginLeft: '5px', marginRight: '15px', width: '60px' };
  const labelStyle = { display: 'inline-block', marginRight: '20px', marginBottom: '10px', width: 'auto' };

  return (
    <div>
      <h2>Augment Dataset: {dataset.name}</h2>
      <p>Select techniques and adjust parameters as needed.</p>

      <fieldset style={{ marginBottom: '15px' }}>
        <legend>Geometric Transformations</legend>
        <div>
          <label style={labelStyle}>
            <input type="checkbox" value="rotate" onChange={handleTechniqueChange} checked={techniques.includes('rotate')} /> Rotate
            {techniques.includes('rotate') && (
              <> Angle: <input type="number" name="rotation_angle" value={parameters.rotation_angle} onChange={handleParameterChange} style={inputStyle} /></>
            )}
          </label>
          <label style={labelStyle}>
            <input type="checkbox" value="scale" onChange={handleTechniqueChange} checked={techniques.includes('scale')} /> Scale
            {techniques.includes('scale') && (
              <> Factor: <input type="number" step="0.1" name="scaling_factor" value={parameters.scaling_factor} onChange={handleParameterChange} style={inputStyle} /></>
            )}
          </label>
        </div>
        <div>
          <label style={labelStyle}><input type="checkbox" value="flip_horizontal" onChange={handleTechniqueChange} checked={techniques.includes('flip_horizontal')} /> Flip Horizontal</label>
          <label style={labelStyle}><input type="checkbox" value="flip_vertical" onChange={handleTechniqueChange} checked={techniques.includes('flip_vertical')} /> Flip Vertical</label>
        </div>
        {/* Add Translate, Crop, Pad later if complex UI is desired for them, for now params can be set via copied settings */}
      </fieldset>

      <fieldset style={{ marginBottom: '15px' }}>
        <legend>Color Transformations</legend>
        <div>
          <label style={labelStyle}>
            <input type="checkbox" value="brightness" onChange={handleTechniqueChange} checked={techniques.includes('brightness')} /> Brightness
            {techniques.includes('brightness') && (
              <> Factor: <input type="number" step="0.1" name="brightness_factor" value={parameters.brightness_factor} onChange={handleParameterChange} style={inputStyle} /></>
            )}
          </label>
          <label style={labelStyle}>
            <input type="checkbox" value="contrast" onChange={handleTechniqueChange} checked={techniques.includes('contrast')} /> Contrast
            {techniques.includes('contrast') && (
              <> Factor: <input type="number" step="0.1" name="contrast_factor" value={parameters.contrast_factor} onChange={handleParameterChange} style={inputStyle} /></>
            )}
          </label>
        </div>
        <div>
          <label style={labelStyle}>
            <input type="checkbox" value="saturation" onChange={handleTechniqueChange} checked={techniques.includes('saturation')} /> Saturation
            {techniques.includes('saturation') && (
              <> Factor: <input type="number" step="0.1" name="saturation_factor" value={parameters.saturation_factor} onChange={handleParameterChange} style={inputStyle} /></>
            )}
          </label>
          <label style={labelStyle}><input type="checkbox" value="grayscale" onChange={handleTechniqueChange} checked={techniques.includes('grayscale')} /> Grayscale</label>
        </div>
      </fieldset>

      <fieldset style={{ marginBottom: '15px' }}>
        <legend>Noise & Blur</legend>
        <div>
          <label style={labelStyle}>
            <input type="checkbox" value="gaussian_noise" onChange={handleTechniqueChange} checked={techniques.includes('gaussian_noise')} /> Gaussian Noise
            {techniques.includes('gaussian_noise') && (
              <> Variance: <input type="number" step="0.001" name="gaussian_variance" value={parameters.gaussian_variance} onChange={handleParameterChange} style={inputStyle} /></>
            )}
          </label>
          <label style={labelStyle}>
            <input type="checkbox" value="salt_pepper_noise" onChange={handleTechniqueChange} checked={techniques.includes('salt_pepper_noise')} /> Salt & Pepper
            {techniques.includes('salt_pepper_noise') && (
              <> Amount: <input type="number" step="0.001" name="sap_amount" value={parameters.sap_amount} onChange={handleParameterChange} style={inputStyle} /></>
            )}
          </label>
        </div>
        <div>
          <label style={labelStyle}><input type="checkbox" value="speckle_noise" onChange={handleTechniqueChange} checked={techniques.includes('speckle_noise')} /> Speckle Noise</label>
          <label style={labelStyle}>
            <input type="checkbox" value="motion_blur" onChange={handleTechniqueChange} checked={techniques.includes('motion_blur')} /> Motion Blur
            {techniques.includes('motion_blur') && (
              <> Size: <input type="number" name="motion_blur_size" value={parameters.motion_blur_size} onChange={handleParameterChange} style={inputStyle} /></>
            )}
          </label>
        </div>
      </fieldset>

      <fieldset style={{ marginBottom: '15px' }}>
        <legend>Occlusion</legend>
        <div>
          <label style={labelStyle}>
            <input type="checkbox" value="cutout" onChange={handleTechniqueChange} checked={techniques.includes('cutout')} /> Cutout
            {techniques.includes('cutout') && (
              <> Size: <input type="number" name="cutout_size" value={parameters.cutout_size} onChange={handleParameterChange} style={inputStyle} /></>
            )}
          </label>
          <label style={labelStyle}><input type="checkbox" value="random_erasing" onChange={handleTechniqueChange} checked={techniques.includes('random_erasing')} /> Random Erasing</label>
        </div>
      </fieldset>

      <fieldset style={{ marginBottom: '15px' }}>
        <legend>Mix Augmentations</legend>
        <div>
        <label style={labelStyle}>
            <input type="checkbox" value="mixup" onChange={handleTechniqueChange} checked={techniques.includes('mixup')} /> MixUp
            {techniques.includes('mixup') && (
              <> Alpha: <input type="number" step="0.1" name="mixup_alpha" value={parameters.mixup_alpha} onChange={handleParameterChange} style={inputStyle} /></>
            )}
          </label>
          <label style={labelStyle}><input type="checkbox" value="cutmix" onChange={handleTechniqueChange} checked={techniques.includes('cutmix')} /> CutMix</label>
        </div>
        <small>MixUp and CutMix require multiple images in the dataset.</small>
      </fieldset>
      <br />
      <button onClick={startAugment} disabled={isLoading}>
        {isLoading ? 'Augmenting...' : 'Start Augmentation'}
      </button>
      <button onClick={() => navigate('/Uploads')} style={{ marginLeft: '10px' }} disabled={isLoading}>
        Cancel
      </button>
    </div>
  );
};

export default Augmentation;
