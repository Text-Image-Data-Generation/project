import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    const cards = [
        { title: "Image Augmentation", color: "primary", route: "/uploads" },
        { title: "CSV Synthetic Data Generation", color: "success", route: "/csv-generation" },
        { title: "Lung Image Synthetic Data Generation", color: "danger", route: "/lung-image-generation" },
        { title: "Image Resolution", color: "warning", route: "/image-resolution" },
    ];

    return (
        <div className="container py-5">
            <h2 className="text-center mb-2">Data Augmentation & Generation</h2>
            <p className="text-center text-muted mb-4">Manage and Organize Your AI Datasets</p>

            <div className="row justify-content-center">
                {cards.map((card, index) => (
                    <div key={index} className="col-md-3 col-sm-6 mb-4">
                        <div
                            className={`card border-${card.color} text-${card.color} h-100 shadow-sm`}
                            style={{
                                cursor: 'pointer',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.03)';
                                e.currentTarget.style.boxShadow = '0 0.5rem 1rem rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '';
                            }}
                            onClick={() => navigate(card.route)}
                        >
                            <div className="card-body text-center">
                                <h5 className="card-title">{card.title}</h5>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Evaluation Results */}
            <div className="mt-5">
                <h3 className="text-center mb-4">Evaluation Metrics Summary</h3>

                {/* CTGAN Summary */}
                <h5>CTGAN Summary</h5>
                <table className="table table-bordered table-hover table-striped small">

                    <thead className="thead-light">
                        <tr>
                            <th>Metric</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>Max KS Statistic</td><td>0.3783 (Sepal Length)</td></tr>
                        <tr><td>Min p-value</td><td>2.02e-11 (Sepal Length)</td></tr>
                        <tr><td>KL Divergence</td><td>0.000694</td></tr>
                        <tr><td>Classifier Accuracy</td><td>0.29</td></tr>
                        <tr><td>F1 Score</td><td>0.2866</td></tr>
                    </tbody>
                </table>

                {/* StyleGAN3 Summary */}
                <h5 className="mt-4">StyleGAN3 Summary</h5>
                <table className="table table-bordered table-hover table-striped small">
                    <thead className="thead-light">
                        <tr>
                            <th>Snapshot</th>
                            <th>KID50k (↓)</th>
                            <th>Training Time</th>
                            <th>GPUs</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>snapshot-000080.pkl</td>
                            <td>0.0510</td>
                            <td>38m 20s</td>
                            <td>2</td>
                        </tr>
                        <tr>
                            <td>snapshot-000120.pkl</td>
                            <td>0.0473</td>
                            <td>38m 25s</td>
                            <td>2</td>
                        </tr>
                    </tbody>
                </table>

                {/* ESRGAN Summary */}
                <h5 className="mt-4">ESRGAN Summary</h5>
                <table className="table table-bordered table-hover table-striped small">

                    
                    <thead className="thead-light">
                        <tr>
                            <th>Metric</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>PSNR</td><td>25.36 dB</td></tr>
                        <tr><td>SSIM</td><td>0.8043</td></tr>
                        <tr><td>Input Resolution</td><td>500 × 500 px</td></tr>
                        <tr><td>Model</td><td>ESRGAN</td></tr>
                        <tr><td>Use Case</td><td>Image Super-Resolution</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Home;