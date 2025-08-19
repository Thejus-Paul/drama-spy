import { storage } from "#imports";

const backendUrl = storage.defineItem("local:backend_url", {
  fallback: "http://localhost:3000",
});

const urlInput = document.getElementById("backend-url");
const saveBtn = document.getElementById("save-btn");
const messageEl = document.getElementById("message");

// Load saved URL
backendUrl
  .getValue()
  .then((result) => {
    if (urlInput) {
      urlInput.value = result;
    }
  })
  .catch((error) => {
    // Only log error for debugging, not the actual value
    console.error("Failed to load settings");
    if (urlInput) {
      urlInput.value = "http://localhost:3000";
    }
  });

if (saveBtn) {
  saveBtn.addEventListener("click", async () => {
    if (!urlInput || !messageEl) {
      console.error("Missing required elements");
      return;
    }

    try {
      const value = urlInput.value;
      await backendUrl.setValue(value);
      showMessage("Settings saved!", "success");
    } catch (error) {
      console.error("Failed to save settings");
      showMessage("Failed to save settings!", "error");
    }
  });
}

function showMessage(text, type) {
  if (!messageEl) {
    console.error("Message element not found");
    return;
  }

  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
  setTimeout(() => {
    if (messageEl) {
      messageEl.textContent = "";
      messageEl.className = "message";
    }
  }, 2000);
}
