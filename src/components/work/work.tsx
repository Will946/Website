"use client";

import { Fragment } from "react";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { TechnicalLabel } from "@/components/ui/technical-label";
import { Divider } from "@/components/ui/divider";
import { ExperienceCase } from "@/components/work/experience-case";
import { experiences } from "@/lib/experiences";

export function Work() {
  return (
    <Section id="work" className="bg-void">
      <Container>
        <div className="flex items-center gap-3">
          <TechnicalLabel tone="signal">Work</TechnicalLabel>
          <span className="text-small text-fg-subtle">Three roles, three engineering problems.</span>
        </div>

        <div className="mt-16 flex flex-col gap-16 lg:gap-24">
          {experiences.map((experience, i) => (
            <Fragment key={experience.id}>
              {i > 0 && <Divider />}
              <ExperienceCase experience={experience} index={i} />
            </Fragment>
          ))}
        </div>
      </Container>
    </Section>
  );
}
