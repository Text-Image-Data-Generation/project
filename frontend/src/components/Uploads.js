// // // // Uploads.js
// // // import React, { useState, useEffect } from 'react';
// // // import axios from 'axios';
// // // import { useNavigate } from 'react-router-dom';

// // // const Uploads = () => {
// // //   const [files, setFiles] = useState([]);
// // //   const [datasets, setDatasets] = useState([]);
// // //   const [datasetName, setDatasetName] = useState('');
// // //   const navigate = useNavigate();

// // //   const fetchDatasets = async () => {
// // //     const res = await axios.get('http://localhost:5001/datasets');
// // //     setDatasets(res.data);
// // //   };

// // //   useEffect(() => {
// // //     fetchDatasets();
// // //   }, []);

// // //   const handleFileChange = (e) => {
// // //     setFiles(e.target.files);
// // //   };

// // //   const handleUpload = async () => {
// // //     if (!datasetName) return alert("Please enter a dataset name.");
// // //     const formData = new FormData();
// // //     for (let file of files) formData.append("files", file);
// // //     formData.append("dataset", datasetName);

// // //     await axios.post('http://localhost:5001/upload', formData);
// // //     alert("Upload successful!");
// // //     setFiles([]);
// // //     setDatasetName('');
// // //     fetchDatasets();
// // //   };

// // //   const handleAugmentClick = (dataset) => {
// // //     navigate('/augmentation', { state: { dataset } });
// // //   };

// // //   return (
// // //     <div>
// // //       <h2>Upload New Dataset</h2>
// // //       <input
// // //         type="text"
// // //         placeholder="Dataset name"
// // //         value={datasetName}
// // //         onChange={(e) => setDatasetName(e.target.value)}
// // //       />
// // //       <input type="file" multiple onChange={handleFileChange} />
// // //       <button onClick={handleUpload}>Upload</button>

// // //       <h3>Uploaded Datasets</h3>
// // //       <table border="1">
// // //         <thead>
// // //           <tr>
// // //             <th>Dataset Name</th>
// // //             <th># of Images</th>
// // //             <th>Files</th>
// // //             <th>Actions</th>
// // //           </tr>
// // //         </thead>
// // //         <tbody>
// // //           {datasets.map((ds, i) => (
// // //             <tr key={i}>
// // //               <td>{ds.name}</td>
// // //               <td>{ds.count}</td>
// // //               <td>
// // //                 {ds.files.map((file, j) => (
// // //                   <div key={j}>
// // //                     {file.match(/\.(jpg|jpeg|png)$/i) ? (
// // //                       <img
// // //                         src={`http://localhost:5001/uploads/${ds.name}/${file}`}
// // //                         alt=""
// // //                         width="60"
// // //                       />
// // //                     ) : (
// // //                       <a href={`http://localhost:5001/uploads/${ds.name}/${file}`} download>{file}</a>
// // //                     )}
// // //                   </div>
// // //                 ))}
// // //                 {ds.augmented_zip && (
// // //                   <div>
// // //                     <strong>Augmented ZIP:</strong>
// // //                     <a href={`http://localhost:5001/augmented/${ds.name}/${ds.augmented_zip}`} download>
// // //                       {ds.augmented_zip}
// // //                     </a>
// // //                   </div>
// // //                 )}
// // //               </td>
// // //               <td>
// // //                 <button onClick={() => handleAugmentClick(ds)}>Augment</button>
// // //                 {ds.augmentations?.length > 0 && (
// // //                   <ul>
// // //                     {ds.augmentations.map((a, k) => <li key={k}>{a}</li>)}
// // //                   </ul>
// // //                 )}
// // //               </td>
// // //             </tr>
// // //           ))}
// // //         </tbody>
// // //       </table>
// // //     </div>
// // //   );
// // // };

// // // export default Uploads;



// // import React, { useState, useEffect } from 'react';
// // import axios from 'axios';
// // import { useNavigate } from 'react-router-dom';

// // const Uploads = () => {
// //   const [files, setFiles] = useState([]);
// //   const [datasets, setDatasets] = useState([]);
// //   const [datasetName, setDatasetName] = useState('');
// //   const [templateDatasetName, setTemplateDatasetName] = useState(''); // For copying augmentations
// //   const navigate = useNavigate();

// //   const fetchDatasets = async () => {
// //     try {
// //       const res = await axios.get('http://localhost:5001/datasets');
// //       setDatasets(res.data);
// //     } catch (error) {
// //       console.error("Error fetching datasets:", error);
// //       alert("Could not fetch datasets. Ensure the backend is running.");
// //     }
// //   };

// //   useEffect(() => {
// //     fetchDatasets();
// //   }, []);

// //   const handleFileChange = (e) => {
// //     setFiles(e.target.files);
// //   };

// //   const handleUpload = async () => {
// //     if (!datasetName.trim()) return alert("Please enter a dataset name.");
// //     if (files.length === 0) return alert("Please select files to upload.");

// //     const formData = new FormData();
// //     for (let file of files) formData.append("files", file);
// //     formData.append("dataset", datasetName.trim());

// //     try {
// //       await axios.post('http://localhost:5001/upload', formData);
// //       alert("Upload successful!");
// //       setFiles([]);
// //       setDatasetName('');
// //       fetchDatasets(); // Refresh dataset list
// //     } catch (error) {
// //       console.error("Upload error:", error);
// //       alert(`Upload failed: ${error.response?.data?.message || error.message}`);
// //     }
// //   };

// //   const handleAugmentClick = (dataset) => {
// //     let dataToPass = { dataset };
// //     if (templateDatasetName) {
// //       const templateDs = datasets.find(d => d.name === templateDatasetName);
// //       if (templateDs && templateDs.techniques && templateDs.techniques.length > 0) {
// //         dataToPass.augmentationsToPreload = {
// //           techniques: templateDs.techniques,
// //           parameters: templateDs.parameters || {}
// //         };
// //         alert(`Preloading augmentations from: ${templateDatasetName}`);
// //       } else if (templateDs) {
// //         alert(`Template dataset '${templateDatasetName}' has no saved augmentations.`);
// //       }
// //     }
// //     navigate('/augmentation', { state: dataToPass });
// //   };

// //   return (
// //     <div>
// //       <h2>Upload New Dataset</h2>
// //       <input
// //         type="text"
// //         placeholder="New dataset name"
// //         value={datasetName}
// //         onChange={(e) => setDatasetName(e.target.value)}
// //         style={{ marginRight: '10px' }}
// //       />
// //       <input type="file" multiple onChange={handleFileChange} style={{ marginRight: '10px' }} />
// //       <button onClick={handleUpload}>Upload</button>

// //       <div style={{ marginTop: '20px', marginBottom: '20px' }}>
// //         <h3>Copy Augmentation Settings (Optional)</h3>
// //         <select
// //           value={templateDatasetName}
// //           onChange={(e) => setTemplateDatasetName(e.target.value)}
// //           style={{ marginRight: '10px' }}
// //         >
// //           <option value="">Don't copy settings / Use defaults</option>
// //           {datasets
// //             .filter(ds => ds.techniques && ds.techniques.length > 0)
// //             .map(ds => (
// //               <option key={ds.name} value={ds.name}>
// //                 {ds.name} (Techniques: {ds.techniques.join(', ')})
// //               </option>
// //             ))}
// //         </select>
// //         <span>
// //             Select a previously augmented dataset to use its settings when you click 'Augment' on any dataset.
// //         </span>
// //       </div>

// //       <h3>Uploaded Datasets</h3>
// //       <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
// //         <thead>
// //           <tr>
// //             <th>Dataset Name</th>
// //             <th># of Images</th>
// //             <th>Files (Sample Previews)</th>
// //             <th>Applied Augmentations</th>
// //             <th>Augmented ZIP</th>
// //             <th>Actions</th>
// //           </tr>
// //         </thead>
// //         <tbody>
// //           {datasets.map((ds) => (
// //             <tr key={ds.name}>
// //               <td>{ds.name}</td>
// //               <td>{ds.count}</td>
// //               <td>
// //                 {ds.files.slice(0, 5).map((file, j) => ( // Show only first 5 files for brevity
// //                   <div key={j} style={{ margin: '2px' }}>
// //                     {file.match(/\.(jpg|jpeg|png)$/i) ? (
// //                       <img
// //                         src={`http://localhost:5001/uploads/${ds.name}/${encodeURIComponent(file)}`}
// //                         alt={file}
// //                         width="50"
// //                         onError={(e) => e.target.style.display='none'} // Hide if image fails to load
// //                       />
// //                     ) : (
// //                       <a href={`http://localhost:5001/uploads/${ds.name}/${encodeURIComponent(file)}`} download>{file}</a>
// //                     )}
// //                   </div>
// //                 ))}
// //                 {ds.files.length > 5 && <div>...and {ds.files.length - 5} more files.</div>}
// //               </td>
// //               <td>
// //                 {ds.techniques && ds.techniques.length > 0 ? ds.techniques.join(', ') : 'N/A'}
// //               </td>
// //               <td>
// //                 {ds.augmented_zip && (
// //                   <a href={`http://localhost:5001/augmented/${ds.name}/${encodeURIComponent(ds.augmented_zip)}`} download>
// //                     {ds.augmented_zip}
// //                   </a>
// //                 )}
// //               </td>
// //               <td>
// //                 <button onClick={() => handleAugmentClick(ds)}>Augment</button>
// //               </td>
// //             </tr>
// //           ))}
// //         </tbody>
// //       </table>
// //     </div>
// //   );
// // };

// // export default Uploads;



// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const Uploads = () => {
//   const [files, setFiles] = useState([]);
//   const [datasets, setDatasets] = useState([]);
//   const [datasetName, setDatasetName] = useState('');
//   const [templateDatasetName, setTemplateDatasetName] = useState('');
//   const navigate = useNavigate();

//   const fetchDatasets = async () => {
//     try {
//       const res = await axios.get('http://localhost:5001/datasets');
//       setDatasets(res.data);
//     } catch (error) {
//       console.error("Error fetching datasets:", error);
//       alert("Could not fetch datasets. Ensure the backend is running.");
//     }
//   };

//   useEffect(() => {
//     fetchDatasets();
//   }, []);

//   const handleFileChange = (e) => {
//     setFiles(e.target.files);
//   };

//   const handleUpload = async () => {
//     if (!datasetName.trim()) return alert("Please enter a dataset name.");
//     if (files.length === 0) return alert("Please select files to upload.");

//     const formData = new FormData();
//     for (let file of files) formData.append("files", file);
//     formData.append("dataset", datasetName.trim());

//     try {
//       await axios.post('http://localhost:5001/upload', formData);
//       alert("Upload successful!");
//       setFiles([]);
//       setDatasetName('');
//       fetchDatasets();
//     } catch (error) {
//       console.error("Upload error:", error);
//       alert(`Upload failed: ${error.response?.data?.message || error.message}`);
//     }
//   };

//   const handleAugmentClick = (dataset) => {
//     let dataToPass = { dataset };
//     if (templateDatasetName) {
//       const templateDs = datasets.find(d => d.name === templateDatasetName);
//       if (templateDs && templateDs.augmentation_runs && templateDs.augmentation_runs.length > 0) {
//         // Use settings from the latest run (assuming runs are appended, so last one is latest)
//         const latestRun = templateDs.augmentation_runs[templateDs.augmentation_runs.length - 1];
//         dataToPass.augmentationsToPreload = {
//           techniques: latestRun.techniques,
//           parameters: latestRun.parameters || {}
//         };
//         alert(`Preloading augmentations from latest run of: ${templateDatasetName} (Run ID: ${latestRun.run_id})`);
//       } else if (templateDs) {
//         alert(`Template dataset '${templateDatasetName}' has no saved augmentation runs.`);
//       }
//     }
//     navigate('/augmentation', { state: dataToPass });
//   };

//   return (
//     <div>
//       <h2>Upload New Dataset</h2>
//       <input
//         type="text"
//         placeholder="New dataset name"
//         value={datasetName}
//         onChange={(e) => setDatasetName(e.target.value)}
//         style={{ marginRight: '10px' }}
//       />
//       <input type="file" multiple onChange={handleFileChange} style={{ marginRight: '10px' }} />
//       <button onClick={handleUpload}>Upload</button>

//       <div style={{ marginTop: '20px', marginBottom: '20px' }}>
//         <h3>Copy Augmentation Settings (Optional)</h3>
//         <select
//           value={templateDatasetName}
//           onChange={(e) => setTemplateDatasetName(e.target.value)}
//           style={{ marginRight: '10px' }}
//         >
//           <option value="">Don't copy settings / Use defaults</option>
//           {datasets
//             .filter(ds => ds.augmentation_runs && ds.augmentation_runs.length > 0)
//             .map(ds => (
//               <option key={ds.name} value={ds.name}>
//                 {ds.name} ({ds.augmentation_runs.length} run(s))
//               </option>
//             ))}
//         </select>
//         <span>
//             Select a dataset to use its latest augmentation settings when you click 'Augment'.
//         </span>
//       </div>

//       <h3>Uploaded Datasets</h3>
//       <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
//         <thead>
//           <tr>
//             <th>Dataset Name</th>
//             <th># of Images</th>
//             <th>Files (Sample)</th>
//             <th>Augmentation Runs (ZIPs & Info)</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {datasets.map((ds) => (
//             <tr key={ds.name}>
//               <td>{ds.name}</td>
//               <td>{ds.count}</td>
//               <td>
//                 {ds.files.slice(0, 3).map((file, j) => (
//                   <div key={j} style={{ margin: '2px', wordBreak: 'break-all' }}>
//                     {file.match(/\.(jpg|jpeg|png)$/i) ? (
//                       <img
//                         src={`http://localhost:5001/uploads/${ds.name}/${encodeURIComponent(file)}`}
//                         alt={file}
//                         width="40"
//                         onError={(e) => e.target.style.display='none'}
//                       />
//                     ) : (
//                       <a href={`http://localhost:5001/uploads/${ds.name}/${encodeURIComponent(file)}`} download>
//                         {file.length > 15 ? file.substring(0,12) + '...' : file}
//                       </a>
//                     )}
//                   </div>
//                 ))}
//                 {ds.files.length > 3 && <div>...{ds.files.length - 3} more.</div>}
//               </td>
//               <td>
//                 {ds.augmentation_runs && ds.augmentation_runs.length > 0 ? (
//                   <ul style={{ paddingLeft: '15px', margin: 0 }}>
//                     {ds.augmentation_runs.map((run, index) => (
//                       <li key={index} style={{ marginBottom: '5px' }}>
//                         <strong>{run.run_id}</strong> ({run.timestamp}):&nbsp;
//                         <a href={`http://localhost:5001/augmented/${ds.name}/${encodeURIComponent(run.augmented_zip)}`} download>
//                           {run.augmented_zip}
//                         </a>
//                         <br/>
//                         <small>Techniques: {run.techniques.join(', ')}</small>
//                       </li>
//                     ))}
//                   </ul>
//                 ) : 'N/A'}
//               </td>
//               <td>
//                 <button onClick={() => handleAugmentClick(ds)}>Augment This Dataset</button>
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
  // Store the combined value for the select: "datasetName|run_id"
  const [selectedTemplateKey, setSelectedTemplateKey] = useState(''); 
  const navigate = useNavigate();

  const fetchDatasets = async () => {
    try {
      const res = await axios.get('http://localhost:5001/datasets');
      setDatasets(res.data);
    } catch (error) {
      console.error("Error fetching datasets:", error);
      // alert("Could not fetch datasets. Ensure the backend is running.");
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
      fetchDatasets();
    } catch (error) {
      console.error("Upload error:", error);
      alert(`Upload failed: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleAugmentClick = (datasetToAugment) => {
    let dataToPass = { dataset: datasetToAugment }; // The dataset we are about to augment

    if (selectedTemplateKey) {
      const [dsName, runId] = selectedTemplateKey.split('|');
      const templateDs = datasets.find(d => d.name === dsName);
      const templateRun = templateDs?.augmentation_runs.find(r => r.run_id === runId);
      
      if (templateRun) {
        dataToPass.augmentationsToPreload = {
          techniques: templateRun.techniques,
          parameters: templateRun.parameters || {}
        };
        alert(`Preloading augmentations from: ${dsName} - ${runId}`);
      } else {
        alert(`Could not find the selected template run (${dsName} - ${runId}). Using defaults.`);
      }
    }
    navigate('/augmentation', { state: dataToPass });
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <h2>Upload New Dataset</h2>
      <input
        type="text"
        placeholder="New dataset name"
        value={datasetName}
        onChange={(e) => setDatasetName(e.target.value)}
        style={{ marginRight: '10px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
      />
      <input 
        type="file" 
        multiple 
        onChange={handleFileChange} 
        style={{ marginRight: '10px' }} 
      />
      <button 
        onClick={handleUpload}
        style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Upload
      </button>

      <div style={{ marginTop: '30px', marginBottom: '30px', padding: '15px', border: '1px solid #eee', borderRadius: '4px' }}>
        <h3>Copy Augmentation Settings (Optional)</h3>
        <select
          value={selectedTemplateKey}
          onChange={(e) => setSelectedTemplateKey(e.target.value)}
          style={{ marginRight: '10px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '200px' }}
        >
          <option value="">Don't copy settings / Use defaults</option>
          {datasets.flatMap(ds =>
            ds.augmentation_runs && ds.augmentation_runs.length > 0
              ? ds.augmentation_runs.map(run => (
                  <option key={`${ds.name}|${run.run_id}`} value={`${ds.name}|${run.run_id}`}>
                    {ds.name} - {run.run_id} (Timestamp: {run.timestamp})
                  </option>
                ))
              : []
          )}
        </select>
        <span style={{ fontSize: '0.9em', color: '#555' }}>
            Select a specific past augmentation run to use its settings when you click 'Augment This Dataset'.
        </span>
      </div>

      <h3>Uploaded Datasets</h3>
      <table border="1" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9em' }}>
        <thead style={{ backgroundColor: '#f0f0f0' }}>
          <tr>
            <th style={{padding: '8px'}}>Dataset Name</th>
            <th style={{padding: '8px'}}># of Images</th>
            <th style={{padding: '8px'}}>Sample Files</th>
            <th style={{padding: '8px', width: '40%'}}>Augmentation Runs (ZIPs & Info)</th>
            <th style={{padding: '8px'}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {datasets.map((ds) => (
            <tr key={ds.name}>
              <td style={{padding: '8px'}}>{ds.name}</td>
              <td style={{padding: '8px', textAlign: 'center'}}>{ds.count}</td>
              <td style={{padding: '8px'}}>
                {ds.files && ds.files.slice(0, 3).map((file, j) => (
                  <div key={j} style={{ margin: '2px 0', wordBreak: 'break-all' }}>
                    {file.match(/\.(jpg|jpeg|png)$/i) ? (
                      <img
                        src={`http://localhost:5001/uploads/${ds.name}/${encodeURIComponent(file)}`}
                        alt={file.length > 20 ? file.substring(0,17) + '...' : file}
                        title={file}
                        width="30"
                        style={{ verticalAlign: 'middle', marginRight: '5px' }}
                        onError={(e) => e.target.style.display='none'}
                      />
                    ) : null}
                     {file.length > 20 ? file.substring(0,17) + '...' : file}
                  </div>
                ))}
                {ds.files && ds.files.length > 3 && <div style={{marginTop: '5px', color: '#777'}}>...{ds.files.length - 3} more.</div>}
              </td>
              <td style={{padding: '8px'}}>
                {ds.augmentation_runs && ds.augmentation_runs.length > 0 ? (
                  <ul style={{ paddingLeft: '15px', margin: 0, listStyleType: 'disc' }}>
                    {ds.augmentation_runs.slice().reverse().map((run, index) => ( // Show latest first
                      <li key={index} style={{ marginBottom: '8px', borderBottom: index < ds.augmentation_runs.length -1 ? '1px dashed #eee' : 'none', paddingBottom: '5px' }}>
                        <strong>{run.run_id}</strong> ({run.timestamp}):&nbsp;
                        <a 
                            href={`http://localhost:5001/augmented/${ds.name}/${encodeURIComponent(run.augmented_zip)}`} 
                            download
                            style={{color: '#007bff', textDecoration: 'none'}}
                        >
                          {run.augmented_zip}
                        </a>
                        <br/>
                        <small style={{color: '#555'}}>Techniques: {run.techniques.join(', ')}</small>
                      </li>
                    ))}
                  </ul>
                ) : 'N/A'}
              </td>
              <td style={{padding: '8px', textAlign: 'center'}}>
                <button 
                    onClick={() => handleAugmentClick(ds)}
                    style={{ padding: '8px 12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Augment This Dataset
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Uploads;