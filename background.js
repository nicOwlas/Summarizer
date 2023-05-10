//background.js

function getAuthToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(token);
      }
    });
  });
}

let apiKey = "";

chrome.storage.sync.get(["apiKey"], (result) => {
  if (result.apiKey) {
    apiKey = result.apiKey;
  } else {
    console.error(
      "No API key found. Please set the API key in the options page."
    );
  }
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.apiKey && changes.apiKey.newValue) {
    apiKey = changes.apiKey.newValue;
  }
});

const model = "gpt-3.5-turbo";

async function summarize(text) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that summarizes text.",
          },
          {
            role: "user",
            content: `Please summarize the following text in 3 bullet points: ${text}`,
          },
        ],
        max_tokens: 600,
        n: 1,
        temperature: 0.5,
        stop: null,
      }),
    });

    const data = await response.json();
    console.log("Hello data:", data);
    if (data && data.choices && data.choices.length > 0) {
      const choice = data.choices[0];
      if (choice.message && choice.message.content) {
        return choice.message.content.trim();
      }
    }
    return "";
  } catch (error) {
    console.log(error);
    return "";
  }
}

// Add the listener to handle messages from the popup script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summarizeText") {
    try {
      const token = getAuthToken();
      console.log("token:", token);
      summarize(request.text).then((summary) => {
        sendResponse({ success: true, summary: summary });
      });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }
  // Keep the message channel open for the asynchronous response
  return true;
});
