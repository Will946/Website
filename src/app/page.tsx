import { Hero } from "@/components/hero/hero";
import { About } from "@/components/about/about";
import { EducationSection } from "@/components/education/education-section";
import { Work } from "@/components/work/work";
import { CurrentProject } from "@/components/current-project/current-project";
import { Projects } from "@/components/projects/projects";
import { Contact } from "@/components/contact/contact";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <EducationSection />
      <Work />
      <CurrentProject />
      <Projects />
      <Contact />
    </main>
  );
}
