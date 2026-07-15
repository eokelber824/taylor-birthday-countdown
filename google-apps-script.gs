/**
 * Taylor Birthday Messages — Google Apps Script
 *
 * Deploy → New deployment → Web app
 *   - Execute as: Me
 *   - Who has access: Anyone   ← must be "Anyone", not "Anyone with Google account"
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

function listMessages_(testMode) {
  if (!testMode && Date.now() < TARGET_MS) {
    return respond_({ ok: false, error: "locked" });
  }

  var sheet = setupSheet_();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return respond_({ ok: true, messages: [] });
  }

  var rows = sheet.getRange(2, 1, lastRow, 3).getValues();
  var messages = rows.map(function (row) {
    return {
      createdAt: row[0],
      name: row[1],
      message: row[2],
    };
  });

  return respond_({ ok: true, messages: messages });
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    if (data.action === "list") {
      return listMessages_(data.test === true || data.test === "1");
    }

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
  if (params.action !== "list") {
    return respond_({ ok: false, error: "Unknown action." });
  }
  return listMessages_(params.test === "1");
}
