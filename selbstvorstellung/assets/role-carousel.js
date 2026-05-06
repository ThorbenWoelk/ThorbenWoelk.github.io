(() => {
  const wheels = document.querySelectorAll(".role-wheel");
  const startDelayMs = 900;
  const itemDurationMs = 1900;
  const wheelStates = [];

  for (const wheel of wheels) {
    const track = wheel.querySelector(".role-wheel__track");
    if (!track || track.dataset.loopReady === "true") continue;

    track.dataset.loopReady = "true";
    const originalItems = Array.from(track.children);
    if (!originalItems.length) continue;

    originalItems.forEach((item, index) => {
      item.dataset.roleIndex = String(index);
    });

    const itemHeight = originalItems[0].offsetHeight;
    const speed = itemHeight / itemDurationMs;
    let offset = 0;
    let lastFrame = 0;
    let startAt = 0;
    let rafId = 0;
    let playing = false;

    const setActive = () => {
      const items = Array.from(track.children);
      const wheelRect = wheel.getBoundingClientRect();
      const wheelCenter = wheelRect.top + wheelRect.height / 2;
      let nearest = null;
      let nearestDistance = Number.POSITIVE_INFINITY;

      for (const item of items) {
        const rect = item.getBoundingClientRect();
        const itemCenter = rect.top + rect.height / 2;
        const distance = Math.abs(itemCenter - wheelCenter);
        const focus = Math.max(0, 1 - distance / (itemHeight * 1.35));
        const eased = focus * focus * (3 - 2 * focus);
        const scale = 0.82 + eased * 0.18;
        const opacity = 0.2 + eased * 0.8;
        const indent = eased * 36;
        item.style.setProperty("--role-scale", scale.toFixed(4));
        item.style.setProperty("--role-opacity", opacity.toFixed(4));
        item.style.setProperty("--role-indent", `${indent.toFixed(2)}px`);
        item.style.setProperty("--role-focus", eased.toFixed(4));
        if (distance < nearestDistance) {
          nearest = item;
          nearestDistance = distance;
        }
      }

      items.forEach((item) => {
        item.classList.toggle("is-active", item === nearest);
      });
    };

    const reset = () => {
      window.cancelAnimationFrame(rafId);
      playing = false;
      track.replaceChildren(...originalItems);
      offset = 0;
      lastFrame = 0;
      track.style.transform = "translateY(0)";
      setActive();
    };

    const step = (now) => {
      if (!playing) return;

      if (now < startAt) {
        setActive();
        rafId = window.requestAnimationFrame(step);
        return;
      }

      if (!lastFrame) lastFrame = now;
      const delta = now - lastFrame;
      lastFrame = now;

      offset -= delta * speed;
      while (offset <= -itemHeight) {
        offset += itemHeight;
        track.appendChild(track.firstElementChild);
      }

      track.style.transform = `translateY(${offset}px)`;
      setActive();
      rafId = window.requestAnimationFrame(step);
    };

    const play = () => {
      reset();
      playing = true;
      startAt = performance.now() + startDelayMs;
      rafId = window.requestAnimationFrame(step);
    };

    const pause = () => {
      reset();
    };

    wheelStates.push({ wheel, play, pause });
    pause();
  }

  const syncToActiveSlide = () => {
    for (const state of wheelStates) {
      const slide = state.wheel.closest("section[data-label]");
      if (slide?.hasAttribute("data-deck-active")) state.play();
      else state.pause();
    }
  };

  document
    .querySelector("deck-stage")
    ?.addEventListener("slidechange", syncToActiveSlide);

  window.requestAnimationFrame(syncToActiveSlide);
})();
