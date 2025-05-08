// // Uploads.js
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const Uploads = () => {
//   const [files, setFiles] = useState([]);
//   const [datasets, setDatasets] = useState([]);
//   const [datasetName, setDatasetName] = useState('');
//   const navigate = useNavigate();

//   const fetchDatasets = async () => {
//     const res = await axios.get('http://localhost:5001/datasets');
//     setDatasets(res.data);
//   };

//   useEffect(() => {
//     fetchDatasets();
//   }, []);

//   const handleFileChange = (e) => {
//     setFiles(e.target.files);
//   };

//   const handleUpload = async () => {
//     if (!datasetName) return alert("Please enter a dataset name.");
//     const formData = new FormData();
//     for (let file of files) formData.append("files", file);
//     formData.append("dataset", datasetName);

//     await axios.post('http://localhost:5001/upload', formData);
//     alert("Upload successful!");
//     setFiles([]);
//     setDatasetName('');
//     fetchDatasets();
//   };

//   const handleAugmentClick = (dataset) => {
//     navigate('/augmentation', { state: { dataset } });
//   };

//   return (
//     <div>
//       <h2>Upload New Dataset</h2>
//       <input
//         type="text"
//         placeholder="Dataset name"
//         value={datasetName}
//         onChange={(e) => setDatasetName(e.target.value)}
//       />
//       <input type="file" multiple onChange={handleFileChange} />
//       <button onClick={handleUpload}>Upload</button>

//       <h3>Uploaded Datasets</h3>
//       <table border="1">
//         <thead>
//           <tr>
//             <th>Dataset Name</th>
//             <th># of Images</th>
//             <th>Files</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {datasets.map((ds, i) => (
//             <tr key={i}>
//               <td>{ds.name}</td>
//               <td>{ds.count}</td>
//               <td>
//                 {ds.files.map((file, j) => (
//                   <div key={j}>
//                     {file.match(/\.(jpg|jpeg|png)$/i) ? (
//                       <img
//                         src={`http://localhost:5001/uploads/${ds.name}/${file}`}
//                         alt=""
//                         width="60"
//                       />
//                     ) : (
//                       <a href={`http://localhost:5001/uploads/${ds.name}/${file}`} download>{file}</a>
//                     )}
//                   </div>
//                 ))}
//                 {ds.augmented_zip && (
//                   <div>
//                     <strong>Augmented ZIP:</strong>
//                     <a href={`http://localhost:5001/augmented/${ds.name}/${ds.augmented_zip}`} download>
//                       {ds.augmented_zip}
//                     </a>
//                   </div>
//                 )}
//               </td>
//               <td>
//                 <button onClick={() => handleAugmentClick(ds)}>Augment</button>
//                 {ds.augmentations?.length > 0 && (
//                   <ul>
//                     {ds.augmentations.map((a, k) => <li key={k}>{a}</li>)}
//                   </ul>
//                 )}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default Uploads;



import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Uploads = () => {
  const [files, setFiles] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [datasetName, setDatasetName] = useState('');
  const [templateDatasetName, setTemplateDatasetName] = useState(''); // For copying augmentations
  const navigate = useNavigate();

  const fetchDatasets = async () => {
    try {
      const res = await axios.get('http://localhost:5001/datasets');
      setDatasets(res.data);
    } catch (error) {
      console.error("Error fetching datasets:", error);
      alert("Could not fetch datasets. Ensure the backend is running.");
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
      await axios.post('http://localhost:5001/upload', formData);
      alert("Upload successful!");
      setFiles([]);
      setDatasetName('');
      fetchDatasets(); // Refresh dataset list
    } catch (error) {
      console.error("Upload error:", error);
      alert(`Upload failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleAugmentClick = (dataset) => {
    let dataToPass = { dataset };
    if (templateDatasetName) {
      const templateDs = datasets.find(d => d.name === templateDatasetName);
      if (templateDs && templateDs.techniques && templateDs.techniques.length > 0) {
        dataToPass.augmentationsToPreload = {
          techniques: templateDs.techniques,
          parameters: templateDs.parameters || {}
        };
        alert(`Preloading augmentations from: ${templateDatasetName}`);
      } else if (templateDs) {
        alert(`Template dataset '${templateDatasetName}' has no saved augmentations.`);
      }
    }
    navigate('/augmentation', { state: dataToPass });
  };

  return (
    <div>
      <h2>Upload New Dataset</h2>
      <input
        type="text"
        placeholder="New dataset name"
        value={datasetName}
        onChange={(e) => setDatasetName(e.target.value)}
        style={{ marginRight: '10px' }}
      />
      <input type="file" multiple onChange={handleFileChange} style={{ marginRight: '10px' }} />
      <button onClick={handleUpload}>Upload</button>

      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <h3>Copy Augmentation Settings (Optional)</h3>
        <select
          value={templateDatasetName}
          onChange={(e) => setTemplateDatasetName(e.target.value)}
          style={{ marginRight: '10px' }}
        >
          <option value="">Don't copy settings / Use defaults</option>
          {datasets
            .filter(ds => ds.techniques && ds.techniques.length > 0)
            .map(ds => (
              <option key={ds.name} value={ds.name}>
                {ds.name} (Techniques: {ds.techniques.join(', ')})
              </option>
            ))}
        </select>
        <span>
            Select a previously augmented dataset to use its settings when you click 'Augment' on any dataset.
        </span>
      </div>

      <h3>Uploaded Datasets</h3>
      <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Dataset Name</th>
            <th># of Images</th>
            <th>Files (Sample Previews)</th>
            <th>Applied Augmentations</th>
            <th>Augmented ZIP</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {datasets.map((ds) => (
            <tr key={ds.name}>
              <td>{ds.name}</td>
              <td>{ds.count}</td>
              <td>
                {ds.files.slice(0, 5).map((file, j) => ( // Show only first 5 files for brevity
                  <div key={j} style={{ margin: '2px' }}>
                    {file.match(/\.(jpg|jpeg|png)$/i) ? (
                      <img
                        src={`http://localhost:5001/uploads/${ds.name}/${encodeURIComponent(file)}`}
                        alt={file}
                        width="50"
                        onError={(e) => e.target.style.display='none'} // Hide if image fails to load
                      />
                    ) : (
                      <a href={`http://localhost:5001/uploads/${ds.name}/${encodeURIComponent(file)}`} download>{file}</a>
                    )}
                  </div>
                ))}
                {ds.files.length > 5 && <div>...and {ds.files.length - 5} more files.</div>}
              </td>
              <td>
                {ds.techniques && ds.techniques.length > 0 ? ds.techniques.join(', ') : 'N/A'}
              </td>
              <td>
                {ds.augmented_zip && (
                  <a href={`http://localhost:5001/augmented/${ds.name}/${encodeURIComponent(ds.augmented_zip)}`} download>
                    {ds.augmented_zip}
                  </a>
                )}
              </td>
              <td>
                <button onClick={() => handleAugmentClick(ds)}>Augment</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Uploads;