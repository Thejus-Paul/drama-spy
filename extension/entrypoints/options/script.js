import { storage } from "#imports";

console.log("Options script loaded");

const backendUrl = storage.defineItem("local:backend_url", {
  fallback: "http://localhost:3000",
});

const urlInput = document.getElementById("backend-url");
const saveBtn = document.getElementById("save-btn");
const messageEl = document.getElementById("message");

console.log("Elements found:", { urlInput, saveBtn, messageEl });

// Load saved URL
backendUrl
  .getValue()
  .then((result) => {
    console.log("Loaded value:", result);
    if (urlInput) {
      urlInput.value = result;
    }
  })
  .catch((error) => {
    console.error("Failed to load settings:", error);
    if (urlInput) {
      urlInput.value = "http://localhost:3000";
    }
  });

if (saveBtn) {
  saveBtn.addEventListener("click", async () => {
    console.log("Save button clicked");
    if (!urlInput || !messageEl) {
      console.error("Missing elements:", { urlInput, messageEl });
      return;
    }

    try {
      const value = urlInput.value;
      console.log("Saving value:", value);
      await backendUrl.setValue(value);
      console.log("Value saved successfully");
      showMessage("Settings saved!", "success");
    } catch (error) {
      console.error("Failed to save settings:", error);
      showMessage("Failed to save settings!", "error");
    }
  });
}

function showMessage(text, type) {
  console.log("Showing message:", text, type);
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
