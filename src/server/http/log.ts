export async function withRequestLog<T>(
  label: string,
  handler: () => Promise<T>
): Promise<T> {
  const dev = process.env.NODE_ENV !== 'production';
  const t0 = dev ? Date.now() : 0;
  try {
    const result = await handler();
    if (dev) console.log(`${label} ok in ${Date.now() - t0}ms`);
    return result;
  } catch (e) {
    if (dev) console.log(`${label} error in ${Date.now() - t0}ms`);
    throw e;
  }
}

