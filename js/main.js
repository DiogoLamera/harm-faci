/* =========================================================
   Configuração: troque aqui o número do WhatsApp da clínica
   (formato internacional, só números: 55 + DDD + número)
   ========================================================= */
const WHATSAPP_NUMBER = '5511999999999';

(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const root = document.documentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  // Sem GSAP (CDN bloqueado, offline), o conteúdo precisa aparecer do mesmo jeito
  if (!hasGsap) root.classList.remove('js');

  /* ---------- Links de WhatsApp ---------- */
  $$('[data-wa]').forEach(el => {
    const msg = el.dataset.wa || 'Olá! Vim pelo site.';
    el.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    el.target = '_blank';
    el.rel = 'noopener';
  });

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Smooth scroll (Lenis) ---------- */
  let lenis = null;
  if (hasGsap && !reducedMotion && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const headerOffset = () => -($('#header')?.offsetHeight || 70) + 1;

  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(target, { offset: id === '#inicio' ? 0 : headerOffset() });
      else target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });

  /* ---------- Header ---------- */
  const header = $('#header');
  let lastY = window.scrollY;

  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    const goingDown = y > lastY && y > 400;
    header.classList.toggle('is-hidden', goingDown && !nav.classList.contains('is-open'));
    lastY = y;
  };

  /* ---------- Menu mobile ---------- */
  const nav = $('#nav');
  const burger = $('#burger');

  function openMenu() {
    nav.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Fechar menu');
  }
  function closeMenu() {
    if (!nav.classList.contains('is-open')) return;
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir menu');
  }
  burger.addEventListener('click', () => nav.classList.contains('is-open') ? closeMenu() : openMenu());
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  $$('[data-wa]', nav).forEach(a => a.addEventListener('click', closeMenu));
  // Menu em cartão: fecha ao tocar fora ou ao rolar a página
  document.addEventListener('click', e => {
    if (nav.classList.contains('is-open') && !nav.contains(e.target) && !burger.contains(e.target)) closeMenu();
  });
  let menuY = 0;
  window.addEventListener('scroll', () => {
    if (!nav.classList.contains('is-open')) { menuY = window.scrollY; return; }
    if (Math.abs(window.scrollY - menuY) > 60) closeMenu();
  }, { passive: true });

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Link ativo no menu ---------- */
  const links = $$('.nav__link');
  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));

  /* ---------- Procedimentos: mapa interativo ---------- */
  const procs = $('#procedimentos');
  if (procs) {
    const mapTabs = $$('.procs__tabs .tabs__btn', procs);
    const frames = $$('.map__frame', procs);
    const hotspots = $$('.hotspot', procs);
    const cards = $$('.proc', procs);
    const chips = $$('.chip', procs);
    const chipsWrap = $('.procs__chips', procs);
    const idxEl = $('#procIndex');
    const totEl = $('#procTotal');
    const animate = hasGsap && !reducedMotion;
    let map = 'face';

    const ids = () => cards.filter(c => c.dataset.map === map).map(c => c.dataset.proc);
    const activeId = () => cards.find(c => c.classList.contains('is-active'))?.dataset.proc;
    const pad = n => String(n).padStart(2, '0');

    const show = (id, dir = 1) => {
      const next = cards.find(c => c.dataset.proc === id);
      const prev = cards.find(c => c.classList.contains('is-active'));
      if (!next || next === prev) return;

      hotspots.forEach(h => h.classList.toggle('is-active', h.dataset.proc === id));
      chips.forEach(c => c.classList.toggle('is-active', c.dataset.proc === id));
      const list = ids();
      idxEl.textContent = pad(list.indexOf(id) + 1);
      totEl.textContent = pad(list.length);

      // Mantém o chip ativo visível na rolagem horizontal do celular
      const chip = chips.find(c => c.dataset.proc === id);
      if (chip && chipsWrap.scrollWidth > chipsWrap.clientWidth) {
        chipsWrap.scrollTo({ left: chip.offsetLeft - 20, behavior: animate ? 'smooth' : 'auto' });
      }

      prev?.classList.remove('is-active');
      next.classList.add('is-active');
      if (!animate) return;
      if (prev) gsap.fromTo(prev, { autoAlpha: 1, x: 0 }, { autoAlpha: 0, x: -30 * dir, duration: .3, ease: 'power2.in', overwrite: true });
      gsap.fromTo(next, { autoAlpha: 0, x: 40 * dir }, { autoAlpha: 1, x: 0, duration: .6, ease: 'power3.out', delay: prev ? .12 : 0, overwrite: true });
      gsap.from($$('.proc__title, .proc__desc, .proc__list li, .proc__facts > div, .btn', next), { y: 16, opacity: 0, duration: .5, stagger: .04, ease: 'power2.out', delay: .22 });
    };

    const step = d => {
      const list = ids();
      const cur = list.indexOf(activeId());
      show(list[(cur + d + list.length) % list.length], d);
    };

    const dirTo = id => {
      const list = ids();
      return list.indexOf(id) >= list.indexOf(activeId()) ? 1 : -1;
    };

    const setMap = m => {
      if (m === map) return;
      map = m;
      mapTabs.forEach(t => {
        const on = t.dataset.map === m;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on);
      });
      frames.forEach(f => f.classList.toggle('is-active', f.dataset.map === m));
      chips.forEach(c => (c.hidden = c.dataset.map !== m));
      chipsWrap.scrollLeft = 0;
      show(ids()[0]);
      if (animate) {
        const frame = frames.find(f => f.dataset.map === m);
        gsap.fromTo(frame, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'expo.out', clearProps: 'clipPath' });
        gsap.fromTo($$('.hotspot', frame), { scale: 0 }, { scale: 1, duration: .5, stagger: .07, ease: 'back.out(2)', delay: .4 });
      }
    };

    mapTabs.forEach(t => t.addEventListener('click', () => setMap(t.dataset.map)));
    [...hotspots, ...chips].forEach(b => b.addEventListener('click', () => show(b.dataset.proc, dirTo(b.dataset.proc))));
    $$('.procs__nav [data-step]', procs).forEach(b => b.addEventListener('click', () => step(+b.dataset.step)));
  }

  /* ---------- Antes e depois ---------- */
  const compare = $('#compare');
  if (compare) {
    const range = $('.compare__range', compare);
    const setPos = v => {
      compare.style.setProperty('--pos', `${v}%`);
      // Com a linha encostada num lado, só uma foto aparece: esconde o rótulo da outra
      compare.classList.toggle('is-min', v < 12);
      compare.classList.toggle('is-max', v > 88);
    };
    range.addEventListener('input', () => setPos(+range.value));

    const cases = $$('.case');
    const selectCase = c => {
      if (c.classList.contains('is-active')) return;
      cases.forEach(x => x.classList.toggle('is-active', x === c));
      compare.classList.add('is-swapping');
      setTimeout(() => {
        const before = $('.compare__img--before', compare);
        const after = $('.compare__img--after', compare);
        before.src = c.dataset.before;
        before.alt = c.dataset.altBefore || 'Antes';
        after.src = c.dataset.after;
        after.alt = c.dataset.altAfter || 'Depois';
        compare.classList.remove('is-swapping');
        range.value = 50; setPos(50);
      }, 350);
    };
    cases.forEach(c => c.addEventListener('click', () => selectCase(c)));
    // Pré-carrega as fotos dos outros casos para a troca ser instantânea
    window.addEventListener('load', () => cases.forEach(c => { new Image().src = c.dataset.before; new Image().src = c.dataset.after; }));
  }

  /* ---------- Depoimentos ---------- */
  const track = $('#testimonialTrack');
  if (track) {
    const slides = $$('.testimonial', track);
    const dotsWrap = $('#sliderDots');
    const dots = slides.map((_, i) => {
      const b = document.createElement('button');
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', `Depoimento ${i + 1}`);
      b.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(b);
      return b;
    });

    const current = () => {
      const x = track.scrollLeft;
      let idx = 0, min = Infinity;
      slides.forEach((s, i) => { const d = Math.abs(s.offsetLeft - x); if (d < min) { min = d; idx = i; } });
      return idx;
    };
    // Último índice que ainda consegue alinhar à esquerda (em telas largas aparecem 3 por vez)
    const lastIndex = () => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      const i = slides.findIndex(s => s.offsetLeft >= maxScroll - 4);
      return i === -1 ? slides.length - 1 : i;
    };
    function goTo(i) {
      const last = lastIndex();
      if (i > last) i = 0;
      if (i < 0) i = last;
      track.scrollTo({ left: slides[i].offsetLeft, behavior: reducedMotion ? 'auto' : 'smooth' });
    }
    const updateDots = () => {
      const idx = current();
      dots.forEach((d, i) => d.setAttribute('aria-selected', i === idx));
    };
    track.addEventListener('scroll', () => requestAnimationFrame(updateDots), { passive: true });
    $('#prevBtn').addEventListener('click', () => goTo(current() - 1));
    $('#nextBtn').addEventListener('click', () => goTo(current() + 1));
    updateDots();

    // Autoplay discreto, pausa quando a pessoa interage
    let timer = null;
    const start = () => { if (!reducedMotion) { stop(); timer = setInterval(() => goTo(current() + 1), 6000); } };
    const stop = () => clearInterval(timer);
    const slider = track.closest('.slider');
    ['mouseenter', 'focusin', 'touchstart'].forEach(ev => slider.addEventListener(ev, stop, { passive: true }));
    ['mouseleave', 'focusout'].forEach(ev => slider.addEventListener(ev, start));
    new IntersectionObserver(([e]) => e.isIntersecting ? start() : stop()).observe(slider);
  }

  /* ---------- Galeria / lightbox ---------- */
  const lightbox = $('#lightbox');
  if (lightbox && typeof lightbox.showModal === 'function') {
    const img = $('img', lightbox);
    $$('.gallery__item').forEach(item => item.addEventListener('click', () => {
      const thumb = $('img', item);
      img.src = item.dataset.full;
      img.alt = thumb.alt;
      lightbox.showModal();
      lenis?.stop();
    }));
    $('.lightbox__close', lightbox).addEventListener('click', () => lightbox.close());
    lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.close(); });
    lightbox.addEventListener('close', () => lenis?.start());
  }

  /* ---------- FAQ: um aberto por vez, com animação ---------- */
  const items = $$('.accordion__item');
  items.forEach(item => {
    const summary = $('summary', item);
    const content = $('.accordion__content', item);

    summary.addEventListener('click', e => {
      if (!hasGsap || reducedMotion) {
        items.forEach(o => { if (o !== item) o.open = false; });
        return;
      }
      e.preventDefault();
      if (item.open) {
        gsap.to(content, { height: 0, duration: .4, ease: 'power2.inOut', onComplete: () => { item.open = false; gsap.set(content, { clearProps: 'height' }); ScrollTrigger.refresh(); } });
      } else {
        items.forEach(o => {
          if (o !== item && o.open) {
            const c = $('.accordion__content', o);
            gsap.to(c, { height: 0, duration: .35, ease: 'power2.inOut', onComplete: () => { o.open = false; gsap.set(c, { clearProps: 'height' }); } });
          }
        });
        item.open = true;
        gsap.fromTo(content, { height: 0 }, { height: 'auto', duration: .5, ease: 'power2.out', onComplete: () => ScrollTrigger.refresh() });
      }
    });
  });

  /* ---------- Dica do botão flutuante ---------- */
  const waFloat = $('.wa-float');
  if (waFloat) {
    setTimeout(() => {
      waFloat.classList.add('show-tip');
      setTimeout(() => waFloat.classList.remove('show-tip'), 4500);
    }, 6000);
  }

  /* =========================================================
     Animações (GSAP + ScrollTrigger + SplitText)
     ========================================================= */
  if (!hasGsap) return;

  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);

  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    /* Hero */
    const title = $('[data-split]');
    gsap.set('.hero__eyebrow', { y: 20 });
    const heroTl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });

    heroTl
      .from('.hero__img', { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', clearProps: 'clipPath' }, 0)
      .from('.hero__img img', { scale: 1.3, duration: 1.8, ease: 'expo.out' }, .3)
      .from('.hero__thumb', { scale: 0, rotate: -20, duration: 1.1, ease: 'back.out(1.6)' }, .9)
      .from('.hero__shape', { opacity: 0, scale: .8, duration: 1.4, stagger: .15 }, .2)
      .to('.hero__eyebrow', { opacity: 1, y: 0, duration: .8 }, .4)
      .fromTo('.hero [data-hero]:not(.hero__eyebrow)', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .9, stagger: .12 }, .9)
      .from('.hero__badge--face', { opacity: 0, x: -30, duration: .9 }, 1.2)
      .from('.hero__badge--dental', { opacity: 0, x: 30, duration: .9 }, 1.35)
      .from('.marquee', { opacity: 0, y: 30, duration: 1 }, 1.2);

    // O título só é dividido em palavras depois que a fonte carrega (limite de 1,5s).
    // Dividir antes faz as quebras de linha mudarem e o texto sumir.
    const startHero = () => {
      if (title && window.SplitText) {
        gsap.set(title, { visibility: 'visible' });
        const split = SplitText.create(title, { type: 'lines, words', mask: 'lines' });
        heroTl.from(split.words, { yPercent: 110, duration: 1, stagger: .06, onComplete: () => split.revert() }, .5);
      } else if (title) {
        heroTl.fromTo(title, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1 }, .5);
      }
      heroTl.play();
    };
    Promise.race([document.fonts ? document.fonts.ready : null, new Promise(res => setTimeout(res, 1500))]).then(startHero);

    // Selo flutuando
    gsap.to('[data-float]', { y: -10, duration: 2.6, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 2 });

    // Parallax do hero
    gsap.to('.hero__img img', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__thumb', { yPercent: -35, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__shape--1', { yPercent: 60, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__content', { y: 80, opacity: .3, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* Reveals genéricos */
    const offsets = { left: { x: -60, y: 0 }, right: { x: 60, y: 0 } };
    $$('[data-reveal]').forEach(el => {
      const o = offsets[el.dataset.reveal] || { x: 0, y: 40 };
      gsap.set(el, o);
    });
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 88%',
      once: true,
      onEnter: batch => gsap.to(batch, { opacity: 1, x: 0, y: 0, duration: 1, ease: 'power3.out', stagger: .1, overwrite: true }),
    });

    /* Galeria */
    gsap.set('.gallery__item', { y: 50 });
    ScrollTrigger.batch('.gallery__item', {
      start: 'top 90%',
      once: true,
      onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .1, overwrite: true }),
    });

    /* Pontos do mapa aparecem em sequência */
    gsap.from('.map__frame.is-active .hotspot', { scale: 0, duration: .5, stagger: .08, ease: 'back.out(2)', scrollTrigger: { trigger: '.map', start: 'top 70%' } });

    /* Mosaico de cápsulas do Sobre: abre de baixo para cima e as colunas andam em sentidos opostos */
    gsap.from('[data-pill]', { clipPath: 'inset(100% 0% 0% 0% round 999px)', duration: 1.3, ease: 'expo.out', stagger: .15, clearProps: 'clipPath', scrollTrigger: { trigger: '.pills', start: 'top 75%' } });
    gsap.from('[data-pill] img', { scale: 1.35, duration: 1.8, ease: 'expo.out', stagger: .15, scrollTrigger: { trigger: '.pills', start: 'top 75%' } });
    gsap.from('.pills__badge', { scale: 0, rotate: -90, duration: 1, ease: 'back.out(1.7)', delay: .6, scrollTrigger: { trigger: '.pills', start: 'top 75%' } });
    gsap.fromTo('.pills__col:first-child', { y: 30 }, { y: -30, ease: 'none', scrollTrigger: { trigger: '.pills', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo('.pills__col--offset', { y: -20 }, { y: 40, ease: 'none', scrollTrigger: { trigger: '.pills', start: 'top bottom', end: 'bottom top', scrub: true } });

    /* Cápsulas do "Como funciona" */
    gsap.from('[data-capsule]', { y: 90, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: .15, scrollTrigger: { trigger: '.capsules', start: 'top 80%' } });
    gsap.fromTo('.capsule__icon', { scale: 0, rotate: -120 }, { scale: 1, rotate: 0, duration: .9, ease: 'back.out(1.8)', stagger: .15, delay: .35, scrollTrigger: { trigger: '.capsules', start: 'top 80%' } });

    /* Ondas: "respiram" conforme a seção entra na tela */
    $$('.wave').forEach(w => {
      const top = w.classList.contains('wave--top');
      gsap.fromTo(w, { scaleY: .35 }, {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: w, start: top ? 'top 95%' : 'top bottom', end: top ? 'top 35%' : 'bottom 45%', scrub: .6 },
      });
    });

    /* Faixa com foto: parallax e botão */
    gsap.fromTo('.band__bg', { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.band', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from('.band__play', { scale: 0, duration: 1, ease: 'back.out(1.7)', scrollTrigger: { trigger: '.band', start: 'top 65%' } });

    /* Contadores */
    $$('[data-count]').forEach(el => {
      const end = +el.dataset.count;
      const obj = { v: 0 };
      el.textContent = '0';
      gsap.to(obj, {
        v: end, duration: 2, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: () => (el.textContent = Math.round(obj.v).toLocaleString('pt-BR')),
      });
    });

    /* Fundo desfocado dos depoimentos */
    gsap.fromTo('.testimonials__bg', { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.testimonials', start: 'top bottom', end: 'bottom top', scrub: true } });

    /* Linhas do rodapé */
    $$('.footer__wave path').forEach((p, i) => {
      const len = p.getTotalLength();
      gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 2.4, delay: i * .3, ease: 'power2.inOut', scrollTrigger: { trigger: '.footer', start: 'top 85%' } });
    });
  });

  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set('[data-reveal], [data-hero], .gallery__item', { opacity: 1, clearProps: 'transform' });
    gsap.set('[data-split]', { visibility: 'visible' });
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
