// Retry the complete answer rather than exposing or saving a truncated turn.
async function generateGuideAnswer(ai, { contents, systemPrompt }) {
  for (const maxOutputTokens of [4096, 8192]) {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents,
      config: {
        systemInstruction: systemPrompt + '\nAnswer all parts of the question in up to 2-3 short paragraphs. Finish every sentence and do not leave the answer incomplete.',
        temperature: 0.7,
        maxOutputTokens
      }
    });
    const reason = response.candidates?.[0]?.finishReason;
    if (reason === 'MAX_TOKENS') continue;
    if (reason && reason !== 'STOP') {
      throw new Error(`AI answer did not complete: ${reason}`);
    }
    const text = response.text?.trim();
    if (!text) throw new Error('AI returned an empty answer');
    return text;
  }
  throw new Error('AI answer exceeded the output limit after retry');
}

module.exports = { generateGuideAnswer };
