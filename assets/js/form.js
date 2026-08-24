// Lead form → Google Sheets (via Google Apps Script Web App)
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyQ03t0eJeAE5npUYhMkqGOU4LTTEFTYBmD-ph6s2Cs_JJxD8LnRDqAlx93fMfaoXTs/exec';
const WHATSAPP_NUMBER  = '201555815833';

const form = document.getElementById('leadForm');
const msgBox = document.getElementById('formMsg');
const submitBtn = document.getElementById('submitBtn');
const isEnglish = document.body.classList.contains('en');

const TEXT = isEnglish
  ? {
      sending: '⏳ Sending...',
      send: '🚀 Send Details',
      ok: '✅ Received! Redirecting you to WhatsApp to continue the conversation...',
      missing: '⚠️ Please fill in the required fields and pick at least one service.',
      err: '⚠️ Something went wrong. Please try again or reach me directly on WhatsApp.',
    }
  : {
      sending: '⏳ جاري الإرسال...',
      send: '🚀 ابعت واتساب لي',
      ok: '✅ وصلتني بياناتك! هحوّلك على واتساب دلوقتي عشان نكمل...',
      missing: '⚠️ من فضلك كمّل الخانات المطلوبة واختار خدمة واحدة على الأقل.',
      err: '⚠️ حصلت مشكلة في الإرسال. جرّب تاني أو كلمني على واتساب مباشرة.',
    };

function showMsg(type, text) {
  msgBox.className = 'form-msg ' + type;
  msgBox.textContent = text;
  msgBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function buildWhatsAppText(data, services) {
  const lines = isEnglish
    ? [
        'Hi Ahmed, I just submitted the form on your site:',
        '',
        `Name: ${data.owner_name || '-'}`,
        `Country: ${data.country || '-'}`,
        `Industry: ${data.product_type || '-'}`,
        `Links: ${data.social_links || '-'}`,
        `Services: ${services.join(', ')}`,
        data.notes ? `Notes: ${data.notes}` : '',
      ]
    : [
        'اهلا احمد، لسه بعتلك الفورم من الموقع:',
        '',
        `الاسم: ${data.owner_name || '-'}`,
        `الدولة: ${data.country || '-'}`,
        `المجال: ${data.product_type || '-'}`,
        `اللينكات: ${data.social_links || '-'}`,
        `الخدمة: ${services.join('، ')}`,
        data.notes ? `تفاصيل: ${data.notes}` : '',
      ];
  return encodeURIComponent(lines.filter(Boolean).join('\n'));
}

let submitting = false;

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (submitting) return;

    const services = [...form.querySelectorAll('input[name="services"]:checked')].map(c => c.value);
    const requiredOk = [...form.querySelectorAll('[required]')].every(f => f.value.trim() !== '');
    if (!requiredOk || services.length === 0) {
      showMsg('err', TEXT.missing);
      return;
    }

    // Collect form data
    const raw = new FormData(form);
    const data = {};
    raw.forEach((val, key) => { if (key !== 'services') data[key] = val; });
    data.services = services.join(' | ');
    data.lang = isEnglish ? 'EN' : 'AR';
    data.submitted_at = new Date().toISOString();

    submitting = true;
    submitBtn.disabled = true;
    submitBtn.textContent = TEXT.sending;

    // Try sending to Sheet. Apps Script Web Apps don't return CORS headers, so we
    // use no-cors and can't read the response — but the row DOES land in the sheet.
    // We treat "fetch didn't throw" as success and either way funnel the user to WhatsApp.
    let sheetOk = true;
    try {
      const params = new URLSearchParams(data);
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
    } catch (err) {
      sheetOk = false;
      console.warn('Sheet submit failed, falling back to WhatsApp only:', err);
    }

    showMsg('ok', TEXT.ok);
    form.reset();
    if (window.trackLead) window.trackLead('form');

    // Open WhatsApp with pre-filled message so the user reaches me even if the sheet fails.
    const waText = buildWhatsAppText(data, services);
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`;
    setTimeout(() => {
      window.open(waUrl, '_blank', 'noopener');
      submitting = false;
      submitBtn.disabled = false;
      submitBtn.textContent = TEXT.send;
    }, 900);
  });
}
