const { test } = require('node:test');
const assert = require('node:assert/strict');
const { generateGuideAnswer } = require('./generate-guide-answer');

function mock(responses) {
  const calls = [];
  return {
    calls,
    models: { generateContent: async request => {
      calls.push(request);
      return responses.shift();
    } }
  };
}
const response = (text, finishReason) => ({ text, candidates: [{ finishReason }] });
const input = { contents: [{ role: 'user', parts: [{ text: 'Describe the hall.' }] }], systemPrompt: 'Tour guide.' };

test('returns a complete answer without retrying', async () => {
  const ai = mock([response('A complete answer.', 'STOP')]);
  assert.equal(await generateGuideAnswer(ai, input), 'A complete answer.');
  assert.equal(ai.calls.length, 1);
  assert.equal(ai.calls[0].config.maxOutputTokens, 4096);
});

test('retries truncated answers with more capacity and original context', async () => {
  const ai = mock([response('The hall is a', 'MAX_TOKENS'), response('The hall is a meeting space.', 'STOP')]);
  assert.equal(await generateGuideAnswer(ai, input), 'The hall is a meeting space.');
  assert.equal(ai.calls.length, 2);
  assert.equal(ai.calls[1].config.maxOutputTokens, 8192);
  assert.deepEqual(ai.calls[1].contents, input.contents);
});

test('does not return an incomplete answer after exhausting retry', async () => {
  const ai = mock([response('partial', 'MAX_TOKENS'), response('still partial', 'MAX_TOKENS')]);
  await assert.rejects(generateGuideAnswer(ai, input), /output limit/);
  assert.equal(ai.calls.length, 2);
});

test('rejects empty and blocked responses', async () => {
  for (const value of [response('', 'STOP'), response('partial', 'SAFETY')]) {
    const ai = mock([value]);
    await assert.rejects(generateGuideAnswer(ai, input));
    assert.equal(ai.calls.length, 1);
  }
});
