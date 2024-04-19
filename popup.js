document.addEventListener('DOMContentLoaded', function() {
    chrome.runtime.sendMessage({ action: "getImprovedText" }, function(response) {
      var improvedText = response.text;
      document.getElementById('improvedText').textContent = improvedText;
    });
  });