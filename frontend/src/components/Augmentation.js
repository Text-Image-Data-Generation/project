// Augmentation.js
import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const Augmentation = () => {
  const { state } = useLocation();
  const { dataset } = state;
  const [augmentations, setAugmentations] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { value, checked } = e.target;
    setAugmentations((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };

  const startAugment = async () => {
    await axios.post('http://localhost:5001/augment', {
      datasetName: dataset.name,
      augmentations,
    });
    alert("Augmentation complete!");
    navigate('/');
  };

  return (
    <div>
      <h2>Augment Dataset: {dataset.name}</h2>
      <label><input type="checkbox" value="rotate" onChange={handleChange} /> Rotate</label>
      <label><input type="checkbox" value="scale" onChange={handleChange} /> Scale</label>
      <label><input type="checkbox" value="flip_horizontal" onChange={handleChange} /> Flip Horizontal</label>
      <label><input type="checkbox" value="flip_vertical" onChange={handleChange} /> Flip Vertical</label>
      <br />
      <button onClick={startAugment}>Start Augment</button>
    </div>
  );
};

export default Augmentation;
