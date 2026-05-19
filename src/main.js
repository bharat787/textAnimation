// GSAP loaded from CDN in index.html
const { gsap } = window;

const CLIP_HIDDEN = "inset(0 100% 0 0)";
const CLIP_FULL = "inset(0 0% 0 0)";

function init() {
  const grid = document.querySelector(".grid");
  const frameMarks = document.querySelector(".frame-marks");
  const labels = document.querySelector(".labels");
  const helloEn = document.querySelector(".hello--en");
  const helloHi = document.querySelector(".hello--hi");
  const hellos = [helloEn, helloHi].filter(Boolean);
  const wordStrokes = gsap.utils.toArray(".word--stroke");
  const wordFills = gsap.utils.toArray(".word--fill");
  const stage = document.querySelector(".stage");
  const hint = document.querySelector(".hint");

  if (!grid || !labels || !hellos.length || !wordStrokes.length || !stage) {
    console.error("Missing blueprint animation elements");
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function resetLayout() {
    labels.classList.remove("is-settled");
    gsap.set(hellos, { clearProps: "transform" });
  }

  function settleLayout() {
    labels.classList.add("is-settled");
    gsap.set(hellos, { clearProps: "transform" });
  }

  function glideToCorners() {
    const starts = hellos.map((el) => el.getBoundingClientRect());

    labels.classList.add("is-settled");
    const ends = hellos.map((el) => el.getBoundingClientRect());
    labels.classList.remove("is-settled");

    hellos.forEach((el, i) => {
      gsap.set(el, {
        x: starts[i].left - ends[i].left,
        y: starts[i].top - ends[i].top,
      });
    });

    labels.classList.add("is-settled");

    return gsap.to(hellos, {
      x: 0,
      y: 0,
      duration: 1.35,
      ease: "power3.inOut",
    });
  }

  function reset() {
    gsap.killTweensOf([grid, frameMarks, labels, ...hellos, ...wordStrokes, ...wordFills]);
    resetLayout();
    gsap.set(grid, { opacity: 0, scale: 1.02 });
    gsap.set(frameMarks, { opacity: 0 });
    gsap.set(wordStrokes, { clipPath: CLIP_HIDDEN, opacity: 1 });
    gsap.set(wordFills, { clipPath: CLIP_HIDDEN });
    hint?.classList.remove("is-visible");
  }

  function showFinal() {
    gsap.set(grid, { opacity: 0 });
    gsap.set(frameMarks, { opacity: 0 });
    gsap.set(wordStrokes, { opacity: 0, clipPath: CLIP_FULL });
    gsap.set(wordFills, { clipPath: CLIP_FULL });
    settleLayout();
    hint?.classList.add("is-visible");
  }

  function playBlueprint() {
    reset();

    if (reducedMotion.matches) {
      showFinal();
      return null;
    }

    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: () => hint?.classList.add("is-visible"),
    });

    tl.to(grid, { opacity: 1, scale: 1, duration: 1.1, ease: "power2.out" })
      .to(frameMarks, { opacity: 1, duration: 0.7 }, "<0.25");

    tl.to(wordStrokes, {
      clipPath: CLIP_FULL,
      duration: 1.15,
      ease: "power3.inOut",
    });

    tl.to(
      wordFills,
      {
        clipPath: CLIP_FULL,
        duration: 1.2,
        ease: "power4.inOut",
      },
      "-=0.35"
    );

    tl.to(wordStrokes, { opacity: 0, duration: 0.45 }, "-=0.55");

    tl.to([grid, frameMarks], { opacity: 0, duration: 1.15, ease: "power2.inOut" }, "-=0.3");

    tl.add(glideToCorners(), "+=0.15");

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
