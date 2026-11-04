// The page: a fridge shelf of soda cans up top, one per section. Shake a can until it pops and the page
// goes to that section. Plain links under the fridge do the same for anyone who would rather not shake.
import SodaCan, { type Can } from './SodaCan';
import { EXPERIENCE, SKILLS, type Experience } from './data/experience';
import { PROJECTS } from './data/projects';

const CANS: Can[] = [
  { id: 'experience', label: 'EXPERIENCE', flavor: 'Cherry', color: '#E8344E', ink: '#5E0B1A' },
  { id: 'projects', label: 'PROJECTS', flavor: 'Lime', color: '#34B24A', ink: '#0F4318' },
  { id: 'about', label: 'ABOUT', flavor: 'Orange', color: '#FF8A1F', ink: '#6A3000' },
  { id: 'contact', label: 'CONTACT', flavor: 'Grape', color: '#7B4DD8', ink: '#2A1160' },
];
const colorOf = (id: string) => CANS.find((c) => c.id === id)!;

const RESUME = `${import.meta.env.BASE_URL}assets/ResumeOfficial.pdf`;
const EMAIL = 'wyw3932@gmail.com';

function go(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
  el.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
}

function Section({ id, title, lead, children }: { id: string; title: string; lead: string; children: React.ReactNode }) {
  const c = colorOf(id);
  return (
    <section id={id} className="section" style={{ '--can': c.color, '--ink': c.ink } as React.CSSProperties}>
      <div className="section-inner">
        <header className="section-head">
          <span className="section-flavor">{c.flavor}</span>
          <h2 tabIndex={-1}>{title}</h2>
          <p className="section-lead">{lead}</p>
        </header>
        {children}
        <a className="back" href="#top" onClick={(e) => { e.preventDefault(); go('top'); }}>↑ Back to the fridge</a>
      </div>
    </section>
  );
}

function EntryCard({ e }: { e: Experience }) {
  return (
    <li className="card">
      <div className="card-head">
        <h3>{e.title}</h3>
        <span className="card-dates">{e.dates}</span>
      </div>
      <p className="card-role">{e.role}</p>
      <ul className="bullets">{e.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
      <ul className="tags">{e.tags.map((t) => <li key={t}>{t}</li>)}</ul>
    </li>
  );
}

export default function App() {
  return (
    <>
      <header id="top" className="hero">
        <div className="hero-inner">
          <div className="hero-text">
            <h1>William<br />Wong</h1>
            <p className="hero-title">Soldering Samurai</p>
            <p className="hero-tag">Unemployed, but wicked cool.</p>
          </div>

          <div className="fridge">
            <div className="fridge-glow" aria-hidden="true" />
            <p className="fridge-sticker" aria-hidden="true">ICE COLD</p>
            <div className="shelf">
              {CANS.map((c) => <SodaCan key={c.id} can={c} onPop={go} />)}
            </div>
            <div className="shelf-rail" aria-hidden="true" />
          </div>

          <p className="hero-hint">Grab a can and shake it up and down until it pops.</p>
          <nav className="hero-links" aria-label="Sections">
            {CANS.map((c) => (
              <a key={c.id} href={`#${c.id}`} onClick={(e) => { e.preventDefault(); go(c.id); }}>{c.label.toLowerCase()}</a>
            ))}
            <a href={RESUME} target="_blank" rel="noreferrer">résumé</a>
          </nav>
        </div>
      </header>

      <main>
        <Section id="experience" title="Experience" lead="Three summers: a building, a spray rig and a rebar-tying drone.">
          <ol className="cards">{EXPERIENCE.filter((e) => !e.about).map((e) => <EntryCard key={e.id} e={e} />)}</ol>
        </Section>

        <Section id="projects" title="Projects" lead="Boards I designed, built, and occasionally set on fire.">
          <ul className="cards grid">
            {PROJECTS.filter((p) => p.listed !== false).map((p) => (
              <li key={p.id} className="card">
                <h3>{p.title}</h3>
                <p className="card-blurb">{p.blurb}</p>
                <ul className="tags">{p.tags.map((t) => <li key={t}>{t}</li>)}</ul>
                {p.url && <a className="pill" href={p.url} target="_blank" rel="noreferrer">Open ↗</a>}
              </li>
            ))}
          </ul>
        </Section>

        <Section id="about" title="About" lead="Hi, I’m William. 100% human, not AI (I think).">
          <ol className="cards">
            {EXPERIENCE.filter((e) => e.about).map((e) => <EntryCard key={e.id} e={e} />)}
            <li className="card">
              <h3>Skills</h3>
              {SKILLS.map((s) => (
                <div key={s.group} className="skill-group">
                  <h4>{s.group}</h4>
                  <ul className="tags">{s.items.map((t) => <li key={t}>{t}</li>)}</ul>
                </div>
              ))}
            </li>
          </ol>
        </Section>

        <Section id="contact" title="Contact" lead="Currently between jobs. Very much open to the next one.">
          <div className="contact-row">
            <a className="pill" href={`mailto:${EMAIL}`}>{EMAIL}</a>
            <a className="pill" href="https://github.com/Will946" target="_blank" rel="noreferrer">GitHub</a>
            <a className="pill" href="https://www.instagram.com/willis_da_asian/" target="_blank" rel="noreferrer">Instagram</a>
            <a className="pill" href={RESUME} target="_blank" rel="noreferrer">Résumé</a>
          </div>
        </Section>
      </main>

      <footer className="footer">
        <p>William Wong · Soldering Samurai. No cans were harmed. Several boards were.</p>
      </footer>
    </>
  );
}
