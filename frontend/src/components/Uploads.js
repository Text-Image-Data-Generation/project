// Uploads.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Uploads = () => {
  const [files, setFiles] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [datasetName, setDatasetName] = useState('');
  const navigate = useNavigate();

  const fetchDatasets = async () => {
    const res = await axios.get('http://localhost:5001/datasets');
    setDatasets(res.data);
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleUpload = async () => {
    if (!datasetName) return alert("Please enter a dataset name.");
    const formData = new FormData();
    for (let file of files) formData.append("files", file);
    formData.append("dataset", datasetName);

    await axios.post('http://localhost:5001/upload', formData);
    alert("Upload successful!");
    setFiles([]);
    setDatasetName('');
    fetchDatasets();
  };

  const handleAugmentClick = (dataset) => {
    navigate('/augmentation', { state: { dataset } });
  };

  return (
    <div>
      <h2>Upload New Dataset</h2>
      <input
        type="text"
        placeholder="Dataset name"
        value={datasetName}
        onChange={(e) => setDatasetName(e.target.value)}
      />
      <input type="file" multiple onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>

      <h3>Uploaded Datasets</h3>
      <table border="1">
        <thead>
          <tr>
            <th>Dataset Name</th>
            <th># of Images</th>
            <th>Files</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {datasets.map((ds, i) => (
            <tr key={i}>
              <td>{ds.name}</td>
              <td>{ds.count}</td>
              <td>
                {ds.files.map((file, j) => (
                  <div key={j}>
                    {file.match(/\.(jpg|jpeg|png)$/i) ? (
                      <img
                        src={`http://localhost:5001/uploads/${ds.name}/${file}`}
                        alt=""
                        width="60"
                      />
                    ) : (
                      <a href={`http://localhost:5001/uploads/${ds.name}/${file}`} download>{file}</a>
                    )}
                  </div>
                ))}
                {ds.augmented_zip && (
                  <div>
                    <strong>Augmented ZIP:</strong>
                    <a href={`http://localhost:5001/augmented/${ds.name}/${ds.augmented_zip}`} download>
                      {ds.augmented_zip}
                    </a>
                  </div>
                )}
              </td>
              <td>
                <button onClick={() => handleAugmentClick(ds)}>Augment</button>
                {ds.augmentations?.length > 0 && (
                  <ul>
                    {ds.augmentations.map((a, k) => <li key={k}>{a}</li>)}
                  </ul>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Uploads;
