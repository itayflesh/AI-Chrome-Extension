document.addEventListener('DOMContentLoaded', function() {
    chrome.runtime.sendMessage({ action: "getImprovedText" }, function(response) {
      const commentedCodeContainer = document.getElementById('commentedCode');
      const quizLines = response.text.split('\n');
  
      quizLines.forEach(line => {
        const lineElement = document.createElement('div');
        lineElement.className = 'code-line';
  
        // Check if the line contains the correct answer
        const correctAnswerRegex = /(-correct)$/;
        const match = line.match(correctAnswerRegex);
        if (match) {
          const correctAnswerLine = line.replace(correctAnswerRegex, '');
          lineElement.innerHTML = `<span class="correct-answer">${correctAnswerLine}</span>`;
        } else {
          lineElement.textContent = line;
        }
  
        commentedCodeContainer.appendChild(lineElement);
      });
    });
  });