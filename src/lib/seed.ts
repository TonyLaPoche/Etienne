import type { Database } from "@/lib/types";

const created = "2026-09-02T08:00:00.000Z";

export function createSeed(): Database {
  return {
    version: 1,
    skills: [
      { id: "skill-assemblage", name: "Assemblage mécanique", createdAt: created },
      { id: "skill-conditionnement", name: "Conditionnement", createdAt: created },
      { id: "skill-controle", name: "Contrôle visuel", createdAt: created },
      { id: "skill-cablage", name: "Câblage", createdAt: created },
      { id: "skill-preparation", name: "Préparation de commandes", createdAt: created },
      { id: "skill-manutention", name: "Manutention manuelle", createdAt: created },
      { id: "skill-securite", name: "Sécurité au poste", createdAt: created },
      { id: "skill-qualite", name: "Qualité et conformité", createdAt: created },
    ],
    characters: [
      {
        id: "perso-camille",
        firstName: "Camille",
        lastName: "Martin",
        age: 34,
        createdAt: created,
        updatedAt: "2026-11-12T10:00:00.000Z",
        skills: [
          {
            skillId: "skill-assemblage",
            note: 8,
            appreciation: "operationnel",
            commentaire: "Tient le poste de montage en autonomie.",
            updatedAt: "2026-11-12T10:00:00.000Z",
          },
          {
            skillId: "skill-conditionnement",
            note: 7,
            appreciation: "operationnel",
            commentaire: "Cadence régulière et quantités justes.",
            updatedAt: "2026-11-12T10:00:00.000Z",
          },
          {
            skillId: "skill-controle",
            note: 5,
            appreciation: "en-progression",
            commentaire: "Encore un appui sur les critères visuels.",
            updatedAt: "2026-11-04T10:00:00.000Z",
          },
          {
            skillId: "skill-manutention",
            note: 6,
            appreciation: "en-progression",
            commentaire: "Gestes corrects, à consolider dans la durée.",
            updatedAt: "2026-10-20T10:00:00.000Z",
          },
        ],
      },
      {
        id: "perso-nadia",
        firstName: "Nadia",
        lastName: "Benali",
        age: 41,
        createdAt: created,
        updatedAt: "2026-11-18T10:00:00.000Z",
        skills: [
          {
            skillId: "skill-controle",
            note: 9,
            appreciation: "referent",
            commentaire: "Référence de l'équipe sur le contrôle visuel.",
            updatedAt: "2026-11-18T10:00:00.000Z",
          },
          {
            skillId: "skill-qualite",
            note: 8,
            appreciation: "operationnel",
            commentaire: "Suit les gammes et signale les écarts.",
            updatedAt: "2026-11-18T10:00:00.000Z",
          },
          {
            skillId: "skill-cablage",
            note: 4,
            appreciation: "a-accompagner",
            commentaire: "En apprentissage, gestes encore lents.",
            updatedAt: "2026-10-02T10:00:00.000Z",
          },
        ],
      },
      {
        id: "perso-hugo",
        firstName: "Hugo",
        lastName: "Bernard",
        age: 28,
        createdAt: created,
        updatedAt: "2026-11-08T10:00:00.000Z",
        skills: [
          {
            skillId: "skill-manutention",
            note: 7,
            appreciation: "operationnel",
            commentaire: "À l'aise sur les colis et le filmage.",
            updatedAt: "2026-11-08T10:00:00.000Z",
          },
          {
            skillId: "skill-preparation",
            note: 6,
            appreciation: "en-progression",
            commentaire: "Quelques oublis de composants.",
            updatedAt: "2026-11-08T10:00:00.000Z",
          },
          {
            skillId: "skill-securite",
            note: 9,
            appreciation: "referent",
            commentaire: "Veille aux EPI et aux gestes sûrs.",
            updatedAt: "2026-09-15T10:00:00.000Z",
          },
          {
            skillId: "skill-assemblage",
            note: 5,
            appreciation: "en-progression",
            commentaire: "Monte les sous-ensembles simples.",
            updatedAt: "2026-10-11T10:00:00.000Z",
          },
        ],
      },
      {
        id: "perso-ines",
        firstName: "Inès",
        lastName: "Morel",
        age: 52,
        createdAt: created,
        updatedAt: "2026-11-15T10:00:00.000Z",
        skills: [
          {
            skillId: "skill-conditionnement",
            note: 8,
            appreciation: "operationnel",
            commentaire: "Soigne les conditionnements clients.",
            updatedAt: "2026-11-15T10:00:00.000Z",
          },
          {
            skillId: "skill-preparation",
            note: 7,
            appreciation: "operationnel",
            commentaire: "Prépare les kits sans écart récurrent.",
            updatedAt: "2026-11-15T10:00:00.000Z",
          },
          {
            skillId: "skill-assemblage",
            note: 6,
            appreciation: "en-progression",
            commentaire: "Fiable sur les séries courtes.",
            updatedAt: "2026-10-28T10:00:00.000Z",
          },
        ],
      },
    ],
  };
}
