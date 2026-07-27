export type WritingMeta = {
  slug: string
  title: string
  date: string
  summary: string
  body: string
}

export type ResumeHighlight = {
  title: string
  body: string
}

export type ResumeDoc = {
  highlights: ResumeHighlight[]
  body: string
}

function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) return { data: {}, body: raw.trim() }
  const data: Record<string, string> = {}
  for (const line of match[1].split(/\r?\n/)) {
    const i = line.indexOf(':')
    if (i === -1) continue
    const key = line.slice(0, i).trim()
    let val = line.slice(i + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    data[key] = val
  }
  return { data, body: match[2].trim() }
}

const writingModules = import.meta.glob('../../content/writing/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const resumeModule = import.meta.glob('../../content/resume.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

export function getAllWriting(): WritingMeta[] {
  const posts: WritingMeta[] = Object.entries(writingModules).map(
    ([path, raw]) => {
      const { data, body } = parseFrontmatter(raw)
      const file = path.split('/').pop() ?? 'post.md'
      const slug = file.replace(/\.md$/, '')
      return {
        slug,
        title: data.title || slug,
        date: data.date || '',
        summary: data.summary || '',
        body,
      }
    },
  )
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getWritingBySlug(slug: string): WritingMeta | null {
  return getAllWriting().find((p) => p.slug === slug) ?? null
}

export function getResume(): ResumeDoc {
  const raw = Object.values(resumeModule)[0] ?? ''
  const { data, body } = parseFrontmatter(raw)
  const highlights: ResumeHighlight[] = []
  // highlights as h1: body1 | h2: body2 in frontmatter optional; use body sections
  if (data.highlight_1_title) {
    highlights.push({
      title: data.highlight_1_title,
      body: data.highlight_1_body || '',
    })
  }
  if (data.highlight_2_title) {
    highlights.push({
      title: data.highlight_2_title,
      body: data.highlight_2_body || '',
    })
  }
  if (data.highlight_3_title) {
    highlights.push({
      title: data.highlight_3_title,
      body: data.highlight_3_body || '',
    })
  }
  if (highlights.length === 0) {
    highlights.push(
      {
        title: 'Experience',
        body: 'Roles, studios, and products I’ve shipped.',
      },
      {
        title: 'Focus',
        body: 'Interface design, motion, and playful web experiments.',
      },
    )
  }
  return { highlights, body }
}
