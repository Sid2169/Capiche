const express = require('express');
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const Task = require('../models/Task');
const router = express.Router();

// Get all projects for current user
router.get('/', auth, async (req, res) => {
  const projects = await Project.find({ owner: req.userId });
  res.json(projects);
});

// Create a project
router.post('/', auth, async (req, res) => {
  const project = await Project.create({ title: req.body.title, owner: req.userId });
  res.status(201).json(project);
});

// Update a project title
router.put('/:id', auth, async (req, res) => {
  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, owner: req.userId },
    { title: req.body.title },
    { new: true }
  );
  res.json(project);
});

// Delete a project and its tasks
router.delete('/:id', auth, async (req, res) => {
  await Task.deleteMany({ project: req.params.id, owner: req.userId });
  await Project.findOneAndDelete({ _id: req.params.id, owner: req.userId });
  res.json({ message: 'Deleted' });
});

module.exports = router;