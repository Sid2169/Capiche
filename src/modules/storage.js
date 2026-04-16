/**
 * @module src/modules/storage.js
 *
 * @description
 * Handles loading, initializing, and persisting project and task data
 * via API calls instead of localStorage.
 */

import { tasksHandler, task } from "./tasks.js";
import { projectsHandler } from "./projects.js";
import { renderProjects } from "./ui/ui-projects.js";
import { apiFetch } from "./api.js";

/**
 * Loads project/task data from API.
 * Falls back to test data ONLY if API is empty.
 */
export const initStorage = async () => {
  try {
    const [projectsRes, tasksRes] = await Promise.all([
      apiFetch("/projects"),
      apiFetch("/tasks"),
    ]);

    let projects = await projectsRes.json();
    let tasks = await tasksRes.json();

    // Fallback if API returns empty arrays
    if (!projects.length || !tasks.length) {
      const testProjectsData = [
        { id: 0, title: "Home" },
        { id: 1, title: "Ideal Year (A sample Project)" },
      ];

      const testTasksData = [
        task(
          "Design a personal vision board",
          "Capture the goals, values, and images that motivate your long-term direction.",
          new Date("2025-12-28 00:00"),
          "none",
          0
        ),
        task(
          "Map out your ideal year",
          "Outline the experiences, milestones, and habits you want to cultivate.",
          new Date("2026-01-15 00:00"),
          "high",
          0
        ),
      ];

      // Seed API instead of localStorage
      await Promise.all([
        apiFetch("/projects", {
          method: "POST",
          body: JSON.stringify(testProjectsData),
        }),
        apiFetch("/tasks", {
          method: "POST",
          body: JSON.stringify(testTasksData),
        }),
      ]);

      projects = testProjectsData;
      tasks = testTasksData;
    }

    projectsHandler.items = projects;
    tasksHandler.items = tasks;

    projectsHandler.init();
    tasksHandler.init();

    renderProjects();
  } catch (error) {
    console.error("Failed to initialize storage:", error);
  }
};

/**
 * Sync projects with API
 */
export const updateProjectsStorage = async () => {
  try {
    await apiFetch("/projects", {
      method: "PUT",
      body: JSON.stringify(projectsHandler.items),
    });
  } catch (error) {
    console.error("Failed to update projects:", error);
  }
};

/**
 * Sync tasks with API
 */
export const updateTasksStorage = async () => {
  try {
    await apiFetch("/tasks", {
      method: "PUT",
      body: JSON.stringify(tasksHandler.items),
    });
  } catch (error) {
    console.error("Failed to update tasks:", error);
  }
};