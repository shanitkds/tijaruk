export function createScrollTriggerRefresh(ScrollTrigger, root) {
  if (typeof window === "undefined") {
    return () => {};
  }

  let frameId = null;

  const scheduleRefresh = () => {
    if (frameId !== null) {
      window.cancelAnimationFrame(frameId);
    }

    frameId = window.requestAnimationFrame(() => {
      frameId = null;
      ScrollTrigger.refresh();
    });
  };

  const images = root ? Array.from(root.querySelectorAll("img")) : [];

  images.forEach((image) => {
    if (image.complete) {
      return;
    }

    image.addEventListener("load", scheduleRefresh, { once: true });
    image.addEventListener("error", scheduleRefresh, { once: true });
  });

  window.addEventListener("load", scheduleRefresh, { once: true });
  scheduleRefresh();

  return () => {
    if (frameId !== null) {
      window.cancelAnimationFrame(frameId);
    }

    window.removeEventListener("load", scheduleRefresh);

    images.forEach((image) => {
      image.removeEventListener("load", scheduleRefresh);
      image.removeEventListener("error", scheduleRefresh);
    });
  };
}
