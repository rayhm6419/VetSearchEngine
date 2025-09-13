export function logInfo(label: string, meta: Record<string, any>) {
  if (process.env.NODE_ENV === 'production') return;
  try {
    // avoid logging secrets
    const safe: Record<string, any> = { ...meta };
    if (safe.key) delete safe.key;
    console.log(label, safe);
  } catch {}
}

export function logError(label: string, meta: Record<string, any>) {
  if (process.env.NODE_ENV === 'production') return;
  try {
    const safe: Record<string, any> = { ...meta };
    if (safe.key) delete safe.key;
    console.error(label, safe);
  } catch {}
}

