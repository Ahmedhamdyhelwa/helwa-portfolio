/**
 * Ahmed Helwa — Lead form receiver
 * يستقبل بيانات الفورم من الموقع ويسجلها صف جديد في Google Sheet.
 *
 * Deploy as: Execute as ME / Who has access: ANYONE (even anonymous)
 */

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

function getOrCreateSheet(ss) {
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
  return sheet;
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, msg: 'helwa-portfolio API alive' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getOrCreateSheet(ss);

    let data = {};

    // Try JSON body first (Content-Type: text/plain)
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (_) {
        // Fall through to parameter parsing
      }
    }

    // Fallback: URLSearchParams (Content-Type: application/x-www-form-urlencoded)
    if (!data.brand_name && e.parameter) {
      data = e.parameter;
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
