// Dev-only accessibility fixes for Vite's error overlay
// Marks the overlay inert/aria-hidden so dev-only UI doesn't trigger Axe violations.

function hideOverlay(overlay: Element) {
  try {
    overlay.setAttribute('aria-hidden', 'true');
    // If the browser supports inert, use it to make the subtree non-interactive
    // @ts-ignore
    if ('inert' in HTMLElement.prototype) {
      // @ts-ignore
      (overlay as HTMLElement).inert = true;
    } else {
      // Fallback: remove tabindex from any focusable descendants
      const els = overlay.querySelectorAll('[tabindex], a, button, input, textarea, select');
      els.forEach((el) => {
        try { (el as HTMLElement).removeAttribute('tabindex'); } catch (e) {}
      });
    }
  } catch (e) {
    // swallow errors in dev-only helper
    // eslint-disable-next-line no-console
    console.debug('dev-overlay-a11y: failed to hide overlay', e);
  }
}

function observeOverlay() {
  const process = () => {
    const overlay = document.querySelector('vite-error-overlay');
    if (overlay) {
      hideOverlay(overlay);
    }
  };

  // Run once immediately
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    process();
  } else {
    window.addEventListener('DOMContentLoaded', process, { once: true });
  }

  // Observe DOM so overlay created later is handled
  const mo = new MutationObserver(() => process());
  mo.observe(document.documentElement || document.body, { childList: true, subtree: true });

  // Keep a periodic check as a last resort
  const id = setInterval(process, 1000);
  // Stop interval after 30s
  setTimeout(() => clearInterval(id), 30_000);
}

// Initialize immediately on import
observeOverlay();

export {};
