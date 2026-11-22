import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-paper px-4 text-center">
      <div>
        <h1 className="font-display text-3xl text-burgundy">Page introuvable</h1>
        <Link href="/" className="mt-4 inline-flex min-h-11 items-center font-semibold text-adtp">
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
