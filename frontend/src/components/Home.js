import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useNavigate } from 'react-router-dom';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const colors = ['#0d6efd', '#198754', '#fd7e14', '#6f42c1']; // Bootstrap blue, green, orange, purple

const Home = () => {
    const { userId } = useAuth();
    const { showSuccessToast, showErrorToast } = useToast();
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
    const [newProject, setNewProject] = useState({
        name: '',
        type: 'Web Development',
        durationValue: '',
        durationUnit: 'weeks',
        description: ''
    });

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_ServerUrl}/users/projects/${userId}`);
            setProjects(res.data);
        } catch (err) {
            showErrorToast('Failed to fetch projects');
        }
    };

    const handleInputChange = (e) => {
        setNewProject({ ...newProject, [e.target.name]: e.target.value });
    };

    const handleAddProject = async () => {
        if (projects.length >= 4) {
            showErrorToast("You can only have 4 projects.");
            return;
        }

        if (!newProject.name || !newProject.durationValue) {
            showErrorToast("Please fill in all required fields.");
            return;
        }

        try {
            await axios.post(`${process.env.REACT_APP_ServerUrl}/users/createProject`, {
                ...newProject,
                userId,
                duration: `${newProject.durationValue} ${newProject.durationUnit}`
            });

            showSuccessToast("Project added!");
            setNewProject({
                name: '',
                type: 'Web Development',
                durationValue: '',
                durationUnit: 'weeks',
                description: ''
            });

            fetchProjects();
            document.getElementById('closeModalBtn')?.click();
        } catch (err) {
            showErrorToast('Failed to add project');
        }
    };

    const handleDeleteProject = async () => {
        try {
            await axios.delete(`${process.env.REACT_APP_ServerUrl}/users/deleteProject/${selectedProject._id}`);
            showSuccessToast('Project deleted');
            fetchProjects();
            document.getElementById('closeDeleteModalBtn')?.click();
        } catch (err) {
            showErrorToast('Failed to delete project');
        }
    };

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const calcProgress = (completed, total) => {
        if (total === 0) return 0;
        return Math.round((completed / total) * 100);
    };

    return (
        <div className="container py-4">
            <div
                className="py-4"
                style={{
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #fff3e0, #e3f2fd)',
                    padding: '2rem'
                }}
            >
                <div
                    className="container p-4 rounded shadow-sm"
                    style={{ backgroundColor: '#ffffffc9', boxShadow: '0 0 15px rgba(0,0,0,0.05)' }}
                >
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <input
                            type="text"
                            className="form-control w-50"
                            placeholder="Search Projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button
                            className="btn btn-primary"
                            data-bs-toggle="modal"
                            data-bs-target="#addProjectModal"
                            disabled={projects.length >= 4}
                        >
                            Add Project
                        </button>
                    </div>

                    {filteredProjects.length === 0 ? (
                        <div
                            className="d-flex justify-content-center align-items-center text-center p-5 rounded"
                            style={{
                                background: 'linear-gradient(135deg, #ffe0b2, #e3f2fd)',
                                minHeight: '250px'
                            }}
                        >
                            <h4 className="text-muted">No projects found. Start by adding one!</h4>
                        </div>
                    ) : (
                        <div className="row">
                            {filteredProjects.map((project, idx) => {
                                const progress = calcProgress(project.completedTasks, project.totalTasks);
                                const color = colors[idx % colors.length];

                                return (
                                    <div className="col-md-6 mb-4" key={idx}>
                                        <div
                                            className="card h-100 border-0 shadow-sm project-card"
                                            style={{
                                                borderRadius: '15px',
                                                transition: 'transform 0.2s ease',
                                                backgroundColor: '#ffffff',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <div className="card-header bg-transparent border-0">
                                                <h6 className="mb-0">Project No - {idx + 1}</h6>
                                            </div>
                                            <hr />
                                            <div className="card-body">
                                                <h5 className="card-title mb-3" style={{ color }}>{project.name}</h5>
                                                <div className="d-flex align-items-center">
                                                    <div style={{ width: 60, height: 60 }}>
                                                        <CircularProgressbar
                                                            value={progress}
                                                            text={`${progress}%`}
                                                            styles={buildStyles({
                                                                textSize: '20px',
                                                                pathColor: color,
                                                                textColor: '#000',
                                                                trailColor: '#eee',
                                                            })}
                                                        />
                                                    </div>
                                                    <div className="ms-4">
                                                        <p className="mb-1"><strong>Type:</strong> {project.type}</p>
                                                        <p className="mb-1"><strong>Duration:</strong> {project.duration}</p>
                                                        {project.description && <p className="mb-1"><strong>Description:</strong> {project.description}</p>}
                                                        <p className="mb-1"><strong>Tasks:</strong> {project.completedTasks}/{project.totalTasks}</p>
                                                    </div>
                                                </div>
                                                <div className="d-flex gap-2 mt-3">
                                                    <button
                                                        className="btn btn-outline-primary btn-sm"
                                                        onClick={() => navigate(`/project/${btoa(project._id)}`)}
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-danger btn-sm"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#deleteConfirmModal"
                                                        onClick={() => setSelectedProject(project)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                );
                            })}
                        </div>

                    )}
                </div>
            </div>


            {/* Add Project Modal */}
            <div className="modal fade" id="addProjectModal" tabIndex="-1" aria-labelledby="addProjectModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="addProjectModalLabel">Add Project</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" id="closeModalBtn" />
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Project Name*</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    value={newProject.name}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Project Type</label>
                                <select
                                    className="form-select"
                                    name="type"
                                    value={newProject.type}
                                    onChange={handleInputChange}
                                >
                                    <option>Web Development</option>
                                    <option>App Development</option>
                                    <option>AI</option>
                                    <option>Music</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="mb-3 row">
                                <div className="col">
                                    <label className="form-label">Duration*</label>
                                    <input
                                        type="number"
                                        name="durationValue"
                                        className="form-control"
                                        value={newProject.durationValue}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="col">
                                    <label className="form-label">Unit</label>
                                    <select
                                        className="form-select"
                                        name="durationUnit"
                                        value={newProject.durationUnit}
                                        onChange={handleInputChange}
                                    >
                                        <option>days</option>
                                        <option>weeks</option>
                                        <option>months</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Description (optional)</label>
                                <textarea
                                    name="description"
                                    className="form-control"
                                    value={newProject.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button className="btn btn-primary" onClick={handleAddProject}>Save Project</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirm Modal */}
            <div className="modal fade" id="deleteConfirmModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Confirm Deletion</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" id="closeDeleteModalBtn" />
                        </div>
                        <div className="modal-body">
                            Are you sure you want to delete the project: <strong>{selectedProject?.name}</strong>?
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button className="btn btn-danger" onClick={handleDeleteProject}>Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
