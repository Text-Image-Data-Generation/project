import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const ProjectView = () => {
    const { id } = useParams();
    const { userId } = useAuth();
    const { showSuccessToast, showErrorToast } = useToast();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [newTask, setNewTask] = useState({ title: '', description: '' });
    const [selectedTask, setSelectedTask] = useState(null);

    const decodedId = atob(id);

    const fetchProject = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_ServerUrl}/users/project/${decodedId}`);
            setProject(res.data);
        } catch (err) {
            showErrorToast("Failed to load project");
            navigate("/project");
        }
    };

    useEffect(() => {
        fetchProject();
    }, [id]);

    const handleTaskStatusChange = async (taskId, newStatus) => {
        try {
            await axios.put(`${process.env.REACT_APP_ServerUrl}/users/project/${decodedId}/task/${taskId}`, { status: newStatus });
            showSuccessToast("Task status updated");
            fetchProject();
        } catch (err) {
            showErrorToast("Failed to update task status");
        }
    };

    const handleTaskDelete = async (taskId) => {
        try {
            await axios.delete(`${process.env.REACT_APP_ServerUrl}/users/project/${decodedId}/task/${taskId}`);
            showSuccessToast("Task deleted");
            fetchProject();
        } catch (err) {
            showErrorToast("Failed to delete task");
        }
    };

    const handleTaskCreate = async () => {
        if (!newTask.title.trim()) return showErrorToast("Task title is required");
        try {
            await axios.post(`${process.env.REACT_APP_ServerUrl}/users/project/${decodedId}/task`, newTask);
            showSuccessToast("Task created");
            setNewTask({ title: '', description: '' });
            fetchProject();
        } catch (err) {
            showErrorToast("Failed to create task");
        }
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
            month: 'short',
            day: 'numeric',
        });
    };

    if (!project) return <div className="container py-4">Loading project...</div>;

    const completed = project.tasks.filter(t => t.status === 'completed').length;
    const total = project.tasks.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(to right, #f2f2f2, #fffbea)', padding: '2rem' }}>
            <div className="container">
                <div className="card shadow-lg mb-4">
                    <div className="card-body d-flex justify-content-between align-items-center">
                        <div>
                            <h3>{project.name}</h3>
                            <p><strong>Type:</strong> {project.type}</p>
                            <p><strong>Duration:</strong> {project.duration.value} {project.duration.unit}</p>
                            <p><strong>Description:</strong> {project.description || 'No description provided.'}</p>
                        </div>
                        <div style={{ width: 80, height: 80 }}>
                            <CircularProgressbar
                                value={percent}
                                text={`${percent}%`}
                                styles={buildStyles({
                                    textSize: '18px',
                                    pathColor: '#ffa500',
                                    textColor: '#333',
                                    trailColor: '#ddd',
                                })}
                            />
                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="mb-0">Tasks</h5>
                    <button className="btn btn-warning" data-bs-toggle="modal" data-bs-target="#addTaskModal">+ Add Task</button>
                </div>

                <table className="table table-striped table-hover">
                    <thead className="table-light">
                        <tr>
                            <th>Title</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Updated</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {project.tasks.map(task => (
                            <tr key={task._id} className={task.status === 'completed' ? 'table-success' : ''}>
                                <td>{task.title}</td>
                                <td>
                                    <select
                                        className="form-select"
                                        value={task.status}
                                        onChange={(e) => handleTaskStatusChange(task._id, e.target.value)}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </td>
                                <td>{formatDate(task.createdAt)}</td>
                                <td>{formatDate(task.updatedAt)}</td>
                                <td>
                                    <button
                                        className="btn btn-secondary btn-sm me-2"
                                        data-bs-toggle="modal"
                                        data-bs-target="#viewTaskModal"
                                        onClick={() => setSelectedTask(task)}
                                    >
                                        View
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        data-bs-toggle="modal"
                                        data-bs-target="#deleteTaskModal"
                                        onClick={() => setSelectedTask(task)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Add Task Modal */}
                <div className="modal fade" id="addTaskModal" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add New Task</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                            </div>
                            <div className="modal-body">
                                <input
                                    type="text"
                                    className="form-control mb-2"
                                    placeholder="Task Title"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                />
                                <textarea
                                    className="form-control"
                                    placeholder="Task Description (optional)"
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button className="btn btn-primary" onClick={handleTaskCreate} data-bs-dismiss="modal">Create</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* View Task Modal */}
                <div className="modal fade" id="viewTaskModal" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Task Details</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                            </div>
                            <div className="modal-body">
                                {selectedTask ? (
                                    <>
                                        <p><strong>Title:</strong> {selectedTask.title}</p>
                                        <p><strong>Status:</strong> {selectedTask.status}</p>
                                        <p><strong>Description:</strong> {selectedTask.description || 'No description.'}</p>
                                        <p><strong>Created:</strong> {formatDate(selectedTask.createdAt)}</p>
                                        <p><strong>Updated:</strong> {formatDate(selectedTask.updatedAt)}</p>
                                    </>
                                ) : (
                                    <p>No task selected.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                <div className="modal fade" id="deleteTaskModal" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Delete Task</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                            </div>
                            <div className="modal-body">
                                Are you sure you want to delete the task <strong>{selectedTask?.title}</strong>?
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button
                                    className="btn btn-danger"
                                    data-bs-dismiss="modal"
                                    onClick={() => handleTaskDelete(selectedTask._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProjectView;
