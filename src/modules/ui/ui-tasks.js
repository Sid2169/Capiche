/**
 * @module src/modules/ui/ui-tasks.js
 * * @description Handles the UI logic for displaying, creating, editing, 
 * sorting, and filtering tasks within the application.
 */

import { format, isToday, isThisWeek, isValid, compareAsc, compareDesc, isPast } from "date-fns";
import { tasksHandler, task } from "../tasks.js";
import { projectsHandler } from "../projects.js";
import { activeTab } from "./ui-projects.js";
import { updateTasksStorage } from "../storage.js";
import { darkOverlay } from "./ui-menu.js";
import emptyMessageImage from "../../images/walking-outside.png";

/* ==========================================================================
   CONSTANTS & CONFIG
   ========================================================================== */

const ICONS = {
    sortDefault: `Sort <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3l-6 8h4v10h4v-10h4l-6-8zm16 14h-8v-2h8v2zm2 2h-10v2h10v-2zm-4-8h-6v2h6v-2zm-2-4h-4v2h4v-2zm-2-4h-2v2h2v-2z"/></svg>`,
    sortAsc: `Sort <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21l6-8h-4v-10h-4v10h-4l6 8zm16-12h-8v-2h8v2zm2-6h-10v2h10v-2zm-4 8h-6v2h6v-2zm-2 4h-4v2h4v-2zm-2 4h-2v2h2v-2z" /></svg>`,
    sortReset: `Sort <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 10v4h4l-6 7-6-7h4v-4h-4l6-7 6 7h-4zm16 5h-10v2h10v-2zm0 6h-10v-2h10v2zm0-8h-10v-2h10v2zm0-4h-10v-2h10v2zm0-4h-10v-2h10v2z"/></svg>`,
    edit: `<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12, 5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"></path></svg>`,
    delete: `<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"></path></svg>`,
    details: `<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"></path></svg>`
};

/* ==========================================================================
   STATE MANAGEMENT
   ========================================================================== */

let uncompletedTaskCount;
const currTaskInfo = {
    index: null,
};

/* ==========================================================================
   DOM ELEMENT CACHING
   ========================================================================== */

// Main Workspace Elements
const newTaskBtn = document.querySelector(".n-task_btn");
const tasksContainer = document.getElementById("tasks");
const completedTasksContainer = document.getElementById("completedTasks");
const sortTasksBtn = document.querySelector(".workspace_actions-btn");

// Modal & Form Elements
const taskModal = document.querySelector(".task-modal");
const taskModalTitle = taskModal.querySelector(".task-modal_title");
const modalCloseBtn = taskModal.querySelector(".close-modal-btn");
const selectInputs = taskModal.querySelectorAll(".task-modal_select");

// Forms
const newTaskForm = document.getElementById("newTaskForm");
const editTaskForm = document.getElementById("editTaskForm");
const newTaskTitle = document.getElementById("f-nTaskTitle");
const editTaskTitle = document.getElementById("f-eTaskTitle");

/* ==========================================================================
   EVENT LISTENERS
   ========================================================================== */

// Modal & Form Triggers
newTaskBtn.addEventListener("click", () => openModal("new"));
newTaskForm.addEventListener("submit", getNewTaskData);
editTaskForm.addEventListener("submit", editTask);
darkOverlay.addEventListener("click", closeModal);
modalCloseBtn.addEventListener("click", closeModal);

// Validation Triggers
newTaskTitle.addEventListener("blur", detectMissingInput);
editTaskTitle.addEventListener("blur", detectMissingInput);

// Priority Select Styling
selectInputs.forEach(select => {
    select.addEventListener("change", (e) => changeFormPriorityIndicator(e.target));
});

// Sort Button Logic
sortTasksBtn.addEventListener("click", (e) => {
    const button = e.target;

    if (!button.dataset.sort) {
        button.dataset.sort = "asc";
        button.innerHTML = ICONS.sortDefault;
    } else if (button.dataset.sort === "asc") {
        button.dataset.sort = "desc";
        button.innerHTML = ICONS.sortAsc;
    } else {
        resetSortTasksBtn();
    }

    renderTasks();
});

/* ==========================================================================
   MODAL LOGIC
   ========================================================================== */

/**
 * Opens the task modal in either 'new' or 'edit' mode.
 * @param {string} modalType - 'new' or 'edit'.
 */
function openModal(modalType) {
    resetForm();
    taskModal.classList.add("active");
    darkOverlay.classList.add("active");

    if (modalType === "new") {
        taskModalTitle.textContent = "New Task";
        newTaskForm.classList.add("active");
    } else {
        taskModalTitle.textContent = "Edit Task";
        editTaskForm.classList.add("active");
    }
}

/**
 * Closes the task modal and overlay.
 */
function closeModal() {
    taskModal.classList.remove("active");
    darkOverlay.classList.remove("active");
}

/* ==========================================================================
   TASK CREATION LOGIC
   ========================================================================== */

/**
 * Handles the submission of the New Task form.
 * Validates input, constructs data, and calls composition.
 * @param {Event} e - Form submit event.
 */
function getNewTaskData(e) {
    e.preventDefault();

    const titleInput = e.target.elements["f-nTaskTitle"];
    if (validateFormData(titleInput) === false) return;

    const data = new FormData(e.currentTarget);
    const title = data.get("f-nTaskTitle");
    const details = data.get("f-nTaskDetails");
    const priority = data.get("f-nTaskPriority");

    // Construct date with time to ensure local timezone handling usually
    let date = new Date(`${data.get("f-nTaskDate")} 00:00`);
    if (!isValid(date)) {
        date = null;
    }

    composeNewTask(title, details, date, priority);
    closeModal();
}

/**
 * Creates a task object, saves it, and updates the UI.
 * @param {string} title 
 * @param {string} details 
 * @param {Date|null} date 
 * @param {string} priority 
 */
function composeNewTask(title, details, date, priority) {
    const projectId = projectsHandler.items[activeTab].id;
    const newTask = task(title, details, date, priority, projectId);
    const newTaskIndex = tasksHandler.addTask(newTask);
    
    updateTasksStorage();

    // Handle "Empty State" removal
    if (uncompletedTaskCount === 0) cleanUncompletedTasksContainer();
    uncompletedTaskCount++;

    // If sorting is active, re-render entire list to maintain order
    if (sortTasksBtn.dataset.sort === "asc" || sortTasksBtn.dataset.sort === "desc") {
        return renderTasks();
    }

    // Otherwise just prepend
    tasksContainer.prepend(createTaskUI(newTask, newTaskIndex));
}

/* ==========================================================================
   UI GENERATION (DOM)
   ========================================================================== */

/**
 * Constructs the DOM element for a single task.
 * @param {Object} task - The task data object.
 * @param {number} taskIndex - The index of the task in the storage array.
 * @returns {HTMLElement} The constructed task div.
 */
function createTaskUI(task, taskIndex) {
    // 1. Create Elements
    const taskContainer = document.createElement("div");
    const checkbox = document.createElement("input");
    const taskTitle = document.createElement("div");
    const taskActions = document.createElement("div");
    const editTaskBtn = document.createElement("button");
    const deleteTaskBtn = document.createElement("button");
    const taskDate = document.createElement("div");

    // 2. Apply Classes & Attributes
    taskContainer.classList.add("task");
    taskTitle.classList.add("task_title");
    taskActions.classList.add("task_actions");
    taskDate.classList.add("task_date");
    
    editTaskBtn.classList.add("icon-container");
    deleteTaskBtn.classList.add("icon-container");
    
    checkbox.type = "checkbox";
    editTaskBtn.type = "button";
    deleteTaskBtn.type = "button";

    taskTitle.textContent = task.title;
    editTaskBtn.innerHTML = ICONS.edit;
    deleteTaskBtn.innerHTML = ICONS.delete;

    // 3. Handle Date
    if (task.date !== null) {
        if (!isToday(task.date) && isPast(task.date)) {
            taskDate.classList.add("overdue");
        }
        taskDate.textContent = format(task.date, "E MMM dd, yyyy");
    } else {
        taskDate.textContent = "No Date";
    }

    // 4. Set Metadata
    editTaskBtn.dataset.taskAction = "edit";
    deleteTaskBtn.dataset.taskAction = "delete";

    checkbox.setAttribute("aria-label", "Mark task as completed");
    editTaskBtn.setAttribute("aria-label", "Edit task");
    deleteTaskBtn.setAttribute("aria-label", "Delete task");
    
    taskActions.append(editTaskBtn, deleteTaskBtn);

    // 5. Handle Details
    if (task.details) {
        const taskDetails = document.createElement("div");
        const taskDetailsBtn = document.createElement("button");

        taskDetails.classList.add("task_details");
        taskDetailsBtn.classList.add("task_details-btn");
        taskDetails.textContent = task.details;

        taskDetailsBtn.type = "button";
        taskDetailsBtn.innerHTML = ICONS.details;
        taskDetailsBtn.setAttribute("aria-label", "Show task details");

        taskTitle.append(taskDetailsBtn);
        taskContainer.append(checkbox, taskTitle, taskDetails, taskDate, taskActions);
        createNewTaskListeners(taskIndex, checkbox, taskActions, taskDetailsBtn);
    } else {
        taskContainer.append(checkbox, taskTitle, taskDate, taskActions);
        createNewTaskListeners(taskIndex, checkbox, taskActions);
    }

    // 6. Handle Priority
    if (task.priority) {
        switch (task.priority) {
            case "low": taskContainer.classList.add("low-priority"); break;
            case "medium": taskContainer.classList.add("medium-priority"); break;
            case "high": taskContainer.classList.add("high-priority"); break;
        }
    }

    // 7. Handle Completion State
    if (task.completed === true) {
        checkbox.checked = true;
        taskContainer.classList.toggle("completed");
    }

    return taskContainer;
}

/**
 * Attaches event listeners to a specific task's interactive elements.
 */
function createNewTaskListeners(taskIndex, checkbox, taskActions, detailsBtn) {
    checkbox.addEventListener("input", (e) => {
        markTaskCompletedUI(e.target, taskIndex);
    });

    taskActions.addEventListener("click", (e) => {
        const button = e.target.closest("button");
        if (!button) return;

        currTaskInfo.index = taskIndex;

        if (button.dataset.taskAction === "edit") {
            openModal("edit");
            setEditFormValues();
        } else if (button.dataset.taskAction === "delete") {
            deleteTask();
        }
    });

    if (detailsBtn) {
        detailsBtn.addEventListener("click", showTaskDetails);
    }
}

/* ==========================================================================
   TASK ACTION LOGIC
   ========================================================================== */

/**
 * Toggles task completion status and moves it to the appropriate container.
 */
function markTaskCompletedUI(target, taskIndex) {
    const taskNode = target.closest("div.task");
    taskNode.classList.toggle("completed");

    const completedState = tasksHandler.toggleCompletedState(taskIndex);
    updateTasksStorage();

    if (completedState === true) {
        uncompletedTaskCount--;
        completedTasksContainer.prepend(taskNode);
    } else {
        uncompletedTaskCount++;
        renderTasks();
    }
    
    renderNoTasksMessage();
}

/**
 * Toggles visibility of task details.
 */
function showTaskDetails(e) {
    const taskNode = e.currentTarget.closest("div.task");
    const taskDetailsNode = taskNode.querySelector(".task_details");

    if (taskDetailsNode) {
        taskDetailsNode.classList.toggle("active");
        e.currentTarget.classList.toggle("rotate");
    }
}

/**
 * Deletes a task after confirmation.
 */
function deleteTask() {
    const confirmed = window.confirm("Delete this task?");
    if (!confirmed) return;

    tasksHandler.removeTask(currTaskInfo.index);

    updateTasksStorage();
    renderTasks();
}

/* ==========================================================================
   EDITING LOGIC
   ========================================================================== */

/**
 * Populates the edit form with the current task's data.
 */
function setEditFormValues() {
    let currTask = tasksHandler.items[currTaskInfo.index];
    editTaskForm.reset();

    const formFields = editTaskForm.elements;
    formFields["f-eTaskTitle"].value = currTask.title;
    formFields["f-eTaskDetails"].value = currTask.details;
    formFields["f-eTaskPriority"].value = currTask.priority;

    changeFormPriorityIndicator(formFields["f-eTaskPriority"]);

    if (currTask.date !== null) {
        let date = format(currTask.date, "yyyy-MM-dd");
        formFields["f-eTaskDate"].value = date;
    }
}

/**
 * Submits the edit form and updates the task.
 */
function editTask(e) {
    e.preventDefault();

    const titleInput = e.target.elements["f-eTaskTitle"];
    if (validateFormData(titleInput) === false) return;

    const confirmed = window.confirm("Apply changes to this task?");
    if (!confirmed) return;

    const data = new FormData(e.currentTarget);
    const title = data.get("f-eTaskTitle");
    const details = data.get("f-eTaskDetails");
    const priority = data.get("f-eTaskPriority");
    let date = new Date(`${data.get("f-eTaskDate")} 00:00`);

    let currTask = tasksHandler.items[currTaskInfo.index];
    currTask.title = title;
    currTask.details = details;
    currTask.priority = priority;

    if (isValid(date)) {
        currTask.date = date;
    } else {
        currTask.date = null;
    }

    updateTasksStorage();
    renderTasks();
    closeModal();
}

/* ==========================================================================
   RENDERING & FILTERING HELPERS
   ========================================================================== */

/**
 * Main function to filter, sort, and render all tasks to the DOM.
 */
function renderTasks() {
    cleanTasksContainers();

    const uncompletedFragment = document.createDocumentFragment();
    const completedFragment = document.createDocumentFragment();
    const sortMethod = sortTasksBtn.dataset.sort;
    
    let filteredTasks = filterTasks();

    if (sortMethod) {
        filteredTasks = sortTasks(filteredTasks, sortMethod);
    }

    filteredTasks.forEach((task) => {
        // Create UI with temp array index
        const taskNode = createTaskUI(task, task.arrIndex);

        if (task.completed === true) completedFragment.prepend(taskNode);
        else uncompletedFragment.prepend(taskNode);

        delete task.arrIndex; // Cleanup
    });

    completedTasksContainer.prepend(completedFragment);
    
    // Count uncompleted tasks to determine empty state
    uncompletedTaskCount = uncompletedFragment.children.length;
    if (renderNoTasksMessage() === true) {
        return;
    } else {
        tasksContainer.prepend(uncompletedFragment);
    }
}

/**
 * Filters tasks based on the currently active Project Tab.
 * @returns {Array} Array of filtered tasks.
 */
function filterTasks() {
    switch (activeTab) {
        case "Today":
            return tasksHandler.items.filter((task, index) => {
                task.arrIndex = index;
                return isToday(task.date);
            });
        case "This Week":
            return tasksHandler.items.filter((task, index) => {
                task.arrIndex = index;
                return isThisWeek(task.date);
            });
        default:
            const id = projectsHandler.items[activeTab].id;
            return tasksHandler.items.filter((task, index) => {
                task.arrIndex = index;
                return task.projectIndex === id;
            });
    }
}

/**
 * Sorts an array of tasks by date.
 * @param {Array} tasksArr 
 * @param {string} sortMethod - 'asc' or 'desc'.
 * @returns {Array} Sorted array.
 */
function sortTasks(tasksArr, sortMethod) {
    const pastDate = new Date(-1, 0, 1, 0, 0, 1); // Fallback for null dates
    
    return tasksArr.sort((a, b) => {
        let dateA = (a.date) ? a.date : pastDate;
        let dateB = (b.date) ? b.date : pastDate;
        
        if (sortMethod === "asc") return compareAsc(dateA, dateB);
        if (sortMethod === "desc") return compareDesc(dateA, dateB);
        return 0;
    });
}

/**
 * Creates the "No Tasks" empty state element.
 */
function createNoTasksMessageUI() {
    const msgContainer = document.createElement("div");
    const message = document.createElement("p");
    const image = document.createElement("img");

    msgContainer.classList.add("tasks_empty");
    image.classList.add("tasks_empty-img");

    image.src = emptyMessageImage;
    image.alt = "Two friends sitting under a tree";
    message.textContent = "Your space is clear—use this moment to breathe, dream, and start something meaningful.”";

    msgContainer.prepend(image, message);
    return msgContainer;
}

/**
 * Checks if task list is empty and renders message if so.
 * @returns {boolean} True if message rendered, false otherwise.
 */
function renderNoTasksMessage() {
    if (uncompletedTaskCount === 0) {
        const message = createNoTasksMessageUI();
        tasksContainer.prepend(message);
        return true;
    }
    return false;
}

function cleanUncompletedTasksContainer() {
    tasksContainer.innerHTML = "";
}

function cleanTasksContainers() {
    tasksContainer.innerHTML = "";
    completedTasksContainer.innerHTML = "";
}

function resetSortTasksBtn() {
    sortTasksBtn.removeAttribute("data-sort");
    sortTasksBtn.innerHTML = ICONS.sortReset;
}

/* ==========================================================================
   FORM HELPER FUNCTIONS
   ========================================================================== */

function detectMissingInput(e) {
    if (e.currentTarget.value === "") {
        showInputError(e.currentTarget);
    } else {
        hideInputError(e.currentTarget);
    }
}

function getClosestErrorMessage(input) {
    const div = input.closest("div.task-modal_w");
    if (!div) return null;
    return div.querySelector(".invalid-input");
}

function showInputError(input) {
    const errorNode = getClosestErrorMessage(input);
    if (errorNode) errorNode.classList.add("active");
}

function hideInputError(input) {
    const errorNode = getClosestErrorMessage(input);
    if (errorNode) errorNode.classList.remove("active");
}

function changeFormPriorityIndicator(select) {
    const label = select.previousElementSibling;
    resetFormPriorityIndicator(label);
    
    // Add appropriate class based on value
    if (["low", "medium", "high"].includes(select.value)) {
        label.classList.add(select.value);
    }
}
            
function resetFormPriorityIndicator(label) {
    label.classList.remove("low", "medium", "high");
}

function validateFormData(input) {
    if (input.value === "") {
        showInputError(input);
        input.focus();
        return false;
    }
    return true;
}

/**
 * Resets forms, clears errors, and removes priority styling.
 */
function resetForm() {
    const forms = taskModal.querySelectorAll(".task-modal_form.active");
    
    for (let form of forms) {
        form.classList.remove("active");
        form.reset();

        const selectIndicator = form.querySelector(".select-indicator");
        if (selectIndicator) resetFormPriorityIndicator(selectIndicator);

        const invalidInputs = form.querySelectorAll(".invalid-input.active");
        invalidInputs.forEach(input => input.classList.remove("active"));
    }
}

// Initialize forms
newTaskForm.reset();
editTaskForm.reset();

/* ==========================================================================
   EXPORTS
   ========================================================================== */

export {
    renderTasks,
    taskModal,
    closeModal,
    resetSortTasksBtn,
};