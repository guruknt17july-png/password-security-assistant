// ===== COMMON WORDS LIST =====
const WORD_LIST = [
  'river','mountain','forest','ocean','valley','sunset','thunder','crystal','dragon','falcon',
  'silver','golden','copper','iron','bronze','marble','ember','shadow','storm','frost',
  'cloud','breeze','harbor','island','canyon','meadow','glacier','summit','desert','tundra',
  'phoenix','tiger','eagle','wolf','panther','cobra','raven','dolphin','stallion','hawk',
  'castle','tower','bridge','garden','temple','palace','fortress','village','harbor','beacon',
  'crimson','azure','scarlet','emerald','violet','ivory','sapphire','amber','indigo','coral',
  'comet','nebula','orbit','quasar','pulsar','photon','prism','zenith','vertex','matrix',
  'train','rocket','anchor','compass','lantern','violin','piano','guitar','canvas','puzzle',
  'coffee','cinnamon','pepper','ginger','saffron','vanilla','walnut','cherry','mango','lemon',
  'atlas','echo','nova','luna','stella','aurora','terra','flora','zephyr','cosmos'
];

const COMMON_PASSWORDS = [
  'password','123456','12345678','qwerty','abc123','monkey','master','dragon','111111','baseball',
  'iloveyou','trustno1','sunshine','princess','football','charlie','shadow','michael','login',
  'welcome','admin','letmein','654321','superman','hello','password1','password123','1234567890',
  'qwerty123','000000','121212','1q2w3e4r','access','starwars','passw0rd','zaq12wsx','!@#$%^&*'
];

const KEYBOARD_PATTERNS = [
  'qwerty','asdfgh','zxcvbn','qwertyuiop','asdfghjkl','zxcvbnm',
  '1234567890','1qaz2wsx','qazwsx','!@#$%^','098765','987654'
];

// ===== NAVIGATION =====
function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.page === page);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMobileMenu() {
  document.getElementById('mobileNav').classList.toggle('open');
}
function closeMobile() {
  document.getElementById('mobileNav').classList.remove('open');
}

// ===== THEME =====
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.dataset.theme === 'dark';
  html.dataset.theme = isDark ? 'light' : 'dark';
  document.querySelector('.icon-moon').style.display = isDark ? 'none' : 'block';
  document.querySelector('.icon-sun').style.display = isDark ? 'block' : 'none';
}

// ===== PASSWORD INPUT HELPERS =====
function toggleVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.setAttribute('aria-label', 'Hide password');
  } else {
    input.type = 'password';
    btn.setAttribute('aria-label', 'Show password');
  }
}

function clearInput(inputId) {
  const input = document.getElementById(inputId);
  input.value = '';
  input.dispatchEvent(new Event('input'));
  input.focus();
}

// ===== PASSWORD ANALYSIS ENGINE =====
function analyzePassword(pw) {
  const result = {
    length: pw.length,
    hasUpper: /[A-Z]/.test(pw),
    hasLower: /[a-z]/.test(pw),
    hasNumber: /[0-9]/.test(pw),
    hasSymbol: /[^A-Za-z0-9]/.test(pw),
    hasMin8: pw.length >= 8,
    has12Plus: pw.length >= 12,
    noCommonPattern: true,
    isCommon: false,
    hasRepeated: false,
    hasSequential: false,
    score: 0,
    strength: 'very-weak',
    strengthLabel: 'Very Weak',
    entropy: 0,
    weaknesses: [],
    improvements: [],
    strengths: []
  };

  // Common password
  if (COMMON_PASSWORDS.includes(pw.toLowerCase())) {
    result.isCommon = true;
    result.noCommonPattern = false;
  }

  // Keyboard patterns
  const pwLower = pw.toLowerCase();
  for (const pat of KEYBOARD_PATTERNS) {
    if (pwLower.includes(pat) || pwLower.includes(pat.split('').reverse().join(''))) {
      result.noCommonPattern = false;
      break;
    }
  }

  // Repeated characters (3+)
  if (/(.)\1{2,}/.test(pw)) {
    result.hasRepeated = true;
    result.noCommonPattern = false;
  }

  // Sequential numbers (3+)
  for (let i = 0; i < pw.length - 2; i++) {
    const c1 = pw.charCodeAt(i), c2 = pw.charCodeAt(i+1), c3 = pw.charCodeAt(i+2);
    if (c2 === c1 + 1 && c3 === c2 + 1) { result.hasSequential = true; result.noCommonPattern = false; break; }
    if (c2 === c1 - 1 && c3 === c2 - 1) { result.hasSequential = true; result.noCommonPattern = false; break; }
  }

  // Score calculation
  let score = 0;
  if (result.hasMin8) score += 1;
  if (result.has12Plus) score += 1;
  if (pw.length >= 16) score += 1;
  if (result.hasUpper) score += 1;
  if (result.hasLower) score += 1;
  if (result.hasNumber) score += 1;
  if (result.hasSymbol) score += 1.5;
  if (result.noCommonPattern) score += 1.5;
  if (result.isCommon) score -= 3;
  if (result.hasRepeated) score -= 0.5;
  if (result.hasSequential) score -= 0.5;

  // Unique chars bonus
  const uniqueRatio = new Set(pw).size / pw.length;
  if (uniqueRatio > 0.7 && pw.length >= 10) score += 1;

  score = Math.max(0, Math.min(10, Math.round(score)));
  result.score = score;

  // Strength label
  if (score <= 2) { result.strength = 'very-weak'; result.strengthLabel = 'Very Weak'; }
  else if (score <= 4) { result.strength = 'weak'; result.strengthLabel = 'Weak'; }
  else if (score <= 6) { result.strength = 'medium'; result.strengthLabel = 'Medium'; }
  else if (score <= 8) { result.strength = 'strong'; result.strengthLabel = 'Strong'; }
  else { result.strength = 'very-strong'; result.strengthLabel = 'Very Strong'; }

  // Entropy
  let charsetSize = 0;
  if (result.hasLower) charsetSize += 26;
  if (result.hasUpper) charsetSize += 26;
  if (result.hasNumber) charsetSize += 10;
  if (result.hasSymbol) charsetSize += 32;
  if (charsetSize === 0) charsetSize = 26;
  result.entropy = Math.round(pw.length * Math.log2(charsetSize));

  // Weaknesses
  if (!result.hasMin8) result.weaknesses.push('Too short (minimum 8 characters)');
  if (!result.has12Plus && result.hasMin8) result.weaknesses.push('Less than 12 characters');
  if (!result.hasUpper) result.weaknesses.push('Missing uppercase letters');
  if (!result.hasLower) result.weaknesses.push('Missing lowercase letters');
  if (!result.hasNumber) result.weaknesses.push('Missing numbers');
  if (!result.hasSymbol) result.weaknesses.push('Missing special characters');
  if (result.isCommon) result.weaknesses.push('Common password pattern detected');
  if (result.hasRepeated) result.weaknesses.push('Contains repeated characters');
  if (result.hasSequential) result.weaknesses.push('Contains sequential characters');

  // Improvements
  if (!result.has12Plus) result.improvements.push('Use at least 12 characters');
  if (!result.hasUpper || !result.hasLower || !result.hasNumber || !result.hasSymbol) {
    result.improvements.push('Combine different character types');
  }
  if (!result.noCommonPattern) result.improvements.push('Avoid common words and patterns');
  result.improvements.push('Consider using a long passphrase');
  result.improvements.push('Use a unique password for each account');

  // Strengths
  if (result.has12Plus) result.strengths.push('Good length (' + pw.length + ' characters)');
  else if (result.hasMin8) result.strengths.push('Acceptable length (' + pw.length + ' characters)');
  const types = [result.hasUpper, result.hasLower, result.hasNumber, result.hasSymbol].filter(Boolean).length;
  if (types >= 3) result.strengths.push('Good character variety');
  if (result.noCommonPattern) result.strengths.push('No obvious pattern detected');

  return result;
}

// ===== CHECKER PAGE =====
const checkerInput = document.getElementById('checkerInput');
checkerInput.addEventListener('input', function() {
  const pw = this.value;
  if (!pw) {
    document.getElementById('checkerEmpty').style.display = 'block';
    document.getElementById('checkerResults').style.display = 'none';
    return;
  }
  document.getElementById('checkerEmpty').style.display = 'none';
  document.getElementById('checkerResults').style.display = 'block';

  const r = analyzePassword(pw);

  // Strength
  const sl = document.getElementById('strengthLabel');
  sl.textContent = r.strengthLabel;
  sl.className = 'value ' + r.strength;

  // Score
  document.getElementById('scoreLabel').textContent = r.score + '/10';
  document.getElementById('scoreLabel').className = 'value ' + r.strength;

  // Length
  document.getElementById('lengthLabel').textContent = r.length + ' chars';

  // Meter
  const mf = document.getElementById('meterFill');
  mf.className = 'meter-fill ' + r.strength;

  // Requirements
  const reqs = [
    { pass: r.hasMin8, text: 'At least 8 characters' },
    { pass: r.has12Plus, text: '12+ characters recommended' },
    { pass: r.hasUpper, text: 'Contains uppercase letter' },
    { pass: r.hasLower, text: 'Contains lowercase letter' },
    { pass: r.hasNumber, text: 'Contains number' },
    { pass: r.hasSymbol, text: 'Contains special character' },
    { pass: r.noCommonPattern, text: 'No obvious/common patterns' }
  ];

  const reqHtml = reqs.map(rq => `
    <div class="req-item ${rq.pass ? 'pass' : 'fail'}">
      <span class="req-icon">${rq.pass ? '✓' : ''}</span>
      <span>${rq.text} ${rq.pass ? '' : '✗'}</span>
    </div>
  `).join('');
  document.getElementById('requirementsList').innerHTML = reqHtml;

  // Analysis cards
  let cardsHtml = '';

  if (r.weaknesses.length > 0 && r.score < 8) {
    cardsHtml += `
      <div class="card analysis-card weak-card">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--warning)" stroke-width="2" width="20" height="20"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Why is this password weak?
        </h3>
        <ul>${r.weaknesses.map(w => `<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>${w}</li>`).join('')}</ul>
      </div>
    `;

    cardsHtml += `
      <div class="card analysis-card improve-card">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          How can you improve it?
        </h3>
        <ul>${r.improvements.map(i => `<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>${i}</li>`).join('')}</ul>
      </div>
    `;
  }

  if (r.score >= 7) {
    cardsHtml += `
      <div class="card analysis-card strong-card">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2" width="20" height="20"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Good password
        </h3>
        <ul>${r.strengths.map(s => `<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>${s}</li>`).join('')}</ul>
        <p style="font-size:0.85rem;color:var(--text-muted);margin-top:12px;font-style:italic">Never reuse this password across multiple important accounts.</p>
      </div>
    `;
  }

  document.getElementById('analysisCards').innerHTML = cardsHtml;

  // Entropy
  document.getElementById('entropyValue').textContent = r.entropy + ' bits';

  // CTA
  document.getElementById('checkerCTA').style.display = r.score < 7 ? 'block' : 'none';
});

// Entropy toggle
function toggleEntropy() {
  const content = document.getElementById('entropyContent');
  const btn = document.querySelector('.entropy-toggle');
  const visible = content.classList.toggle('visible');
  btn.setAttribute('aria-expanded', visible);
  btn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="${visible ? '18 15 12 9 6 15' : '6 9 12 15 18 9'}"/></svg>
    ${visible ? 'Hide' : 'Show'} Advanced Analysis
  `;
}

// ===== GENERATOR TABS =====
function setGenTab(tab) {
  document.querySelectorAll('.gen-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
    t.setAttribute('aria-selected', t.dataset.tab === tab);
  });
  document.querySelectorAll('.gen-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + tab).classList.add('active');
}

// Slider update
function updateSlider(sliderId, valId) {
  document.getElementById(valId).textContent = document.getElementById(sliderId).value;
}

// Option toggle
function toggleOpt(btn, groupId) {
  btn.classList.toggle('active');
  const check = btn.querySelector('.check');
  check.textContent = btn.classList.contains('active') ? '✓' : '';
}

function getActiveOpts(groupId) {
  const opts = {};
  document.querySelectorAll(`#${groupId} .option-btn`).forEach(b => {
    opts[b.dataset.opt] = b.classList.contains('active');
  });
  return opts;
}

function showError(id, msg) {
  const el = document.getElementById(id);
  el.querySelector('span').textContent = msg;
  el.classList.add('visible');
  setTimeout(() => el.classList.remove('visible'), 3000);
}

// ===== RANDOM GENERATOR =====
function generateRandomPassword(length, opts) {
  let chars = '';
  let required = [];
  if (opts.upper) { chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; required.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ'); }
  if (opts.lower) { chars += 'abcdefghijklmnopqrstuvwxyz'; required.push('abcdefghijklmnopqrstuvwxyz'); }
  if (opts.numbers) { chars += '0123456789'; required.push('0123456789'); }
  if (opts.symbols) { chars += '!@#$%^&*()-_=+[]{}|;:,.<>?'; required.push('!@#$%^&*()-_=+[]{}|;:,.<>?'); }

  if (!chars) return null;

  let pw = '';
  // Ensure at least one from each required set
  for (const r of required) {
    pw += r[Math.floor(Math.random() * r.length)];
  }
  // Fill rest
  while (pw.length < length) {
    pw += chars[Math.floor(Math.random() * chars.length)];
  }
  // Shuffle
  pw = pw.split('').sort(() => Math.random() - 0.5).join('');
  return pw;
}

function generateRandom() {
  const opts = getActiveOpts('randomOptions');
  if (!opts.upper && !opts.lower && !opts.numbers && !opts.symbols) {
    showError('randomError', 'Select at least one character type.');
    return;
  }
  const length = parseInt(document.getElementById('randomLength').value);
  const results = [];
  for (let i = 0; i < 3; i++) {
    let pw, analysis, attempts = 0;
    do {
      pw = generateRandomPassword(length, opts);
      analysis = analyzePassword(pw);
      attempts++;
    } while (analysis.score < 6 && attempts < 20);
    results.push({ pw, analysis });
  }
  renderResults('randomResults', results);
}

// ===== MEMORABLE GENERATOR =====
function generateMemorablePassword(length, opts) {
  // Pick 2-3 words, capitalize some, insert numbers and symbols
  const w1 = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
  const w2 = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
  const w3 = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];

  const symbols = '!@#$%&*-+?';
  const capitalize = (w) => w.charAt(0).toUpperCase() + w.slice(1);

  let parts = [];
  if (opts.upper) {
    parts.push(capitalize(w1));
    parts.push(capitalize(w2));
  } else if (opts.lower) {
    parts.push(w1);
    parts.push(w2);
  } else {
    parts.push(w1.toUpperCase());
    parts.push(w2.toUpperCase());
  }

  if (opts.symbols) {
    parts.splice(1, 0, symbols[Math.floor(Math.random() * symbols.length)]);
  }
  if (opts.numbers) {
    parts.push(String(Math.floor(Math.random() * 90) + 10));
  }
  if (opts.symbols) {
    parts.push(symbols[Math.floor(Math.random() * symbols.length)]);
  }

  let pw = parts.join('');

  // Adjust length
  if (pw.length < length) {
    const extra = capitalize(w3);
    pw = pw.slice(0, -1) + extra + pw.slice(-1);
  }
  if (pw.length > length) {
    pw = pw.slice(0, length);
  }
  // Ensure minimum length
  while (pw.length < length) {
    pw += 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)];
  }

  return pw;
}

function generateMemorable() {
  const opts = getActiveOpts('memorableOptions');
  if (!opts.upper && !opts.lower && !opts.numbers && !opts.symbols) {
    showError('memorableError', 'Select at least one character type.');
    return;
  }
  const length = parseInt(document.getElementById('memorableLength').value);
  const results = [];
  for (let i = 0; i < 3; i++) {
    let pw, analysis, attempts = 0;
    do {
      pw = generateMemorablePassword(length, opts);
      analysis = analyzePassword(pw);
      attempts++;
    } while (analysis.score < 6 && attempts < 30);
    results.push({ pw, analysis });
  }
  renderResults('memorableResults', results);
}

// ===== PERSONALIZED GENERATOR =====
function generatePersonalPassword(length, opts, word, num, theme) {
  const symbols = '!@#$%&*-+?';
  const allWords = [word, theme].filter(Boolean);

  // Use fragments of personal words, not full words
  let fragments = [];
  for (const w of allWords) {
    if (w.length > 0) {
      // Take a fragment (2-4 chars) and transform it
      const frag = w.slice(0, Math.min(4, w.length));
      // Apply transformation: capitalize, reverse, or leet
      const transforms = [
        () => frag.charAt(0).toUpperCase() + frag.slice(1),
        () => frag.split('').reverse().join(''),
        () => frag.replace(/a/gi, '@').replace(/e/gi, '3').replace(/i/gi, '1').replace(/o/gi, '0'),
      ];
      fragments.push(transforms[Math.floor(Math.random() * transforms.length)]());
    }
  }

  // Random word from list
  const rw = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
  const cap = rw.charAt(0).toUpperCase() + rw.slice(1);

  let parts = [];
  parts.push(cap);
  if (opts.symbols) parts.push(symbols[Math.floor(Math.random() * symbols.length)]);
  if (fragments.length > 0) parts.push(fragments[0]);
  if (opts.numbers) {
    const n = num || String(Math.floor(Math.random() * 90) + 10);
    parts.push(n.slice(0, 2));
  }
  if (fragments.length > 1) {
    if (opts.symbols) parts.push(symbols[Math.floor(Math.random() * symbols.length)]);
    parts.push(fragments[1]);
  }
  // Another random word
  const rw2 = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
  parts.push(rw2.charAt(0).toUpperCase() + rw2.slice(1));
  if (opts.symbols) parts.push(symbols[Math.floor(Math.random() * symbols.length)]);
  if (opts.numbers) parts.push(String(Math.floor(Math.random() * 9) + 1));

  let pw = parts.join('');
  if (pw.length > length) pw = pw.slice(0, length);
  while (pw.length < length) {
    pw += 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%'[Math.floor(Math.random() * 41)];
  }

  return pw;
}

function generatePersonal() {
  const opts = getActiveOpts('persOptions');
  if (!opts.upper && !opts.lower && !opts.numbers && !opts.symbols) {
    showError('persError', 'Select at least one character type.');
    return;
  }
  const length = parseInt(document.getElementById('persLength').value);
  const word = document.getElementById('persWord').value.trim();
  const num = document.getElementById('persNumber').value.trim();
  const theme = document.getElementById('persTheme').value.trim();

  const results = [];
  for (let i = 0; i < 5; i++) {
    let pw, analysis, attempts = 0;
    do {
      pw = generatePersonalPassword(length, opts, word, num, theme);
      analysis = analyzePassword(pw);
      attempts++;
    } while (analysis.score < 6 && attempts < 30);
    results.push({ pw, analysis });
  }
  renderResults('personalResults', results);
}

// ===== PASSPHRASE GENERATOR =====
function generatePassphraseText(wordCount, includeNumbers, includeSymbols) {
  const symbols = ['!', '@', '#', '$', '%', '&', '*', '?'];
  const separator = '-';
  let words = [];

  const used = new Set();
  while (words.length < wordCount) {
    const w = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    if (!used.has(w)) {
      used.add(w);
      words.push(w.charAt(0).toUpperCase() + w.slice(1));
    }
  }

  let phrase = words.join(separator);
  if (includeNumbers) {
    phrase += separator + (Math.floor(Math.random() * 90) + 10);
  }
  if (includeSymbols) {
    phrase += symbols[Math.floor(Math.random() * symbols.length)];
  }
  return phrase;
}

function generatePassphrase() {
  const wordCount = parseInt(document.getElementById('phraseWords').value);
  const opts = getActiveOpts('phraseOptions');

  const results = [];
  for (let i = 0; i < 3; i++) {
    let pw, analysis, attempts = 0;
    do {
      pw = generatePassphraseText(wordCount, opts.numbers, opts.symbols);
      analysis = analyzePassword(pw);
      attempts++;
    } while (analysis.score < 6 && attempts < 20);
    results.push({ pw, analysis });
  }
  renderResults('passphraseResults', results, true);
}

// ===== RENDER RESULTS =====
function renderResults(containerId, results, showLength = false) {
  const container = document.getElementById(containerId);
  container.innerHTML = results.map((r, i) => {
    const badgeClass = r.analysis.score >= 9 ? 'very-strong' : r.analysis.score >= 7 ? 'strong' : 'medium';
    return `
      <div class="card gen-result">
        <div class="gen-password" id="genPw${containerId}${i}">${escapeHtml(r.pw)}</div>
        <div>
          <span class="gen-strength-badge ${badgeClass}">${r.analysis.strengthLabel}</span>
          ${showLength ? `<span style="font-size:0.8rem;color:var(--text-muted);margin-left:8px">${r.pw.length} chars</span>` : ''}
        </div>
        <div class="gen-actions">
          <button class="btn btn-secondary btn-sm" onclick="copyPassword('${escapeAttr(r.pw)}')" aria-label="Copy password">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copy
          </button>
          <button class="btn btn-secondary btn-sm" onclick="usePassword('${escapeAttr(r.pw)}')" aria-label="Use this password">Use</button>
        </div>
      </div>
    `;
  }).join('');

  // Scroll to results
  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\\/g, '\\\\');
}

// ===== COPY =====
function copyPassword(pw) {
  navigator.clipboard.writeText(pw).then(() => {
    showToast('Password copied');
  }).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = pw;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('Password copied');
  });
}

function usePassword(pw) {
  navigate('checker');
  const input = document.getElementById('checkerInput');
  input.value = pw;
  input.type = 'password';
  input.dispatchEvent(new Event('input'));
}

// ===== TOAST =====
function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toastText').textContent = msg;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 2200);
}

// ===== INIT =====
// Close mobile menu on outside click
document.addEventListener('click', function(e) {
  const nav = document.getElementById('mobileNav');
  const btn = document.querySelector('.mobile-menu-btn');
  if (nav.classList.contains('open') && !nav.contains(e.target) && !btn.contains(e.target)) {
    nav.classList.remove('open');
  }
});

// Keyboard navigation for feature cards
document.querySelectorAll('.feature-card').forEach(card => {
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.click();
    }
  });
});
