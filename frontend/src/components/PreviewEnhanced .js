import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Buffer } from 'buffer';

const PreviewEnhanced = () => {
    const { encodedDatasetName } = useParams();
    const [datasetName, setDatasetName] = useState('');
    const [imagePairs, setImagePairs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (encodedDatasetName) {
            try {
                const decodedName = Buffer.from(encodedDatasetName, 'base64').toString('utf-8');
                setDatasetName(decodedName);
                fetchPreviewData(decodedName);
            } catch (e) {
                console.error("Error decoding dataset name:", e);
                setError("Invalid dataset name.");
                setLoading(false);
            }
        }
    }, [encodedDatasetName]);

    const fetchPreviewData = async (decodedName) => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get(`${process.env.REACT_APP_FlaskUrl}/preview_enhanced/${decodedName}`);
            const originalsData = res.data.originals || [];
            const enhancedData = res.data.enhanced || [];

            const pairs = originalsData.map((original, index) => ({
                original,
                enhanced: enhancedData[index] || null, // Match by index
            }));

            setImagePairs(pairs);
        } catch (err) {
            console.error("Failed to fetch preview data", err);
            setError("Failed to load preview data.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-4">
            <h2 className="text-center mb-4">Preview Dataset: {datasetName}</h2>

            {loading && <div className="text-center">Loading preview...</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && !error && (
                <div className="table-responsive">
                    <table className="table table-bordered align-middle">
                        <thead>
                            <tr>
                                <th className="text-center">Original Image</th>
                                <th className="text-center">Enhanced Image</th>
                            </tr>
                        </thead>
                        <tbody>
                            {imagePairs.map((pair, index) => (
                                <tr key={index}>
                                    <td className="text-center">
                                        {pair.original ? (
                                            <div>
                                                <img
                                                    src={`${process.env.REACT_APP_FlaskUrl}/image_enhanced/${datasetName}/originals/${pair.original}`}
                                                    alt={`Original ${index + 1}`}
                                                    className="img-fluid"
                                                    style={{ maxWidth: '300px', maxHeight: '300px' }}
                                                />
                                                <p className="mt-2">{pair.original}</p>
                                                <p><small className="text-muted">Original</small></p>
                                            </div>
                                        ) : (
                                            <div className="text-muted">No Original</div>
                                        )}
                                    </td>
                                    <td className="text-center">
                                        {pair.enhanced ? (
                                            <div>
                                                <img
                                                    src={`${process.env.REACT_APP_FlaskUrl}/image_enhanced/${datasetName}/predictions/${pair.enhanced}`}
                                                    alt={`Enhanced ${index + 1}`}
                                                    className="img-fluid"
                                                    style={{ maxWidth: '300px', maxHeight: '300px' }}
                                                />
                                                <p className="mt-2">{pair.enhanced}</p>
                                                <p><small className="text-muted">Enhanced</small></p>
                                            </div>
                                        ) : (
                                            <div className="text-muted">No Enhanced</div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {imagePairs.length === 0 && (
                                <tr>
                                    <td colSpan="2" className="text-center text-muted">No images found for this dataset.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PreviewEnhanced;