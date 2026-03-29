'use strict';

// ==================== LOADER ====================
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 2000);
});

// ==================== CONTACT FORM (🔥 FIXED) ====================
const form = document.getElementById('contactForm');
const success = document.getElementById('formSuccess');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<span>Sending...</span>';

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    try {
      const res = await fetch('https://portfolio-project-1-86re.onrender.com/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();

      if (data.success) {
        success.innerHTML = "✅ Message sent successfully!";
        success.style.display = 'block';
        form.reset();
      } else {
        success.innerHTML = "❌ Failed to send message";
        success.style.display = 'block';
      }

    } catch (err) {
      success.innerHTML = "❌ Server error. Try again.";
      success.style.display = 'block';
    }

    btn.disabled = false;
    btn.innerHTML = '<span>Send Message</span>';

    setTimeout(() => {
      success.style.display = 'none';
    }, 4000);
  });
}

// ==================== TYPED TEXT ====================
const phrases = [
  'Web Developer',
  'Full Stack Developer',
  'UI/UX Enthusiast',
  'Problem Solver',
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

const typedEl = document.getElementById('typedText');

function typeLoop() {
  const current = phrases[phraseIndex];

  if (!isDeleting) {
    typedEl.textContent = current.slice(0, ++charIndex);
    if (charIndex === current.length) {
      isDeleting = true;
      return setTimeout(typeLoop, 1500);
    }
  } else {
    typedEl.textContent = current.slice(0, --charIndex);
    if (charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }
  }

  setTimeout(typeLoop, isDeleting ? 50 : 90);
}

setTimeout(typeLoop, 1000);

// ==================== NAV SCROLL ====================
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
});

// ==================== SMOOTH SCROLL ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  });
});