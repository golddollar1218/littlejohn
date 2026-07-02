// ===== NAVBAR SCROLL =====
const navbar = document.getElementById("navbar");
const navToggle = document.getElementById("navToggle");
const navLinks = document.querySelector(".nav-links");

window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 40);
});

navToggle.addEventListener("click", () => {
  navToggle.classList.toggle("active");
  navLinks.classList.toggle("open");
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navToggle.classList.remove("active");
    navLinks.classList.remove("open");
  });
});

// ===== SCROLL REVEAL =====
const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
);

revealElements.forEach((el) => revealObserver.observe(el));

// ===== SMOOTH ANCHOR OFFSET =====
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const targetId = anchor.getAttribute("href");
    if (targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();
    const navHeight = navbar.offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
    window.scrollTo({ top, behavior: "smooth" });
  });
});

// ===== COPY CONTRACT ADDRESS =====
const copyBtn = document.getElementById("copyBtn");
const caInput = document.getElementById("caInput");
const copyText = document.getElementById("copyText");

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(caInput.value);
    copyBtn.classList.add("copied");
    copyText.textContent = "Copied!";

    setTimeout(() => {
      copyBtn.classList.remove("copied");
      copyText.textContent = "Copy";
    }, 2000);
  } catch {
    copyText.textContent = "Failed";
    setTimeout(() => {
      copyText.textContent = "Copy";
    }, 2000);
  }
});

// ===== PAGE LOAD =====
window.addEventListener("load", () => {
  document.body.style.opacity = "0";
  requestAnimationFrame(() => {
    document.body.style.transition = "opacity 0.6s ease";
    document.body.style.opacity = "1";
  });

  document.querySelectorAll(".hero-content").forEach((el, i) => {
    el.style.animationDelay = `${i * 0.1}s`;
  });
});
