const SHEET_NAME = 'Leads';

const COLUMNS = [
  ['submitted_at', 'تاريخ التسجيل'],
  ['lang',         'لغة الموقع'],
  ['brand_name',   'اسم البراند'],
  ['owner_name',   'اسم صاحب البراند'],
  ['whatsapp',     'واتساب'],
  ['email',        'إيميل'],
  ['social_links', 'لينكات السوشيال'],
  ['product_type', 'نوع المنتج'],
  ['country',      'الدولة المستهدفة'],
  ['budget',       'الميزانية الشهرية'],
  ['currency',     'العملة'],
  ['services',     'الخدمات المطلوبة'],
  ['notes',        'تفاصيل إضافية'],
];

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, msg: 'alive' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(COLUMNS.map(c => c[1]));
      sheet.getRange(1, 1, 1, COLUMNS.length)
        .setFontWeight('bold')
        .setBackground('#0f1729')
        .setFontColor('#22d3ee');
      sheet.setFrozenRows(1);
    }

    let data = {};

    // Try JSON first
    try {
      data = JSON.parse(e.postData.contents);
    } catch (_) {
      // Fallback to URL params
      data = e.parameter || {};
    }

    sheet.appendRow(COLUMNS.map(c => data[c[0]] || ''));

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
