/**
 * @module src/login.js
 *
 * @description
 * Auth logic for the login/register page. Kept separate from app.js so
 * this page doesn't trigger the app bootstrap/auth guard.
 */

const API_URL = process.env.API_URL;

// ─── DOM refs ─────────────────────────────────────────────
const tabs = document.querySelectorAll(".auth-tab");
const loginForm = document.getElementById("loginForm");
const regForm = document.getElementById("registerForm");
const errorBanner = document.getElementById("authError");
const successBanner = document.getElementById("authSuccess");

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
      window.location.href = "/index.html";
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
          window.location.href = "/index.html";
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

// ─── REDIRECT IF ALREADY LOGGED IN ───────────────────────
if (localStorage.getItem("token")) {
  window.location.href = "/index.html";
}
