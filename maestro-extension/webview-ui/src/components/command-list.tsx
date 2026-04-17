import { useState } from "react";
import { ChevronRight, Search, Wrench, Zap, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { CommandCard } from "@/components/command-card";
import type { SkillInfo } from "@/hooks/use-vscode";

const CATEGORY_META: Record<
  string,
  { label: string; icon: React.ReactNode; skills: string[] }
> = {
  analysis: {
    label: "Analysis",
    icon: <Search className="h-3.5 w-3.5" />,
    skills: ["diagnose", "evaluate"],
  },
  fix: {
    label: "Fix & Improve",
    icon: <Wrench className="h-3.5 w-3.5" />,
    skills: ["refine", "streamline", "calibrate", "fortify", "zero-defect"],
  },
  enhancement: {
    label: "Enhancement",
    icon: <Zap className="h-3.5 w-3.5" />,
    skills: [
      "amplify",
      "chain",
      "compose",
      "enrich",
      "guard",
      "iterate",
      "accelerate",
      "turbocharge",
    ],
  },
  utility: {
    label: "Utility",
    icon: <Settings className="h-3.5 w-3.5" />,
    skills: [
      "teach-maestro",
      "onboard-agent",
      "adapt-workflow",
      "specialize",
      "extract-pattern",
      "temper",
    ],
  },
};

const CATEGORY_ORDER = ["analysis", "fix", "enhancement", "utility"];

interface CommandListProps {
  skills: SkillInfo[];
  usedCommands?: string[];
  onRunCommand: (command: string) => void;
  onHover: (desc: string) => void;
  onLeave: () => void;
}

export function CommandList({ skills, usedCommands = [], onRunCommand, onHover, onLeave }: CommandListProps) {
  const usedSet = new Set(usedCommands);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    analysis: true,
    fix: true,
    enhancement: false,
    utility: false,
  });

  const toggle = (cat: string) => {
    setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const skillMap = new Map(skills.map((s) => [s.name, s]));

  return (
    <div className="flex flex-col gap-1 px-2">
      {CATEGORY_ORDER.map((catId) => {
        const meta = CATEGORY_META[catId];
        if (!meta) return null;

        const catSkills = meta.skills
          .map((name) => skillMap.get(name))
          .filter((s): s is SkillInfo => !!s && s.userInvocable);

        if (catSkills.length === 0) return null;

        const isOpen = expanded[catId] ?? false;

        return (
          <div key={catId}>
            <button
              type="button"
              onClick={() => toggle(catId)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronRight
                className={cn(
                  "h-3 w-3 transition-transform duration-200",
                  isOpen && "rotate-90"
                )}
              />
              {meta.icon}
              <span>{meta.label}</span>
              <span className="ml-auto text-[10px] tabular-nums opacity-60">
                {catSkills.length}
              </span>
            </button>

            {isOpen && (
              <div className="ml-5 flex flex-col gap-1 pb-1 pt-0.5">
                {catSkills.map((skill) => (
                  <CommandCard
                    key={skill.name}
                    name={skill.name}
                    description={skill.description}
                    isNew={skill.name === "zero-defect"}
                    used={usedSet.has(skill.name)}
                    onClick={() => onRunCommand(skill.name)}
                    onHover={onHover}
                    onLeave={onLeave}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
