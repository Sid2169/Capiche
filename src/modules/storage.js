import { tasksHandler, task } from "./tasks.js";
import { projectsHandler } from "./projects.js";
import { renderProjects } from "./ui/ui-projects.js";

function initStorage() {
  // Try to get data
  projectsHandler.items = JSON.parse(localStorage.getItem("projects"));
  tasksHandler.items = JSON.parse(localStorage.getItem("tasks"));

  // If there was no data in localStorage assign some test data
  if (projectsHandler.items === null || tasksHandler.items === null) {
    const testProjectsData = [
      {
        id: 0,
        title: "Home",
      },
      {
        id: 1,
        title: "Ideal Year (A sample Project)",
      },
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
    )
    ];

    localStorage.setItem("projects", JSON.stringify(testProjectsData));
    localStorage.setItem("tasks", JSON.stringify(testTasksData));

    projectsHandler.items = testProjectsData;
    tasksHandler.items = testTasksData;
  }

  projectsHandler.init();
  tasksHandler.init();
  renderProjects();
}

function updateProjectsStorage() {
  localStorage.setItem("projects", JSON.stringify(projectsHandler.items));
}

function updateTasksStorage() {
  localStorage.setItem("tasks", JSON.stringify(tasksHandler.items));
}

export { initStorage, updateProjectsStorage, updateTasksStorage };
