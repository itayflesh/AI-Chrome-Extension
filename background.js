let currentWindowId = null;
let currentListener = null;

chrome.contextMenus.create({
  id: "improveEnglish",
  title: "Improve English",
  contexts: ["selection"]
});

chrome.contextMenus.create({
  id: "improveEnglishCreative",
  title: "Improve English - Creative",
  contexts: ["selection"]
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === "improveEnglish") {
    handleSelection(info.selectionText, 'gpt-3.5-turbo', 0.7); // Use default temperature of 0.7
  } else if (info.menuItemId === "improveEnglishCreative") {
    handleSelection(info.selectionText, 'gpt-3.5-turbo', 0.9); // Use higher temperature of 0.9 for creative output
  }
});

function handleSelection(selectedText, apiModel, temperature) {
  var messages = [
    {
      role: "system",
      content: "You are an English teacher who improves the writing of given text."
    },
    {
      role: "user",
      content: "Improve the following text as if an English teacher wrote it:\n\n" + selectedText
    }
  ];

  fetchChatCompletion(messages, 'sk-proj-wQ4taTDDFhbuDrmkqIlOT3BlbkFJlJVo8Zlx0wucOcJ2atou', apiModel, temperature)
    .then(data => {
      var improvedText = data.choices[0].message.content.trim();
      console.log("Improved Text:", improvedText);

      // Close the previous window if it exists
      if (currentWindowId !== null) {
        chrome.windows.remove(currentWindowId);
      }

      // Remove the previous listener if it exists
      if (currentListener !== null) {
        chrome.runtime.onMessage.removeListener(currentListener);
      }

      currentWindowId = null;
      currentListener = null;
      
      chrome.windows.create({
        url: "popup.html",
        type: "popup",
        width: 400,
        height: 300
      }, function(window) {
        currentWindowId = window.id;

        // Create a new listener with a closure
        currentListener = function handleMessage(request, sender, sendResponse) {
          if (request.action === "getImprovedText") {
            sendResponse({ text: improvedText });
          }
        };
        chrome.runtime.onMessage.addListener(currentListener);

        // Listen for the window being closed programmatically or manually
        chrome.windows.onRemoved.addListener(handlePopupWindowRemoved);
        window.onRemoved.addListener(handlePopupWindowRemoved);
      });
    })
    .catch(error => {
      console.error("Error:", error);
    });
}

// Fetch data from the OpenAI Chat Completion API
async function fetchChatCompletion(messages, apiKey, apiModel, temperature) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        "messages": messages,
        "model": apiModel,
        "temperature": temperature
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Unauthorized - Incorrect API key
        throw new Error("Looks like your API key is incorrect. Please check your API key and try again.");
      } else {
        throw new Error(`Failed to fetch. Status code: ${response.status}`);
      }
    }

    return await response.json();
  } catch (error) {
    // Send a response to the popup script
    chrome.runtime.sendMessage({ error: error.message });
    console.error(error);
  }
}