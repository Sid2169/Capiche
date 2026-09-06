/**
 * @module src/modules/ui/ui-account.js
 *
 * @description
 * Account management UI:
 * - Opens/closes the account modal from the sidebar button
 * - Loads current user info (GET /auth/me)
 * - Lets password accounts change their password (POST /auth/change-password)
 */

import { apiFetch } from "../../api.js";
import { format } from "date-fns";

// ------------------------------------------------------
// DOM Cache
// ------------------------------------------------------

const accountBtn = document.getElementById("accountBtn");
const accountModal = document.querySelector(".account-modal");
const accountCloseBtn = document.getElementById("accountCloseBtn");
const darkOverlay = document.querySelector(".dark-overlay");

const accountAvatar = document.getElementById("accountAvatar");
const accountEmail = document.getElementById("accountEmail");
const accountSub = document.getElementById("accountSub");
const accountPasswordSection = document.getElementById("accountPasswordSection");
const changePasswordForm = document.getElementById("changePasswordForm");
const accountMsg = document.getElementById("accountMsg");

// ------------------------------------------------------
// Helpers
// ------------------------------------------------------

function initialsOf(email) {
  const local = (email || "").split("@")[0] || "?";
  const words = local.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  const chars = words.length > 1 ? words[0][0] + words[1][0] : local.slice(0, 2);
  return chars.toUpperCase() || "?";
}

function memberSinceText(iso) {
  try {
    return "Member since " + format(new Date(iso), "MMM d, yyyy");
  } catch {
    return "";
  }
}

function showAccountMsg(type, text) {
  accountMsg.className = "account-msg " + type;
  accountMsg.textContent = text;
}

function clearAccountMsg() {
  accountMsg.className = "account-msg";
  accountMsg.textContent = "";
}

// ------------------------------------------------------
// Load account info
// ------------------------------------------------------

async function loadAccount() {
  try {
    const res = await apiFetch("/auth/me");
    if (!res.ok) throw new Error();

    const data = await res.json();
    accountEmail.textContent = data.email;
    accountAvatar.textContent = initialsOf(data.email);
    accountSub.textContent = `${data.hasPassword ? "Password" : "Google"} account · ${memberSinceText(data.createdAt)}`;

    if (!data.hasPassword) {
      accountPasswordSection.hidden = true;
    }
  } catch {
    accountAvatar.textContent = "?";
    accountEmail.textContent = "Could not load account";
  }
}

// ------------------------------------------------------
// Open / Close modal
// ------------------------------------------------------

function openAccountModal() {
  clearAccountMsg();
  accountModal.classList.add("active");
  darkOverlay.classList.add("active");
  loadAccount();
}

function closeAccountModal() {
  accountModal.classList.remove("active");
  darkOverlay.classList.remove("active");
}

accountBtn.addEventListener("click", openAccountModal);
accountCloseBtn.addEventListener("click", closeAccountModal);
darkOverlay.addEventListener("click", closeAccountModal);

// ------------------------------------------------------
// Change password
// ------------------------------------------------------

changePasswordForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearAccountMsg();

  const currentPassword = document.getElementById("cpCurrent").value;
  const newPassword = document.getElementById("cpNew").value;
  const confirmPassword = document.getElementById("cpConfirm").value;

  if (!currentPassword || !newPassword || !confirmPassword) {
    showAccountMsg("error", "All fields are required.");
    return;
  }

  if (newPassword.length < 8) {
    showAccountMsg("error", "New password must be at least 8 characters.");
    return;
  }

  if (newPassword !== confirmPassword) {
    showAccountMsg("error", "New passwords do not match.");
    return;
  }

  const btn = document.getElementById("changePasswordBtn");
  btn.disabled = true;
  btn.textContent = "Updating…";

  try {
    const res = await apiFetch("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();

    if (!res.ok) {
      showAccountMsg("error", data.message || "Could not update the password.");
    } else {
      showAccountMsg("success", "Password updated.");
      changePasswordForm.reset();
    }
  } catch {
    showAccountMsg("error", "Could not reach the server. Is it running?");
  } finally {
    btn.disabled = false;
    btn.textContent = "Update password";
  }
});