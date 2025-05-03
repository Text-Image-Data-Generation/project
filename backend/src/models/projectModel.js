const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    completedAt: { type: Date }
}, { timestamps: true }); // includes createdAt and updatedAt

const projectSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'signupdetail', required: true },
    name: { type: String, required: true },
    type: { 
        type: String, 
        enum: ['Web Development', 'App Development', 'AI', 'Music', 'Other'],
        required: true 
    },
    duration: {
        value: { type: Number, required: true },   // e.g., 4
        unit: { type: String, enum: ['days', 'weeks', 'months'], required: true } // e.g., weeks
    },
    description: { type: String },
    tasks: [taskSchema]
}, { timestamps: true }); // timestamps for project

module.exports = mongoose.model('Project', projectSchema);
