document.addEventListener("DOMContentLoaded", () => {
  // Retrieve the saved API key from storage and display it in the input field
  chrome.storage.sync.get(["apiKey"], (result) => {
    if (result.apiKey) {
      document.getElementById("api-key").value = result.apiKey;
    }
  });

  // Save the API key when the Save button is clicked
  document.getElementById("save-btn").addEventListener("click", () => {
    const apiKey = document.getElementById("api-key").value;
    chrome.storage.sync.set({ apiKey }, () => {
      console.log("API key saved");
    });
  });
});
