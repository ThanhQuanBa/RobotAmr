import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createVoiceSession } from './voiceSession.js';

function setup() {
  let now = 0;
  let id = 0;
  const timers = new Map();
  const sent = [];
  const errors = [];
  const recognition = { start() {}, stop() {}, abort() {} };
  const session = createVoiceSession({ recognition,
    onTranscript() {}, onClose() {}, onSubmit: text => sent.push(text),
    onError: error => errors.push(error),
    schedule: (fn, ms) => { timers.set(++id, { fn, at: now + ms }); return id; },
    cancel: key => timers.delete(key)
  });
  const advance = ms => {
    const end = now + ms;
    while (true) {
      const next = [...timers].sort((a, b) => a[1].at - b[1].at)[0];
      if (!next || next[1].at > end) break;
      now = next[1].at;
      timers.delete(next[0]);
      next[1].fn();
    }
    now = end;
  };
  const result = (text, isFinal = false) => recognition.onresult({
    results: [Object.assign([{ transcript: text }], { isFinal })]
  });
  return { recognition, session, advance, result, sent, errors };
}

test('silence submits once and uses the final result delivered during stop', () => {
  const t = setup();
  t.result('where');
  t.advance(1999);
  assert.deepEqual(t.sent, []);
  t.advance(1);
  t.result('where is the museum', true);
  t.recognition.onend();
  t.advance(1000);
  t.recognition.onend();
  assert.deepEqual(t.sent, ['where is the museum']);
});

test('continuing speech resets silence and interim text is retained as fallback', () => {
  const t = setup();
  t.result('where');
  t.advance(1500);
  t.result('where is the garden');
  t.advance(1500);
  assert.deepEqual(t.sent, []);
  t.advance(1000);
  assert.deepEqual(t.sent, ['where is the garden']);
});

test('engine restart preserves earlier words and accepts the next phrase', () => {
  const t = setup();
  t.result('museum', true);
  t.advance(500);
  t.recognition.onend();
  t.result('opening hours', true);
  t.advance(2500);
  assert.deepEqual(t.sent, ['museum opening hours']);
});

test('cancel, recognition errors and empty input never submit', () => {
  for (const action of ['cancel', 'error', 'empty']) {
    const t = setup();
    if (action !== 'empty') t.result('museum');
    if (action === 'cancel') t.session.cancel();
    if (action === 'error') t.recognition.onerror({ error: 'not-allowed' });
    t.recognition.onend();
    t.advance(5000);
    assert.deepEqual(t.sent, []);
  }
});

test('manual send and silence racing still submit once', () => {
  const t = setup();
  t.result('museum');
  t.session.submit();
  t.session.submit();
  t.advance(5000);
  assert.deepEqual(t.sent, ['museum']);
});
