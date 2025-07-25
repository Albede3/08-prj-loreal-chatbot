/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Cloudflare Worker endpoint URL (replace with your deployed Worker URL)
const CLOUDFLARE_WORKER_URL =
  "https://steep-salad-515d.bdgalaxy04.workers.dev/";

// System prompt to guide the AI
const systemPrompt = {
  role: "system",
  content: `You are a helpful assistant for L'Oréal. Only answer questions about L'Oréal products, beauty routines, skincare, haircare, and beauty recommendations. If asked about anything unrelated to L'Oréal or beauty, politely reply: 'Sorry, I can only answer questions about L'Oréal products, routines, and beauty topics.'`,
};

// Store the conversation as an array of messages
let messages = [systemPrompt];

// Set initial message
chatWindow.innerHTML =
  '<div class="msg ai">👋 Hello! How can I help you today?</div>';

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userText = userInput.value.trim();
  if (!userText) return;

  // Add user message to chat and messages array
  addMessage(userText, "user");
  messages.push({ role: "user", content: userText });
  userInput.value = "";

  // Show loading message
  addMessage("...", "ai");

  try {
    // Send messages array to Cloudflare Worker
    const response = await fetch(CLOUDFLARE_WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    const data = await response.json();
    // Get AI reply from data.choices[0].message.content
    const aiReply =
      data.choices?.[0]?.message?.content ||
      "Sorry, I couldn't get a response.";
    // Remove loading message and add AI reply
    chatWindow.removeChild(chatWindow.lastChild);
    addMessage(aiReply, "ai");
    // Add AI reply to messages array
    messages.push({ role: "assistant", content: aiReply });
  } catch (err) {
    chatWindow.removeChild(chatWindow.lastChild);
    addMessage("Sorry, there was an error. Please try again.", "ai");
  }
});

// Function to add a message to the chat window
function addMessage(text, sender) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `msg ${sender}`;
  msgDiv.textContent = text;
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}
