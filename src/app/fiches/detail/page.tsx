import { Suspense } from "react";
import type { Metadata } from "next";
import { BootScreen } from "@/components/boot-screen";
import { DetailView } from "@/components/views/detail-view";

export const metadata: Metadata = { title: "Fiche" };

export default function Page() {
  return (
    <Suspense fallback={<BootScreen />}>
      <DetailView />
    </Suspense>
  );
}
