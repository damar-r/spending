/**
 * Catatan Pengeluaran: penerima sinkron ke Google Sheets.
 *
 * Cara pasang (ringkas, rinci ada di README):
 * 1. Buat Google Sheet kosong, lalu Extensions → Apps Script.
 * 2. Tempel seluruh isi file ini, ganti nilai KUNCI di bawah, lalu Save.
 * 3. Deploy → New deployment → Web app. Execute as: Me. Who has access: Anyone.
 * 4. Salin alamat Web App (berakhiran /exec) ke Pengaturan di aplikasi, bersama KUNCI yang sama.
 *
 * Sheet yang dibuat otomatis:
 *   Pembelian : satu baris per pembelian (diperbarui setiap Kirim, Ubah, Hapus)
 *   Budget    : budget per sub-kategori, dengan kolom terpakai, sisa, dan % terpakai (rumus)
 *   Info      : pemasukan dan periode yang dipakai rumus di sheet Budget
 */
const KUNCI = 'GANTI-DENGAN-KUNCI-RAHASIA-ANDA';

const TX = 'Pembelian', BUDGET = 'Budget', INFO = 'Info';
const TX_HEAD = ['id', 'tanggal', 'nama', 'kategori', 'subkategori', 'harga', 'dicatat'];
const BUDGET_HEAD = ['kategori', 'subkategori', 'budget', 'terpakai', 'sisa', '% terpakai'];

function doGet() {
  return respond_({ ok: true, pesan: 'Penerima sinkron aktif' });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(25000);
    const b = JSON.parse(e.postData.contents);
    if (!KUNCI || KUNCI.indexOf('GANTI') === 0) return respond_({ ok: false, error: 'KUNCI belum diganti di Code.gs' });
    if (b.key !== KUNCI) return respond_({ ok: false, error: 'kunci' });
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    switch (b.action) {
      case 'ping': prepare_(ss); break;
      case 'put': put_(ss, b.row); break;
      case 'del': del_(ss, b.id); break;
      case 'sync': sync_(ss, b); break;
      default: return respond_({ ok: false, error: 'aksi tidak dikenal' });
    }
    return respond_({ ok: true });
  } catch (err) {
    return respond_({ ok: false, error: String((err && err.message) || err) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function respond_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function sheet_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function prepare_(ss) {
  const s = sheet_(ss, TX);
  if (s.getLastRow() < 1) {
    s.getRange(1, 1, 1, TX_HEAD.length).setValues([TX_HEAD]);
    s.setFrozenRows(1);
  }
  return s;
}

function toDate_(ss, str) {
  return Utilities.parseDate(str, ss.getSpreadsheetTimeZone(), 'yyyy-MM-dd');
}

function row_(ss, r) {
  return [String(r.id), toDate_(ss, r.date), r.name, r.cat, r.sub, Number(r.amount), new Date(Number(r.ts) || Date.now())];
}

function findRow_(s, id) {
  const n = s.getLastRow();
  if (n < 2) return 0;
  const ids = s.getRange(2, 1, n - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) if (String(ids[i][0]) === String(id)) return i + 2;
  return 0;
}

function formatRows_(s, first, count) {
  s.getRange(first, 2, count, 1).setNumberFormat('yyyy-mm-dd');
  s.getRange(first, 6, count, 1).setNumberFormat('#,##0');
  s.getRange(first, 7, count, 1).setNumberFormat('yyyy-mm-dd hh:mm');
}

function put_(ss, r) {
  const s = prepare_(ss);
  const at = findRow_(s, r.id) || s.getLastRow() + 1;
  s.getRange(at, 1).setNumberFormat('@');
  s.getRange(at, 1, 1, TX_HEAD.length).setValues([row_(ss, r)]);
  formatRows_(s, at, 1);
}

function del_(ss, id) {
  const s = prepare_(ss);
  const at = findRow_(s, id);
  if (at) s.deleteRow(at);
}

function sync_(ss, b) {
  // Pembelian: tulis ulang seluruhnya, urut tanggal
  const s = prepare_(ss);
  if (s.getLastRow() > 1) s.getRange(2, 1, s.getLastRow() - 1, TX_HEAD.length).clearContent();
  const tx = (b.tx || []).slice().sort(function (a, c) {
    return a.date < c.date ? -1 : a.date > c.date ? 1 : (a.ts || 0) - (c.ts || 0);
  });
  if (tx.length) {
    s.getRange(2, 1, tx.length, 1).setNumberFormat('@');
    s.getRange(2, 1, tx.length, TX_HEAD.length).setValues(tx.map(function (r) { return row_(ss, r); }));
    formatRows_(s, 2, tx.length);
  }

  // Info: pemasukan dan periode
  const info = sheet_(ss, INFO);
  info.clear();
  const p = b.period || {};
  info.getRange(1, 1, 3, 2).setValues([
    ['pemasukan', Number(b.income) || 0],
    ['mulai', p.start ? toDate_(ss, p.start) : new Date(2000, 0, 1)],
    ['selesai', p.end ? toDate_(ss, p.end) : new Date(2100, 0, 1)]
  ]);
  info.getRange(1, 2).setNumberFormat('#,##0');
  info.getRange(2, 2, 2, 1).setNumberFormat('yyyy-mm-dd');

  // Budget: rumus menghitung terpakai dari sheet Pembelian pada periode di Info
  const bs = sheet_(ss, BUDGET);
  bs.clear();
  bs.getRange(1, 1, 1, BUDGET_HEAD.length).setValues([BUDGET_HEAD]);
  bs.setFrozenRows(1);
  const subs = b.subs || [];
  if (subs.length) {
    const rows = subs.map(function (x, i) {
      const r = i + 2;
      return [
        x.cat, x.name, Number(x.budget) || 0,
        '=SUMIFS(' + TX + '!$F:$F,' + TX + '!$D:$D,A' + r + ',' + TX + '!$E:$E,B' + r +
          ',' + TX + '!$B:$B,">="&' + INFO + '!$B$2,' + TX + '!$B:$B,"<="&' + INFO + '!$B$3)',
        '=C' + r + '-D' + r,
        '=IF(C' + r + '>0,D' + r + '/C' + r + ',"")'
      ];
    });
    bs.getRange(2, 1, rows.length, BUDGET_HEAD.length).setValues(rows);
    bs.getRange(2, 3, rows.length, 3).setNumberFormat('#,##0');
    bs.getRange(2, 6, rows.length, 1).setNumberFormat('0.0%');
  }
}
