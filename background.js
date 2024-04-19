chrome.contextMenus.create({
    id: "improveEnglish",
    title: "Improve English",
    contexts: ["selection"]
  });
  
  chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === "improveEnglish") {
      var selectedText = info.selectionText;
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
  
      fetchChatCompletion(messages, 'sk-proj-wQ4taTDDFhbuDrmkqIlOT3BlbkFJlJVo8Zlx0wucOcJ2atou', 'gpt-3.5-turbo')
        .then(data => {
          var improvedText = data.choices[0].message.content.trim();
          chrome.windows.create({
            url: "popup.html",
            type: "popup",
            width: 400,
            height: 300
          }, function(window) {
            // Remove the previous listener
            chrome.runtime.onMessage.removeListener(handleMessage);
  
            // Create a new listener
            chrome.runtime.onMessage.addListener(handleMessage);
  
            function handleMessage(request, sender, sendResponse) {
              if (request.action === "getImprovedText") {
                sendResponse({ text: improvedText });
              }
            }
          });
        })
        .catch(error => {
          console.error("Error:", error);
        });
    }
  });
  
  // Fetch data from the OpenAI Chat Completion API
  async function fetchChatCompletion(messages, apiKey, apiModel) {
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