(function () {
  'use strict';

  if (location.hostname !== 'sinazk.com' && location.hostname !== 'www.sinazk.com') return;

  const preference = document.querySelector('[data-analytics-preference]');
  const button = preference.querySelector('button');
  const storageKey = 'portfolio-analytics-consent';
  let enabled = false;

  try {
    enabled = localStorage.getItem(storageKey) === 'granted';
  } catch {
    // The visitor can still enable analytics for the current page.
  }

  function sendConsent(value) {
    window.clarity('consentv2', {
      ad_Storage: 'denied',
      analytics_Storage: value,
    });
  }

  function startClarity() {
    window.clarity = window.clarity || function () {
      (window.clarity.q = window.clarity.q || []).push(arguments);
    };
    sendConsent('granted');

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.clarity.ms/tag/zk6xui1x5k';
    document.head.appendChild(script);
  }

  function updateButton() {
    button.textContent = enabled ? 'Turn off analytics' : 'Allow analytics';
  }

  button.addEventListener('click', function () {
    enabled = !enabled;
    try {
      if (enabled) {
        localStorage.setItem(storageKey, 'granted');
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch {
      // Storage may be blocked by the browser.
    }

    if (enabled) {
      startClarity();
      updateButton();
    } else {
      sendConsent('denied');
      location.reload();
    }
  });

  updateButton();
  preference.hidden = false;
  if (enabled) startClarity();
})();
