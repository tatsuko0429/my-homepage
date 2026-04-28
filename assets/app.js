const data = window.siteData;

const deck = document.getElementById("page-deck");
const mobileProgress = document.getElementById("mobile-progress");
const loadingScreen = document.getElementById("loading-screen");
const loadingDialogue = document.getElementById("loading-dialogue");
const mobileMedia = window.matchMedia("(max-width: 960px)");
const reducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");

const loadingText = "、、、ホームページって 一般人の癖に、イキりすぎやろ！笑";
const loadingDuration = 5000;

const panels = {
  hero: document.getElementById("hero-panel"),
  profile: document.getElementById("profile-panel"),
  work: document.getElementById("work-panel"),
  contact: document.getElementById("contact-panel")
};

initializePage();

function initializePage() {
  applyMeta();
  renderHero();
  renderProfile();
  renderWork();
  renderContact();
  setupPanelMeta();
  initReveal();
  initWorkTabs();
  initMobileProgress();
  initMobileDeckMotion();
  initHapticFeedback();
  initTapSparks();
  startLoadingSequence();
}

function shouldUseMobileDeck() {
  return mobileMedia.matches || window.matchMedia("(pointer: coarse)").matches;
}

function applyMeta() {
  document.title = data.meta.title;

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute("content", data.meta.description);
  }
}

function setupPanelMeta() {
  Object.values(panels).forEach((panel, index) => {
    panel.style.setProperty("--panel-order", index);
    panel.querySelectorAll("[data-seq]").forEach((item) => {
      item.style.setProperty("--seq", item.dataset.seq);
    });
  });
}

function renderHero() {
  panels.hero.dataset.navLabel = data.hero.navLabel;
  panels.hero.innerHTML = `
    <div class="panel-inner hero-shell">
      ${renderSectionMark(1, 0)}
      <p class="section-label panel-fragment" data-seq="1">${data.hero.label}</p>
      <div class="hero-title-block panel-fragment" data-seq="2">
        <h1 class="hero-title">${data.hero.namePrimary}</h1>
        <p class="hero-title-sub">${data.hero.nameSecondary}</p>
      </div>
      ${data.hero.roles.length ? `
        <div class="role-row panel-fragment" data-seq="3">
          ${data.hero.roles.map((role) => `<span class="role-pill">${role}</span>`).join("")}
        </div>
      ` : ""}
      <dl class="fact-grid panel-fragment" data-seq="4">
        ${data.hero.facts.map((fact) => `
          <div class="fact-card">
            <dt>${fact.label}</dt>
            <dd>${fact.value}</dd>
          </div>
        `).join("")}
      </dl>
      ${renderDecorationSlot("hero", 5)}
      <p class="panel-credit panel-fragment" data-seq="6">${data.footer.credit}</p>
    </div>
  `;
}

function renderProfile() {
  panels.profile.id = "about";
  panels.profile.dataset.navLabel = data.profile.navLabel;
  panels.profile.innerHTML = `
    <div class="panel-inner">
      ${renderSectionHeader(data.profile.label, data.profile.title, "", 0, 2)}
      <div class="profile-layout">
        <figure class="portrait-stage panel-fragment" data-seq="4" data-burst="strong">
          <img class="portrait-image" src="${data.profile.image.src}" alt="${data.profile.image.alt}">
        </figure>
        <div class="profile-copy">
          ${data.profile.text.map((text, index) => `<p class="panel-fragment" data-seq="${index + 5}">${text}</p>`).join("")}
        </div>
      </div>
      ${renderDecorationSlot("profile", 8)}
    </div>
  `;
}

function startLoadingSequence() {
  if (reducedMotionMedia.matches) {
    loadingDialogue.textContent = loadingText;
    finishLoading();
    return;
  }

  loadingDialogue.textContent = "";

  const typeStart = 350;
  const typeDuration = 1700;
  const interval = typeDuration / loadingText.length;
  let index = 0;
  let timer = null;

  window.setTimeout(() => {
    timer = window.setInterval(() => {
      index += 1;
      loadingDialogue.textContent = loadingText.slice(0, index);

      if (index >= loadingText.length) {
        window.clearInterval(timer);
      }
    }, interval);
  }, typeStart);

  window.setTimeout(() => {
    if (timer) {
      window.clearInterval(timer);
    }
    loadingDialogue.textContent = loadingText;
    finishLoading();
  }, loadingDuration);
}

function finishLoading() {
  if (shouldUseMobileDeck()) {
    Object.values(panels).forEach((panel) => panel.classList.add("is-visible"));
  }

  document.body.classList.add("is-ready");
  document.body.classList.remove("is-loading");
  loadingScreen.classList.add("is-hidden");

  window.setTimeout(() => {
    loadingScreen.remove();
  }, 520);
}

function renderWork() {
  const current = data.work.tabs[0];
  const switcherMarkup = data.work.tabs.length > 1
    ? `
      <div class="switcher-row panel-fragment" data-seq="4" role="tablist" aria-label="できることの切り替え">
        ${data.work.tabs.map((tab, index) => `
          <button
            class="switcher-button${index === 0 ? " is-active" : ""}"
            type="button"
            role="tab"
            aria-selected="${index === 0 ? "true" : "false"}"
            data-work-id="${tab.id}"
            data-burst="strong"
          >
            ${tab.label}
          </button>
        `).join("")}
      </div>
    `
    : "";

  panels.work.dataset.navLabel = data.work.navLabel;
  panels.work.innerHTML = `
    <div class="panel-inner">
      ${renderSectionHeader(data.work.label, data.work.title, data.work.description, 0, 3)}
      ${switcherMarkup}
      <div class="detail-card panel-fragment" data-seq="5" id="work-detail">
        ${renderWorkTab(current)}
      </div>
      ${renderDecorationSlot("work", 6)}
    </div>
  `;
}

function renderContact() {
  panels.contact.id = "contact";
  panels.contact.dataset.navLabel = data.contact.navLabel;
  panels.contact.innerHTML = `
    <div class="panel-inner">
      ${renderSectionHeader(data.contact.label, data.contact.title, data.contact.description, 0, 4)}
      <div class="contact-grid">
        <article class="contact-card contact-card-static">
          <p class="mini-label">リンク一覧</p>
          <div class="social-list">
            ${data.contact.socialLinks.map((link) => `
              <a class="social-link" href="${link.href}" target="_blank" rel="noreferrer noopener" data-burst="strong">
                <span>${link.label}</span>
                <span class="social-arrow">↗</span>
              </a>
            `).join("")}
          </div>
        </article>
      </div>
      ${renderDecorationSlot("contact", 5)}
    </div>
  `;

  panels.contact.classList.add("is-visible");
}

function renderSectionHeader(label, title, description, seqStart, markCount) {
  const labelMarkup = label
    ? `<p class="section-label panel-fragment" data-seq="${seqStart + 1}">${label}</p>`
    : "";
  const descriptionMarkup = description
    ? `<p class="section-description panel-fragment" data-seq="${seqStart + 3}">${description}</p>`
    : "";

  return `
    <div class="section-head">
      ${renderSectionMark(markCount || 1, seqStart)}
      ${labelMarkup}
      <h2 class="section-title panel-fragment" data-seq="${seqStart + 2}">${title}</h2>
      ${descriptionMarkup}
    </div>
  `;
}

function renderSectionMark(count, seq) {
  return `
    <div class="section-mark panel-fragment" data-seq="${seq}" aria-hidden="true">
      ${Array.from({ length: count }, () => '<span class="section-dot"></span>').join("")}
    </div>
  `;
}

function renderDecorationSlot(slotKey, seq) {
  const items = data.decorations && data.decorations[slotKey] ? data.decorations[slotKey] : [];

  if (!items.length) {
    return "";
  }

  return `
    <div class="ornament-row panel-fragment" data-seq="${seq}">
      ${items.map((item) => `
        <figure class="ornament-card">
          <img src="${item.src}" alt="${item.alt}">
          ${item.caption ? `<figcaption>${item.caption}</figcaption>` : ""}
        </figure>
      `).join("")}
    </div>
  `;
}

function renderActions(actions) {
  return actions.map((action) => {
    if (action.soon || !action.href) {
      return `
        <button class="cta-button is-${action.variant} is-disabled" type="button" disabled aria-disabled="true">
          <span>${action.label}</span>
        </button>
      `;
    }

    const isExternal = !action.href.startsWith("mailto:");
    const attributes = isExternal ? 'target="_blank" rel="noreferrer noopener"' : "";

    return `
      <a class="cta-button is-${action.variant}" href="${action.href}" ${attributes} data-burst="strong">
        <span>${action.label}</span>
      </a>
    `;
  }).join("");
}

function renderWorkTab(tab) {
  return `
    <div class="detail-stack">
      ${tab.items.map((item) => `
        <article class="detail-item">
          <div class="detail-top">
            <p class="detail-title">${item.title}</p>
            ${item.state ? `<span class="state-pill">${item.state}</span>` : ""}
          </div>
          ${item.meta ? `<p class="detail-meta">${item.meta}</p>` : ""}
          <p class="detail-text">${item.text}</p>
          ${item.sampleLink ? `
            <a
              class="detail-link"
              href="${item.sampleLink.href}"
              target="_blank"
              rel="noreferrer noopener"
              data-burst="strong"
            >
              <span>${item.sampleLink.label}</span>
              <span aria-hidden="true">↗</span>
            </a>
          ` : ""}
        </article>
      `).join("")}
    </div>
    ${tab.actions ? `<div class="cta-row detail-actions">${renderActions(tab.actions)}</div>` : ""}
  `;
}

function initWorkTabs() {
  const buttons = Array.from(document.querySelectorAll("[data-work-id]"));
  const detail = document.getElementById("work-detail");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const current = data.work.tabs.find((item) => item.id === button.dataset.workId);
      if (!current) {
        return;
      }

      buttons.forEach((item) => {
        item.classList.remove("is-active");
        item.setAttribute("aria-selected", "false");
      });

      button.classList.add("is-active");
      button.setAttribute("aria-selected", "true");

      detail.innerHTML = renderWorkTab(current);
    });
  });
}

function initReveal() {
  const items = Array.from(document.querySelectorAll(".reveal"));

  if (reducedMotionMedia.matches || shouldUseMobileDeck()) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      currentObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0.24
  });

  items.forEach((item) => observer.observe(item));
}

function initMobileProgress() {
  const slidePanels = Object.values(panels);
  const markup = slidePanels.map((panel, index) => `
    <button
      class="progress-dot${index === 0 ? " is-active" : ""}"
      type="button"
      data-panel-index="${index}"
      aria-label="${panel.dataset.navLabel}へ移動"
    ></button>
  `).join("");

  mobileProgress.innerHTML = `
    <div class="progress-shell">
      <span class="progress-label" id="progress-label">${slidePanels[0].dataset.navLabel}</span>
      <div class="progress-dots">${markup}</div>
    </div>
  `;

  const dots = Array.from(mobileProgress.querySelectorAll(".progress-dot"));
  const label = document.getElementById("progress-label");

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const panel = slidePanels[Number(dot.dataset.panelIndex)];
      if (!panel) {
        return;
      }

      scrollPanelIntoView(panel);
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const index = slidePanels.indexOf(entry.target);
      if (index === -1) {
        return;
      }

      dots.forEach((dot) => dot.classList.remove("is-active"));
      dots[index].classList.add("is-active");
      label.textContent = entry.target.dataset.navLabel;
      entry.target.classList.add("is-visible");
    });
  }, {
    root: shouldUseMobileDeck() ? deck : null,
    threshold: 0.55
  });

  slidePanels.forEach((panel) => observer.observe(panel));
}

function initTapSparks() {
  if (reducedMotionMedia.matches) {
    return;
  }

  const sparkLayer = document.getElementById("spark-layer");
  const pointerState = {
    active: false,
    x: 0,
    y: 0,
    time: 0
  };

  document.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    pointerState.active = true;
    pointerState.x = event.clientX;
    pointerState.y = event.clientY;
    pointerState.time = performance.now();
  }, { passive: true });

  document.addEventListener("pointercancel", () => {
    pointerState.active = false;
  }, { passive: true });

  document.addEventListener("pointerup", (event) => {
    if (!pointerState.active) {
      return;
    }

    const deltaX = event.clientX - pointerState.x;
    const deltaY = event.clientY - pointerState.y;
    const distance = Math.hypot(deltaX, deltaY);
    const duration = performance.now() - pointerState.time;

    pointerState.active = false;

    if (distance > 14 || duration > 550) {
      return;
    }

    const burstTarget = event.target.closest("[data-burst]");
    const burstType = burstTarget ? burstTarget.dataset.burst : "soft";
    const particleCount = burstType === "strong" ? 12 : 7;

    createSparkBurst(sparkLayer, event.clientX, event.clientY, particleCount);
  }, { passive: true });
}

function initHapticFeedback() {
  if (!("vibrate" in navigator) || typeof navigator.vibrate !== "function") {
    return;
  }

  const pointerState = {
    active: false,
    x: 0,
    y: 0,
    time: 0
  };

  document.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse") {
      return;
    }

    pointerState.active = true;
    pointerState.x = event.clientX;
    pointerState.y = event.clientY;
    pointerState.time = performance.now();
  }, { passive: true });

  document.addEventListener("pointercancel", () => {
    pointerState.active = false;
  }, { passive: true });

  document.addEventListener("pointerup", (event) => {
    if (!pointerState.active) {
      return;
    }

    const deltaX = event.clientX - pointerState.x;
    const deltaY = event.clientY - pointerState.y;
    const distance = Math.hypot(deltaX, deltaY);
    const duration = performance.now() - pointerState.time;

    pointerState.active = false;

    if (distance > 12 || duration > 520) {
      return;
    }

    const target = event.target.closest("a, button, [role='button'], [data-haptic]");
    if (!target || target.disabled || target.getAttribute("aria-disabled") === "true") {
      return;
    }

    const strength = target.dataset.haptic || (target.dataset.burst === "strong" ? "strong" : "light");
    triggerHapticFeedback(strength);
  }, { passive: true });
}

function triggerHapticFeedback(strength) {
  const pattern = strength === "strong" ? 18 : 10;

  try {
    navigator.vibrate(pattern);
  } catch (error) {
    // Unsupported browsers should silently fall back to visual feedback only.
  }
}

function createSparkBurst(layer, x, y, particleCount) {
  const cluster = document.createElement("div");
  cluster.className = "spark-cluster";
  cluster.style.left = `${x}px`;
  cluster.style.top = `${y}px`;

  const core = document.createElement("span");
  core.className = "spark-core";
  cluster.appendChild(core);

  for (let index = 0; index < particleCount; index += 1) {
    const particle = document.createElement("span");
    const angle = (Math.PI * 2 * index) / particleCount + randomBetween(-0.25, 0.25);
    const distance = randomBetween(18, 46);
    const offsetX = Math.cos(angle) * distance;
    const offsetY = Math.sin(angle) * distance;
    const size = randomBetween(4, 9);
    const rotation = randomBetween(-18, 18);

    particle.className = "spark";
    particle.style.setProperty("--dx", `${offsetX}px`);
    particle.style.setProperty("--dy", `${offsetY}px`);
    particle.style.setProperty("--size", `${size}px`);
    particle.style.setProperty("--rotation", `${rotation}deg`);
    particle.style.animationDelay = `${index * 14}ms`;
    cluster.appendChild(particle);
  }

  layer.appendChild(cluster);

  window.setTimeout(() => {
    cluster.remove();
  }, 720);
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function scrollPanelIntoView(panel) {
  if (!shouldUseMobileDeck()) {
    panel.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start"
    });
    return;
  }

  const offset = Math.max((deck.clientWidth - panel.clientWidth) / 2, 0);
  const left = Math.max(panel.offsetLeft - offset, 0);
  panel.classList.add("is-visible");

  deck.scrollTo({
    left,
    behavior: "smooth"
  });
}

function initMobileDeckMotion() {
  if (reducedMotionMedia.matches) {
    return;
  }

  const slidePanels = Object.values(panels);
  let frameId = 0;
  let releaseTimer = 0;

  function resetDeckMotion() {
    slidePanels.forEach((panel) => {
      panel.classList.remove("is-current");
      panel.style.removeProperty("--swipe-shift-x");
      panel.style.removeProperty("--swipe-shift-y");
      panel.style.removeProperty("--swipe-rotate");
      panel.style.removeProperty("--swipe-scale");
      panel.style.removeProperty("--swipe-opacity");
    });

    deck.classList.remove("is-dragging");
  }

  function updateDeckMotion() {
    if (!shouldUseMobileDeck()) {
      resetDeckMotion();
      return;
    }

    const deckRect = deck.getBoundingClientRect();
    const viewportCenter = deckRect.left + (deckRect.width / 2);
    let currentPanel = null;
    let currentDistance = Number.POSITIVE_INFINITY;

    slidePanels.forEach((panel) => {
      const rect = panel.getBoundingClientRect();
      const width = rect.width || 1;
      const delta = ((rect.left + (rect.width / 2)) - viewportCenter) / width;
      const limited = Math.max(-1.15, Math.min(1.15, delta));
      const distance = Math.min(Math.abs(limited), 1);
      const shiftX = limited * 18;
      const shiftY = distance * 18;
      const rotate = limited * 6;
      const scale = 1 - (distance * 0.08);
      const opacity = 1 - (distance * 0.2);

      panel.style.setProperty("--swipe-shift-x", `${shiftX.toFixed(2)}px`);
      panel.style.setProperty("--swipe-shift-y", `${shiftY.toFixed(2)}px`);
      panel.style.setProperty("--swipe-rotate", `${rotate.toFixed(2)}deg`);
      panel.style.setProperty("--swipe-scale", scale.toFixed(3));
      panel.style.setProperty("--swipe-opacity", opacity.toFixed(3));

      if (distance < currentDistance) {
        currentDistance = distance;
        currentPanel = panel;
      }
    });

    slidePanels.forEach((panel) => {
      panel.classList.toggle("is-current", panel === currentPanel);
    });

    if (currentPanel) {
      currentPanel.classList.add("is-visible");
    }
  }

  function scheduleUpdate() {
    if (frameId) {
      return;
    }

    frameId = window.requestAnimationFrame(() => {
      frameId = 0;
      updateDeckMotion();
    });
  }

  function beginDrag() {
    if (!shouldUseMobileDeck()) {
      return;
    }

    window.clearTimeout(releaseTimer);
    deck.classList.add("is-dragging");
    scheduleUpdate();
  }

  function endDrag() {
    window.clearTimeout(releaseTimer);
    releaseTimer = window.setTimeout(() => {
      deck.classList.remove("is-dragging");
      scheduleUpdate();
    }, 140);
  }

  deck.addEventListener("scroll", scheduleUpdate, { passive: true });
  deck.addEventListener("pointerdown", beginDrag, { passive: true });
  document.addEventListener("pointerup", endDrag, { passive: true });
  document.addEventListener("pointercancel", endDrag, { passive: true });
  window.addEventListener("resize", scheduleUpdate, { passive: true });

  if (typeof mobileMedia.addEventListener === "function") {
    mobileMedia.addEventListener("change", scheduleUpdate);
  }

  scheduleUpdate();
}
