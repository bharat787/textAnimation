// GSAP loaded from CDN in index.html
const { gsap } = window;

const CLIP_HIDDEN = "inset(0 100% 0 0)";
const CLIP_FULL = "inset(0 0% 0 0)";

function init() {
  const grid = document.querySelector(".grid");
  const frameMarks = document.querySelector(".frame-marks");
  const wordStrokes = gsap.utils.toArray(".word--stroke");
  const wordFills = gsap.utils.toArray(".word--fill");
  const stage = document.querySelector(".stage");
  const hint = document.querySelector(".hint");

  if (!grid || !wordStrokes.length || !wordFills.length || !stage) {
    console.error("Missing blueprint animation elements");
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function reset() {
    gsap.killTweensOf([grid, frameMarks, ...wordStrokes, ...wordFills]);
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

    // 1 — Grid + registration marks
    tl.to(grid, { opacity: 1, scale: 1, duration: 1.1, ease: "power2.out" })
      .to(frameMarks, { opacity: 1, duration: 0.7 }, "<0.25");

    // 2 — Outlines draw left → right (English + Hindi together)
    tl.to(wordStrokes, {
      clipPath: CLIP_FULL,
      duration: 1.15,
      ease: "power3.inOut",
    });

    // 3 — Fill sweeps left → right on both words
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

    // 4 — Grid fades out
    tl.to(
      [grid, frameMarks],
      { opacity: 0, duration: 1.15, ease: "power2.inOut" },
      "-=0.3"
    );

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
