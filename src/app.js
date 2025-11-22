/**
 * @module src/app.js
 * * @description Main application entry point.
 * Responsible for importing global assets and initializing core modules.
 */

/* ==========================================================================
   ASSETS & STYLES
   ========================================================================== */

// Global application styles
import "./style.css";

// Static assets (required for bundlers like Webpack to process them)
import "./images/GitHub-Mark.png";

/* ==========================================================================
   MODULE IMPORTS
   ========================================================================== */

import * as storage from "./modules/storage.js";

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */

/**
 * Bootstraps the application.
 * Initializes the storage engine to load saved data.
 */
const initApp = () => {
    storage.initStorage();
};

// Start the application
initApp();