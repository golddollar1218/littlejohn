/* ========================================================
   $JOHN — Robin Hood Interactions & FX
======================================================== */
(function () {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Nav ---------- */
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const links = document.querySelector('.nav__links');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('shrink', window.scrollY > 40);
  }, { passive: true });

  burger.addEventListener('click', () => links.classList.toggle('open'));
  links.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => links.classList.remove('open'))
  );

  /* ---------- Smooth scroll ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - nav.offsetHeight - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---------- Animated counters ---------- */
  const fmt = n => n >= 1e9 ? (n / 1e9) + 'B'
                 : n >= 1e6 ? (n / 1e6) + 'M'
                 : n.toLocaleString();

  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.dataset.count);
      const big = target >= 1e6;
      const dur = 1400, t0 = performance.now();
      const tick = now => {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target * eased;
        el.textContent = big ? fmt(Math.round(val / 1e6) * 1e6) : Math.round(val).toLocaleString();
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = fmt(target);
      };
      requestAnimationFrame(tick);
      countIO.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => countIO.observe(el));

  /* ---------- Copy contract ---------- */
  const caBtn = document.getElementById('ca-copy');
  const caText = document.getElementById('ca-text');
  if (caBtn) {
    caBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(caText.textContent.trim());
        const old = caBtn.textContent;
        caBtn.textContent = 'COPIED ✔';
        setTimeout(() => (caBtn.textContent = old), 1500);
      } catch {
        caBtn.textContent = 'COPY MANUALLY';
      }
    });
  }

  /* ---------- 3D tilt ---------- */
  if (!reduced && window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('[data-tilt]').forEach(card => {
      const max = parseFloat(card.dataset.tiltMax || '10');
      card.addEventListener('mousemove', ev => {
        const r = card.getBoundingClientRect();
        const px = (ev.clientX - r.left) / r.width - 0.5;
        const py = (ev.clientY - r.top) / r.height - 0.5;
        card.style.transform = `rotateY(${px * max}deg) rotateX(${-py * max}deg) translateZ(4px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- Floating leaves ---------- */
  if (!reduced) {
    const floaters = document.querySelector('.floaters');
    const leaves = ['🍃', '🌿', '🍂', '🏹'];
    const make = () => {
      const s = document.createElement('span');
      s.textContent = leaves[Math.floor(performance.now() * 0.001 % leaves.length)];
      s.style.left = (5 + (performance.now() * 0.05 % 90)) + '%';
      const dur = 10 + (performance.now() % 8);
      s.style.animationDuration = dur + 's';
      s.style.fontSize = (14 + (performance.now() % 16)) + 'px';
      floaters.appendChild(s);
      setTimeout(() => s.remove(), dur * 1000 + 200);
    };
    for (let i = 0; i < 5; i++) setTimeout(make, i * 1200);
    setInterval(make, 2000);
  }

  /* ---------- Falling leaf canvas ---------- */
  if (!reduced) {
    const canvas = document.getElementById('leaf-canvas');
    const ctx = canvas.getContext('2d');
    let W, H, leaves = [];

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let seed = 42;
    const rnd = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };

    const colors = ['#3d7a52', '#2a5238', '#c9a227', '#5c7a66', '#8aab94'];
    const N = window.innerWidth < 600 ? 25 : 45;

    for (let i = 0; i < N; i++) {
      leaves.push({
        x: rnd() * W,
        y: rnd() * H,
        size: 3 + rnd() * 5,
        speed: 0.3 + rnd() * 0.8,
        sway: rnd() * Math.PI * 2,
        swaySpeed: 0.01 + rnd() * 0.02,
        rot: rnd() * Math.PI * 2,
        rotSpeed: -0.02 + rnd() * 0.04,
        color: colors[Math.floor(rnd() * colors.length)],
        opacity: 0.2 + rnd() * 0.4
      });
    }

    const drawLeaf = (x, y, size, rot, color, opacity) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.quadraticCurveTo(size * 0.8, -size * 0.3, 0, size);
      ctx.quadraticCurveTo(-size * 0.8, -size * 0.3, 0, -size);
      ctx.fill();
      ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const l of leaves) {
        l.y += l.speed;
        l.sway += l.swaySpeed;
        l.rot += l.rotSpeed;
        l.x += Math.sin(l.sway) * 0.5;
        if (l.y > H + 20) {
          l.y = -20;
          l.x = rnd() * W;
        }
        drawLeaf(l.x, l.y, l.size, l.rot, l.color, l.opacity);
      }
      requestAnimationFrame(draw);
    };
    draw();
  }

  /* ---------- Arrow burst on CTA click ---------- */
  if (!reduced) {
    document.querySelectorAll('.btn--gold').forEach(btn => {
      btn.addEventListener('click', e => {
        for (let i = 0; i < 3; i++) {
          const arrow = document.createElement('div');
          arrow.innerHTML = '<svg viewBox="0 0 24 24" fill="#c9a227" width="20" height="20"><path d="M2 12l20-8-8 20-2-8-8-4z"/></svg>';
          arrow.style.cssText =
            `position:fixed;left:${e.clientX}px;top:${e.clientY}px;` +
            `pointer-events:none;z-index:999;transition:transform .8s ease,opacity .8s;`;
          document.body.appendChild(arrow);
          const angle = (i - 1) * 40;
          requestAnimationFrame(() => {
            arrow.style.transform = `translate(${Math.sin(angle) * 60}px, -80px) rotate(${angle}deg)`;
            arrow.style.opacity = '0';
          });
          setTimeout(() => arrow.remove(), 850);
        }
      });
    });
  }

  /* ---------- Hero parallax ---------- */
  if (!reduced) {
    const heroImg = document.querySelector('.hero__img');
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight && heroImg) {
        heroImg.style.transform = `translateY(${y * 0.06}px)`;
      }
    }, { passive: true });
  }
})();
