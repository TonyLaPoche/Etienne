import { MATERIAL_ICONS, type MaterialIconName } from "@/components/material-icons";

export function Icon({ name, className = "size-6" }: { name: MaterialIconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`inline-block shrink-0 ${className}`}
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: MATERIAL_ICONS[name] }}
    />
  );
}
