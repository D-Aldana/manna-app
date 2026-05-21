export type VerseSource = {
  sourceId: string
  abbreviation: string
  fetchVerse(osisRef: string): Promise<VerseFetchResult>
}

export type VerseFetchResult =
  | { ok: true; text: string }
  | { ok: false; reason: "not_found" }
  | { ok: false; reason: "upstream_error"; status: number; detail: string }

export function createYouVersionSource(opts: {
  appKey: string
  bibleId: string
  abbreviation: string
}): VerseSource {
  return {
    sourceId: `youversion:${opts.bibleId}`,
    abbreviation: opts.abbreviation,
    async fetchVerse(osisRef) {
      const url = `https://api.youversion.com/v1/bibles/${opts.bibleId}/passages/${osisRef}`
      const res = await fetch(url, {
        headers: { "X-YVP-App-Key": opts.appKey },
      })

      if (res.status === 404) return { ok: false, reason: "not_found" }
      if (!res.ok) {
        return {
          ok: false,
          reason: "upstream_error",
          status: res.status,
          detail: await res.text(),
        }
      }

      const data = await res.json()
      const text = extractPassageText(data)
      if (!text) {
        return {
          ok: false,
          reason: "upstream_error",
          status: 200,
          detail: `Unexpected response shape: ${JSON.stringify(data).slice(0, 200)}`,
        }
      }
      return { ok: true, text }
    },
  }
}

function extractPassageText(data: unknown): string | null {
  if (!data || typeof data !== "object") return null
  const content = (data as { content?: unknown }).content
  if (typeof content === "string" && content.trim()) return stripHtml(content).trim()
  return null
}

function stripHtml(s: string): string {
  return s
    .replace(/<sup[^>]*>.*?<\/sup>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}
