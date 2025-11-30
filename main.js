import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import confetti from "canvas-confetti";

gsap.registerPlugin(ScrollTrigger);

// --- 1. Canvas Background (Falling Coffee Beans/Stars) ---
const canvas = document.getElementById('space-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

class Particle {
  constructor() {
    this.reset(true);
  }

  reset(initial = false) {
    this.x = Math.random() * width;
    this.y = initial ? Math.random() * height : -20;
    this.size = Math.random() * 3 + 1;
    this.speed = Math.random() * 1 + 0.5;
    this.angle = Math.random() * 360;
    this.spin = (Math.random() - 0.5) * 0.1;
    // 80% stars (white/blue), 20% coffee beans (brown)
    this.isBean = Math.random() > 0.8;
    this.color = this.isBean ? '#6f4e37' : `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2})`;
  }

  update() {
    this.y += this.speed;
    this.angle += this.spin;
    if (this.y > height) this.reset();
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.fillStyle = this.color;
    
    if (this.isBean) {
      // Draw simple bean shape (oval with line)
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size * 2, this.size * 1.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3e2b1f';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-this.size, 0);
      ctx.quadraticCurveTo(0, -this.size/2, this.size, 0);
      ctx.stroke();
    } else {
      // Draw star
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function initParticles() {
  particles = [];
  const count = Math.floor(width / 10);
  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }
}

function animateCanvas() {
  ctx.clearRect(0, 0, width, height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateCanvas);
}

window.addEventListener('resize', () => {
  resize();
  initParticles();
});

resize();
initParticles();
animateCanvas();

// --- 2. GSAP Animations ---

// Hero Animation
gsap.from(".hero-content", {
  duration: 1.5,
  y: 50,
  opacity: 0,
  ease: "power3.out",
  delay: 0.2
});

// Section 1: Beans gathering into cup
const beanCluster = document.querySelector('.bean-cluster');
// Create DOM beans for the specific animation
for(let i=0; i<15; i++) {
  const b = document.createElement('div');
  b.classList.add('bean-visual');
  // Random positions above the cup
  b.style.left = (Math.random() * 100 + 50) + 'px'; 
  b.style.transform = `rotate(${Math.random() * 360}deg)`;
  beanCluster.appendChild(b);
}

gsap.to(".bean-visual", {
  scrollTrigger: {
    trigger: "#origin",
    start: "top center",
    end: "center center",
    scrub: 1
  },
  y: 250, // Fall into cup
  x: (i) => (Math.random() - 0.5) * 50, // Converge slightly
  opacity: 1,
  rotation: 720,
  stagger: 0.05
});

// Section 2: Recipes Cards
gsap.to(".card", {
  scrollTrigger: {
    trigger: "#recipes",
    start: "top 70%"
  },
  y: 0,
  opacity: 1,
  duration: 0.8,
  stagger: 0.2,
  ease: "back.out(1.7)"
});

// --- 3. Form Interaction ---
const form = document.getElementById('order-form');
const btn = document.querySelector('.launch-btn');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Button animation
  gsap.to(btn, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });
  
  // Confetti explosion from button coordinates
  const rect = btn.getBoundingClientRect();
  const x = (rect.left + rect.width / 2) / window.innerWidth;
  const y = (rect.top + rect.height / 2) / window.innerHeight;

  confetti({
    particleCount: 150,
    spread: 70,
    origin: { x, y },
    colors: ['#ff4b1f', '#ff9068', '#ffffff', '#6f4e37'],
    disableForReducedMotion: true
  });

  btn.textContent = "LAUNCHING... 🛸";
  setTimeout(() => {
    btn.textContent = "ORDER SENT!";
    form.reset();
    setTimeout(() => btn.textContent = "LAUNCH ORDER 🚀", 2000);
  }, 1500);
});