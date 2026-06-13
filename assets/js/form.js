// Lead form → Google Sheets (via Google Apps Script Web App)
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyQ03t0eJeAE5npUYhMkqGOU4LTTEFTYBmD-ph6s2Cs_JJxD8LnRDqAlx93fMfaoXTs/exec';

const form = document.getElementById('leadForm');
const msgBox = document.getElementById('formMsg');
const submitBtn = document.getElementById('submitBtn');
const isEnglish = document.body.classList.contains('en');

const TEXT = isEnglish
  ? {
      sending: '⏳ Sending...',
      send: '🚀 Send Your Details',
      ok: '✅ Received! I\'ll get back to you very soon on WhatsApp.',
      missing: '⚠️ Please fill in all required fields and pick at least one service.',
      err: '⚠️ Something went wrong. Please try again or message me directly on social media.',
      notConfigured: '⚠️ The form isn\'t connected yet. Please reach me on Facebook or Instagram (links below).',
    }
  : {
      sending: '⏳ جاري الإرسال...',
      send: '🚀 ابعت بياناتك',
      ok: '✅ وصلتني بياناتك! هتواصل معاك في أقرب وقت على الواتساب.',
      missing: '⚠️ من فضلك كمّل كل الخانات المطلوبة واختار خدمة واحدة على الأقل.',
      err: '⚠️ حصلت مشكلة في الإرسال. جرب تاني أو كلمني مباشرة على السوشيال ميديا.',
      notConfigured: '⚠️ الفورم لسه مش متوصل. كلمني على فيسبوك أو انستجرام (اللينكات تحت).',
    };

function showMsg(type, text) {
  msgBox.className = 'form-msg ' + type;
  msgBox.textContent = text;
  msgBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const services = [...form.querySelectorAll('input[name="services"]:checked')].map(c => c.value);
    const requiredOk = [...form.querySelectorAll('[required]')].every(f => f.value.trim() !== '');
    if (!requiredOk || services.length === 0) {
      showMsg('err', TEXT.missing);
      return;
    }

    if (APPS_SCRIPT_URL.startsWith('PASTE_')) {
      showMsg('err', TEXT.notConfigured);
      return;
    }

    // Collect form data — skip 'services' key (handled separately via checkboxes)
    const raw = new FormData(form);
    const data = {};
    raw.forEach((val, key) => { if (key !== 'services') data[key] = val; });
    data.services = services.join(' | ');
    data.lang = isEnglish ? 'EN' : 'AR';
    data.submitted_at = new Date().toISOString();

    submitBtn.disabled = true;
    submitBtn.textContent = TEXT.sending;

    try {
      // Google Apps Script Web Apps don't return CORS headers, so we must use
      // mode:'no-cors'. The request DOES reach the sheet — we just can't read
      // the response. We use a URLSearchParams body so Apps Script can also
      // read via e.parameter as a fallback.
      const params = new URLSearchParams(data);

      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      // With no-cors we can't read the response, but if fetch didn't throw
      // the request was sent successfully.
      showMsg('ok', TEXT.ok);
      form.reset();

    } catch (err) {
      console.error('Form error:', err);
      showMsg('err', TEXT.err);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = TEXT.send;
    }
  });
}
