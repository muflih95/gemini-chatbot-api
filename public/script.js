/**
 * Frontend JavaScript for the chatbot application.
 * Handles form submission, sends user messages to the backend API,
 * and displays the AI's response in the chat box.
 */
document.addEventListener('DOMContentLoaded', () => {
  const chatBox = document.getElementById('chat-box');
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');

  // Basic check to ensure essential elements are on the page
  if (!chatBox || !chatForm || !userInput) {
    console.error('Error: One or more required DOM elements (chat-box, chat-form, user-input) were not found.');
    return;
  }

  /**
   * Appends a message to the chat box and scrolls to the bottom.
   * @param {string} text - The content of the message.
   * @param {string} sender - The sender of the message, either 'user' or 'bot'.
   * @returns {HTMLElement} The newly created message element.
   */
  const addMessage = (text, sender) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', `${sender}-message`);
    messageElement.textContent = text;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the latest message
    return messageElement;
  };

  // Listen for the form submission event
  chatForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission (page reload)

    const userText = userInput.value.trim();
    if (userText === '') {
      return; // Don't send empty messages
    }

    // 1. Add the user's message to the chat interface
    addMessage(userText, 'user');
    userInput.value = ''; // Clear the input field

    // 2. Show a temporary "Thinking..." message from the bot
    const thinkingMessageElement = addMessage('Thinking...', 'bot');
    thinkingMessageElement.classList.add('thinking');

    try {
      // 3. Send the user's message to the backend API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation: [{ role: 'user', text: userText }],
        }),
      });

      if (!response.ok) {
        // Handle non-successful HTTP responses
        thinkingMessageElement.textContent = 'Failed to get response from server.';
        console.error('Server error:', response.status, response.statusText);
        thinkingMessageElement.classList.remove('thinking');
        return;
      }

      const data = await response.json();
      thinkingMessageElement.classList.remove('thinking');

      // 4. Replace the "Thinking..." message with the actual AI response
      if (data && data.result) {
        thinkingMessageElement.innerHTML = data.result.replace(/\*\*/g, '').replace(/\*/g, '<br>');
      } else {
        // Handle cases where the response is successful but contains no result
        thinkingMessageElement.textContent = 'Sorry, no response received.';
      }
    } catch (error) {
      // 5. Handle network errors or issues with the fetch request itself
      console.error('Fetch error:', error);
      thinkingMessageElement.textContent = 'Failed to get response from server.';
    }
  });
});
