import { TechnicalLabel } from "@/components/ui/technical-label";

export function SceneLoading() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <TechnicalLabel tone="cyan">Initializing 3D System</TechnicalLabel>
      <div className="h-px w-40 overflow-hidden bg-border">
        <div className="h-full w-1/3 animate-[scene-loading_1.1s_ease-in-out_infinite] bg-cyan" />
      </div>
    </div>
  );
}
