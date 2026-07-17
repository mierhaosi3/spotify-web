const sections = [
  {
    title: 'Experience',
    body: 'Placeholder for roles, studios, and companies you’ve worked with.',
  },
  {
    title: 'Writing',
    body: 'Placeholder for essays and long-form notes.',
  },
] as const

export function SitePlaceholders() {
  return (
    <div className="flex w-full flex-col gap-12">
      {sections.map((section) => (
        <section key={section.title} className="flex flex-col gap-3">
          <h2 className="text-[13px] font-bold tracking-wide text-muted-foreground">
            {section.title}
          </h2>
          <p className="max-w-xl text-[14px] leading-relaxed text-muted-foreground/75">
            {section.body}
          </p>
        </section>
      ))}
    </div>
  )
}
