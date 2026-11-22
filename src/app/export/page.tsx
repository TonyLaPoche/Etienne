import { Suspense } from "react";
import type { Metadata } from "next";
import { BootScreen } from "@/components/boot-screen";
import { ExportView } from "@/components/views/export-view";

export const metadata: Metadata = { title: "Export PDF" };

export default function Page() {
  return (
    <Suspense fallback={<BootScreen />}>
      <ExportView />
    </Suspense>
  );
}
