interface SectionProps {
  title: string;
  children: React.ReactNode;
  topMargin?: number;
}

const Section = ({ title, children, topMargin = 64 }: SectionProps) => {
  return (
    <section className="w-full" style={{ marginTop: topMargin }}>
      <h2 className="text-[28px] leading-9 font-bold text-[color:var(--color-accent)]">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
};

export default Section;
