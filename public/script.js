/* ============================================================
   DHANUSH S — PORTFOLIO JavaScript
   Particles · Cursor · Typed · Scroll Animations · Skills
   ============================================================ */

'use strict';

// ==================== LOADER ====================
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 2000);
});

// ==================== CUSTOM CURSOR ====================
const dot  = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0;
let ringX  = 0, ringY  = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  dot.style.left = mouseX + 'px';
  dot.style.top  = mouseY + 'px';
});

(function animateRing() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  ring.style.left = ringX + 'px';
  ring.style.top  = ringY + 'px';
  requestAnimationFrame(animateRing);
})();

document.addEventListener('mouseleave', () => {
  dot.style.opacity  = '0';
  ring.style.opacity = '0';
});
document.addEventListener('mouseenter', () => {
  dot.style.opacity  = '1';
  ring.style.opacity = '0.5';
});

// ==================== PARTICLE CANVAS ====================
const canvas = document.getElementById('particleCanvas');
const ctx    = canvas.getContext('2d');

function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

const PARTICLE_COUNT = 80;
const particles = [];

class Particle {
  constructor() { this.reset(true); }
  reset(init = false) {
    this.x  = Math.random() * canvas.width;
    this.y  = init ? Math.random() * canvas.height : canvas.height + 10;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = -(Math.random() * 0.6 + 0.2);
    this.size   = Math.random() * 2 + 0.5;
    this.life   = Math.random() * 0.5 + 0.2;
    this.decay  = Math.random() * 0.003 + 0.001;
    const hues  = [185, 270, 330, 145];
    this.hue    = hues[Math.floor(Math.random() * hues.length)];
  }
  update() {
    this.x    += this.vx;
    this.y    += this.vy;
    this.life -= this.decay;
    if (this.life <= 0 || this.y < -10) this.reset();
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.shadowBlur  = 8;
    ctx.shadowColor = `hsl(${this.hue}, 100%, 60%)`;
    ctx.fillStyle   = `hsl(${this.hue}, 100%, 70%)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

// Connection lines
function drawConnections() {
  const maxDist = 100;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx   = particles[i].x - particles[j].x;
      const dy   = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < maxDist) {
        const alpha = (1 - dist / maxDist) * 0.06;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#00f5ff';
        ctx.lineWidth   = 0.5;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawConnections();
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateParticles);
}
animateParticles();

// ==================== NAVIGATION ====================
const nav = document.getElementById('nav');
const toggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
  updateActiveNav();
});

toggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const spans = toggle.querySelectorAll('span');
  const isOpen = navLinks.classList.contains('open');
  spans[0].style.transform = isOpen ? 'rotate(45deg) translate(5px, 5px)' : '';
  spans[1].style.opacity   = isOpen ? '0' : '1';
  spans[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px, -5px)' : '';
});

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    toggle.querySelectorAll('span').forEach(s => {
      s.style.transform = ''; s.style.opacity = '1';
    });
  });
});

function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  sections.forEach(section => {
    const top = section.offsetTop - 100;
    const id  = section.getAttribute('id');
    const link = document.querySelector(`.nav-link[href="#${id}"]`);
    if (!link) return;
    if (window.scrollY >= top && window.scrollY < top + section.offsetHeight) {
      document.querySelectorAll('.nav-link').forEach(l => l.style.color = '');
      link.style.color = 'var(--cyan)';
    }
  });
}

// ==================== TYPED TEXT ====================
const phrases = [
  'Web Developer',
  'Frontend Engineer',
  'UI/UX Enthusiast',
  'Problem Solver',
  'Creative Coder',
  'Open Source Fan',
];
let phraseIndex = 0;
let charIndex   = 0;
let isDeleting  = false;
const typedEl   = document.getElementById('typedText');

function typeLoop() {
  const current = phrases[phraseIndex];
  if (!isDeleting) {
    typedEl.textContent = current.slice(0, ++charIndex);
    if (charIndex === current.length) {
      isDeleting = true;
      return setTimeout(typeLoop, 1800);
    }
  } else {
    typedEl.textContent = current.slice(0, --charIndex);
    if (charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }
  }
  setTimeout(typeLoop, isDeleting ? 50 : 95);
}
setTimeout(typeLoop, 1200);

// ==================== SCROLL REVEAL ====================
const observer = new IntersectionObserver(entries => {
  entries.forEach((entry, idx) => {
    if (entry.isIntersecting) {
      // stagger siblings
      const siblings = entry.target.parentElement
        ? [...entry.target.parentElement.querySelectorAll('.reveal')]
        : [entry.target];
      const i = siblings.indexOf(entry.target);
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, i * 100);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ==================== SKILL BARS ====================
const skillObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.skill-fill').forEach(fill => {
        const w = fill.getAttribute('data-width');
        setTimeout(() => { fill.style.width = w + '%'; }, 200);
      });
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.skill-column').forEach(col => skillObserver.observe(col));

// ==================== COUNTER ANIMATION ====================
const countObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el  = entry.target;
      const end = parseInt(el.getAttribute('data-count'), 10);
      let current = 0;
      const step  = Math.max(1, Math.floor(end / 40));
      const timer = setInterval(() => {
        current = Math.min(current + step, end);
        el.textContent = current + '+';
        if (current >= end) clearInterval(timer);
      }, 40);
      countObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => countObserver.observe(el));

// ==================== CONTACT FORM ====================
const form    = document.getElementById('contactForm');
const success = document.getElementById('formSuccess');

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<span>Sending...</span>';

    // Try the API — if unavailable (frontend-only mode) simulate success
    const name    = form.querySelector('input[type="text"]').value;
    const email   = form.querySelector('input[type="email"]').value;
    const message = form.querySelector('textarea').value;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error('API offline');
    } catch (_) {
      // Frontend-only fallback
    }

    await new Promise(r => setTimeout(r, 800));
    form.reset();
    success.style.display = 'block';
    btn.disabled = false;
    btn.innerHTML = '<span>Send Message</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
    setTimeout(() => { success.style.display = 'none'; }, 4000);
  });
}

// ==================== MAGNETIC BUTTON EFFECT ====================
document.querySelectorAll('.btn, .tech-icon').forEach(el => {
  el.addEventListener('mousemove', e => {
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width  / 2) * 0.2;
    const y = (e.clientY - rect.top  - rect.height / 2) * 0.2;
    el.style.transform = `translate(${x}px, ${y}px) scale(1.04)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = '';
  });
});

// ==================== PARALLAX HERO GRID ====================
document.addEventListener('mousemove', e => {
  const grid = document.querySelector('.hero-grid-overlay');
  if (!grid) return;
  const xPct = (e.clientX / window.innerWidth  - 0.5) * 20;
  const yPct = (e.clientY / window.innerHeight - 0.5) * 20;
  grid.style.transform = `translate(${xPct}px, ${yPct}px)`;
});

// ==================== SMOOTH ANCHOR SCROLL ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  });
});

// ==================== GLITCH EFFECT on NAV LOGO ====================
const logo = document.querySelector('.nav-logo');
if (logo) {
  setInterval(() => {
    logo.style.textShadow = `2px 0 var(--pink), -2px 0 var(--cyan)`;
    logo.style.transform  = `skew(-2deg)`;
    setTimeout(() => {
      logo.style.textShadow = '0 0 20px var(--cyan)';
      logo.style.transform  = '';
    }, 80);
  }, 4000);
}

// ==================== PROJECT CARD TILT ====================
document.querySelectorAll('.project-card, .gallery-item').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 12;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 12;
    card.style.transform   = `perspective(600px) rotateX(${-y}deg) rotateY(${x}deg) translateY(-6px)`;
    card.style.transition  = 'transform 0.1s ease';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform  = '';
    card.style.transition = 'transform 0.4s ease';
  });
});

// ==================== CONSOLE EASTER EGG ====================
console.log(
  '%c Dhanush S — Portfolio 🚀 ',
  'background: linear-gradient(135deg, #00f5ff, #8b00ff); color: black; padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 14px;'
);
console.log('%c Built with ❤️ + JS | Kristu Jayanti University | 25AIMA19', 'color: #00f5ff; font-size: 12px;');