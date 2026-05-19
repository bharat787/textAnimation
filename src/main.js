// GSAP loaded from CDN in index.html
const { gsap } = window;

const CLIP_HIDDEN = "inset(0 100% 0 0)";
const CLIP_FULL = "inset(0 0% 0 0)";

function init() {
  const grid = document.querySelector(".grid");
  const intro = document.querySelector(".intro");
  const wordStroke = document.querySelector(".word--stroke");
  const wordFill = document.querySelector(".word--fill");
  const stage = document.querySelector(".stage");
  const hint = document.querySelector(".hint");

  if (!grid || !intro || !wordStroke || !wordFill || !stage) {
    console.error("Missing blueprint animation elements");
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function resetLayout() {
    stage.classList.add("stage--centering");
    intro.classList.remove("is-settled");
  }

  function settleLayout() {
    stage.classList.remove("stage--centering");
    intro.classList.add("is-settled");
  }

  function showFilledState() {
    gsap.set(wordStroke, { clipPath: CLIP_FULL, opacity: 1 });
    gsap.set(wordFill, { clipPath: CLIP_FULL });
  }

  function fadeInAtCorner() {
    const tl = gsap.timeline();

    tl.to(intro, { opacity: 0, duration: 0.45, ease: "power2.in" });

    tl.call(() => {
      settleLayout();
      showFilledState();
      gsap.set(intro, { opacity: 0 });
    });

    tl.to(intro, { opacity: 1, duration: 0.65, ease: "power2.out" });

    return tl;
  }

  function reset() {
    gsap.killTweensOf([grid, intro, wordStroke, wordFill]);
    resetLayout();
    gsap.set(grid, { opacity: 0, scale: 1.02 });
    gsap.set(intro, { opacity: 1 });
    gsap.set(wordStroke, { clipPath: CLIP_HIDDEN, opacity: 1 });
    gsap.set(wordFill, { clipPath: CLIP_HIDDEN });
    hint?.classList.remove("is-visible");
  }

  function showFinal() {
    gsap.set(grid, { opacity: 1, scale: 1 });
    showFilledState();
    settleLayout();
    gsap.set(intro, { opacity: 1 });
    hint?.classList.add("is-visible");
  }

  function playBlueprint() {
    reset();

    if (reducedMotion.matches) {
      showFinal();
      return null;
    }

    const tl = gsap.timeline({
      onComplete: () => hint?.classList.add("is-visible"),
    });

    tl.to(grid, { opacity: 1, scale: 1, duration: 1.1, ease: "power2.out" });

    // Step 1: stencil (left → right)
    tl.to(wordStroke, {
      clipPath: CLIP_FULL,
      duration: 1.15,
      ease: "power3.inOut",
    });

    tl.to({}, { duration: 0.25 });

    // Step 2: fill (left → right)
    tl.to(wordFill, {
      clipPath: CLIP_FULL,
      duration: 1.2,
      ease: "power4.inOut",
    });

    tl.to({}, { duration: 0.2 });

    // Steps 3–4: fade out center, fade in at bottom right (filled, smaller)
    tl.add(fadeInAtCorner());

    return tl;
  }

  playBlueprint();

  stage.addEventListener("click", playBlueprint);
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.code === "Enter") {
      e.preventDefault();
      playBlueprint();
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
