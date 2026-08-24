import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { TechnicalLabel } from "@/components/ui/technical-label";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { TextLink } from "@/components/ui/text-link";
import { Divider } from "@/components/ui/divider";
import { GridBackground } from "@/components/ui/grid-background";

const swatches = [
  { name: "void", var: "--color-void", label: "background" },
  { name: "surface", var: "--color-surface", label: "panel" },
  { name: "surface-raised", var: "--color-surface-raised", label: "raised panel" },
  { name: "fg", var: "--color-fg", label: "foreground" },
  { name: "fg-muted", var: "--color-fg-muted", label: "muted text" },
  { name: "signal", var: "--color-signal", label: "active / success" },
  { name: "cyan", var: "--color-cyan", label: "links / measurement" },
  { name: "amber", var: "--color-amber", label: "warning / readout" },
  { name: "fault", var: "--color-fault", label: "error only" },
];

export default function DesignSystemPage() {
  return (
    <main>
      <Section grid className="pt-24">
        <Container className="relative">
          <GridBackground />
          <div className="relative flex items-center gap-3">
            <TechnicalLabel tone="signal">REV 01</TechnicalLabel>
            <StatusBadge status="ready" label="SYS READY" />
          </div>
          <Heading level="display" className="relative mt-6 max-w-3xl">
            Design system
          </Heading>
          <p className="relative mt-4 max-w-xl text-body-lg text-fg-muted">
            Tokens and primitives only, no Hero, About, or Work section lives
            here yet. This page exists to prove the system works before
            anything gets built on top of it.
          </p>
        </Container>
      </Section>

      <Divider />

      <Section>
        <Container>
          <Heading level="h2">Color</Heading>
          <p className="mt-2 text-body text-fg-muted">
            Dark foundation, signal accents used with intent. Red is reserved
            for fault states only.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden border border-border sm:grid-cols-3 lg:grid-cols-5">
            {swatches.map((s) => (
              <div key={s.name} className="bg-surface p-4">
                <div
                  className="mb-3 h-16 w-full border border-border-strong"
                  style={{ background: `var(${s.var})` }}
                />
                <div className="font-mono text-label uppercase tracking-label text-fg-muted">
                  {s.name}
                </div>
                <div className="text-small text-fg-subtle">{s.label}</div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Divider />

      <Section>
        <Container>
          <Heading level="h2">Typography</Heading>
          <p className="mt-2 text-body text-fg-muted">
            IBM Plex Sans for statements and body copy, IBM Plex Mono for
            instrumentation labels, chosen for its technical-documentation
            heritage rather than generic SaaS type.
          </p>
          <div className="mt-8 space-y-6 border-t border-border pt-8">
            <div>
              <Heading level="display">Display 7rem</Heading>
            </div>
            <div>
              <Heading level="h1">Heading One</Heading>
            </div>
            <div>
              <Heading level="h2">Heading Two</Heading>
            </div>
            <div>
              <Heading level="h3">Heading Three</Heading>
            </div>
            <p className="text-body-lg">Body large, 1.125rem, for lead paragraphs.</p>
            <p className="text-body text-fg-muted">
              Body, 1rem, the default for running copy and descriptions.
            </p>
            <p className="font-mono text-label uppercase tracking-label text-fg-subtle">
              Label, mono, uppercase, wide tracking, for CH1 / REV 01 / PWM
            </p>
          </div>
        </Container>
      </Section>

      <Divider />

      <Section>
        <Container>
          <Heading level="h2">Interactive primitives</Heading>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <TextLink href="#">Text link with signal underline</TextLink>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <TechnicalLabel tone="signal">CH1</TechnicalLabel>
            <TechnicalLabel tone="cyan">CH2</TechnicalLabel>
            <TechnicalLabel tone="amber">5.00V</TechnicalLabel>
            <TechnicalLabel>100Hz</TechnicalLabel>
            <TechnicalLabel tone="signal">PWM</TechnicalLabel>
            <TechnicalLabel tone="cyan">CAN</TechnicalLabel>
          </div>

          <div className="mt-10 flex flex-wrap gap-6">
            <StatusBadge status="ready" />
            <StatusBadge status="pass" />
            <StatusBadge status="warn" />
            <StatusBadge status="fail" />
          </div>
        </Container>
      </Section>

      <Divider />

      <Section className="pb-24">
        <Container>
          <p className="text-small text-fg-subtle">
            Reduced motion, keyboard focus, and responsive rhythm are handled
            globally, this page inherits them, it doesn&apos;t implement them.
          </p>
        </Container>
      </Section>
    </main>
  );
}
