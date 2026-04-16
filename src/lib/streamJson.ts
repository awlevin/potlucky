/**
 * Read a streamed text response fully, decoding to string.
 * The server may emit `__ERROR__:<msg>` to signal errors mid-stream.
 */
export async function readStreamToString(
  res: Response,
  onChunk?: (total: string) => void
): Promise<string> {
  if (!res.body) throw new Error("Response has no body");
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    full += decoder.decode(value, { stream: true });
    onChunk?.(full);
  }
  if (full.includes("__ERROR__:")) {
    const errMsg = full.split("__ERROR__:").pop() ?? "Unknown error";
    throw new Error(errMsg);
  }
  return full;
}

/** Parse JSON from a (possibly noisy) string, with a best-effort brace-match fallback. */
export function parseJsonLoose<T = unknown>(text: string): T {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start === -1 || end <= start) throw new Error("Invalid JSON response");
    return JSON.parse(trimmed.slice(start, end + 1)) as T;
  }
}
