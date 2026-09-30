/* Klaus Orioki — portfolio scripts */

document.getElementById("year").textContent = new Date().getFullYear();

/* Sticky navigation */
const nav = document.querySelector(".nav-wrap");

function updateNav() {
  nav.classList.toggle("scrolled", window.scrollY > 30);
}

window.addEventListener("scroll", updateNav, { passive: true });
updateNav();

/* Floating back-to-top: show after the hero, ring tracks scroll progress */
(() => {
  const btn = document.getElementById("toTop");
  const bar = document.getElementById("toTopBar");
  const hero = document.getElementById("home");
  const LEN = 2 * Math.PI * 22;
  bar.style.strokeDasharray = LEN;
  let ticking = false;

  function update() {
    ticking = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    const progress = max > 0 ? Math.min(scrollY / max, 1) : 0;
    bar.style.strokeDashoffset = LEN * (1 - progress);
    btn.classList.toggle("show", scrollY > hero.offsetHeight * 0.8);
  }

  addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  addEventListener("resize", update);

  btn.addEventListener("click", () => {
    const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
    const brand = document.querySelector(".brand");
    if (brand) brand.focus({ preventScroll: true });
  });

  update();
})();

/* Mobile navigation */
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

function setMenu(open) {
  navLinks.classList.toggle("open", open);
  menuBtn.classList.toggle("is-open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
}

menuBtn.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));

document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => setMenu(false));
});

/* Hero stats: count up from 0 when the page loads */
(() => {
  const counters = document.querySelectorAll(".hero-stats [data-count]");
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const DURATION = 1800;
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  counters.forEach(el => { el.textContent = "0"; });

  setTimeout(() => {
    const start = performance.now();
    function tick(now) {
      const t = Math.min((now - start) / DURATION, 1);
      counters.forEach(el => {
        el.textContent = Math.round(easeOut(t) * Number(el.dataset.count));
      });
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, 350); // start just after the hero fades in
})();

/* Scroll reveal */
const revealElements = document.querySelectorAll(
  ".fade-up, .reveal-on-scroll"
);

const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("reveal");
      obs.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: "0px 0px -50px 0px"
});

revealElements.forEach(el => observer.observe(el));

/*
  ============================================================
  FEATURED PROJECTS: filter tabs + "View more"
  ============================================================
  Shows PAGE_SIZE cards at first; "View more" reveals the next
  PAGE_SIZE. Once everything is visible it becomes "Show less".
*/
const PAGE_SIZE = 3;
const projectCards = [...document.querySelectorAll(".featured-card")];
const filterTabs = document.querySelectorAll(".filter-tab");
const viewMoreBtn = document.getElementById("viewMoreBtn");
const viewMoreLabel = viewMoreBtn.querySelector(".view-all-label");

let activeFilter = "websites"; // default tab
let activeIndustry = "all";
let visibleCount = PAGE_SIZE;

const industryBtn = document.getElementById("industryBtn");
const industryMenu = document.getElementById("industryMenu");
const industryOptions = industryMenu.querySelectorAll(".industry-option");
const industryCurrent = document.getElementById("industryCurrent");
const projectsEmpty = document.getElementById("projectsEmpty");

// Both filters combine: type tab AND industry dropdown
function matchingCards(filter, industry = activeIndustry) {
  return projectCards.filter(card =>
    (filter === "all" || card.dataset.category === filter) &&
    (industry === "all" || card.dataset.industry === industry)
  );
}

/* Counts on tabs and dropdown options reflect the other filter */
function updateCounts() {
  filterTabs.forEach(tab => {
    tab.querySelector(".filter-count").textContent =
      matchingCards(tab.dataset.filter).length;
  });
  industryOptions.forEach(opt => {
    opt.querySelector(".industry-count").textContent =
      matchingCards(activeFilter, opt.dataset.industry).length;
  });
}

/* Replays the card entrance animation with a short stagger */
function animateIn(card, index) {
  card.classList.remove("reveal");
  void card.offsetWidth; // restart transition
  card.style.transitionDelay = `${index * 90}ms`;
  requestAnimationFrame(() => card.classList.add("reveal"));
  // Clear the delay afterwards so hover effects stay instant
  setTimeout(() => { card.style.transitionDelay = ""; }, 900 + index * 90);
}

function renderProjects({ animateFrom = 0 } = {}) {
  const matches = matchingCards(activeFilter);
  const shown = matches.slice(0, visibleCount);

  updateCounts();
  projectsEmpty.hidden = matches.length > 0;
  document.querySelectorAll(".industry-tag").forEach(tag => {
    tag.classList.toggle("is-match", tag.dataset.setIndustry === activeIndustry);
  });

  projectCards.forEach(card => {
    card.classList.toggle("is-hidden", !shown.includes(card));
  });

  shown.forEach((card, i) => {
    // Renumber cards within the current view: 01, 02, 03…
    card.querySelector(".featured-number").textContent =
      String(i + 1).padStart(2, "0");
    if (i >= animateFrom) animateIn(card, i - animateFrom);
  });

  // Button: hidden if nothing extra to show, otherwise More / Less
  const hasMore = matches.length > visibleCount;
  viewMoreBtn.hidden = matches.length <= PAGE_SIZE;
  viewMoreLabel.textContent = hasMore ? "View more" : "Show less";
  viewMoreBtn.classList.toggle("expanded", !hasMore);
  viewMoreBtn.setAttribute("aria-expanded", String(!hasMore));
}

filterTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    if (tab.dataset.filter === activeFilter) return;
    filterTabs.forEach(t => {
      t.classList.toggle("active", t === tab);
      t.setAttribute("aria-selected", String(t === tab));
    });
    activeFilter = tab.dataset.filter;
    visibleCount = PAGE_SIZE;
    renderProjects();
  });
});

/* Industry dropdown */
function setIndustryMenu(open) {
  industryMenu.classList.toggle("open", open);
  industryBtn.setAttribute("aria-expanded", String(open));
  if (open) {
    const target = industryMenu.querySelector(".industry-option.active") || industryOptions[0];
    requestAnimationFrame(() => target.focus());
  }
}

function setIndustry(industry, { render = true } = {}) {
  activeIndustry = industry;
  industryOptions.forEach(opt => {
    const on = opt.dataset.industry === industry;
    opt.classList.toggle("active", on);
    opt.setAttribute("aria-selected", String(on));
  });
  const current = industryMenu.querySelector(`[data-industry="${industry}"]`);
  industryCurrent.textContent = industry === "all"
    ? "All"
    : current.firstChild.textContent.trim();
  industryBtn.classList.toggle("is-filtered", industry !== "all");
  visibleCount = PAGE_SIZE;
  if (render) renderProjects();
}

industryBtn.addEventListener("click", () => {
  setIndustryMenu(!industryMenu.classList.contains("open"));
});

industryOptions.forEach(opt => {
  opt.addEventListener("click", () => {
    setIndustry(opt.dataset.industry);
    setIndustryMenu(false);
    industryBtn.focus();
  });
});

// Arrow-key navigation inside the menu, Esc to close
industryMenu.addEventListener("keydown", e => {
  const list = [...industryOptions];
  const i = list.indexOf(document.activeElement);
  if (e.key === "ArrowDown") { e.preventDefault(); list[(i + 1) % list.length].focus(); }
  if (e.key === "ArrowUp")   { e.preventDefault(); list[(i - 1 + list.length) % list.length].focus(); }
});

document.addEventListener("click", e => {
  if (!e.target.closest("#industryFilter")) setIndustryMenu(false);
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape" && industryMenu.classList.contains("open")) {
    setIndustryMenu(false);
    industryBtn.focus();
  }
});

// Clicking a card's industry pill applies (or clears) that filter
document.querySelectorAll(".industry-tag").forEach(tag => {
  tag.addEventListener("click", () => {
    const ind = tag.dataset.setIndustry;
    setIndustry(activeIndustry === ind ? "all" : ind);
  });
});

// Projects without a live link yet: don't navigate anywhere
document.querySelectorAll('.featured-image-link[href="#"]').forEach(link => {
  link.addEventListener("click", e => e.preventDefault());
});

viewMoreBtn.addEventListener("click", () => {
  const total = matchingCards(activeFilter).length;

  if (visibleCount < total) {
    const previous = visibleCount;
    visibleCount += PAGE_SIZE;
    renderProjects({ animateFrom: previous });
  } else {
    visibleCount = PAGE_SIZE;
    renderProjects({ animateFrom: Infinity });
    document.getElementById("projects")
      .scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

// Initial state: hide extras without replaying animations
// (the scroll-reveal observer handles the first entrance).
renderProjects({ animateFrom: Infinity });

// Keep the original staggered first entrance, then clear the delay
// so hover lift isn't delayed.
projectCards.filter(c => !c.classList.contains("is-hidden"))
  .forEach((card, i) => {
    card.style.transitionDelay = `${i * 100}ms`;
    card.addEventListener("transitionend", function clear(e) {
      if (e.propertyName !== "opacity") return;
      card.style.transitionDelay = "";
      card.removeEventListener("transitionend", clear);
    });
  });

/* Active navigation section */
const sections = document.querySelectorAll("main section[id]");
const navAnchors = document.querySelectorAll(".nav-links a");

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => {
        a.classList.toggle(
          "active",
          a.getAttribute("href") === `#${entry.target.id}`
        );
      });
    }
  });
}, {
  rootMargin: "-35% 0px -55% 0px"
});

sections.forEach(section => sectionObserver.observe(section));

/*
  ============================================================
  SERVICE POP-UPS
  ============================================================
*/
const serviceModal = document.getElementById("serviceModal");
const serviceContent = document.getElementById("serviceModalContent");
let lastServiceCard = null;

function openService(card) {
  const tpl = document.getElementById(`service-${card.dataset.service}`);
  if (!tpl) return;
  lastServiceCard = card;
  serviceModal.querySelector(".modal-icon use").setAttribute("href", `#i-${tpl.dataset.icon}`);
  document.getElementById("serviceModalTitle").textContent = tpl.dataset.title;
  document.getElementById("serviceModalKicker").textContent = tpl.dataset.kicker || "Service";
  serviceContent.replaceChildren(tpl.content.cloneNode(true));
  serviceModal.querySelector(".modal-inner").scrollTop = 0;
  document.body.style.overflow = "hidden";
  serviceModal.showModal();
}

function closeService() {
  if (serviceModal.open) serviceModal.close();
}

serviceModal.addEventListener("close", () => {
  document.body.style.overflow = "";
  if (lastServiceCard) lastServiceCard.focus({ preventScroll: true });
});

document.querySelectorAll(".service-card[data-service]").forEach(card => {
  card.addEventListener("click", () => openService(card));
  card.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openService(card);
    }
  });
});

document.querySelector(".about-more").addEventListener("click", e => openService(e.currentTarget));

document.getElementById("serviceModalClose").addEventListener("click", closeService);

// Click on the dimmed backdrop closes the pop-up
serviceModal.addEventListener("click", e => {
  if (e.target === serviceModal) closeService();
});

// "See ... projects" buttons: close, switch the portfolio tab, scroll there
serviceModal.addEventListener("click", e => {
  const btn = e.target.closest("[data-goto-filter]");
  if (!btn) return;
  const filter = btn.dataset.gotoFilter;
  lastServiceCard = null;
  closeService();
  const tab = document.querySelector(`.filter-tab[data-filter="${filter}"]`);
  setIndustry("all", { render: false });
  if (tab && !tab.classList.contains("active")) tab.click();
  else renderProjects();
  document.getElementById("projects").scrollIntoView({ behavior: "smooth", block: "start" });
});

/*
  ============================================================
  WEB APP VIDEO DEMOS
  ============================================================
  The player only loads when a demo is opened, keeping the page fast.
*/
const videoModal = document.getElementById("videoModal");
const videoFrame = document.getElementById("videoFrame");
let lastVideoLink = null;

function openVideo(link) {
  const id = link.dataset.video;
  const title = link.closest(".featured-card").querySelector("h3").textContent;
  lastVideoLink = link;
  document.getElementById("videoModalTitle").textContent = title;
  document.getElementById("videoYtLink").href = `https://www.youtube.com/watch?v=${id}`;
  videoFrame.innerHTML =
    `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1"
             title="${title} demo video"
             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
             allowfullscreen></iframe>`;
  document.body.style.overflow = "hidden";
  videoModal.showModal();
}

document.querySelectorAll(".video-link").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    openVideo(link);
  });
});

document.getElementById("videoModalClose").addEventListener("click", () => videoModal.close());
videoModal.addEventListener("click", e => { if (e.target === videoModal) videoModal.close(); });

// Closing removes the player so the video stops
videoModal.addEventListener("close", () => {
  videoFrame.innerHTML = "";
  document.body.style.overflow = "";
  if (lastVideoLink) lastVideoLink.focus({ preventScroll: true });
});

/*
  ============================================================
  HERO PARTICLES
  ============================================================
  Drifting nodes that link up when close and reach gently toward
  the cursor. Pauses when the hero is off-screen or the tab is
  hidden; draws a single still frame for reduced-motion users.
  Tweak the numbers in PARTICLES to adjust the look.
*/
(() => {
  const PARTICLES = {
    density: 15000,     // one node per this many px² (higher = fewer)
    maxNodes: 90,
    maxNodesMobile: 38,
    speed: 0.22,
    linkDistance: 130,
    cursorDistance: 170,
    color: "15,124,118" // RGB of the teal accent
  };

  const hero = document.getElementById("home");
  const canvas = document.getElementById("heroParticles");
  if (!hero || !canvas || !canvas.getContext) return;

  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const rand = (a, b) => a + Math.random() * (b - a);

  let W = 0, H = 0, nodes = [], mouse = null, rafId = null, visible = true;

  function setup() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = hero.offsetWidth;
    H = hero.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cap = W < 768 ? PARTICLES.maxNodesMobile : PARTICLES.maxNodes;
    const count = Math.min(cap, Math.round((W * H) / PARTICLES.density));
    nodes = Array.from({ length: count }, () => ({
      x: rand(0, W),
      y: rand(0, H),
      vx: rand(-PARTICLES.speed, PARTICLES.speed),
      vy: rand(-PARTICLES.speed, PARTICLES.speed),
      r: rand(1.2, 2.4)
    }));
  }

  function draw() {
    const { linkDistance: LINK, cursorDistance: CUR, color } = PARTICLES;
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1;

    for (const n of nodes) {
      if (!reduce) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }
    }

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];

      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK) {
          ctx.strokeStyle = `rgba(${color},${(1 - d / LINK) * 0.28})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      if (mouse) {
        const d = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (d < CUR) {
          ctx.strokeStyle = `rgba(33,190,175,${(1 - d / CUR) * 0.5})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      ctx.fillStyle = `rgba(${color},.45)`;
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop() {
    rafId = null;
    if (!visible || document.hidden) return;
    draw();
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (reduce) { draw(); return; }
    if (!rafId && visible && !document.hidden) rafId = requestAnimationFrame(loop);
  }

  if (finePointer && !reduce) {
    hero.addEventListener("pointermove", e => {
      const r = hero.getBoundingClientRect();
      mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
    });
    hero.addEventListener("pointerleave", () => { mouse = null; });
  }

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    start();
  }).observe(hero);

  document.addEventListener("visibilitychange", start);

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // ignore mobile address-bar height changes; rebuild only on real resizes
      if (hero.offsetWidth === W && Math.abs(hero.offsetHeight - H) < 120) return;
      setup();
      if (reduce) draw();
    }, 200);
  });

  setup();
  start();
})();

/*
  Contact form (FormSubmit)
  - After sending, FormSubmit redirects back here with ?sent=1,
    which shows the thank-you message.
  - When opened as a local file, _next is left empty and FormSubmit
    shows its own thank-you page instead.
*/
(() => {
  const form = document.getElementById("contactForm");
  const next = document.getElementById("formNext");
  const success = document.getElementById("formSuccess");
  const button = document.getElementById("formSubmit");

  if (location.protocol.startsWith("http")) {
    next.value = location.origin + location.pathname + "?sent=1#contact";
  } else {
    next.remove();
  }

  form.addEventListener("submit", () => {
    button.disabled = true;
    button.querySelector(".btn-label").textContent = "Sending…";
  });

  // Re-enable if the visitor comes back with the browser's Back button
  window.addEventListener("pageshow", () => {
    button.disabled = false;
    button.querySelector(".btn-label").textContent = "Send Message";
  });

  if (new URLSearchParams(location.search).get("sent") === "1") {
    success.hidden = false;
    history.replaceState(null, "", location.pathname + "#contact");
  }
})();
