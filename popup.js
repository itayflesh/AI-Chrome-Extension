document.addEventListener('DOMContentLoaded', function() {
    chrome.runtime.sendMessage({ action: "getImprovedText" }, function(response) {
      const commentedCodeContainer = document.getElementById('commentedCode');
      const commentedCodeLines = response.text.split('\n');
  
      commentedCodeLines.forEach(line => {
        const lineElement = document.createElement('div');
        lineElement.className = 'code-line';
        lineElement.textContent = line;
        commentedCodeContainer.appendChild(lineElement);
      });
    });
  });