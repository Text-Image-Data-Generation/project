import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EnhancedManager = () => {
    const [datasets, setDatasets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [datasetName, setDatasetName] = useState('');
    const [uploading, setUploading] = useState(false);

    const fetchDatasets = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_FlaskUrl}enhanced_datasets`);
            setDatasets(res.data);
        } catch (e) {
            console.error("Failed to fetch enhanced datasets", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDatasets();
    }, []);

    const handleFileChange = (e) => {
        setSelectedFiles(e.target.files);
    };

    const handleUpload = async () => {
        if (!datasetName.trim() || selectedFiles.length === 0) {
            alert("Please enter a dataset name and select files.");
            return;
        }

        const formData = new FormData();
        formData.append('dataset', datasetName.trim());
        for (let i = 0; i < selectedFiles.length; i++) {
            formData.append('files', selectedFiles[i]);
        }

        setUploading(true);
        try {
            const res = await axios.post(`${process.env.REACT_APP_FlaskUrl}upload_and_enhance`, formData);
            alert(`Enhancement complete: ${res.data.enhanced_count} images processed`);
            setSelectedFiles([]);
            setDatasetName('');
            fetchDatasets();
        } catch (error) {
            console.error("Upload/Enhance failed", error);
            alert("Upload failed: " + (error.response?.data?.error || error.message));
        } finally {
            setUploading(false);
        }
    };

    const downloadZip = (dataset) => {
        window.open(`${process.env.REACT_APP_FlaskUrl}enhanced_zip/${dataset}`);
    };

    return (
        <div style={{ maxWidth: 900, margin: '2rem auto', padding: '1rem 2rem', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Upload and Enhance with ESRGAN</h2>

            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    marginBottom: '2rem',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <input
                    type="text"
                    placeholder="Enter Dataset Name"
                    value={datasetName}
                    onChange={(e) => setDatasetName(e.target.value)}
                    style={{
                        padding: '10px',
                        fontSize: '1rem',
                        borderRadius: 6,
                        border: '1px solid #ccc',
                        flex: '1 1 250px',
                        minWidth: '200px',
                    }}
                />
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{
                        flex: '1 1 250px',
                        minWidth: '200px',
                        padding: '6px 10px',
                        borderRadius: 6,
                        border: '1px solid #ccc',
                        cursor: 'pointer',
                    }}
                />
                <button
                    onClick={handleUpload}
                    disabled={uploading}
                    style={{
                        padding: '10px 20px',
                        fontSize: '1rem',
                        borderRadius: 6,
                        border: 'none',
                        backgroundColor: uploading ? '#999' : '#007bff',
                        color: '#fff',
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        minWidth: '160px',
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(0,123,255,0.4)',
                        transition: 'background-color 0.3s',
                    }}
                    onMouseEnter={e => !uploading && (e.target.style.backgroundColor = '#0056b3')}
                    onMouseLeave={e => !uploading && (e.target.style.backgroundColor = '#007bff')}
                >
                    {uploading ? 'Uploading & Enhancing...' : 'Upload & Enhance'}
                </button>
            </div>

            <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Enhanced Datasets</h3>

            {loading ? (
                <p style={{ textAlign: 'center' }}>Loading datasets...</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table
                        style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '1rem',
                            minWidth: '600px',
                        }}
                    >
                        <thead style={{ backgroundColor: '#007bff', color: '#fff' }}>
                            <tr>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Dataset</th>
                                <th style={{ padding: '12px', textAlign: 'center' }}>Original Count</th>
                                <th style={{ padding: '12px', textAlign: 'center' }}>Enhanced Count</th>
                                <th style={{ padding: '12px', textAlign: 'center' }}>Download</th>
                            </tr>
                        </thead>
                        <tbody>
                            {datasets.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '16px' }}>
                                        No enhanced datasets yet.
                                    </td>
                                </tr>
                            ) : (
                                datasets.map((ds) => (
                                    <tr key={ds.dataset} style={{ borderBottom: '1px solid #ddd' }}>
                                        <td style={{ padding: '12px' }}>{ds.dataset}</td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>{ds.original_count}</td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>{ds.enhanced_count}</td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <button
                                                onClick={() => downloadZip(ds.dataset)}
                                                style={{
                                                    padding: '6px 12px',
                                                    backgroundColor: '#28a745',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    transition: 'background-color 0.3s',
                                                }}
                                                onMouseEnter={(e) => (e.target.style.backgroundColor = '#1e7e34')}
                                                onMouseLeave={(e) => (e.target.style.backgroundColor = '#28a745')}
                                            >
                                                Download ZIP
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default EnhancedManager;
