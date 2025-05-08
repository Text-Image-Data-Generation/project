// Augmentation.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const Augmentation = () => {
  const { state } = useLocation();
  const { dataset } = state || {};
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedAugmentations, setSelectedAugmentations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (dataset) {
      setSelectedFiles(dataset.files);
    }
  }, [dataset]);

  const handleAugmentationChange = (e) => {
    const { value, checked } = e.target;
    setSelectedAugmentations((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };

  const handleApplyAugmentations = async () => {
    try {
      const res = await axios.post('http://localhost:5001/augment', {
        datasetName: dataset.name,
        augmentations: selectedAugmentations,
      });
      alert('Augmentation applied successfully!');
      navigate('/');
    } catch (err) {
      console.error("Error applying augmentations:", err);
      alert("Failed to apply augmentations.");
    }
  };

  return (
    <div>
      <h2>Augment Dataset: {dataset?.name}</h2>
      <div>
        <h3>Select Augmentation Techniques</h3>
        <label>
          <input
            type="checkbox"
            value="rotate"
            onChange={handleAugmentationChange}
          />
          Rotate
        </label>
        <label>
          <input
            type="checkbox"
            value="flip"
            onChange={handleAugmentationChange}
          />
          Flip
        </label>
        <label>
          <input
            type="checkbox"
            value="scale"
            onChange={handleAugmentationChange}
          />
          Scale
        </label>
        {/* Add more augmentation techniques as needed */}
      </div>
      <button onClick={handleApplyAugmentations}>Start Augment</button>
    </div>
  );
};

export default Augmentation;
