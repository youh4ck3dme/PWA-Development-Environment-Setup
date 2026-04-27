interface SectionCardProps {
  eyebrow?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function SectionCard({ eyebrow, title, description, children }: SectionCardProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20">
      {eyebrow ? (
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-sky-300">{eyebrow}</p>
      ) : null}
      <h2 className="mt-3 text-xl font-semibold text-white">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  );
}
