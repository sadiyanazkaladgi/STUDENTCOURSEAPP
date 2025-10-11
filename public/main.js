// main.js — small UI helpers: floating-circle actions, a modal, demo message AJAX
document.addEventListener("DOMContentLoaded", () => {

  // FLOATING CIRCLES ACTIONS ON HOME
  const circles = document.querySelectorAll(".circle");
  if (circles.length) {
    circles.forEach(el => {
      el.addEventListener("click", () => {
        const action = el.dataset.action;
        if (action === "about") {
          showModal(`<h3>About Me</h3><p>Name: ${window.currentUserName || 'Student'}</p><p>Email: ${window.currentUserEmail || '—'}</p><p class="muted">You can edit profile from Profile page.</p>`);
        } else if (action === "courses") {
          // navigate to home anchor or open modal list
          window.location.href = "/home#registered";
        } else if (action === "join") {
          window.location.href = "/join";
        }
      });
    });
  }

  // expose current user (if server set in global)
  if (window.__USER__) {
    window.currentUserName = window.__USER__.name;
    window.currentUserEmail = window.__USER__.email;
  }

  // modal
  const modal = document.getElementById("floatModal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) hideModal();
    });
  }

  // demo message form AJAX on fun.ejs
  const demoForm = document.getElementById("demoForm");
  if (demoForm) {
    demoForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(demoForm);
      const payload = {
        name: formData.get("name"),
        email: formData.get("email"),
        message: formData.get("message")
      };
      try {
        const res = await fetch("/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const text = await res.text();
        document.getElementById("demoResp").textContent = "✅ " + text;
        demoForm.reset();
      } catch (err) {
        document.getElementById("demoResp").textContent = "❌ Error sending message.";
      }
    });
  }

});

// simple modal functions
function showModal(html) {
  let modal = document.getElementById("floatModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "floatModal";
    document.body.appendChild(modal);
  }
  modal.classList.remove("hidden");
  modal.innerHTML = `<div class="modal-card">${html}<div style="height:12px"></div><button onclick="hideModal()" class="primary-btn">Close</button></div>`;
  // modal style
  modal.style.position = "fixed";
  modal.style.left = 0;
  modal.style.top = 0;
  modal.style.right = 0;
  modal.style.bottom = 0;
  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";
  modal.style.background = "rgba(0,0,0,0.35)";
  modal.style.zIndex = 9999;
  const card = modal.querySelector(".modal-card");
  card.style.background = "white";
  card.style.borderRadius = "14px";
  card.style.padding = "18px";
  card.style.maxWidth = "520px";
  card.style.boxShadow = "0 12px 40px rgba(0,0,0,0.25)";
}
function hideModal() {
  const modal = document.getElementById("floatModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.style.display = "none";
  }
}
console.log("✨ Frontend JS loaded successfully!");

// Fun bubble animation 🎈
const canvas = document.getElementById("funCanvas");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let bubbles = [];
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  window.addEventListener("mousemove", (e) => {
    bubbles.push({ x: e.x, y: e.y, radius: 8, alpha: 1 });
  });

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bubbles.forEach((b, i) => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 192, 203, ${b.alpha})`;
      ctx.fill();
      b.y -= 1;
      b.alpha -= 0.01;
      if (b.alpha <= 0) bubbles.splice(i, 1);
    });
    requestAnimationFrame(animate);
  }
  animate();
}
