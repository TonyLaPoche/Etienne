import type { Metadata } from "next";
import { SkillsView } from "@/components/views/skills-view";

export const metadata: Metadata = { title: "Compétences" };

export default function Page() {
  return <SkillsView />;
}
