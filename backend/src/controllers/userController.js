const Project = require('../models/projectModel');

const fetchProjects = async (req, res) => {
    try {
        const userId = req.params.userId;
        const projects = await Project.find({ userId });

        const result = projects.map(p => ({
            _id: p._id,
            name: p.name,
            type: p.type,
            duration: `${p.duration.value} ${p.duration.unit}`,
            description: p.description,
            completedTasks: p.tasks.filter(t => t.status === 'completed').length,
            totalTasks: p.tasks.length
        }));

        res.status(200).json(result);
    } catch (err) {
        console.error('Error fetching projects:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const fetchProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.status(200).json(project);
    } catch (err) {
        console.error('Error fetching project by ID:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const createProject = async (req, res) => {
    try {
        const { name, type, duration, description, userId } = req.body;

        if (!name || !type || !duration || !userId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const [valueStr, unit] = duration.trim().split(' ');
        const durationValue = parseInt(valueStr);

        if (isNaN(durationValue) || !['days', 'weeks', 'months'].includes(unit)) {
            return res.status(400).json({ error: 'Invalid duration format' });
        }

        const newProject = new Project({
            userId,
            name,
            type,
            duration: {
                value: durationValue,
                unit: unit
            },
            description,
            tasks: [] // empty for now
        });

        const saved = await newProject.save();
        res.status(201).json(saved);
    } catch (err) {
        console.error('Error creating project:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        if (!projectId) {
            return res.status(400).json({ error: 'Missing project ID' });
        }

        const deleted = await Project.findByIdAndDelete(projectId);

        if (!deleted) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (err) {
        console.error('Error deleting project:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};



// Add a new task to a project
const addTask = async (req, res) => {
    const { projectId } = req.params;
    const { title, description } = req.body;

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        project.tasks.push({ title, description });
        await project.save();

        res.status(200).json({ message: 'Task added successfully', task: project.tasks.slice(-1)[0] });
    } catch (err) {
        console.error('Error adding task:', err);
        res.status(500).json({ error: 'Failed to add task' });
    }
};

// Update the status of an existing task
const updateTaskStatus = async (req, res) => {
    const { projectId, taskId } = req.params;
    const { status } = req.body;

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const task = project.tasks.id(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        task.status = status;
        if (status === 'completed') {
            task.completedAt = new Date();
        }

        await project.save();

        res.status(200).json({ message: 'Task status updated successfully', task });
    } catch (err) {
        console.error('Error updating task status:', err);
        res.status(500).json({ error: 'Failed to update task status' });
    }
};

// Delete a task from a project
const deleteTask = async (req, res) => {
    const { projectId, taskId } = req.params;

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const task = project.tasks.id(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Use pull to remove subdocument by id
        project.tasks.pull(taskId);
        await project.save();

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (err) {
        console.error('Error deleting task:', err);
        res.status(500).json({ error: 'Failed to delete task' });
    }
};



module.exports = {
    deleteProject,
    fetchProjects,
    fetchProjectById,
    createProject,
    deleteTask,
    updateTaskStatus,
    addTask
};
