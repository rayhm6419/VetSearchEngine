export async function* chunkText(text: string, chunkSize = 20, delayMs = 35): AsyncGenerator<string> {
  let i = 0;
  while (i < text.length) {
    const next = text.slice(i, i + chunkSize);
    i += next.length;
    await new Promise((r) => setTimeout(r, delayMs));
    yield next;
  }
}
