document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("noteForm");
  const submitBtn = document.getElementById("submitBtn");
  const statusDiv = document.getElementById("status");

  // Get the API URL - use your production URL in the final version
  // For development, use your local server
  const API_URL = "https://snappynotes.onrender.com/api/notes";
  // const API_URL = "http://localhost:5001/api/notes"; // For local development

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();

    if (!title || !content) {
      showStatus("All fields are required", "error");
      return;
    }

    // Update button state
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating...";

    try {
      // Using XMLHttpRequest instead of fetch for better compatibility
      const xhr = new XMLHttpRequest();
      xhr.open("POST", API_URL, true);
      xhr.setRequestHeader("Content-Type", "application/json");

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            // Success
            showStatus("Note created successfully!", "success");
            form.reset();
          } else if (xhr.status === 429) {
            showStatus("Slow down! You're creating notes too fast", "error");
          } else {
            showStatus("Failed to create note", "error");
            console.error("Server responded with status:", xhr.status);
          }

          // Reset button state
          submitBtn.disabled = false;
          submitBtn.textContent = "Create Note";
        }
      };

      xhr.onerror = function () {
        showStatus("Network error occurred", "error");
        console.error("Network error occurred");
        submitBtn.disabled = false;
        submitBtn.textContent = "Create Note";
      };

      xhr.send(JSON.stringify({ title, content }));
    } catch (error) {
      console.error("Error creating note:", error);
      showStatus(error.message || "Error creating note", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "Create Note";
    }
  });

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `mt-4 text-center ${type}`;
    statusDiv.classList.remove("hidden");

    // Hide the status message after 3 seconds
    setTimeout(() => {
      statusDiv.classList.add("hidden");
    }, 3000);
  }
});
