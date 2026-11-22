import type { Metadata } from "next";
import { CreateFicheView } from "@/components/views/fiche-form-view";

export const metadata: Metadata = { title: "Nouvelle fiche" };

export default function Page() {
  return <CreateFicheView />;
}
