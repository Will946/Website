// The readable sections. Each belongs to a machine: as the page scrolls that machine slides out of the
// row and stands beside its section (src/arcade/path.ts), so here each only fills the other half of the
// window. The sections marked data-stop are the journey's stops, in order; keep them matching SCENES.
import { useRef } from 'react';
import { LogoLink } from './arcade/logos';
import SquishTitle from './arcade/SquishTitle';
import { arcade, type MachineId } from './arcade/store';
import { EXPERIENCE, SKILLS } from './data/experience';
import { PROJECTS } from './data/projects';
import { loadReel, reel } from './resume/store';
import { S, useSquish } from './Squish';

/** Play the machine beside this section; leaving it comes back to the same place on the page. */
const play = (machine: MachineId) => arcade.set({ focus: machine, shot: 'main' });

// The Résumé links play the reel; a modified click (new tab, download) still gets the PDF itself.
export function openReel(e: React.MouseEvent) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
  e.preventDefault();
  reel.set({ open: true });
}

function EntryCard({ entry, tags = true }: { entry: (typeof EXPERIENCE)[number]; tags?: boolean }) {
  return (
    <li id={`exp-${entry.id}`} className="card">
      <div className="card-head"><h3><S>{entry.title}</S></h3><span className="card-dates"><S>{entry.dates}</S></span></div>
      <p className="card-role"><S>{entry.role}</S></p>
      <ul className="bullets">{entry.bullets.map((b) => <li key={b}><S>{b}</S></li>)}</ul>
      {tags && <ul className="tags">{entry.tags.map((t) => <li key={t}><S>{t}</S></li>)}</ul>}
    </li>
  );
}

export default function Sections() {
  const root = useRef<HTMLDivElement>(null);
  useSquish(root);
  return (
    <div ref={root} className="sections">
      <section id="experience" data-stop className="scene cards-right">
        <div className="scene-col">
          <SquishTitle text="Experience" />
          <p className="section-lead"><button type="button" className="pill" onClick={() => play('vending')}>Draw a sword</button></p>
          <ol className="cards">{EXPERIENCE.filter((e) => !e.about).map((e) => <EntryCard key={e.id} entry={e} />)}</ol>
        </div>
      </section>

      <section id="projects" data-stop className="scene cards-left">
        <div className="scene-col">
          <SquishTitle text="Projects" />
          <p className="section-lead"><button type="button" className="pill" onClick={() => play('gacha')}>Shake the box</button></p>
          <ul className="cards projects-grid">
            {PROJECTS.filter((p) => p.listed !== false).map((p) => (
              <li key={p.id} id={`project-${p.id}`} className="card">
                <h3><S>{p.title}</S></h3>
                <p className="card-blurb"><S>{p.blurb}</S></p>
                <ul className="tags">{p.tags.map((t) => <li key={t}><S>{t}</S></li>)}</ul>
                {p.url && <div className="card-links"><a className="pill" href={p.url} target="_blank" rel="noreferrer">Open ↗</a></div>}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="about" data-stop className="scene cards-right">
        <div className="scene-col">
          <SquishTitle text="About" />
          <p className="section-lead"><button type="button" className="pill" onClick={() => play('claw')}>Hit the drum</button></p>
          <ol className="cards">
            {EXPERIENCE.filter((e) => e.about).map((e) => <EntryCard key={e.id} entry={e} tags={false} />)}
            <li className="card">
              <h3><S>Skills</S></h3>
              {SKILLS.map((s) => (
                <div key={s.group} className="skill-group">
                  <h4><S>{s.group}</S></h4>
                  <p className="card-blurb skill-line"><S>{s.items.join(' · ')}</S></p>
                </div>
              ))}
            </li>
          </ol>
        </div>
      </section>

      <section id="contact" data-stop className="scene cards-left">
        <div className="scene-col">
          <SquishTitle text="Contact" />
          <p className="section-lead"><span><S>Say hi. I reply faster than a Daruma gets back up.</S></span></p>
          <div className="contact-row">
            <a className="pill" href="mailto:wyw3932@gmail.com">wyw3932@gmail.com</a>
            <LogoLink name="github" className="pill logo" />
            <LogoLink name="instagram" className="pill logo" />
            <a className="pill" href="/assets/ResumeOfficial.pdf" onPointerEnter={() => loadReel()} onFocus={() => loadReel()} onClick={openReel}>Resume</a>
          </div>
          <footer className="site-footer"><S>Built with React Three Fiber and Rapier. The dolls and sticks are real physics; the jobs are real jobs.</S></footer>
        </div>
      </section>
    </div>
  );
}
