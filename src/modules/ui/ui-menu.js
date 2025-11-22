/**
 * @module src/modules/ui/ui-menu.js
 *
 * @description
 * Handles responsive sidebar menu behavior and interactions with the UI
 * (including dark overlay and modal state handling).
 */

import { taskModal, closeModal } from "./ui-tasks.js";

// ------------------------------------------------------
// DOM Cache
// ------------------------------------------------------

/** Menu button for mobile/tablet layouts */
const menuBtn = document.querySelector(".resp-menu_btn");

/** Sidebar element that slides in/out */
const sidebar = document.querySelector(".sidebar");

/** Overlay shown when sidebar or modal is active */
const darkOverlay = document.querySelector(".dark-overlay");

// ------------------------------------------------------
// Event Listeners
// ------------------------------------------------------

/**
 * Toggle the menu when clicking the hamburger button.
 */
menuBtn.addEventListener("click", closeMenu);

/**
 * Clicking the overlay closes either:
 * 1. the task modal (if open),
 * 2. or the menu itself.
 */
darkOverlay.addEventListener("click", () => {
  if (taskModal.classList.contains("active")) {
    closeModal();
    return;
  }
  closeMenu();
});

// ------------------------------------------------------
// Responsive Behavior
// ------------------------------------------------------

/**
 * Automatically closes the sidebar when the viewport grows beyond 992px.
 * Ensures desktop layout never shows both overlay + sidebar accidentally.
 */
const observer = new ResizeObserver(([entry]) => {
  const aboveBreakpoint = entry.contentRect.width > 992;
  const isSidebarActive = sidebar.classList.contains("active");

  if (aboveBreakpoint && isSidebarActive) closeMenu();
});

observer.observe(document.body);

// ------------------------------------------------------
// Functions
// ------------------------------------------------------

/**
 * Toggles menu visibility and overlay state.
 * Maintains alignment with existing CSS class logic.
 */
function closeMenu() {
  sidebar.classList.toggle("active");
  darkOverlay.classList.toggle("menu-active");
}

// ------------------------------------------------------
// Exports
// ------------------------------------------------------

export { sidebar, darkOverlay };
