/**
 * @module src/modules/storage.js
 *
 * @description
 * Handles loading, initializing, and persisting project and task data
 * via API calls. The backend is the source of truth.
 */

import { tasksHandler, task } from "./tasks.js";
import { projectsHandler } from "./projects.js";
import { renderProjects } from "./ui/ui-projects.js";
import { apiFetch } from "../api.js";

/**
 * Async helper that checks a fetch response and throws on non-2xx.
 * @param {Response} res - fetch Response object.
 * @returns {Promise<any>} Parsed JSON body.
 */
const handleResponse = async (res) => {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

/**
 * Loads project/task data from API.
 * Seeds sample data for a brand-new user (empty account).
 */
export const initStorage = async () => {
  try {
    const [projectsRes, tasksRes] = await Promise.all([
      apiFetch("/projects"),
      apiFetch("/tasks"),
    ]);

    let projects = await handleResponse(projectsRes);
    let tasks = await handleResponse(tasksRes);

    // Seed sample data if this is a brand-new user
    if (!projects.length || !tasks.length) {
      projects = [];
      tasks = [];

      try {
        // Create two sample projects
        const homeProject = await handleResponse(
          await apiFetch("/projects", {
            method: "POST",
            body: JSON.stringify({ title: "Home" }),
          })
        );
        const idealYearProject = await handleResponse(
          await apiFetch("/projects", {
            method: "POST",
            body: JSON.stringify({ title: "Ideal Year (A Sample Project)" }),
          })
        );

        projects = [homeProject, idealYearProject];

        // Create sample tasks for the Home project
        const sampleTasks = [
          task(
            "Design a personal vision board",
            "Capture the goals, values, and images that motivate your long-term direction.",
            new Date("2025-12-28 00:00"),
            "none",
            homeProject._id
          ),
          task(
            "Map out your ideal year",
            "Outline the experiences, milestones, and habits you want to cultivate.",
            new Date("2026-01-15 00:00"),
            "high",
            homeProject._id
          ),
        ];

        tasks = await Promise.all(
          sampleTasks.map((t) =>
            handleResponse(
              apiFetch("/tasks", {
                method: "POST",
                body: JSON.stringify(t),
              })
            )
          )
        );
      } catch (seedError) {
        console.error("Failed to seed sample data:", seedError);
      }
    }

    projectsHandler.items = projects;
    tasksHandler.items = tasks;

    tasksHandler.init();
    renderProjects();
  } catch (error) {
    console.error("Failed to initialize storage:", error);
  }
};

/**
 * Create a new project on the backend, then add to local state.
 * @param {string} title - Project title.
 * @returns {Promise<object|null>} The saved project, or null on failure.
 */
export const createProjectStorage = async (title) => {
  try {
    const project = await handleResponse(
      await apiFetch("/projects", {
        method: "POST",
        body: JSON.stringify({ title }),
      })
    );
    projectsHandler.addProject(project);
    return project;
  } catch (error) {
    console.error("Failed to create project:", error);
    return null;
  }
};

/**
 * Update a project title on the backend.
 * @param {string} id - MongoDB _id.
 * @param {string} title - New title.
 * @returns {Promise<boolean>} True on success.
 */
export const updateProjectStorage = async (id, title) => {
  try {
    await handleResponse(
      await apiFetch(`/projects/${id}`, {
        method: "PUT",
        body: JSON.stringify({ title }),
      })
    );
    return true;
  } catch (error) {
    console.error("Failed to update project:", error);
    return false;
  }
};

/**
 * Delete a project and its tasks on the backend, then update local state.
 * @param {string} id - MongoDB _id.
 * @returns {Promise<boolean>} True on success.
 */
export const deleteProjectStorage = async (id) => {
  try {
    await handleResponse(
      await apiFetch(`/projects/${id}`, { method: "DELETE" })
    );

    const index = projectsHandler.items.findIndex((p) => p._id === id);
    if (index !== -1) projectsHandler.removeProject(index);

    tasksHandler.removeProjectTasks(id);
    return true;
  } catch (error) {
    console.error("Failed to delete project:", error);
    return false;
  }
};

/**
 * Create a new task on the backend, then add to local state.
 * @param {object} taskData - Task data matching backend shape.
 * @returns {Promise<object|null>} The saved task, or null on failure.
 */
export const createTaskStorage = async (taskData) => {
  try {
    const savedTask = await handleResponse(
      await apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify(taskData),
      })
    );
    return tasksHandler.addTask(savedTask);
  } catch (error) {
    console.error("Failed to create task:", error);
    return null;
  }
};

/**
 * Update a task on the backend, then update local state.
 * @param {string} id - MongoDB _id.
 * @param {object} updates - Fields to update.
 * @returns {Promise<boolean>} True on success.
 */
export const updateTaskStorage = async (id, updates) => {
  try {
    const savedTask = await handleResponse(
      await apiFetch(`/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      })
    );

    const index = tasksHandler.items.findIndex((t) => t._id === id);
    if (index !== -1) tasksHandler.items[index] = savedTask;
    return true;
  } catch (error) {
    console.error("Failed to update task:", error);
    return false;
  }
};

/**
 * Delete a task on the backend, then remove from local state.
 * @param {string} id - MongoDB _id.
 * @returns {Promise<boolean>} True on success.
 */
export const deleteTaskStorage = async (id) => {
  try {
    await handleResponse(
      await apiFetch(`/tasks/${id}`, { method: "DELETE" })
    );

    const index = tasksHandler.items.findIndex((t) => t._id === id);
    if (index !== -1) tasksHandler.removeTask(index);
    return true;
  } catch (error) {
    console.error("Failed to delete task:", error);
    return false;
  }
};
