// // Uploads.js
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const Uploads = () => {
//   const [files, setFiles] = useState([]);
//   const [datasets, setDatasets] = useState([]);
//   const [datasetName, setDatasetName] = useState('');

//   const fetchDatasets = async () => {
//     try {
//       const res = await axios.get('http://localhost:5001/datasets');
//       setDatasets(res.data);
//     } catch (err) {
//       console.error("Error fetching datasets:", err);
//       alert("Unable to connect to backend on port 5001.");
//     }
//   };

//   useEffect(() => {
//     fetchDatasets();
//   }, []);

//   const handleFileChange = (e) => {
//     setFiles(e.target.files);
//   };

//   const handleUpload = async () => {
//     if (!datasetName) {
//       alert("Please enter a dataset name.");
//       return;
//     }

//     const formData = new FormData();
//     for (let file of files) {
//       formData.append("files", file);
//     }
//     formData.append("dataset", datasetName);

//     try {
//       await axios.post('http://localhost:5001/upload', formData);
//       alert("Upload successful!");
//       setDatasetName('');
//       setFiles([]);
//       fetchDatasets();
//     } catch (error) {
//       console.error("Upload error:", error);
//       alert("Upload failed.");
//     }
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Upload New Dataset</h2>
//       <input
//         type="text"
//         placeholder="Dataset name"
//         value={datasetName}
//         onChange={(e) => setDatasetName(e.target.value)}
//       />
//       <br /><br />
//       <input type="file" multiple onChange={handleFileChange} />
//       <br /><br />
//       <button onClick={handleUpload}>Upload</button>

//       <h3 style={{ marginTop: 40 }}>Uploaded Datasets</h3>
//       <table border="1" cellPadding="10">
//         <thead>
//           <tr>
//             <th>Dataset Name</th>
//             <th># of Images</th>
//             <th>Files</th>
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
//                         style={{ margin: 5 }}
//                       />
//                     ) : (
//                       <a href={`http://localhost:5001/uploads/${ds.name}/${file}`} download>{file}</a>
//                     )}
//                   </div>
//                 ))}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default Uploads;





// Uploads.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Uploads = () => {
  const [datasets, setDatasets] = useState([]);
  const navigate = useNavigate();

  const fetchDatasets = async () => {
    try {
      const res = await axios.get('http://localhost:5001/datasets');
      setDatasets(res.data);
    } catch (err) {
      console.error("Error fetching datasets:", err);
      alert("Unable to connect to backend.");
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleAugmentClick = (dataset) => {
    navigate('/augmentation', { state: { dataset } });
  };

  return (
    <div>
      <h2>Uploaded Datasets</h2>
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
                        style={{ margin: 5 }}
                      />
                    ) : (
                      <a href={`http://localhost:5001/uploads/${ds.name}/${file}`} download>{file}</a>
                    )}
                  </div>
                ))}
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
