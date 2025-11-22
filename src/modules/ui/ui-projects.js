/**
 * @module src/modules/ui/ui-projects.js
 *
 * @description
 * Handles UI interactions for project management:
 * - Creating, deleting, selecting, and renaming projects
 * - Rendering sidebar items and workspace titles
 * - Coordinating with task rendering and storage modules
 */

import { renderTasks, resetSortTasksBtn } from "./ui-tasks.js";
import { createNewProject, projectsHandler } from "../projects.js";
import { tasksHandler } from "../tasks.js";
import { updateProjectsStorage, updateTasksStorage } from "../storage.js";
import { sidebar } from "./ui-menu.js";

// ------------------------------------------------------
// State
// ------------------------------------------------------

/** Tracks which project (or filter like "Today") is currently active */
let activeTab = 0;

/** Reference to the sidebar title element for the selected project */
let sidebarProjectTitle = null;

// ------------------------------------------------------
// DOM Cache
// ------------------------------------------------------

const sidebarItems = sidebar.getElementsByClassName("sidebar_item");
const sidebarUserProjects = document.querySelector(".sidebar_my-projects");

const newProjectBtn = document.getElementById("newProject");
const newProjectForm = document.querySelector(".n-project_form");

const workspaceTitle = document.querySelector(".workspace_title");
const newTaskContainer = document.querySelector(".n-task");

// ------------------------------------------------------
// Event Listeners
// ------------------------------------------------------

newProjectBtn.addEventListener("click", showNewProjectForm);

sidebarItems[0].addEventListener("click", (e) =>
  changeProject(e.currentTarget, 0)
);
sidebarItems[1].addEventListener("click", (e) =>
  changeProject(e.currentTarget, "Today")
);
sidebarItems[2].addEventListener("click", (e) =>
  changeProject(e.currentTarget, "This Week")
);

newProjectForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = e.currentTarget.elements["formProjectTitle"].value;
  if (!title) return;

  e.currentTarget.reset();
  hideNewProjectForm();
  composeNewProject(title);
});

// ------------------------------------------------------
// Project Creation
// ------------------------------------------------------

function composeNewProject(title) {
  const index = createNewProject(title);
  const projectUI = createProjectUI(projectsHandler.items[index], index);

  sidebarUserProjects.prepend(projectUI);
  updateProjectsStorage();

  changeProject(projectUI, index);
}

/**
 * Build a sidebar UI entry for a project.
 */
function createProjectUI(project, projectIndex) {
  const item = document.createElement("li");
  const projectIcon = document.createElement("span");
  const projectTitle = document.createElement("div");
  const deleteProjectBtn = document.createElement("button");

  item.classList.add("sidebar_item");
  projectIcon.classList.add("icon-container");
  projectTitle.classList.add("sidebar_item-title", "flex-g");
  deleteProjectBtn.classList.add("icon-container", "sidebar_item-btn");

  deleteProjectBtn.title = "Delete project";
  deleteProjectBtn.setAttribute("aria-label", "Delete project");

  projectTitle.textContent = project.title;

  projectIcon.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m3.3 15.4c.717 0 1.3.583 1.3 1.3s-.583 1.3-1.3 1.3-1.3-.583-1.3-1.3.583-1.3 1.3-1.3zm2.7
      1.85c0-.414.336-.75.75-.75h14.5c.414 0 .75.336.75.75s-.336.75-.75.75h-14.5c-.414 0-.75-.336-.75-.75zm-2.7-6.55c.717
      0 1.3.583 1.3 1.3s-.583 1.3-1.3 1.3-1.3-.583-1.3-1.3.583-1.3 1.3-1.3zm2.7 1.3c0-.414.336-.75.75-.75h14.5c.414
      0 .75.336.75.75s-.336.75-.75.75h-14.5c-.414 0-.75-.336-.75-.75zm-2.7-6c.717 0 1.3.583 1.3 1.3s-.583 1.3-1.3
      1.3-1.3-.583-1.3-1.3.583-1.3 1.3-1.3zm2.7.75c0-.414.336-.75.75-.75h14.5c.414 0 .75.336.75.75s-.336.75-.75.75h-14.5c-.414
      0-.75-.336-.75-.75z" fill-rule="nonzero" />
    </svg>`;

  deleteProjectBtn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"></path>
    </svg>`;

  item.append(projectIcon, projectTitle, deleteProjectBtn);

  item.addEventListener("click", (e) => {
    if (e.target.closest(".sidebar_item-btn")) {
      deleteProject(projectIndex);
      return;
    }
    changeProject(e.currentTarget, projectIndex);
  });

  return item;
}

// ------------------------------------------------------
// Project Deletion
// ------------------------------------------------------

function deleteProject(index) {
  const projectId = projectsHandler.items[index].id;

  const confirmed = window.confirm(
    "Are you sure you want to delete this project? This action cannot be undone."
  );
  if (!confirmed) return;

  tasksHandler.removeProjectTasks(projectId);
  projectsHandler.removeProject(index);

  updateProjectsStorage();
  updateTasksStorage();
  renderProjects();
}

// ------------------------------------------------------
// Project Switching
// ------------------------------------------------------

function changeProject(projectNode, projectIndex) {
  switchProjectTab(projectNode);
  resetSortTasksBtn();

  activeTab = projectIndex;
  sidebarProjectTitle = projectNode.querySelector(".flex-g");

  workspaceTitle.removeEventListener("click", updateProjectTitle);

  // "Today" & "This Week" behave like filters, not projects
  if (projectIndex === "Today" || projectIndex === "This Week") {
    workspaceTitle.textContent = projectIndex;
    newTaskContainer.classList.remove("active");
  } else {
    const project = projectsHandler.items[projectIndex];
    workspaceTitle.textContent = project.title;

    newTaskContainer.classList.add("active");

    if (project.id !== 0) {
      workspaceTitle.addEventListener("click", updateProjectTitle);
    }
  }

  renderTasks();
}

function switchProjectTab(tab) {
  const actives = sidebar.querySelectorAll(".sidebar_item.active");
  actives.forEach((item) => item.classList.remove("active"));

  tab.classList.add("active");
}

// ------------------------------------------------------
// Project Title Editing
// ------------------------------------------------------

function updateProjectTitle() {
  const currProject = projectsHandler.items[activeTab];

  const input = document.createElement("input");
  input.type = "text";
  input.autocomplete = "off";
  input.classList.add("workspace_title-input");
  input.value = currProject.title;

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") input.blur();
  });

  input.addEventListener("blur", () => {
    const value = input.value.trim() || "Untitled";

    workspaceTitle.innerText = value;
    sidebarProjectTitle.innerText = value;
    currProject.title = value;

    input.remove();
    updateProjectsStorage();
    workspaceTitle.classList.add("active");
  });

  input.addEventListener("input", () => {
    sidebarProjectTitle.innerText = input.value;
    currProject.title = input.value;
  });

  workspaceTitle.classList.remove("active");
  workspaceTitle.after(input);
  input.focus();
}

// ------------------------------------------------------
// Rendering
// ------------------------------------------------------

function renderProjects() {
  const fragment = document.createDocumentFragment();
  const total = projectsHandler.items.length;

  if (total > 1) {
    for (let i = 1; i < total; i++) {
      fragment.prepend(createProjectUI(projectsHandler.items[i], i));
    }
  }

  sidebarItems[0].click();
  sidebarUserProjects.innerHTML = "";
  sidebarUserProjects.prepend(fragment);
}

// ------------------------------------------------------
// New Project Form
// ------------------------------------------------------

function showNewProjectForm() {
  newProjectBtn.classList.remove("active");
  newProjectForm.classList.add("active");

  document.addEventListener("click", detectClickOutsideForm);
  newProjectForm.firstElementChild.focus();
}

function hideNewProjectForm() {
  newProjectBtn.classList.add("active");
  newProjectForm.classList.remove("active");

  document.removeEventListener("click", detectClickOutsideForm);
}

function detectClickOutsideForm(e) {
  if (
    e.target.closest(".n-project_form") ||
    e.target.closest("#newProject")
  )
    return;

  hideNewProjectForm();
}

// ------------------------------------------------------
// Exports
// ------------------------------------------------------

export { activeTab, renderProjects };
