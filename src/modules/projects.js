/**
 * @module src/modules/project.js
 *
 * @description
 * Manages project items in memory.
 * Projects use MongoDB's _id (string) as identifier.
 */

export const projectsHandler = {
  /** @type {Array<object>} List of stored projects {_id, title} */
  items: [],

  /**
   * Adds a project object to the collection.
   * @param {object} project - A project object {_id, title} from the API.
   * @returns {number} Index where the project was inserted.
   */
  addProject(project) {
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
};
