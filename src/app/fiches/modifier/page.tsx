import { Suspense } from "react";
import type { Metadata } from "next";
import { BootScreen } from "@/components/boot-screen";
import { EditFicheView } from "@/components/views/fiche-form-view";

export const metadata: Metadata = { title: "Modifier" };

export default function Page() {
  return (
    <Suspense fallback={<BootScreen />}>
      <EditFicheView />
    </Suspense>
  );
}
