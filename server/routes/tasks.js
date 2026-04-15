const express = require('express');
const auth = require('../middleware/auth');
const Task = require('../models/Task');

const router = express.Router();

/**
 * GET all tasks for the current user
 */
router.get('/', auth, async (req, res) => {
  const tasks = await Task.find({ owner: req.userId });
  res.json(tasks);
});

/**
 * CREATE a task
 */
router.post('/', auth, async (req, res) => {
  const task = await Task.create({
    title: req.body.title,
    details: req.body.details,
    date: req.body.date,
    priority: req.body.priority,
    completed: req.body.completed,
    project: req.body.project,   // required
    owner: req.userId            // required
  });

  res.status(201).json(task);
});

/**
 * UPDATE a task
 */
router.put('/:id', auth, async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, owner: req.userId },
    {
      title: req.body.title,
      details: req.body.details,
      date: req.body.date,
      priority: req.body.priority,
      completed: req.body.completed
    },
    { new: true }
  );

  res.json(task);
});

/**
 * DELETE a task
 */
router.delete('/:id', auth, async (req, res) => {
  await Task.findOneAndDelete({
    _id: req.params.id,
    owner: req.userId
  });

  res.json({ message: 'Deleted' });
});

module.exports = router;