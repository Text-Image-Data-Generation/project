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
        </div>
    );
};

export default Home;
