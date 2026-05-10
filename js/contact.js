// Contact page functionality for logged-in users
document.addEventListener("DOMContentLoaded", async function () {
  const authStatus = await checkAuthStatus();

  const messageForm = document.getElementById("messageForm");
  const messageInput = document.getElementById("messageInput");
  const messageList = document.getElementById("messageList");
  const loginPrompt = document.getElementById("loginPrompt");
  const contactStatus = document.getElementById("contactStatus");
  const submitBtn = document.getElementById("contactSubmitBtn");
  const btnText = submitBtn?.querySelector(".contact-form__btn-text");

  if (authStatus.authenticated) {
    // User is logged in - show form and load messages
    if (messageForm) messageForm.style.display = "block";
    if (loginPrompt) loginPrompt.style.display = "none";

    // Load existing messages
    loadMessages();

    // Handle form submission
    if (messageForm) {
      messageForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const message = messageInput.value.trim();
        if (!message) {
          showStatus("Iltimos, xabarni kiriting!", "error");
          return;
        }

        // Disable form during submission
        setFormDisabled(true, "Yuborilmoqda...");

        try {
          const response = await fetch("/api/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ message }),
          });

          const data = await response.json();

          if (data.success) {
            messageInput.value = "";
            loadMessages(); // Reload messages after sending
            showStatus("Xabar muvaffaqiyatli yuborildi!", "success");
          } else {
            showStatus(
              "Xatolik yuz berdi: " + (data.message || "Noma'lum xatolik"),
              "error",
            );
          }
        } catch (err) {
          console.error("Error sending message:", err);
          showStatus(
            "Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.",
            "error",
          );
        } finally {
          setFormDisabled(false, "Yuborish");
        }
      });
    }
  } else {
    // User is not logged in - show login prompt
    if (messageForm) messageForm.style.display = "none";
    if (loginPrompt) loginPrompt.style.display = "flex";
  }

  // Function to show status messages
  function showStatus(message, type) {
    if (!contactStatus) return;

    contactStatus.textContent = message;
    contactStatus.className = `contact-form__status ${type} show`;

    // Hide status after 5 seconds
    setTimeout(() => {
      contactStatus.classList.remove("show");
    }, 5000);
  }

  // Function to disable/enable form
  function setFormDisabled(disabled, text = "Yuborish") {
    if (submitBtn) {
      submitBtn.disabled = disabled;
      submitBtn.style.opacity = disabled ? "0.7" : "1";
      submitBtn.style.cursor = disabled ? "not-allowed" : "pointer";
    }

    if (btnText) {
      btnText.textContent = text;
    }

    if (messageInput) {
      messageInput.disabled = disabled;
    }
  }
});

// Function to load and display messages
async function loadMessages() {
  const messageList = document.getElementById("messageList");

  if (!messageList) return;

  try {
    const response = await fetch("/api/messages");
    const data = await response.json();

    if (data.success && data.messages.length > 0) {
      messageList.innerHTML = data.messages
        .map(
          (msg) => `
        <div class="message-item">
          <div class="message-header">
            <strong>${msg.username}</strong>
            <span class="message-date">${new Date(msg.created_at).toLocaleString("uz-UZ")}</span>
          </div>
          <div class="message-content">${escapeHtml(msg.message)}</div>
        </div>
      `,
        )
        .join("");
    } else {
      messageList.innerHTML = "<p>Hozircha hech qanday xabar yo'q.</p>";
    }
  } catch (err) {
    console.error("Error loading messages:", err);
    messageList.innerHTML = "<p>Xabarlarni yuklashda xatolik yuz berdi.</p>";
  }
}

// Helper function to escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
