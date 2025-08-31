// Apps Script (Web App): лог событий попапа в Google Sheets
const SHEET_ID = 'ВСТАВЬ_ID_ТВОЕЙ_ТАБЛИЦЫ';
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sh = ss.getSheetByName('events');
    sh.appendRow([
      new Date(),
      body.client_id || 'N/A',
      body.page || 'N/A',
      body.event || 'N/A',
      body.user_agent || 'N/A',
      body.referrer || 'N/A'
    ]);
    return ContentService.createTextOutput(JSON.stringify({ok:true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ok:false, error:String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
