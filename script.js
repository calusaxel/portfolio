/*
   Axel Calus Portfolio - Interactive Logic
   Aerodynamic & Motorsports Engineering Theme
*/

document.addEventListener('DOMContentLoaded', () => {
  // --- Navigation & Scroll Effects ---
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinksContainer = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    // Scroll header background shift
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Scroll active link highlight
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').slice(1) === current) {
        link.classList.add('active');
      }
    });
  });

  // Mobile navigation toggle
  mobileToggle.addEventListener('click', () => {
    mobileToggle.classList.toggle('active');
    navLinksContainer.classList.toggle('active');
  });

  // Close mobile nav on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileToggle.classList.remove('active');
      navLinksContainer.classList.remove('active');
    });
  });

  // --- Scroll to Top Button ---
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      scrollTopBtn.style.opacity = '1';
      scrollTopBtn.style.pointerEvents = 'auto';
    } else {
      scrollTopBtn.style.opacity = '0';
      scrollTopBtn.style.pointerEvents = 'none';
    }
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // --- Project Filtering ---
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        // Reset transitions/visibility
        card.style.display = 'flex';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.85)';

        setTimeout(() => {
          if (filterValue === 'all') {
            card.style.display = 'flex';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'scale(1)';
            }, 50);
          } else {
            if (card.classList.contains(filterValue)) {
              card.style.display = 'flex';
              setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
              }, 50);
            } else {
              card.style.display = 'none';
            }
          }
        }, 300);
      });
    });
  });

  // --- Skills Animation (Progress Bars) ---
  const skillBars = document.querySelectorAll('.skill-fill');
  
  const skillObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const width = bar.getAttribute('data-width');
        bar.style.width = width;
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.1 });

  skillBars.forEach(bar => {
    skillObserver.observe(bar);
  });

  // --- Aerodynamic Flow Simulation Canvas ---
  const canvas = document.getElementById('canvas-bg');
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const flowParticles = [];
  const particleCount = Math.min(60, Math.floor(width / 25)); // Scale particles count to window width

  // Mouse coords
  const mouse = {
    x: undefined,
    y: undefined,
    radius: 120 // Deflection range
  };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = undefined;
    mouse.y = undefined;
  });

  class FlowParticle {
    constructor() {
      this.reset();
      this.x = Math.random() * width; // Initial random spreading
    }

    reset() {
      this.x = -20;
      this.y = Math.random() * height;
      this.speed = 1.5 + Math.random() * 2;
      this.length = 40 + Math.random() * 80;
      this.thickness = 0.5 + Math.random() * 1.2;
      // Fade edges based on screen y coordinates (less visible near center for content readability)
      this.opacity = 0.08 + Math.random() * 0.12;
      this.color = Math.random() > 0.6 ? '#00a8cc' : '#ff4500'; // Orange & Cyan flows
    }

    update() {
      this.x += this.speed;

      // Deflection logic around cursor (aerodynamic airflow obstacle simulation)
      if (mouse.x !== undefined && mouse.y !== undefined) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          // Calculate deflection vector
          const force = (mouse.radius - distance) / mouse.radius; // Closer = stronger force
          const angle = Math.atan2(dy, dx);
          
          // Deflect particle away from mouse y direction
          const dirY = dy > 0 ? 1 : -1;
          this.y -= Math.sin(angle) * force * 2;
        }
      }

      // Reset when particle goes off screen
      if (this.x - this.length > width) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      ctx.lineWidth = this.thickness;
      
      // Gradient line for styling
      const grad = ctx.createLinearGradient(this.x - this.length, this.y, this.x, this.y);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, this.color);
      
      ctx.strokeStyle = grad;
      ctx.globalAlpha = this.opacity;
      ctx.moveTo(this.x - this.length, this.y);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }
  }

  // Initialize flow particles
  for (let i = 0; i < particleCount; i++) {
    flowParticles.push(new FlowParticle());
  }

  // Draw engineering coordinate lines (Grid overlay)
  function drawTelemetryGrid() {
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.025)';
    ctx.lineWidth = 1;
    const gridSize = 80;

    // Vertical lines
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Draw Grid
    drawTelemetryGrid();

    // Update & draw aerodynamic flow
    flowParticles.forEach(particle => {
      particle.update();
      particle.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();

  // --- Contact Form Submission & Feedback ---
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('formName').value.trim();
    const email = document.getElementById('formEmail').value.trim();
    const subject = document.getElementById('formSubject').value.trim();
    const message = document.getElementById('formMsg').value.trim();

    // Reset status classes
    formStatus.className = 'form-status';
    formStatus.textContent = '';

    // Simple client side validation
    if (!name || !email || !subject || !message) {
      formStatus.classList.add('error');
      formStatus.textContent = 'All fields are required. Please fill in the missing sectors.';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      formStatus.classList.add('error');
      formStatus.textContent = 'Invalid email syntax detected. Check format.';
      return;
    }

    // Interactive button loading state mock
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Connecting to Server...';

    // Simulate Network Request
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;

      formStatus.classList.add('success');
      formStatus.textContent = 'Transmission Success: Message sent to Axel Calus.';
      
      // Reset Form Inputs
      contactForm.reset();
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        formStatus.style.opacity = '0';
        setTimeout(() => {
          formStatus.className = 'form-status';
          formStatus.style.opacity = '1';
        }, 500);
      }, 5000);
    }, 1500);
  });
});
