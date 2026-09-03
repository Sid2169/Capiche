/**
 * @module src/modules/tasks.js
 *
 * @description
 * Handles creation, storage, mutation, and initialization of task objects.
 */

/**
 * Central controller for task state and operations.
 */
export const tasksHandler = {
  /** @type {Array<object>} All task objects */
  items: [],

  /**
   * Add a new task to the list.
   * @param {object} taskObj - A task object created by `task()`.
   * @returns {number} Index where the task was added.
   */
  addTask(taskObj) {
    return this.items.push(taskObj) - 1;
  },

  /**
   * Remove a task by index.
   * @param {number} index - Position of the task in the list.
   * @returns {Array<object>} Removed task(s).
   */
  removeTask(index) {
    return this.items.splice(index, 1);
  },

  /**
   * Remove all tasks belonging to a specific project.
   * @param {string} projectId - MongoDB project _id to filter out.
   */
  removeProjectTasks(projectId) {
    this.items = this.items.filter((task) => task.project !== projectId);
  },

  /**
   * Initialize internal task state.
   * Converts date strings back to `Date` objects.
   */
  init() {
    for (const task of this.items) {
      if (task.date !== null) task.date = new Date(task.date);
    }
  }
};

/**
 * Factory for building new task objects.
 * @param {string} title
 * @param {string} details
 * @param {Date|null} date
 * @param {string} priority - e.g., "low", "medium", "high", "none"
 * @param {string} project - MongoDB project _id
 * @param {boolean} [completed=false]
 * @returns {object}
 */
export const task = (
  title,
  details,
  date,
  priority,
  project,
  completed = false
) => ({
  title,
  details,
  date,
  priority,
  completed,
  project,
});
