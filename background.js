let currentWindowId = null;
let currentListener = null;
let apiKey = ''; // insert your OpenAI API key here

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

  chrome.contextMenus.create({
    id: "generateQuiz",
    title: "AI Quiz",
    contexts: ["selection"]
  });

  chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === "improveEnglish") {
      handleSelection(info.selectionText, 'gpt-3.5-turbo', 0.6 , "Improve English");
    } else if (info.menuItemId === "improveEnglishCreative") {
      handleSelection(info.selectionText, 'gpt-3.5-turbo', 0.9 , "Improve English - Creative ");
    } else if (info.menuItemId === "addCommentsToCode") {
      handleCodeComments(info.selectionText , "add Comments To Code");
    } else if (info.menuItemId === "summarizeToSingleParagraph") {
      handleSummarize(info.selectionText , "summarize To Paragraph" );
    } else if (info.menuItemId === "generateQuiz") {
        handleGenerateQuiz(info.selectionText ,"Quiz" );
      }
  });

function handleSelection(selectedText, apiModel, temperature , title) {
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

  fetchChatCompletion(messages, apiKey, apiModel, temperature)
    .then(data => {
      var improvedText = data.choices[0].message.content.trim();

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
            sendResponse({ text: improvedText , title: title });
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

async function handleCodeComments(selectedText , title) {
    const messages = [
      {
        role: "system",
        content: "You are an expert code commentator. First, determine if the given text is a code snippet or not. If it is code, return extactly the same code and add relevant comments to it . If it is not code, respond with the message: The provided text is not code."
      },
      {
        role: "user",
        content: `Analyze the following text:\n\n${selectedText}`
      }
    ];
  
    try {
      const response = await fetchChatCompletion(messages, apiKey, 'gpt-3.5-turbo', 0.5);
      const result = response.choices[0].message.content.trim();
  
      let commentedCode = result;
      if (!result.includes('\n')) {
        // If the result is a single line, add a newline character to make it a multi-line string
        commentedCode = result + '\n';
      }
  
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
          width: 600,
          height: 400
        }, function(window) {
          currentWindowId = window.id;
    
          // Create a new listener with a closure
          currentListener = function handleMessage(request, sender, sendResponse) {
            if (request.action === "getImprovedText") {
              sendResponse({ text: commentedCode  , title: title});
            }
          };
          chrome.runtime.onMessage.addListener(currentListener);
    
          // Listen for the window being closed programmatically or manually
          chrome.windows.onRemoved.addListener(handlePopupWindowRemoved);
          window.onRemoved.addListener(handlePopupWindowRemoved);
        });
        
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

  function handleSummarize(selectedText , title) {
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
  
    fetchChatCompletion(messages, apiKey, 'gpt-3.5-turbo', 0.6)
      .then(data => {
        const summary = data.choices[0].message.content.trim();
  
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
              sendResponse({ text: summary , title:title });
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

  async function handleGenerateQuiz(selectedText , title) {
    const messages = [
      {
        role: "system",
        content: "You are an AI assistant that generates multiple-choice quizzes based on given text."
      },
      {
        role: "user",
        content: `Generate a quiz with 10 multiple-choice questions (with 4 options each) and add '-correct' to the relevant answer based on the following text:\n\n${selectedText}`
      }
    ];
  
    try {
      const response = await fetchChatCompletion(messages, apiKey, 'gpt-3.5-turbo', 0.7);
      const quizQuestions = response.choices[0].message.content.trim();
    
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
  
      chrome.windows.getCurrent(function(currentWindow) {
        chrome.windows.create({
          url: "popup.html",
          type: "popup",
          width: 700,
          height: currentWindow.height // Set the height to the current window's height
        }, function(window) {
        currentWindowId = window.id;
  
        // Create a new listener with a closure
        currentListener = function handleMessage(request, sender, sendResponse) {
          if (request.action === "getImprovedText") {
            sendResponse({ text: quizQuestions  , title:title});
          }
        };
        chrome.runtime.onMessage.addListener(currentListener);
  
        // Listen for the window being closed programmatically or manually
        chrome.windows.onRemoved.addListener(handlePopupWindowRemoved);
        window.onRemoved.addListener(handlePopupWindowRemoved);
      });
    });
    } catch (error) {
      console.error("Error:", error);
    }
  }