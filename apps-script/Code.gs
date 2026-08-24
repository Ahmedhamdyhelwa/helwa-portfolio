// ============================================================
// Ahmed Helwa portfolio — Sheet backend
//   Routes submissions to different tabs based on `form_type`.
//   - form_type == 'book' → "Books" sheet
//   - anything else       → "Leads" sheet (default)
// ============================================================

const LEADS_SHEET = 'Leads';
const BOOKS_SHEET = 'Books';

const LEADS_COLUMNS = [
  ['submitted_at', 'تاريخ التسجيل'],
  ['lang',         'لغة الموقع'],
  ['owner_name',   'الاسم'],
  ['whatsapp',     'واتساب'],
  ['social_links', 'لينكات السوشيال'],
  ['product_type', 'نوع المنتج'],
  ['country',      'الدولة المستهدفة'],
  ['services',     'الخدمات المطلوبة'],
  ['notes',        'تفاصيل إضافية'],
];

const BOOKS_COLUMNS = [
  ['submitted_at', 'تاريخ الطلب'],
  ['lang',         'لغة الموقع'],
  ['owner_name',   'الاسم'],
  ['whatsapp',     'رقم الموبايل'],
  ['address',      'العنوان'],
  ['book',         'الكتاب المطلوب'],
];

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, msg: 'alive' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    let data = {};
    try {
      data = JSON.parse(e.postData.contents);
    } catch (_) {
      data = e.parameter || {};
    }

    const isBook = (data.form_type || '').toLowerCase() === 'book';
    const sheetName = isBook ? BOOKS_SHEET : LEADS_SHEET;
    const columns   = isBook ? BOOKS_COLUMNS : LEADS_COLUMNS;

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(columns.map(c => c[1]));
      sheet.getRange(1, 1, 1, columns.length)
        .setFontWeight('bold')
        .setBackground('#14181f')
        .setFontColor('#5da9d6');
      sheet.setFrozenRows(1);
    }

    sheet.appendRow(columns.map(c => data[c[0]] || ''));

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, target: sheetName }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
