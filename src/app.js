/**
 * @module src/app.js
 * * @description Main application entry point.
 * Responsible for importing global assets and initializing core modules.
 */

/* ==========================================================================
   AUTH GUARD
   ========================================================================== */

// Check if user is authenticated BEFORE loading anything
const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "./login.html";
}

/* ==========================================================================
   ASSETS & STYLES
   ========================================================================== */

import "./style.css";

/* ==========================================================================
   MODULE IMPORTS
   ========================================================================== */

import * as storage from "./modules/storage.js";
import "./modules/ui/ui-account.js";

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */

const initApp = () => {
    storage.initStorage();
};

// Start the application
initApp();