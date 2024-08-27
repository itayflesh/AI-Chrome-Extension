# AI Chrome Extension

## Description

https://drive.google.com/file/d/19B2Bk8bCytj55pRsYwqQvtL4GF3XdtMp/view?usp=share_link

This Chrome browser extension enhances your browsing experience by providing AI-powered text manipulation features. This extension uses the OpenAI GPT-3.5 model to improve text, add comments to code, summarize content, and generate quizzes based on selected text.

## Features

- Improve English: Enhances the selected text as if an English teacher wrote it.
- Improve English - Creative: Similar to Improve English, but with more creative output.
- Add comments to code: Automatically adds relevant comments to selected code snippets.
- Summarize to a single paragraph: Condenses selected text into a concise summary.
- AI Quiz: Generates a 10-question multiple-choice quiz based on the selected text.

## Installation

1. Clone this repository or download the source code.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the directory containing the extension files.

### Prerequisites

- Google Chrome browser
- An OpenAI API key (insert your key in the `background.js` file)

## How It Works

1. Select text on any webpage.
2. Right-click to open the context menu.
3. Choose one of the AIEverywhere options.
4. A popup window will appear with the processed text or generated content.

## Technologies Used

- JavaScript
- HTML/CSS
- Chrome Extension API
- OpenAI GPT-3.5 API

## Project Structure

- `manifest.json`: Extension configuration file
- `background.js`: Handles context menu creation and API interactions
- `popup.html` and `popup.js`: Manages the popup window display
- `icons/`: Contains extension icons

## Note

Make sure to replace the `apiKey` variable in `background.js` with your own OpenAI API key before using the extension.

