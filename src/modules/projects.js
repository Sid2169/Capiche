/**
 * @module src/modules/project.js
 *
 * @description
 * Manages project items and their identifiers.
 */

/// Central handler for project creation, storage, and indexing
export const projectsHandler = {
  /** @type {Array<object>} List of stored projects */
  items: [],

  /** @type {number} Tracks the highest assigned project ID */
  projectIdCount: 0,

  /**
   * Adds a project object to the collection.
   * @param {object} project - A project object { id, title }.
   * @returns {number} Index where the project was inserted.
   */
  addProject(project) {
    // push returns new length → subtract 1 to get index
    return this.items.push(project) - 1;
  },

  /**
   * Removes a project from the collection.
   * @param {number} index - Position in the items array.
   * @returns {Array<object>} Removed project(s).
   */
  removeProject(index) {
    return this.items.splice(index, 1);
  },

  /**
   * Initializes internal ID counter based on existing project data.
   * Ensures new projects continue from the highest existing ID.
   */
  init() {
    this.projectIdCount = this.items.reduce(
      (highest, curr) => (curr.id > highest ? curr.id : highest),
      0
    );
  },
};

/**
 * Factory function for project objects.
 * @param {number} id - Unique identifier.
 * @param {string} title - Project title.
 * @returns {{id: number, title: string}}
 */
const createProject = (id, title) => ({ id, title });

/**
 * Creates and stores a new project.
 * @param {string} title - Title of the new project.
 * @returns {number} Index where the project was inserted.
 */
export const createNewProject = (title) => {
  // Increment ID counter for the next project
  projectsHandler.projectIdCount++;

  const newProject = createProject(projectsHandler.projectIdCount, title);
  const index = projectsHandler.addProject(newProject);

  return index;
};
