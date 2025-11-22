/**
 * @module src/modules/storage.js
 *
 * @description
 * Handles loading, initializing, and persisting project and task data
 * using localStorage. Ensures fallback test data when none exists.
 */

import { tasksHandler, task } from "./tasks.js";
import { projectsHandler } from "./projects.js";
import { renderProjects } from "./ui/ui-projects.js";

/**
 * Loads stored project/task data, or inserts test data if none exists.
 * Initializes both handlers and triggers UI rendering.
 */
export const initStorage = () => {
  // Attempt to read data from localStorage
  const storedProjects = JSON.parse(localStorage.getItem("projects"));
  const storedTasks = JSON.parse(localStorage.getItem("tasks"));

  projectsHandler.items = storedProjects;
  tasksHandler.items = storedTasks;

  // If any stored data is missing, fallback to predefined test data
  if (!storedProjects || !storedTasks) {
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
        "Outline the experiences, milestones, and habits you want to cultivate in the coming months.",
        new Date("2026-01-15 00:00"),
        "high",
        0
      ),
      task(
        "Share your latest creation with the world",
        "Upload your work and let it inspire others to start their own journey.",
        new Date("2026-02-03 00:00"),
        "medium",
        0
      ),
      task(
        "Move your body with intention",
        "Choose an activity that energizes you and reconnects you with your strength.",
        new Date("2025-12-10 00:00"),
        "low",
        0,
        true
      ),
      task(
        "Support your wellbeing",
        "Take what you need today to feel balanced and grounded.",
        new Date("2025-12-05 00:00"),
        "none",
        0
      ),
      task(
        "Start a passion project",
        "Open a new space dedicated to something you truly enjoy creating.",
        new Date("2026-01-02 00:00"),
        "low",
        1
      ),
      task(
        "Develop a creative concept",
        "Explore ideas freely and shape them into something meaningful.",
        new Date("2026-01-22 00:00"),
        "none",
        1
      ),
      task(
        "Complete a 30-day creativity streak",
        "Produce something small each day: writing, sketching, music, or ideas.",
        new Date("2026-01-25 00:00"),
        "high",
        1
      ),
      task(
        "Plan a future-self strategy day",
        "Map the next 3–5 years and identify the first actionable steps.",
        new Date("2026-02-18 00:00"),
        "medium",
        1
      ),
      task(
        "Declutter one major zone of your life",
        "Tackle a digital archive, workspace, or physical storage to regain focus.",
        new Date("2025-12-30 00:00"),
        "low",
        1
      ),
    ];

    // Persist test data to localStorage
    localStorage.setItem("projects", JSON.stringify(testProjectsData));
    localStorage.setItem("tasks", JSON.stringify(testTasksData));

    // Assign defaults for runtime handlers
    projectsHandler.items = testProjectsData;
    tasksHandler.items = testTasksData;
  }

  // Initialize ID counters and rebuild any needed data state
  projectsHandler.init();
  tasksHandler.init();

  // Re-render the project interface
  renderProjects();
};

/**
 * Persists current project list to localStorage.
 */
export const updateProjectsStorage = () => {
  localStorage.setItem("projects", JSON.stringify(projectsHandler.items));
};

/**
 * Persists current task list to localStorage.
 */
export const updateTasksStorage = () => {
  localStorage.setItem("tasks", JSON.stringify(tasksHandler.items));
};
