const express = require('express');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || '/data';

// Ensure data dir exists (Fly volume mounts to /data)
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const dbPath = path.join(DATA_DIR, 'bills.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS state (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL,
    updated_by TEXT
  )
`);

const DEFAULT_BILLS = [
  { id: 'cp01', code: 'CP', priority: 'CRITICAL', vendor: "Chris Paving", invoice: "Sworn Statement (Bond)", dueDate: "5/8/26", amount: 12000.00, status: "Sworn Statement filed 4/29/26", spec: "32 12 16", arNote: "Hoy Attorney", context: "Hoy Hughes counsel. Payable to Chris' Paving, mail to 30216 N Dixie Ranch Rd, Lacombe LA. Payment to issue first week of May upon City funds.", paidNext: false, comments: "", lastEditedBy: "", lastEditedAt: 0 },
  { id: 'af01', code: 'AF', priority: 'CRITICAL', vendor: "AmeriFactors (...7807)", invoice: "CCG #72739 (Concrete Materials)", dueDate: "5/8/26", amount: 18110.00, status: "Factored, position is dispute", spec: "09 96 00 / 03 30 00", arNote: "Concrete Materials CCG (####5394)", context: "Original Coastline 72739 factored to AmeriFactors. A/R labels concrete materials; Cameron's 4/24 demand calls it epoxy. Cross-check assignment paperwork. Surface prep failure defense in reserve.", paidNext: false, comments: "", lastEditedBy: "", lastEditedAt: 0 },
  { id: 'af02', code: 'AF', priority: 'CRITICAL', vendor: "AmeriFactors (Loan Repay)", invoice: "2/2 Payment (#72724)", dueDate: "5/8/26", amount: 20850.00, status: "Second half of 50/50 plan", spec: "03 30 00", arNote: "Factoring Repayment", context: "Final payment on Coastline #72724 concrete invoice ($41,200 total). Cleanest undisputed amount to point Isiah Cline (CNA) toward.", paidNext: false, comments: "", lastEditedBy: "", lastEditedAt: 0 },
  { id: 'ccg01', code: 'CCG', priority: 'CRITICAL', vendor: "Coastline (CCG)", invoice: "Trench Drain Invoice", dueDate: "5/8/26", amount: 4820.00, status: "Open invoice", spec: "33 41 00", arNote: "See Tab CCG INVOICE / TRENCH DRAIN", context: "Trench drain scope. Confirm whether tied to bond claim or separate. Confirm work was accepted by Engineer of Record.", paidNext: false, comments: "", lastEditedBy: "", lastEditedAt: 0 },
  { id: 'mf01', code: 'MF', priority: 'HIGH', vendor: "N.O. Metal Fabrication", invoice: "Invoice 2649 plus 2770", dueDate: "5/8/26", amount: 2005.67, status: "Past due, addition pending", spec: "05 50 00", arNote: "Wants addition $548", context: "Original 2649 balance $2,005.67 (30 plus days past due). Vendor wants to add new $548 charge.", paidNext: false, comments: "", lastEditedBy: "", lastEditedAt: 0 },
  { id: 'ew01', code: 'EW', priority: 'HIGH', vendor: "Elite Waste", invoice: "Invoice 1381", dueDate: "5/8/26", amount: 2923.00, status: "Late fees applied", spec: "01 74 23", arNote: "1.5 percent late fee", context: "Original $2,880 plus 1.5 percent late fee equals $2,923. Forwarded by Willie 4/13/26.", paidNext: false, comments: "", lastEditedBy: "", lastEditedAt: 0 },
  { id: 'm2m01', code: 'M2M', priority: 'HIGH', vendor: "Manning Lumber (via M2M)", invoice: "TBD", dueDate: "5/8/26", amount: 3584.00, status: "Due on date", spec: "06 10 00", arNote: "Due 5/8/2026", context: "Routed through M2M. Likely supersedes 84 Lumber line in 3/15 internal memo.", paidNext: false, comments: "", lastEditedBy: "", lastEditedAt: 0 },
  { id: 'tc01', code: 'TC', priority: 'HIGH', vendor: "T and C Welding", invoice: "Lump Sum SC", dueDate: "5/8/26", amount: 3336.21, status: "Confirm balance", spec: "05 50 00 / 05 52 13", arNote: "Confirm, see tab at bottom", context: "A/R shows $3,336.21 against the $32,900 turnkey rail and bench package. Reconcile against credits for prior payments. Galvanization tied to AZZ.", paidNext: false, comments: "", lastEditedBy: "", lastEditedAt: 0 },
  { id: 'e101', code: 'E1', priority: 'HIGH', vendor: "E1 Electric (Eugene Lawrence)", invoice: "Invoice 27906 (3/3/26)", dueDate: "5/8/26", amount: 5650.00, status: "Open total fee as of 3/3/26", spec: "26 05 00", arNote: "27906 TOTAL FEE, CHASE(..3613)", context: "PO-004 electrical scope. E1 is field installer, distinct from Elliott Electric supplier.", paidNext: false, comments: "", lastEditedBy: "", lastEditedAt: 0 },
  { id: 'tfc01', code: 'TFC', priority: 'HIGH', vendor: "Traffic Commander", invoice: "Invoice 022826SM (FEB)", dueDate: "5/8/26", amount: 630.90, status: "Open", spec: "01 55 00", arNote: "Invoice 022826SM (FEBRUARY)", context: "Traffic control during February work.", paidNext: false, comments: "", lastEditedBy: "", lastEditedAt: 0 },
  { id: 'tfc02', code: 'TFC', priority: 'HIGH', vendor: "Traffic Commander", invoice: "Invoice 033126SM (MAR)", dueDate: "5/8/26", amount: 545.01, status: "Open", spec: "01 55 00", arNote: "Invoice 033126SM (MARCH)", context: "Traffic control during March work.", paidNext: false, comments: "", lastEditedBy: "", lastEditedAt: 0 },
  { id: 'pw01', code: 'M2M', priority: 'MEDIUM', vendor: "Power Wash (via M2M)", invoice: "TBD", dueDate: "5/8/26", amount: 414.00, status: "Open", spec: "01 74 23", arNote: "(no note)", context: "Likely Rhino Blast Exterior Cleaning per 4/20 thread. Routed through M2M.", paidNext: false, comments: "", lastEditedBy: "", lastEditedAt: 0 },
  { id: 'es01', code: 'M2M', priority: 'MEDIUM', vendor: "Epoxy Sealant (via M2M)", invoice: "TBD", dueDate: "5/8/26", amount: 2000.00, status: "Open", spec: "07 92 00", arNote: "(no note)", context: "Routed through M2M. Possibly clear coat concrete sealer per 4/20 closeout update.", paidNext: false, comments: "", lastEditedBy: "", lastEditedAt: 0 },
  { id: 'oct01', code: 'SM', priority: 'MEDIUM', vendor: "Octagon Fire Suppression", invoice: "Invoice 1434 Fire Ext", dueDate: "5/19/26", amount: 150.00, status: "Open, due 5/19/26", spec: "21 13 13", arNote: "Due May 19", context: "Annual or final inspection charge.", paidNext: false, comments: "", lastEditedBy: "", lastEditedAt: 0 },
  { id: 'e102', code: 'E1', priority: 'PENDING', vendor: "E1 Electric", invoice: "CO2 (pending)", dueDate: "5/22/26", amount: 1913.90, status: "Pending change order", spec: "26 05 00", arNote: "[$1913.90] CO2", context: "Pending change order to E1 PO-004. Ties to the electrical scope delineation work with the City. Not yet billed.", paidNext: false, comments: "", lastEditedBy: "", lastEditedAt: 0 },
  { id: 'ee01', code: 'EE', priority: 'PENDING', vendor: "Elliott Electric (Supplier)", invoice: "Light Brackets", dueDate: "6/22/26", amount: 5259.64, status: "NOT APPROVED YET", spec: "26 56 00", arNote: "($5,259.64) Light Brackets", context: "A1 brackets, Manufacturer Invoice 137-10005-01 (3/30/26). Cornerstone of CPR 8. Awaiting CO4 approval.", paidNext: false, comments: "", lastEditedBy: "", lastEditedAt: 0 },
];

function getState() {
  const row = db.prepare('SELECT value, updated_at, updated_by FROM state WHERE key = ?').get('bills');
  if (row) {
    return {
      bills: JSON.parse(row.value),
      updatedAt: row.updated_at,
      updatedBy: row.updated_by || ''
    };
  }
  // Seed with defaults
  const now = Date.now();
  db.prepare('INSERT INTO state (key, value, updated_at, updated_by) VALUES (?, ?, ?, ?)').run(
    'bills', JSON.stringify(DEFAULT_BILLS), now, ''
  );
  return { bills: DEFAULT_BILLS, updatedAt: now, updatedBy: '' };
}

function saveState(bills, updatedBy) {
  const now = Date.now();
  db.prepare('UPDATE state SET value = ?, updated_at = ?, updated_by = ? WHERE key = ?').run(
    JSON.stringify(bills), now, updatedBy || '', 'bills'
  );
  return now;
}

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/bills', (req, res) => {
  try {
    res.json(getState());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load bills' });
  }
});

app.put('/api/bills', (req, res) => {
  try {
    const { bills, updatedBy } = req.body;
    if (!Array.isArray(bills)) {
      return res.status(400).json({ error: 'bills must be an array' });
    }
    const updatedAt = saveState(bills, updatedBy);
    res.json({ ok: true, updatedAt, updatedBy: updatedBy || '' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not save bills' });
  }
});

app.post('/api/reset', (req, res) => {
  try {
    const { updatedBy } = req.body || {};
    const updatedAt = saveState(DEFAULT_BILLS, updatedBy);
    res.json({ ok: true, bills: DEFAULT_BILLS, updatedAt, updatedBy: updatedBy || '' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not reset' });
  }
});

app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`HGI Bills Tracker listening on ${PORT}, data at ${dbPath}`);
});
