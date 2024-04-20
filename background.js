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

chrome.contextMenus.create({
  id: "addCommentsToCode",
  title: "Add comments to code",
  contexts: ["selection"]
});

chrome.contextMenus.create({
    id: "summarizeToSingleParagraph",
    title: "Summarize to a single paragraph",
    contexts: ["selection"]
  });

  chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === "improveEnglish") {
      handleSelection(info.selectionText, 'gpt-3.5-turbo', 0.6);
    } else if (info.menuItemId === "improveEnglishCreative") {
      handleSelection(info.selectionText, 'gpt-3.5-turbo', 0.9);
    } else if (info.menuItemId === "addCommentsToCode") {
      handleCodeComments(info.selectionText);
    } else if (info.menuItemId === "summarizeToSingleParagraph") {
      handleSummarize(info.selectionText);
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

async function handleCodeComments(selectedText) {
    const messages = [
      {
        role: "system",
        content: "You are an expert code commentator. First, determine if the given text is a code snippet or not. If it is code, return extactly the same code and add relevant comments to it . If it is not code, respond with a message saying that the provided text is not code."
      },
      {
        role: "user",
        content: `Analyze the following text:\n\n${selectedText}`
      }
    ];
  
    try {
      const response = await fetchChatCompletion(messages, 'sk-proj-wQ4taTDDFhbuDrmkqIlOT3BlbkFJlJVo8Zlx0wucOcJ2atou', 'gpt-3.5-turbo', 0.5);
      const result = response.choices[0].message.content.trim();
  
      if (result.includes("The provided text is not code")) {
        console.log("The selected text is not code.");
        // Display a message to the user or handle the non-code case accordingly
      } else {
        let commentedCode = result;
        if (!result.includes('\n')) {
          // If the result is a single line, add a newline character to make it a multi-line string
          commentedCode = result + '\n';
        }
    
        console.log("Commented Code:", commentedCode);
  
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
                sendResponse({ text: commentedCode });
              }
            };
            chrome.runtime.onMessage.addListener(currentListener);
      
            // Listen for the window being closed programmatically or manually
            chrome.windows.onRemoved.addListener(handlePopupWindowRemoved);
            window.onRemoved.addListener(handlePopupWindowRemoved);
          });
        }
    } catch (error) {
      console.error("Error:", error);
    }
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

  function handleSummarize(selectedText) {
    const messages = [
      {
        role: "system",
        content: "You are a text summarizer. Your task is to summarize the given text into a single paragraph."
      },
      {
        role: "user",
        content: `Summarize the following text into a single paragraph:\n\n${selectedText}`
      }
    ];
  
    fetchChatCompletion(messages, 'sk-proj-wQ4taTDDFhbuDrmkqIlOT3BlbkFJlJVo8Zlx0wucOcJ2atou', 'gpt-3.5-turbo', 0.6)
      .then(data => {
        const summary = data.choices[0].message.content.trim();
        console.log("Summary:", summary);
  
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
              sendResponse({ text: summary });
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