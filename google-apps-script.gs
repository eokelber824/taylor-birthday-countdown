/**
 * Taylor Birthday Messages — Google Apps Script
 *
 * Setup:
 * 1. Create a new Google Sheet
 * 2. Extensions → Apps Script
 * 3. Paste this entire file, save
 * 4. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the web app URL into messages-config.js
 */

var TARGET_MS = 1784563200000; // July 20, 2026 9:00 AM Pacific
var MAX_MESSAGES = 100;

function setupSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Messages");
  if (sheet) return sheet;

  sheet = ss.insertSheet("Messages");
  sheet.appendRow(["createdAt", "name", "message"]);
  return sheet;
}

function respond_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var name = String(data.name || "").trim();
    var message = String(data.message || "").trim();

    if (!name || !message) {
      return respond_({ ok: false, error: "Name and message are required." });
    }
    if (name.length > 50) {
      return respond_({ ok: false, error: "Name is too long." });
    }
    if (message.length > 500) {
      return respond_({ ok: false, error: "Message is too long." });
    }

    var sheet = setupSheet_();
    var count = Math.max(0, sheet.getLastRow() - 1);
    if (count >= MAX_MESSAGES) {
      return respond_({ ok: false, error: "Message limit reached." });
    }

    sheet.appendRow([new Date().toISOString(), name, message]);
    return respond_({ ok: true });
  } catch (err) {
    return respond_({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  var params = e && e.parameter ? e.parameter : {};
  var action = params.action || "";

  if (action !== "list") {
    return respond_({ ok: false, error: "Unknown action." });
  }

  var testMode = params.test === "1";
  if (!testMode && Date.now() < TARGET_MS) {
    return respond_({ ok: false, error: "locked" });
  }

  var sheet = setupSheet_();
  if (sheet.getLastRow() < 2) {
    return respond_({ ok: true, messages: [] });
  }

  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).getValues();
  var messages = rows.map(function (row) {
    return {
      createdAt: row[0],
      name: row[1],
      message: row[2],
    };
  });

  return respond_({ ok: true, messages: messages });
}
