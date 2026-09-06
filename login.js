/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./src/modules/ui/ui-theme.js
/**
 * @module src/modules/ui/ui-theme.js
 *
 * @description
 * Light/dark theme switching. The current theme lives on <html> as
 * `data-theme` and is persisted in localStorage under "capiche-theme".
 * Each HTML page ships a tiny inline script in <head> that restores the
 * stored theme before first paint, so the UI never flashes between themes.
 */

const STORAGE_KEY = "capiche-theme";

/**
 * Reads the persisted theme, defaulting to dark.
 * @returns {"dark" | "light"}
 */
const getStoredTheme = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) || "dark";
  } catch {
    return "dark";
  }
};

/**
 * Applies a theme to the document root and persists the choice.
 * @param {"dark" | "light"} theme
 */
const applyTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage unavailable (private mode, etc.) — theme still applies.
  }
};

/**
 * Flips between light and dark.
 */
const toggleTheme = () => {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  applyTheme(current === "light" ? "dark" : "light");
};

/**
 * Applies the persisted theme and wires up a #themeToggle button if present.
 */
const initTheme = () => {
  applyTheme(getStoredTheme());

  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;

  const syncPressed = () => {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    toggle.setAttribute("aria-pressed", String(isLight));
    toggle.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
  };

  syncPressed();
  toggle.addEventListener("click", () => {
    toggleTheme();
    syncPressed();
  });
};
;// ./src/login.js
/**
 * @module src/login.js
 *
 * @description
 * Auth logic for the login/register page. Kept separate from app.js so
 * this page doesn't trigger the app bootstrap/auth guard.
 */



const API_URL = "http://localhost:5000/api";
const GOOGLE_CLIENT_ID = "";

initTheme();

// ─── DOM refs ─────────────────────────────────────────────
const tabs = document.querySelectorAll(".auth-tab");
const loginForm = document.getElementById("loginForm");
const regForm = document.getElementById("registerForm");
const errorBanner = document.getElementById("authError");
const successBanner = document.getElementById("authSuccess");
const googleSection = document.getElementById("googleSection");
const googleSignIn = document.getElementById("googleSignIn");

// ─── TAB SWITCHING ────────────────────────────────────────
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => {
      t.classList.remove("active");
      t.setAttribute("aria-selected", "false");
    });
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");

    loginForm.classList.remove("active");
    regForm.classList.remove("active");

    if (tab.dataset.tab === "login") loginForm.classList.add("active");
    else regForm.classList.add("active");

    clearBanners();
  });
});

// ─── BANNERS ──────────────────────────────────────────────
function showError(msg) {
  successBanner.classList.remove("active");
  errorBanner.textContent = msg;
  errorBanner.classList.add("active");
}

function showSuccess(msg) {
  errorBanner.classList.remove("active");
  successBanner.textContent = msg;
  successBanner.classList.add("active");
}

function clearBanners() {
  errorBanner.classList.remove("active");
  successBanner.classList.remove("active");
}

// ─── FIELD VALIDATION ─────────────────────────────────────
function showFieldError(errId) {
  document.getElementById(errId).classList.add("active");
}

function hideFieldError(errId) {
  document.getElementById(errId).classList.remove("active");
}

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

// ─── LOADING STATE ────────────────────────────────────────
function setLoading(btn, on) {
  if (on) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Please wait…';
  } else {
    btn.disabled = false;
  }
}

// ─── LOGIN ────────────────────────────────────────────────
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearBanners();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  let valid = true;

  if (!isValidEmail(email)) {
    showFieldError("loginEmailErr");
    valid = false;
  } else hideFieldError("loginEmailErr");

  if (!password) {
    showFieldError("loginPasswordErr");
    valid = false;
  } else hideFieldError("loginPasswordErr");

  if (!valid) return;

  const btn = document.getElementById("loginBtn");
  setLoading(btn, true);

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password }),
    });
    const data = await res.json();

    if (!res.ok) {
      showError(data.message || "Login failed. Please try again.");
    } else {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      window.location.href = "./index.html";
    }
  } catch {
    showError("Could not reach the server. Is it running?");
  } finally {
    btn.textContent = "Sign in";
    btn.disabled = false;
  }
});

// ─── REGISTER ─────────────────────────────────────────────
regForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearBanners();

  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;
  const confirm = document.getElementById("regConfirm").value;
  let valid = true;

  if (!isValidEmail(email)) {
    showFieldError("regEmailErr");
    valid = false;
  } else hideFieldError("regEmailErr");

  if (password.length < 8) {
    showFieldError("regPasswordErr");
    valid = false;
  } else hideFieldError("regPasswordErr");

  if (password !== confirm) {
    showFieldError("regConfirmErr");
    valid = false;
  } else hideFieldError("regConfirmErr");

  if (!valid) return;

  const btn = document.getElementById("registerBtn");
  setLoading(btn, true);

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password }),
    });
    const data = await res.json();

    if (!res.ok) {
      showError(data.message || "Registration failed. Please try again.");
    } else {
      showSuccess("Account created! Signing you in…");
      // Auto-login after registration
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const loginData = await loginRes.json();
      if (loginData.token) {
        localStorage.setItem("token", loginData.token);
        localStorage.setItem("userId", loginData.userId);
        setTimeout(() => {
          window.location.href = "./index.html";
        }, 800);
      }
    }
  } catch {
    showError("Could not reach the server. Is it running?");
  } finally {
    btn.textContent = "Create account";
    btn.disabled = false;
  }
});

// ─── GOOGLE SIGN-IN ───────────────────────────────────────
async function handleGoogleCredential(response) {
  const credential = response.credential;
  if (!credential) {
    showError("Google sign-in failed. Please try again.");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });
    const data = await res.json();

    if (!res.ok) {
      showError(data.message || "Google sign-in failed. Please try again.");
    } else {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      window.location.href = "./index.html";
    }
  } catch {
    showError("Could not reach the server. Is it running?");
  }
}

let googleReady = false;
function initGoogleSignIn() {
  if (googleReady) return true;
  if (!window.google || !window.google.accounts || !window.google.accounts.id) return false;

  googleReady = true;
  googleSection.hidden = false;

  const width = googleSignIn.clientWidth || undefined;
  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleCredential,
  });
  window.google.accounts.id.renderButton(googleSignIn, {
    theme: "outline",
    size: "large",
    shape: "rectangular",
    text: "continue_with",
    logo_alignment: "center",
    ...(width !== undefined ? { width } : {}),
  });
  return true;
}

if (GOOGLE_CLIENT_ID) {
  let ticks = 0;
  const poll = setInterval(() => {
    if (initGoogleSignIn() || ++ticks > 50) clearInterval(poll);
  }, 200);
  window.addEventListener("load", () => initGoogleSignIn());
}

// ─── REDIRECT IF ALREADY LOGGED IN ───────────────────────
if (localStorage.getItem("token")) {
  window.location.href = "./index.html";
}

/******/ })()
;