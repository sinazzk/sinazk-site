(function () {
  'use strict';

  if (location.hostname !== 'sinazk.com' && location.hostname !== 'www.sinazk.com') return;

  window.clarity = window.clarity || function () {
    (window.clarity.q = window.clarity.q || []).push(arguments);
  };
  window.clarity('consentv2', {
    ad_Storage: 'denied',
    analytics_Storage: 'denied',
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.clarity.ms/tag/zk6xui1x5k';
  document.head.appendChild(script);
})();
