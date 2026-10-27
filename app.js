'use strict';
const KEY = 'sl5x5.v1';
const MAIN_NAMES = { squat: 'Kniebeuge', bench: 'Bankdrücken', row: 'Langhantelrudern', ohp: 'Schulterdrücken', deadlift: 'Kreuzheben' };
const PLAN = { A: [['squat', 5], ['bench', 5], ['row', 5]], B: [['squat', 5], ['ohp', 5], ['deadlift', 1]] };

const defaults = () => ({
  customNames: {},
  weights: { squat: 40, bench: 30, row: 30, ohp: 20, deadlift: 50 },
  steps: { other: 2.5, deadlift: 5 },
  fails: { squat: 0, bench: 0, row: 0, ohp: 0, deadlift: 0 },
  deloads: { squat: 0, bench: 0, row: 0, ohp: 0, deadlift: 0 },
  next: 'A', history: [], session: null,
  settings: { rest: 180, autoTimer: true }
});

const load = () => {
  try { 
    const d = JSON.parse(localStorage.getItem(KEY)); 
    return d ? { 
      ...defaults(), 
      ...d, 
      customNames: { ...(d.customNames || {}) },
      weights: { ...defaults().weights, ...(d.weights || {}) },
      steps: { ...defaults().steps, ...(d.steps || {}) },
      fails: { ...defaults().fails, ...(d.fails || {}) },
      deloads: { ...defaults().deloads, ...(d.deloads || {}) }
    } : defaults(); 
  } catch (e) { 
    console.error("Ladefehler:", e);
    return defaults(); 
  }
};

let S = load();

const save = () => {
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { alert('Speichern fehlgeschlagen: ' + e.message); }
};

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fw = w => String(w).replace('.', ',');

const getExerciseName = id => MAIN_NAMES[id] || S.customNames[id] || id;
const isMainExercise = id => MAIN_NAMES.hasOwnProperty(id);

const formatDateTime = isoOrTimestamp => {
  const d = new Date(isoOrTimestamp);
  if (isNaN(d.getTime())) return '';
  const dateStr = d.toLocaleDateString('de-AT', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = d.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' });
  return `${dateStr}, ${timeStr} Uhr`;
};

const getStep = id => (id === 'deadlift' ? (S.steps.deadlift ?? 5) : (S.steps.other ?? 2.5));

/* ---------- Pausentimer ---------- */
let restEnd = 0, restTotal = 0, tick = null, ctx = null, lock = null;
let showRestMenu = false;

const PRESETS = [
  { label: '30s', sec: 30 },
  { label: '1m', sec: 60 },
  { label: '1:30', sec: 90 },
  { label: '2m', sec: 120 },
  { label: '3m', sec: 180 },
  { label: '4m', sec: 240 },
  { label: '5m', sec: 300 }
];

function startRest() {
  if (!S.settings.autoTimer) return;
  try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); ctx.resume && ctx.resume(); } catch {}
  restTotal = S.settings.rest;
  restEnd = Date.now() + restTotal * 1000;
  showRestMenu = false;
  clearInterval(tick); tick = setInterval(updateTimer, 250); updateTimer();
}

function adjustRest(newSec) {
  if (!restEnd) return;
  const diff = newSec - restTotal;
  restEnd += diff * 1000;
  restTotal = newSec;
  updateTimer();
}

function stopRest() { restEnd = 0; restTotal = 0; showRestMenu = false; clearInterval(tick); updateTimer(); }

function updateTimer() {
  const left = Math.ceil((restEnd - Date.now()) / 1000);
  if (restEnd && left <= 0) { stopRest(); beep(); return; }
  const timerEl = $('#timer');
  if (timerEl) timerEl.hidden = !restEnd;
  const ttEl = $('#tt');
  if (restEnd && ttEl) {
    const timeFormatted = `Pause ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
    
    if (!showRestMenu) {
      ttEl.innerHTML = `<span data-a="togglerestmenu" style="font-weight: 700; cursor: pointer;" title="Klicken, um Pausenzeit zu ändern">${timeFormatted}</span>`;
    } else {
      const buttonsHtml = PRESETS
        .filter(p => p.sec !== S.settings.rest)
        .map(p => {
          const isActive = p.sec === restTotal;
          const bgStyle = isActive 
            ? 'background: #fff; color: #000; border: 1px solid #000;' 
            : 'background: rgba(255,255,255,0.25); color: #fff; border: none;';
          return `<button data-a="adjustrest" data-sec="${p.sec}" style="${bgStyle} padding: 3px 7px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold;">${p.label}</button>`;
        })
        .join(' ');

      ttEl.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 4px; width: 100%;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span data-a="togglerestmenu" style="font-weight: 700; cursor: pointer;" title="Schließen">${timeFormatted} ✕</span>
          </div>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">${buttonsHtml}</div>
        </div>
      `;
    }
  }
}

function beep() {
  try {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.value = 880; g.gain.value = 0.2; o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + 0.5);
  } catch {}
  if (navigator.vibrate) navigator.vibrate([250, 100, 250]);
}

/* ---------- Bildschirm anlassen ---------- */
async function wake() {
  try {
    if (S.session && 'wakeLock' in navigator && !lock) {
      lock = await navigator.wakeLock.request('screen');
      lock.addEventListener('release', () => { lock = null; });
    }
  } catch {}
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') wake(); });

/* ---------- Views ---------- */
let tab = 'train';

function vTrain() {
  const s = S.session;
  if (s) {
    const isAssistantOrSuperset = s.type === 'Assistenz' || s.type === 'Supersatz';
    return `<h2>Workout ${s.type}</h2>` + s.ex.map((x, i) => `
      <section class="card" ${isAssistantOrSuperset ? 'style="border-left: 4px solid var(--accent);"' : ''}>
        <div class="row">
          <b>${esc(x.name)}</b>
          <span class="w">
            <button data-a="w" data-i="${i}" data-d="-1" aria-label="Weniger Gewicht">−</button>
            <output data-a="editw" data-i="${i}" style="cursor:pointer;" title="Gewicht manuell ändern">${fw(x.weight)} kg</output>
            <button data-a="w" data-i="${i}" data-d="1" aria-label="Mehr Gewicht">+</button>
          </span>
        </div>
        <div class="sets">${x.sets.map((v, j) => {
          const val = (v === null || v === undefined || isNaN(v)) ? 0 : v;
          if (isAssistantOrSuperset) {
            const isTargetRange = val >= 8 && val <= 12;
            const bg = isTargetRange 
              ? 'background: var(--green); color: #fff;' 
              : (val > 0 ? 'background: var(--accent); color: #fff;' : 'background: var(--line); color: var(--mute);');
            return `<button class="set" style="${bg}" data-a="assistsatz" data-i="${i}" data-j="${j}" title="Klicken zum Erhöhen, Halten zum Zurücksetzen">${val}</button>`;
          } else {
            const bg = val === 5 ? 'background: var(--green); border-color: var(--green); color: #fff;' : (val > 0 ? 'background: var(--red); border-color: var(--red); color: #fff;' : '');
            return `<button class="set" style="${bg}" data-a="set" data-i="${i}" data-j="${j}">${val}</button>`;
          }
        }).join('')}</div>
        ${isAssistantOrSuperset ? `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
            <button class="link" data-a="addset" data-i="${i}" style="font-size: 12px;">+ Satz hinzufügen</button>
            <button class="link danger" data-a="delexercise" data-i="${i}" style="font-size: 12px;">Übung entfernen</button>
          </div>
        ` : ''}
      </section>`).join('') +
      (isAssistantOrSuperset ? `
        <button class="btn" data-a="addexercise" style="margin-bottom: 8px;">+ Weitere Übung hinzufügen</button>
        <button class="btn" data-a="addsuperset" style="margin-bottom: 8px; background: var(--line); color: var(--text);">+ Als Supersatz hinzufügen</button>
      ` : '') +
      `<button class="primary" data-a="finish">Workout beenden</button>
       <button class="link danger" data-a="cancel">Workout verwerfen</button>`;
  }

  const t = S.next;
  return `
  <section class="card">
    <small>Nächstes Workout</small><h2>Workout ${t}</h2>
    <ul>${PLAN[t].map(([id, n]) => {
      const failsCount = S.fails[id] || 0;
      const deloadsCount = S.deloads[id] || 0;
      let infoParts = [];
      if (failsCount > 0) infoParts.push(`Fehlversuche ${failsCount}/3`);
      if (deloadsCount > 0) infoParts.push(`Deloads: ${deloadsCount}`);
      const infoStr = infoParts.length > 0 ? ` <small>(${infoParts.join(', ')})</small>` : '';
      return `<li><span>${MAIN_NAMES[id]}${infoStr}</span><b>${n}×5 · ${fw(S.weights[id])} kg</b></li>`;
    }).join('')}</ul>
    <button class="primary" data-a="start">Training starten</button>
    <button class="link" data-a="swap">Stattdessen Workout ${t === 'A' ? 'B' : 'A'}</button>
  </section>

  <section class="card" style="margin-top: 16px;">
    <h3>Freies Training & Assistenz</h3>
    <p style="font-size: 13px; color: var(--mute); margin-bottom: 12px;">Trainiere Zusätze oder Supersätze unabhängig vom A/B-Schema.</p>
    <button class="btn primary" data-a="startassistant">+ Assistenzübung starten</button>
  </section>`;
}

function vHist() {
  if (!S.history.length) return '<p class="empty">Noch keine Einträge. Dein erstes Workout erscheint hier.</p>';
  return S.history.map((h, hi) => `
    <section class="card">
      <div class="row"><b>Workout ${esc(h.type)}</b><small>${formatDateTime(h.date)}</small></div>
      ${h.ex.map((x, xi) => {
        const isMain = h.type === 'A' || h.type === 'B' || isMainExercise(x.id);
        return `
        <div class="line" style="flex-direction: column; align-items: stretch; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span><b>${esc(x.name)}</b></span>
            <output data-a="edithistw" data-hi="${hi}" data-xi="${xi}" style="cursor:pointer; font-weight:700;" title="Gewicht anpassen">${fw(x.weight)} kg</output>
          </div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${x.sets.map((v, sj) => {
              const val = (v === null || v === undefined || isNaN(v)) ? 0 : v;
              let bg = 'background: var(--line); color: var(--mute);';
              if (isMain) {
                if (val === 5) bg = 'background: var(--green); color: #fff;';
                else if (val > 0) bg = 'background: var(--red); color: #fff;';
              } else {
                if (val >= 8 && val <= 12) bg = 'background: var(--green); color: #fff;';
                else if (val > 0) bg = 'background: var(--accent); color: #fff;';
              }
              return `<button style="display:inline-block; width:26px; height:26px; line-height:26px; text-align:center; border-radius:6px; font-weight:700; font-size:13px; font-variant-numeric:tabular-nums; border:none; cursor:pointer; ${bg}" data-a="edithistset" data-hi="${hi}" data-xi="${xi}" data-sj="${sj}" title="Satz anpassen">${val}</button>`;
            }).join('')}
          </div>
        </div>`;
      }).join('')}
      <button class="link danger" data-a="del" data-id="${h.id}" style="margin-top: 12px;">Eintrag löschen</button>
    </section>`).join('');
}

function vSetup() {
  const mainWeightsHtml = Object.keys(MAIN_NAMES).map(id => `
    <label class="line">
      <span>${MAIN_NAMES[id]}</span>
      <span><input type="number" inputmode="decimal" step="0.5" min="0" value="${S.weights[id] ?? 0}" name="w_${id}"> kg</span>
    </label>`).join('');

  const customKeys = Object.keys(S.customNames);
  const customNamesHtml = customKeys.length === 0 
    ? '<p style="font-size: 13px; color: var(--mute);">Noch keine Assistenzübungen angelegt.</p>' 
    : customKeys.map(id => `
      <div class="line" style="margin-bottom: 8px; align-items: center;">
        <input type="text" value="${esc(S.customNames[id])}" data-editcustom="${id}" style="flex:1; padding: 6px; border-radius: 4px; border: 1px solid var(--line); background: var(--card); color: var(--text);">
        <button class="btn danger" data-a="delcustom" data-id="${id}" style="padding: 6px 10px; margin-left: 8px;">Löschen</button>
      </div>`).join('');

  return `
  <form id="setup-form">
    <section class="card">
      <h3>🏋️‍♂️ Hauptübungen (StrongLifts 5x5)</h3>
      <p style="font-size: 12px; color: var(--mute); margin-bottom: 10px;">Aktuelle Gewichte für den automatischen A/B-Plan.</p>
      ${mainWeightsHtml}
    </section>

    <section class="card" style="margin-top: 16px;">
      <h3>💪 Eigene Übungen & Assistenz</h3>
      <p style="font-size: 12px; color: var(--mute); margin-bottom: 10px;">Verwalte hier deine zusätzlichen Übungen für freie Workouts.</p>
      ${customNamesHtml}
      <button type="button" class="btn" data-a="newcustom" style="margin-top: 10px;">+ Neue Assistenzübung hinzufügen</button>
    </section>

    <section class="card" style="margin-top: 16px;">
      <h3>Stufen & Steigerung</h3>
      <label class="line"><span>Alle Übungen außer Kreuzheben</span><span><input type="number" inputmode="decimal" step="0.5" min="0" value="${S.steps.other ?? 2.5}" name="step_other"> kg</span></label>
      <label class="line"><span>Kreuzheben</span><span><input type="number" inputmode="decimal" step="0.5" min="0" value="${S.steps.deadlift ?? 5}" name="step_deadlift"> kg</span></label>
    </section>

    <section class="card" style="margin-top: 16px;">
      <h3>Pause</h3>
      <label class="line"><span>Timer nach jedem Satz starten</span><input type="checkbox" name="auto" ${S.settings.autoTimer ? 'checked' : ''}></label>
      <label class="line"><span>Pausenlänge (Standard)</span><span><input type="number" inputmode="numeric" min="0" step="10" value="${S.settings.rest}" name="rest"> s</span></label>
    </section>

    <button type="submit" class="primary" style="margin-top: 16px;">Einstellungen speichern</button>
  </form>

  <section class="card" style="margin-top: 16px;">
    <h3>Daten</h3>
    <button class="btn" data-a="csv">Verlauf als CSV exportieren</button>
    <button class="btn" data-a="json">Sicherung als JSON speichern</button>
    <label class="btn">Sicherung wiederherstellen<input type="file" id="imp" accept=".json,application/json" hidden></label>
    <button class="btn danger" data-a="reset">Alle Daten löschen</button>
  </section>`;
}

function render() {
  try {
    const viewEl = $('#view');
    if (!viewEl) return;
    const views = { train: vTrain, hist: vHist, setup: vSetup };
    viewEl.innerHTML = views[tab] ? views[tab]() : '<p>Ansicht nicht gefunden</p>';
    document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  } catch (e) {
    console.error("Render-Fehler:", e);
    const viewEl = $('#view');
    if (viewEl) viewEl.innerHTML = `<p style="color:red; padding:20px;">Fehler beim Rendern: ${e.message}</p>`;
  }
}

/* ---------- Export / Import ---------- */
function download(name, text, mime) {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const csvText = () => {
  const q = v => '"' + String(v).replace(/"/g, '""') + '"';
  const rows = ['Datum_Uhrzeit;Workout;Übung;Satz;Wiederholungen;Gewicht_kg'];
  S.history.forEach(h => {
    const dtFormatted = new Date(h.date).toLocaleString('de-AT');
    h.ex.forEach(x => x.sets.forEach((v, j) =>
      rows.push([q(dtFormatted), h.type, q(x.name), j + 1, (v === null || v === undefined) ? 0 : v, String(x.weight).replace('.', ',')].join(';'))));
  });
  return '\ufeff' + rows.join('\n');
};
const jsonText = () => JSON.stringify({ app: 'sl5x5', version: 1, exported: new Date().toISOString(),
  customNames: S.customNames, weights: S.weights, steps: S.steps, fails: S.fails, deloads: S.deloads, next: S.next, history: S.history, settings: S.settings }, null, 2);

const normalize = h => ({
  id: h.id, date: h.date, type: h.type,
  ex: (h.ex || h.exercises || []).map(x => ({
    id: x.id, name: x.name, weight: x.weight, target: x.target || x.targetReps || 5, sets: x.sets || x.completedSets || []
  }))
});
async function importFile(file) {
  if (!file) return;
  try {
    const d = JSON.parse(await file.text());
    if (!Array.isArray(d.history)) throw new Error('kein Verlauf gefunden');
    if (!confirm('Aktuelle Daten durch die Sicherung ersetzen?')) return;
    const st = d.settings || {};
    S = { 
      ...defaults(), 
      customNames: { ...(d.customNames || {}) },
      weights: { ...defaults().weights, ...(d.weights || {}) }, 
      steps: { ...defaults().steps, ...(d.steps || {}) }, 
      fails: { ...defaults().fails, ...(d.fails || {}) },
      deloads: { ...defaults().deloads, ...(d.deloads || {}) },
      next: d.next || d.nextWorkout || 'A', 
      history: d.history.map(normalize),
      settings: { rest: st.rest || st.defaultRest || 180, autoTimer: st.autoTimer !== false } 
    };
    save(); render(); alert('Sicherung wiederhergestellt.');
  } catch (e) { alert('Import fehlgeschlagen: ' + e.message); }
}

/* ---------- Übungs-Auswahl-Dialog ---------- */
function promptExerciseChoice(callback) {
  const keys = Object.keys(S.customNames);
  if (keys.length === 0) {
    alert('Bitte lege zuerst in den Einstellungen unter „Eigene Übungen & Assistenz“ mindestens eine Übung an.');
    return;
  }
  const optionsHtml = keys.map(id => `<button type="button" class="btn" data-pick="${id}" style="margin-bottom: 6px; width: 100%; text-align: left; background: var(--card); border: 1px solid var(--line);">${esc(S.customNames[id])}</button>`).join('');
  
  const dialog = document.createElement('div');
  dialog.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; justify-content:center; align-items:center; z-index:9999;';
  dialog.innerHTML = `
    <div class="card" style="width: 90%; max-width: 400px; max-height: 80vh; overflow-y: auto;">
      <h3>Übung auswählen</h3>
      <div style="margin: 12px 0;">${optionsHtml}</div>
      <button type="button" class="link danger" id="cancel-picker" style="width:100%;">Abbrechen</button>
    </div>
  `;
  document.body.append(dialog);

  dialog.addEventListener('click', e => {
    const btn = e.target.closest('[data-pick]');
    if (btn) {
      const id = btn.dataset.pick;
      dialog.remove();
      callback(id);
    } else if (e.target.id === 'cancel-picker' || e.target === dialog) {
      dialog.remove();
    }
  });
}

/* ---------- Long Press / Zähler Logik ---------- */
let pressTimer = null;
let isLongPress = false;

document.addEventListener('pointerdown', e => {
  const b = e.target.closest('[data-a="set"], [data-a="assistsatz"]');
  if (!b) return;
  isLongPress = false;
  
  const i = +b.dataset.i, j = +b.dataset.j;
  const x = S.session.ex[i];
  let v = x.sets[j];
  if (v === null || v === undefined || isNaN(v)) v = 0;

  const isAssist = b.dataset.a === 'assistsatz';
  const holdTime = isAssist ? 600 : 3000;

  pressTimer = setTimeout(() => {
    isLongPress = true;
    if (isAssist) {
      x.sets[j] = 0;
      save();
      render();
      stopRest();
    } else {
      const input = prompt('Wiederholungen manuell eingeben (0 bis 20):', v);
      if (input !== null) {
        let num = parseInt(input, 10);
        if (!isNaN(num) && num >= 0 && num <= 20) {
          x.sets[j] = num;
          save();
          render();
          if (num === 0) stopRest(); else startRest();
        } else {
          alert('Bitte eine gültige Zahl zwischen 0 und 20 eingeben.');
        }
      }
    }
  }, holdTime);
});

document.addEventListener('pointerup', () => { if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; } });
document.addEventListener('pointercancel', () => { if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; } });

const A = {
  start() {
    const t = S.next;
    S.session = { type: t, start: Date.now(),
      ex: PLAN[t].map(([id, n]) => ({ id, name: MAIN_NAMES[id], weight: S.weights[id] || 0, target: 5, sets: Array(n).fill(0) })) };
    save(); wake(); render();
  },
  startassistant() {
    promptExerciseChoice(id => {
      const exerciseName = getExerciseName(id);
      const weight = S.weights[id] || 0;

      S.session = {
        type: 'Assistenz',
        start: Date.now(),
        ex: [{ id, name: exerciseName, weight, target: 10, sets: [0, 0, 0] }]
      };
      save(); wake(); render();
    });
  },
  addexercise() {
    promptExerciseChoice(id => {
      const exerciseName = getExerciseName(id);
      const weight = S.weights[id] || 0;

      S.session.ex.push({ id, name: exerciseName, weight, target: 10, sets: [0, 0, 0] });
      save(); render();
    });
  },
  addsuperset() {
    promptExerciseChoice(id => {
      const exerciseName = getExerciseName(id);
      const weight = S.weights[id] || 0;

      S.session.type = 'Supersatz';
      S.session.ex.push({ id, name: exerciseName, weight, target: 10, sets: [0, 0, 0] });
      save(); render();
    });
  },
  addset(b) {
    const i = +b.dataset.i;
    S.session.ex[i].sets.push(0);
    save(); render();
  },
  delexercise(b) {
    const i = +b.dataset.i;
    if (S.session.ex.length <= 1) {
      if (confirm('Das ist die letzte Übung. Möchtest du das gesamte Workout verwerfen?')) {
        A.cancel();
      }
      return;
    }
    if (confirm(`Übung "${S.session.ex[i].name}" aus diesem Workout entfernen?`)) {
      S.session.ex.splice(i, 1);
      // Wenn nur noch eine Übung übrig bleibt und es ein Supersatz war, wieder zu Assistenz umbenennen
      if (S.session.ex.length === 1 && S.session.type === 'Supersatz') {
        S.session.type = 'Assistenz';
      }
      save();
      render();
    }
  },
  newcustom() {
    const name = prompt('Name der neuen Assistenzübung:');
    if (!name) return;
    const id = 'custom_' + Date.now();
    S.customNames[id] = name;
    S.weights[id] = 0;
    save();
    render();
  },
  delcustom(b) {
    const id = b.dataset.id;
    delete S.customNames[id];
    delete S.weights[id];
    save();
    render();
  },
  swap() { S.next = S.next === 'A' ? 'B' : 'A'; save(); render(); },
  set(b) {
    if (isLongPress) return;
    const now = Date.now();
    const i = +b.dataset.i, j = +b.dataset.j;
    const x = S.session.ex[i];
    let v = x.sets[j];
    if (v === null || v === undefined || isNaN(v)) v = 0;

    if (now - (b._lastClick || 0) < 300) {
      if (v === 0) {
        x.sets[j] = 5;
        save();
        render();
        startRest();
      } else {
        x.sets[j] = 0;
        save();
        render();
        stopRest();
      }
      b._lastClick = 0;
      return;
    }
    b._lastClick = now;
  },
  assistsatz(b) {
    if (isLongPress) return;
    const i = +b.dataset.i, j = +b.dataset.j;
    const x = S.session.ex[i];
    let v = x.sets[j];
    if (v === null || v === undefined || isNaN(v)) v = 0;

    x.sets[j] = (v + 1) % 21;
    save();
    render();
    if (x.sets[j] > 0) startRest(); else stopRest();
  },
  w(b) {
    const x = S.session.ex[+b.dataset.i];
    const stepVal = getStep(x.id);
    x.weight = Math.max(0, x.weight + (+b.dataset.d) * stepVal);
    S.weights[x.id] = x.weight;
    save(); render();
  },
  editw(out) {
    const x = S.session.ex[+out.dataset.i];
    const input = prompt('Gewicht in kg manuell eingeben:', x.weight);
    if (input !== null) {
      let val = parseFloat(input.replace(',', '.'));
      if (!isNaN(val) && val >= 0) {
        x.weight = val;
        S.weights[x.id] = val;
        save();
        render();
      } else {
        alert('Bitte eine gültige Zahl eingeben.');
      }
    }
  },
  finish() {
    const s = S.session;
    if (s.type === 'A' || s.type === 'B') {
      if (s.ex.some(x => x.sets.some(v => v === null || v !== 5)) && !confirm('Nicht alle Sätze sind auf 5. Trotzdem beenden?')) return;
      s.ex.forEach(x => {
        if (x.sets.every(v => v === null || v === 0)) return;
        const stepVal = getStep(x.id);
        if (x.sets.every(v => v === 5)) { 
          S.weights[x.id] = x.weight + stepVal; 
          S.fails[x.id] = 0; 
        } else {
          S.weights[x.id] = x.weight; 
          S.fails[x.id]++;
          if (S.fails[x.id] >= 3) { 
            S.weights[x.id] = Math.round(x.weight * 0.9 / 2.5) * 2.5; 
            S.fails[x.id] = 0;
            S.deloads[x.id] = (S.deloads[x.id] || 0) + 1;
          }
        }
      });
      S.next = s.type === 'A' ? 'B' : 'A';
    } else {
      s.ex.forEach(x => {
        S.weights[x.id] = x.weight;
      });
    }
    S.history.unshift({ id: Date.now(), date: new Date(s.start || Date.now()).toISOString(), type: s.type, ex: s.ex });
    S.session = null;
    save(); stopRest(); if (lock) lock.release(); render();
  },
  cancel() { if (confirm('Dieses Workout verwerfen?')) { S.session = null; save(); stopRest(); if (lock) lock.release(); render(); } },
  togglerestmenu() {
    showRestMenu = !showRestMenu;
    updateTimer();
  },
  adjustrest(b) {
    const sec = +b.dataset.sec;
    if (!isNaN(sec)) adjustRest(sec);
  },
  edithistw(el) {
    const hi = +el.dataset.hi, xi = +el.dataset.xi;
    const x = S.history[hi].ex[xi];
    const input = prompt(`Gewicht für ${x.name} in kg anpassen:`, x.weight);
    if (input !== null) {
      let val = parseFloat(input.replace(',', '.'));
      if (!isNaN(val) && val >= 0) {
        x.weight = val;
        save();
        render();
      } else {
        alert('Bitte eine gültige Zahl eingeben.');
      }
    }
  },
  edithistset(btn) {
    const hi = +btn.dataset.hi, xi = +btn.dataset.xi, sj = +btn.dataset.sj;
    const x = S.history[hi].ex[xi];
    const currentVal = x.sets[sj] ?? 0;
    const input = prompt(`Wiederholungen für Satz ${sj + 1} (${x.name}, 0-20):`, currentVal);
    if (input !== null) {
      let num = parseInt(input, 10);
      if (!isNaN(num) && num >= 0 && num <= 20) {
        x.sets[sj] = num;
        save();
        render();
      } else {
        alert('Bitte eine gültige Zahl zwischen 0 und 20 eingeben.');
      }
    }
  },
  del(b) { if (confirm('Eintrag löschen? Die Gewichte bleiben unverändert.')) { S.history = S.history.filter(h => String(h.id) !== b.dataset.id); save(); render(); } },
  stoprest() { stopRest(); },
  csv() { download(`stronglifts_${stamp()}.csv`, csvText(), 'text/csv;charset=utf-8'); },
  json() { download(`stronglifts_backup_${stamp()}.json`, jsonText(), 'application/json'); },
  reset() { if (confirm('Wirklich ALLE Daten löschen?')) { localStorage.removeItem(KEY); S = defaults(); stopRest(); render(); } }
};

document.addEventListener('click', e => {
  const b = e.target.closest('[data-a],[data-tab]');
  if (!b) return;
  if (b.dataset.tab) { tab = b.dataset.tab; render(); return; }
  const action = b.dataset.a;
  if (A[action]) A[action](b);
});

// Eigene Übungsnamen live speichern
document.addEventListener('input', e => {
  const input = e.target.closest('[data-editcustom]');
  if (!input) return;
  const id = input.dataset.editcustom;
  S.customNames[id] = input.value;
  save();
});

document.addEventListener('submit', e => {
  if (e.target.id === 'setup-form') {
    e.preventDefault();
    const fdData = new FormData(e.target);
    
    Object.keys(MAIN_NAMES).forEach(id => {
      const val = parseFloat(String(fdData.get(`w_${id}`)).replace(',', '.'));
      if (!isNaN(val) && val >= 0) {
        S.weights[id] = val;
      }
    });

    const stepOther = parseFloat(String(fdData.get('step_other')).replace(',', '.'));
    if (!isNaN(stepOther) && stepOther >= 0) S.steps.other = stepOther;

    const stepDeadlift = parseFloat(String(fdData.get('step_deadlift')).replace(',', '.'));
    if (!isNaN(stepDeadlift) && stepDeadlift >= 0) S.steps.deadlift = stepDeadlift;

    const restVal = parseInt(fdData.get('rest'), 10);
    if (!isNaN(restVal) && restVal >= 0) S.settings.rest = restVal;

    S.settings.autoTimer = fdData.get('auto') === 'on';

    save();
    render();
    alert('Einstellungen gespeichert.');
  }
});

document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'imp') { importFile(t.files[0]); t.value = ''; }
});

// App starten
try {
  render();
  wake();
} catch (e) {
  console.error("Start-Fehler:", e);
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(console.error);
}
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persist();
}