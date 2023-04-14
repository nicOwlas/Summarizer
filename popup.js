// popup.js
document.getElementById("summarize-btn").addEventListener("click", async () => {
  const spinner = document.getElementById("spinner");
  const summaryTextElement = document.getElementById("summary-text");

  spinner.style.display = "inline-block"; // Show the spinner

  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs[0];

  try {
    await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      function: getPageText,
    });

    chrome.tabs.sendMessage(activeTab.id, { action: "getText" }, (response) => {
      chrome.runtime.sendMessage(
        { action: "summarizeText", text: response.text },
        (result) => {
          spinner.style.display = "none"; // Hide the spinner

          if (result && result.summary) {
            summaryTextElement.innerText = result.summary;
          } else {
            summaryTextElement.innerText = "Error: No summary available.";
          }
        }
      );
    });
  } catch (error) {
    console.error("[popup.js] Error executing script:", error);
    spinner.style.display = "none"; // Hide the spinner
    summaryTextElement.innerText = "Error: Unable to summarize the text.";
  }
});

function getPageText() {
  const textContent = document.body.innerText;

  // Listen for the message from the popup script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getText") {
      sendResponse({ text: textContent });
    }
  });
}
