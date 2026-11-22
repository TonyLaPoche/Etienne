import type { Metadata } from "next";
import { FichesView } from "@/components/views/fiches-view";

export const metadata: Metadata = { title: "Fiches" };

export default function Page() {
  return <FichesView />;
}
