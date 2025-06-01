import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PreviewDataset = () => {
    const { encodedDatasetName, contentType, runId } = useParams();
    const navigate = useNavigate();
    const [datasetName, setDatasetName] = useState('');
    const [images, setImages] = useState([]);
    const [selectedImg, setSelectedImg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log(runId);
        let decodedName;
        try {
            decodedName = atob(encodedDatasetName);
            setDatasetName(decodedName);
        } catch (err) {
            console.error('Error decoding dataset name:', err);
            setError('Invalid dataset name in URL.');
            setLoading(false);
            return;
        }

        const fetchImages = async () => {
            setLoading(true);
            setError(null);
            let apiUrl = '';

            if (contentType === 'uploads') {
                apiUrl = `${process.env.REACT_APP_FlaskUrl}/preview_uploads/${encodeURIComponent(decodedName)}`;
            } else if (contentType === 'run' && runId) {
                apiUrl = `${process.env.REACT_APP_FlaskUrl}/preview_runs/${encodeURIComponent(decodedName)}/${encodeURIComponent(runId)}`;
            } else {
                setError("Invalid preview URL. Please specify 'uploads' or a valid 'runId'.");
                setLoading(false);
                return;
            }

            try {
                const res = await axios.get(apiUrl);
                setImages(res.data.images);
            } catch (err) {
                console.error('Error fetching preview:', err);
                setError(`Failed to load images: ${err.response?.data?.error || err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, [encodedDatasetName, contentType, runId, navigate]);

    return (
        <div className="container my-4" style={{ fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif" }}>
            <h3 className="text-center mb-4 text-primary">
                Preview: {datasetName} {contentType === 'run' && runId ? <span className="badge bg-info ms-2">Run: {runId}</span> : <span className="badge bg-secondary ms-2">Original Uploads</span>}
            </h3>

            {loading && (
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading images...</p>
                </div>
            )}

            {error && (
                <div className="alert alert-danger text-center" role="alert">
                    {error}
                </div>
            )}

            {!loading && !error && images.length === 0 && (
                <div className="alert alert-warning text-center" role="alert">
                    No images found for this {contentType === 'runs' ? 'run' : 'dataset'}.
                </div>
            )}

            {!loading && !error && images.length > 0 && (
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
                    {images.map((img, i) => (
                        <div className="col" key={i}>
                            <div className="card shadow-sm h-100" style={{ cursor: 'pointer' }} onClick={() => setSelectedImg(img)} data-bs-toggle="modal" data-bs-target="#previewModal">
                                <div className="ratio ratio-1x1">
                                    <img
                                        src={`data:image/${img.format};base64,${img.base64}`}
                                        alt={img.name}
                                        className="card-img-top rounded"
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                                <div className="card-body">
                                    <p className="card-text small text-muted text-truncate" title={img.name}>{img.name}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal for larger image preview */}
            <div className="modal fade" id="previewModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header bg-light">
                            <h5 className="modal-title text-primary">{selectedImg?.name}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body text-center">
                            {selectedImg && (
                                <img
                                    src={`data:image/${selectedImg.format};base64,${selectedImg.base64}`}
                                    alt={selectedImg.name}
                                    className="img-fluid rounded shadow-sm"
                                    style={{ maxHeight: '80vh' }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreviewDataset;