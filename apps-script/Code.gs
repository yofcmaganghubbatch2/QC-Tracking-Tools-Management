/**
 * Tracking QC Measurement Tools - sumber data.
 * Tempel seluruh isi file ini di Google Sheet: Extensions > Apps Script.
 * @OnlyCurrentDoc
 */

// Nama tab yang dibaca (lihat tab di bagian bawah Google Sheet).
const TAB_NAME = 'Form Responses 1';

// Kolom yang TIDAK dikirim ke dashboard (email dan foto tidak dipakai tampilan).
const DROP_COLUMNS = /^(email|ultrasonic thickness gauge photo)/i;

function doGet(e) {
  // Kunci rahasia disimpan di Project Settings > Script Properties dengan nama API_KEY.
  const expected = PropertiesService.getScriptProperties().getProperty('API_KEY');
  if (!expected) return json_({ error: 'API_KEY is not set in Script Properties.' });

  const given = (e && e.parameter && e.parameter.key) || '';
  if (given !== expected) return json_({ error: 'Unauthorized.' });

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(TAB_NAME);
  if (!sheet) return json_({ error: 'Tab "' + TAB_NAME + '" not found.' });

  const values = sheet.getDataRange().getValues();
  if (!values.length) return json_({ values: [] });

  const tz = ss.getSpreadsheetTimeZone();
  const keep = values[0]
    .map(function (h, i) { return DROP_COLUMNS.test(String(h)) ? -1 : i; })
    .filter(function (i) { return i >= 0; });

  // Tanggal dikirim sebagai teks yyyy-MM-dd (zona waktu spreadsheet) supaya tidak bergeser hari.
  const out = values.map(function (row) {
    return keep.map(function (i) {
      const v = row[i];
      return Object.prototype.toString.call(v) === '[object Date]' ? Utilities.formatDate(v, tz, 'yyyy-MM-dd') : v;
    });
  });
  return json_({ values: out });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
