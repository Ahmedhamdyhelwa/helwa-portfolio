// ============================================================
// Analytics — GA4 + Meta Pixel
// ------------------------------------------------------------
// Fill in the two IDs below. When either is left as an empty
// string ('') that tracker is silently skipped, so the site
// keeps working before you configure them.
//
// GA4 dashboard:    https://analytics.google.com
// Meta Pixel:       https://business.facebook.com → Events Manager
// ============================================================

const GA4_MEASUREMENT_ID = ''; // e.g. 'G-XXXXXXXXXX'
const META_PIXEL_ID      = ''; // e.g. '123456789012345'

// ---------- Google Analytics 4 ----------
(function loadGA4() {
  if (!GA4_MEASUREMENT_ID) return;

  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA4_MEASUREMENT_ID, { anonymize_ip: true });
})();

// ---------- Meta Pixel ----------
(function loadMetaPixel() {
  if (!META_PIXEL_ID) return;

  !function(f,b,e,v,n,t,s){
    if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', META_PIXEL_ID);
  fbq('track', 'PageView');
})();

// ---------- Custom conversion helpers ----------
// Call these from other scripts when meaningful actions happen.
window.trackLead = function trackLead(source) {
  // source examples: 'form', 'whatsapp-hero', 'whatsapp-fab'
  if (window.gtag)  gtag('event', 'generate_lead', { source });
  if (window.fbq)   fbq('track', 'Lead', { source });
};

window.trackContact = function trackContact(channel) {
  // channel examples: 'whatsapp', 'facebook', 'instagram'
  if (window.gtag)  gtag('event', 'contact', { channel });
  if (window.fbq)   fbq('trackCustom', 'Contact', { channel });
};

// Auto-track all WhatsApp link clicks
document.addEventListener('click', function (e) {
  const a = e.target.closest && e.target.closest('a[href*="wa.me/"]');
  if (a) window.trackContact('whatsapp');
});
