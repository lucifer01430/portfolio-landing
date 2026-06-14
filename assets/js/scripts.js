
    (function() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const canvas = document.getElementById('bg-canvas');
      const scene = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(innerWidth, innerHeight);
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      cam.position.z = 4.5;

      const geo = new THREE.IcosahedronGeometry(2, 1);
      const mat = new THREE.MeshBasicMaterial({ color: 0xDFFF00, wireframe: true, opacity: 0.15, transparent: true });
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);

      let mouseX = 0, mouseY = 0;
      document.addEventListener('mousemove', e => {
        mouseX = (e.clientX / innerWidth - 0.5) * 0.4;
        mouseY = (e.clientY / innerHeight - 0.5) * 0.4;
      });

      function animate() {
        requestAnimationFrame(animate);
        mesh.rotation.x += 0.0015;
        mesh.rotation.y += 0.002;
        mesh.rotation.x += (mouseY - mesh.rotation.x) * 0.02;
        mesh.rotation.y += (mouseX - mesh.rotation.y) * 0.02;
        renderer.render(scene, cam);
      }
      animate();

      window.addEventListener('resize', () => {
        cam.aspect = innerWidth / innerHeight;
        cam.updateProjectionMatrix();
        renderer.setSize(innerWidth, innerHeight);
      });
    })();


    // ── Current year in footer ──
    document.getElementById('year').textContent = new Date().getFullYear();

    // ── Mobile nav toggle ──
    function toggleNav(btn) {
      const menu = document.getElementById('nav-menu');
      const isOpen = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen);
    }

    // ── Magnetic buttons ──
    document.querySelectorAll('.btn-magnetic').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.25;
        const y = (e.clientY - r.top - r.height / 2) * 0.25;
        btn.style.transform = `translate(${x}px, ${y}px)`;
        btn.style.transition = 'transform 0.1s';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0,0)';
        btn.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
      });
    });

    // ── Counter animation ──
    document.querySelectorAll('[data-target]').forEach(el => {
      const target = +el.dataset.target;
      const duration = 1800;
      let started = false;

      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !started) {
          started = true;
          const start = performance.now();
          const tick = now => {
            const p = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.floor(ease * target);
            if (p < 1) requestAnimationFrame(tick);
            else el.textContent = target;
          };
          requestAnimationFrame(tick);
        }
      }, { threshold: 0.5 });
      obs.observe(el);
    });

    // ── Scroll reveal fallback (for browsers without scroll-driven animations) ──
    if (!CSS.supports('animation-timeline', 'scroll()')) {
      const obs = new IntersectionObserver(
        entries => entries.forEach((e, i) => {
          if (e.isIntersecting) {
            e.target.style.transitionDelay = (i * 60) + 'ms';
            e.target.classList.add('in-view');
          }
        }),
        { threshold: 0.12 }
      );
      document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    }

    // ── Text scramble on hero ──
    class TextScramble {
      constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#01';
        this.original = el.textContent;
      }
      setText(text) {
        return new Promise(resolve => {
          let frame = 0;
          const queue = [...text].map((to, i) => ({
            from: this.el.innerText[i] || '',
            to,
            start: Math.floor(Math.random() * 12),
            end: Math.floor(Math.random() * 12) + 14
          }));
          const tick = () => {
            let out = '', done = 0;
            queue.forEach(q => {
              if (frame >= q.end) { done++; out += q.to; }
              else if (frame >= q.start) {
                out += `<span style="opacity:.35;color:var(--clr-acid)">${this.chars[Math.floor(Math.random() * this.chars.length)]}</span>`;
              } else out += q.from || ' ';
            });
            this.el.innerHTML = out;
            if (done < queue.length) { requestAnimationFrame(tick); frame++; } else resolve();
          };
          requestAnimationFrame(tick);
        });
      }
    }

    const scrambleEl = document.getElementById('scramble-target');
    if (scrambleEl && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const fx = new TextScramble(scrambleEl);
      const phrases = ['That Ship.', 'That Scale.', 'That Convert.', 'That Last.'];
      let idx = 0;
      const cycle = () => {
        fx.setText(phrases[idx]).then(() => {
          setTimeout(cycle, 3000);
          idx = (idx + 1) % phrases.length;
        });
      };
      setTimeout(cycle, 2000);
    }

    // ── Nav scroll style ──
    const nav = document.querySelector('.nav-pill');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        nav.style.background = 'rgba(5,5,5,0.95)';
      } else {
        nav.style.background = '';
      }
    }, { passive: true });

    // ── Form submission handler ──
    function handleFormSubmit(e) {
      e.preventDefault();
      const status = document.getElementById('form-status');
      const btn = e.target;
      btn.textContent = 'Sending…';
      btn.style.opacity = '.7';
      btn.disabled = true;
      // Simulate async submit
      setTimeout(() => {
        status.textContent = '✓ Got it — I'll reply within 24 hours.';
        status.style.color = 'var(--clr-acid)';
        btn.textContent = 'Message Sent ✓';
      }, 1200);
    }

    // ── Stagger children ──
    document.querySelectorAll('.stagger').forEach(parent => {
      [...parent.children].forEach((child, i) => {
        child.style.setProperty('--i', i);
      });
    });
