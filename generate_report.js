"use strict";
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  Header, Footer, NumberFormat, PageBreak,
  LevelFormat, convertInchesToTwip,
  UnderlineType, SimpleField,
} = require("docx");
const fs = require("fs");

// ─── Colors ──────────────────────────────────────────────────────────────────
const NAVY       = "1F3864";
const SKY        = "5B9BD5";
const BORDEAUX   = "7B2D26";
const WHITE      = "FFFFFF";
const LIGHT_GRAY = "F2F2F2";
const MID_GRAY   = "D0D0D0";
const DARK       = "222222";
const TEXT       = "333333";

// ─── Typography helpers ───────────────────────────────────────────────────────

function run(text, opts = {}) {
  return new TextRun({
    text,
    font: opts.mono ? "Consolas" : "Calibri",
    size: opts.size ?? 22,
    bold: opts.bold ?? false,
    italics: opts.italic ?? false,
    color: opts.color ?? TEXT,
    underline: opts.underline ? { type: UnderlineType.SINGLE } : undefined,
  });
}

function para(children, opts = {}) {
  const c = Array.isArray(children) ? children : [run(children, opts)];
  return new Paragraph({
    children: c,
    alignment: opts.align ?? AlignmentType.JUSTIFIED,
    spacing: { before: opts.spaceBefore ?? 120, after: opts.spaceAfter ?? 120, line: 331 },
    indent: opts.indent ? { left: convertInchesToTwip(0.4) } : undefined,
  });
}

function h1(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Calibri", size: 36, bold: true, color: NAVY, allCaps: true })],
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 480, after: 240 },
    alignment: AlignmentType.LEFT,
  });
}

function h2(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Calibri", size: 28, bold: true, color: SKY })],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 360, after: 160 },
  });
}

function h3(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Calibri", size: 24, bold: true, color: BORDEAUX })],
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 280, after: 120 },
  });
}

function pbk() {
  return new Paragraph({ children: [new PageBreak()] });
}

function empty(lines = 1) {
  return Array.from({ length: lines }, () => new Paragraph({ children: [run("")], spacing: { before: 40, after: 40 } }));
}

function bullet(text, level = 0) {
  return new Paragraph({
    children: [run(text, { size: 22 })],
    bullet: { level },
    spacing: { before: 60, after: 60 },
    indent: { left: convertInchesToTwip(level * 0.3 + 0.3) },
  });
}

function subBullet(text) { return bullet(text, 1); }

function hline() {
  return new Paragraph({
    children: [],
    border: { bottom: { color: NAVY, space: 1, style: BorderStyle.SINGLE, size: 6 } },
    spacing: { before: 80, after: 80 },
  });
}

function codePara(lines) {
  return lines.map(l =>
    new Paragraph({
      children: [new TextRun({ text: l, font: "Consolas", size: 18, color: "1a1a2e" })],
      spacing: { before: 20, after: 20 },
      shading: { type: ShadingType.CLEAR, color: "auto", fill: "EEF0F4" },
    })
  );
}

// ─── Table helpers ────────────────────────────────────────────────────────────

function headerCell(text, widthPct) {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, font: "Calibri", size: 20, bold: true, color: WHITE })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 80 },
    })],
    shading: { type: ShadingType.CLEAR, color: "auto", fill: NAVY },
    width: { size: widthPct, type: WidthType.PERCENTAGE },
  });
}

function cell(text, shade = false, widthPct = undefined, align = AlignmentType.LEFT, bold = false) {
  const opts = {
    children: [new Paragraph({
      children: [new TextRun({ text, font: "Calibri", size: 20, bold, color: DARK })],
      alignment: align,
      spacing: { before: 60, after: 60 },
    })],
    shading: shade ? { type: ShadingType.CLEAR, color: "auto", fill: LIGHT_GRAY } : undefined,
  };
  if (widthPct) opts.width = { size: widthPct, type: WidthType.PERCENTAGE };
  return new TableCell(opts);
}

function cellBold(text, shade = false) { return cell(text, shade, undefined, AlignmentType.LEFT, true); }

function makeTable(headers, rows, widths) {
  const headerRow = new TableRow({
    children: headers.map((h, i) => headerCell(h, widths ? widths[i] : Math.floor(100 / headers.length))),
    tableHeader: true,
  });
  const dataRows = rows.map((row, ri) =>
    new TableRow({
      children: row.map((c, ci) => cell(c, ri % 2 === 1, widths ? widths[ci] : undefined)),
    })
  );
  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top:    { style: BorderStyle.SINGLE, size: 1, color: MID_GRAY },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: MID_GRAY },
      left:   { style: BorderStyle.SINGLE, size: 1, color: MID_GRAY },
      right:  { style: BorderStyle.SINGLE, size: 1, color: MID_GRAY },
      insideH:{ style: BorderStyle.SINGLE, size: 1, color: MID_GRAY },
      insideV:{ style: BorderStyle.SINGLE, size: 1, color: MID_GRAY },
    },
  });
}

// ─── Cover page ───────────────────────────────────────────────────────────────

function coverPage() {
  return [
    ...empty(4),
    new Paragraph({
      children: [new TextRun({ text: "ITEAM University", font: "Calibri", size: 72, bold: true, color: NAVY })],
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "École d'ingénieurs & management", font: "Calibri", size: 28, color: SKY })],
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "Formation : 2ème CCV3 — Année universitaire 2025 – 2026", font: "Calibri", size: 24, color: TEXT })],
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 400 },
    }),
    hline(),
    ...empty(1),
    new Paragraph({
      children: [new TextRun({ text: "Projet de Fin d'Année (PFA)", font: "Calibri", size: 30, bold: true, color: BORDEAUX, allCaps: true })],
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 160 },
    }),
    new Paragraph({
      children: [new TextRun({
        text: "Application de suivi des candidats\npour un processus de recrutement",
        font: "Calibri", size: 44, bold: true, color: NAVY,
      })],
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "RecruitTracker", font: "Calibri", size: 52, bold: true, color: SKY, italics: true })],
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 200 },
    }),
    hline(),
    ...empty(2),
    makeTable(
      ["Réalisé par", "Khedhri Takoua & Dhafer Smeti"],
      [
        ["Encadrant", "Hassen Lazreg"],
        ["Année universitaire", "2025 – 2026"],
      ],
      [30, 70]
    ),
    pbk(),
  ];
}

// ─── Remerciements ────────────────────────────────────────────────────────────

function remerciements() {
  return [
    h1("Remerciements"),
    para("Nous tenons à exprimer notre sincère gratitude à notre encadrant, M. Hassen Lazreg, dont les conseils avisés, la disponibilité et le suivi attentif ont été déterminants dans la réussite de ce projet. Sa rigueur pédagogique et son expertise technique nous ont permis de mener ce travail avec méthode et ambition."),
    para("Nous remercions également l'ensemble du corps enseignant de l'ITEAM University pour la qualité de la formation dispensée tout au long de notre parcours en 2ème CCV3, ainsi que l'administration de l'école pour les ressources et l'environnement de travail mis à notre disposition."),
    para("Nos remerciements vont aussi à nos familles pour leur soutien indéfectible et leurs encouragements constants tout au long de cette année universitaire."),
    para("Enfin, nous remercions nos collègues et amis qui, par leurs retours constructifs lors des phases de test, ont contribué à améliorer la qualité de l'application finale."),
    pbk(),
  ];
}

// ─── Résumé exécutif ──────────────────────────────────────────────────────────

function resume() {
  return [
    h1("Résumé exécutif"),
    para("Le recrutement constitue un processus stratégique pour toute organisation. Dans un contexte où les volumes de candidatures croissent chaque année et où la coordination entre recruteurs et candidats devient un défi opérationnel, les équipes RH ont besoin d'outils dédiés pour piloter efficacement leurs pipelines de recrutement."),
    para("Ce projet de fin d'année, réalisé dans le cadre de la formation 2ème CCV3 à l'ITEAM University, consiste en la conception et le développement d'une application web complète baptisée RecruitTracker, destinée à digitaliser et optimiser l'intégralité du processus de recrutement d'une entreprise."),
    para("RecruitTracker met en œuvre une architecture trois-tiers moderne : un backend Java avec Spring Boot 3.2.5, exposant une API REST sécurisée par JWT, et un frontend React 18 avec Tailwind CSS pour une interface utilisateur réactive et ergonomique. La persistance des données est assurée par MySQL via XAMPP, avec Hibernate comme ORM."),
    para("L'application distingue trois rôles : l'Administrateur, qui gère les recruteurs ; le Recruteur, qui pilote les candidats, offres, entretiens et évaluations ; et le Candidat, qui accède à un portail dédié pour suivre sa candidature en temps réel via un pipeline visuel à six étapes (Reçu → En examen → Entretien → Évaluation → Accepté/Refusé). Parmi les fonctionnalités phares figurent la création automatique de comptes candidats avec envoi de credentials, le système de notifications in-app et email, l'évaluation multi-critères avec score global automatique, la génération d'offres d'embauche PDF, et l'export de rapports en CSV et PDF."),
    para("À l'issue du projet, l'ensemble des objectifs du MVP ont été atteints : authentification sécurisée à trois rôles, gestion complète du pipeline candidat, tableau de bord avec KPIs (taux de conversion, délai moyen de recrutement), et une interface soignée et responsive. Ce projet nous a permis d'acquérir une expérience concrète en développement full-stack, en sécurité web et en gestion de projet en binôme."),
    pbk(),
  ];
}

// ─── Table des matières ───────────────────────────────────────────────────────

function toc() {
  const entries = [
    ["1", "Introduction générale", "5"],
    ["2", "Contexte, problématique et objectifs", "6"],
    ["3", "Cahier des charges et périmètre", "8"],
    ["4", "Méthodologie et organisation", "10"],
    ["5", "Architecture et conception technique", "11"],
    ["6", "Implémentation backend (Spring Boot)", "14"],
    ["7", "Implémentation frontend (React)", "19"],
    ["8", "Fonctionnalités phares", "22"],
    ["9", "Tests et validation", "26"],
    ["10", "Déploiement et utilisation", "28"],
    ["11", "Limites et perspectives", "30"],
    ["12", "Conclusion", "32"],
    ["", "Annexes", "33"],
  ];
  return [
    h1("Table des matières"),
    ...entries.map(([num, title, page]) =>
      new Paragraph({
        children: [
          new TextRun({ text: num ? `${num}.  ${title}` : `     ${title}`, font: "Calibri", size: 22, color: TEXT }),
          new TextRun({ text: `  ............................................................................  ${page}`, font: "Calibri", size: 20, color: "AAAAAA" }),
        ],
        spacing: { before: 80, after: 80 },
        indent: num && num.length === 1 ? {} : { left: convertInchesToTwip(0.3) },
      })
    ),
    pbk(),
  ];
}

// ─── Chapitre 1 ───────────────────────────────────────────────────────────────

function chapitre1() {
  return [
    h1("Chapitre 1 — Introduction générale"),
    para("La gestion du capital humain est aujourd'hui reconnue comme un levier essentiel de la compétitivité des entreprises. Le recrutement, en particulier, représente un processus critique : il conditionne la qualité des ressources humaines intégrées dans l'organisation, influence directement la performance des équipes et génère des coûts significatifs lorsqu'il est mal maîtrisé."),
    para("Face à la multiplication des candidatures, à la nécessité de respecter des délais stricts et à l'exigence d'offrir une expérience candidat de qualité, les entreprises se trouvent confrontées à un besoin urgent de digitalisation de leurs processus RH. Trop souvent, les équipes recrutement gèrent encore leurs pipelines via des tableurs Excel, des échanges d'emails non structurés et des outils disparates non intégrés, ce qui engendre des erreurs, des pertes d'information et une expérience candidat dégradée."),
    para("C'est dans ce contexte que s'inscrit RecruitTracker : une application web full-stack destinée à centraliser, structurer et automatiser l'ensemble du processus de recrutement. Elle offre une vue unifiée du pipeline pour les recruteurs, un portail self-service pour les candidats, et des outils analytiques pour les managers."),

    h2("1.1 Vision du projet"),
    para("RecruitTracker est conçu autour de trois grandes valeurs :"),
    bullet("Transparence : chaque changement de statut d'une candidature est tracé automatiquement et notifié au candidat en temps réel."),
    bullet("Efficacité : toutes les opérations critiques (création de compte candidat, planification d'entretien, génération d'offre PDF) sont accessibles en quelques clics depuis un tableau de bord centralisé."),
    bullet("Expérience candidat : le portail candidat offre un accès direct au statut de la candidature, aux détails des entretiens, aux notifications et à l'offre d'embauche, sans nécessiter d'échanges par email."),

    h2("1.2 Périmètre du rapport"),
    para("Ce rapport présente l'intégralité du travail réalisé dans le cadre du PFA, depuis la phase d'analyse et de conception jusqu'à l'implémentation et la validation. Il décrit les choix techniques effectués, l'architecture retenue, les modules développés côté backend et frontend, ainsi que les tests et résultats obtenus."),
    para("Le rapport est structuré en douze chapitres : après cette introduction, nous exposons le contexte et la problématique (Chapitre 2), puis le cahier des charges (Chapitre 3), la méthodologie (Chapitre 4), l'architecture technique (Chapitre 5), l'implémentation backend (Chapitre 6), l'implémentation frontend (Chapitre 7), les fonctionnalités phares (Chapitre 8), les tests (Chapitre 9), le déploiement (Chapitre 10), les limites et perspectives (Chapitre 11), et enfin la conclusion (Chapitre 12)."),
    pbk(),
  ];
}

// ─── Chapitre 2 ───────────────────────────────────────────────────────────────

function chapitre2() {
  return [
    h1("Chapitre 2 — Contexte, problématique et objectifs"),

    h2("2.1 Contexte du recrutement aujourd'hui"),
    para("Selon les études RH récentes, une entreprise de taille moyenne reçoit entre 50 et 200 candidatures par poste ouvert. Le processus de traitement de ces candidatures implique plusieurs acteurs (chargés de recrutement, managers, RH) et s'étend sur une durée moyenne de 15 à 45 jours ouvrés. Cette complexité génère des défis organisationnels importants :"),
    bullet("Suivi manuel des candidatures sur tableurs → risque d'oubli et d'erreurs de saisie."),
    bullet("Communication par email → perte d'information, manque de traçabilité."),
    bullet("Absence de vision consolidée du pipeline → impossibilité de mesurer le taux de conversion, le délai moyen ou d'identifier les goulots d'étranglement."),
    bullet("Expérience candidat dégradée → les candidats ne reçoivent pas de retour structuré sur l'évolution de leur candidature."),

    h2("2.2 Problématique"),
    para("La problématique centrale de ce projet peut se formuler ainsi :"),
    new Paragraph({
      children: [new TextRun({ text: "Comment concevoir une application web qui centralise et automatise le processus de recrutement, tout en offrant une expérience transparente et fluide aux trois parties prenantes : administrateurs, recruteurs et candidats ?", font: "Calibri", size: 22, bold: true, italics: true, color: NAVY })],
      alignment: AlignmentType.CENTER,
      shading: { type: ShadingType.CLEAR, color: "auto", fill: "E8EEF7" },
      spacing: { before: 160, after: 160 },
      indent: { left: convertInchesToTwip(0.5), right: convertInchesToTwip(0.5) },
    }),
    para("Cette problématique se décline en plusieurs sous-problèmes techniques : sécurisation de l'accès selon les rôles, gestion en temps réel du pipeline de recrutement, communication automatisée avec les candidats, génération de documents PDF, et production de rapports analytiques."),

    h2("2.3 Objectifs du projet"),
    para("Le projet RecruitTracker vise à atteindre les six objectifs suivants :"),
    bullet("Authentification sécurisée et gestion des rôles : trois rôles distincts (ADMIN, RECRUTEUR, CANDIDAT) avec token JWT et changement de mot de passe obligatoire au premier login."),
    bullet("Gestion complète des candidatures : pipeline à six statuts avec historique automatique de chaque transition, notifications in-app et email à chaque étape."),
    bullet("Planification et suivi des entretiens : création d'entretiens avec lien visioconférence, instructions de préparation, suivi du statut (planifié / terminé / annulé)."),
    bullet("Évaluation multi-critères : notation sur trois axes (compétences, attitude, potentiel) avec calcul automatique du score global et recommandation HIRE/REJECT."),
    bullet("Génération d'offres d'embauche : création d'une offre avec salaire, date de début et avantages, export PDF, acceptation ou refus par le candidat depuis son portail."),
    bullet("Dashboard analytique et rapports : KPIs en temps réel (taux de conversion, délai moyen de recrutement), export CSV et PDF des rapports par poste."),

    h2("2.4 KPIs du projet"),
    makeTable(
      ["KPI", "Cible", "Résultat"],
      [
        ["Fonctionnalités MVP livrées", "100 %", "100 % ✓"],
        ["Délai de démarrage (stack complète)", "≤ 5 min", "~3 min ✓"],
        ["Endpoints API protégés par JWT", "100 %", "100 % ✓"],
        ["Rôles couverts", "3", "3 (ADMIN, RECRUITER, CANDIDATE) ✓"],
        ["Pages portail candidat", "≥ 6", "7 pages ✓"],
        ["Statuts pipeline couverts", "6", "6 (RECEIVED → REJECTED) ✓"],
      ],
      [40, 20, 40]
    ),
    pbk(),
  ];
}

// ─── Chapitre 3 ───────────────────────────────────────────────────────────────

function chapitre3() {
  return [
    h1("Chapitre 3 — Cahier des charges et périmètre"),

    h2("3.1 Périmètre fonctionnel MVP livré"),
    para("L'ensemble des fonctionnalités suivantes a été implémenté et validé dans le cadre de ce PFA :"),

    h3("3.1.1 Module Authentification"),
    bullet("Connexion par email/mot de passe avec génération de token JWT (durée : 24h)."),
    bullet("Changement de mot de passe obligatoire au premier login (flag firstLogin en base)."),
    bullet("Déconnexion côté frontend (suppression du token localStorage)."),
    bullet("Gestion des rôles via Spring Security : ADMIN, RECRUITER, CANDIDATE."),

    h3("3.1.2 Module Candidats (côté Recruteur)"),
    bullet("CRUD complet : création, lecture, modification, suppression."),
    bullet("Création automatique d'un compte User (rôle CANDIDATE) à la création du candidat, avec mot de passe aléatoire de 10 caractères."),
    bullet("Envoi des identifiants par notification email (mode log-console si SMTP désactivé)."),
    bullet("Upload et stockage du CV (fichier PDF, max 5 MB) dans uploads/cvs/."),
    bullet("Champs enrichis : lettre de motivation, expériences professionnelles, diplômes, poste visé."),

    h3("3.1.3 Module Offres d'emploi"),
    bullet("CRUD complet avec les statuts : DRAFT, PUBLISHED, CLOSED."),
    bullet("Champ requiredSkills (compétences requises)."),
    bullet("Filtrage côté portail candidat : seules les offres PUBLISHED sont affichées."),

    h3("3.1.4 Module Candidatures"),
    bullet("Création d'une candidature liant un Candidat et une Offre d'emploi."),
    bullet("Pipeline à six statuts : RECEIVED → UNDER_REVIEW → INTERVIEW → EVALUATION → ACCEPTED / REJECTED."),
    bullet("Historique automatique de chaque transition de statut (entité StatusHistoryEntry)."),
    bullet("Notification in-app + email à chaque changement de statut."),

    h3("3.1.5 Module Entretiens"),
    bullet("Planification d'un entretien associé à une candidature."),
    bullet("Champs : date, heure, lieu (optionnel), lien visioconférence, instructions de préparation, statut (PLANNED / COMPLETED / CANCELLED)."),
    bullet("Notification d'invitation envoyée au candidat à la création de l'entretien."),

    h3("3.1.6 Module Évaluations"),
    bullet("Notation sur trois critères : compétences techniques, attitude/comportement, potentiel."),
    bullet("Score global = moyenne des trois critères, calculé automatiquement via @PrePersist / @PreUpdate."),
    bullet("Recommandation : HIRE si globalScore ≥ 3.5, REJECT sinon."),
    bullet("Mise à jour automatique du statut de la candidature vers EVALUATION."),

    h3("3.1.7 Portail Candidat (7 pages)"),
    bullet("Page d'accueil : tableau de bord personnel avec pipeline visuel du statut actuel."),
    bullet("Page Profil : modification de profil (téléphone, compétences, lettre de motivation, expériences, diplômes) et upload de CV."),
    bullet("Page Ma candidature : détails de l'offre, pipeline interactif, liste des entretiens, historique des statuts."),
    bullet("Page Entretiens : liste de tous les entretiens avec lien visio, instructions, score d'évaluation."),
    bullet("Page Notifications : liste des notifications avec marquage lu/non lu, marquage global."),
    bullet("Page Offre d'embauche : affichage de l'offre reçue avec boutons Accepter / Refuser."),
    bullet("Page Changer mot de passe : changement sécurisé avec validation et mise à jour du token JWT."),

    h3("3.1.8 Module Rapports (côté Recruteur)"),
    bullet("Tableau de bord avec KPIs : postes ouverts, candidats actifs, taux de conversion, délai moyen."),
    bullet("Pipeline par statut (barre segmentée en six couleurs)."),
    bullet("Rapport par poste : nombre total, acceptés, refusés, taux de conversion."),
    bullet("Export CSV (opencsv) : liste de toutes les candidatures."),
    bullet("Export PDF (OpenPDF) : rapport en tableau A4 paysage."),

    h3("3.1.9 Module Administration"),
    bullet("Gestion des recruteurs : création (avec rôle RECRUITER), liste, suppression."),

    h2("3.2 Hors périmètre"),
    para("Les éléments suivants ont été volontairement exclus du périmètre MVP, faute de temps ou parce qu'ils constituent des évolutions naturelles du projet :"),
    bullet("Intégration de jobboards externes (LinkedIn, Indeed, ANAPEC)."),
    bullet("Module de tests en ligne (QCM, coding challenge) pour les candidats."),
    bullet("IA/ML pour le scoring automatique de compatibilité CV/offre."),
    bullet("Pipeline CI/CD automatisé (Jenkins, GitHub Actions)."),
    bullet("Déploiement en production (cloud, Heroku, VPS)."),
    bullet("Application mobile native (iOS/Android)."),
    bullet("Mode multi-entreprises (multi-tenancy)."),
    pbk(),
  ];
}

// ─── Chapitre 4 ───────────────────────────────────────────────────────────────

function chapitre4() {
  return [
    h1("Chapitre 4 — Méthodologie et organisation"),

    h2("4.1 Approche de développement"),
    para("Le projet a été conduit selon une approche itérative et incrémentale inspirée de la méthode Scrum, adaptée à un binôme en contexte académique. Le développement a été divisé en sprints de deux semaines, chacun livrant un ensemble de fonctionnalités testables."),
    makeTable(
      ["Sprint", "Durée", "Objectif principal", "Livrable"],
      [
        ["Sprint 0", "1 semaine", "Setup & architecture", "Projet initialisé, JWT fonctionnel"],
        ["Sprint 1", "2 semaines", "Backend entités & CRUD de base", "CRUD Candidate, JobOffer, Application"],
        ["Sprint 2", "2 semaines", "Sécurité & rôles", "Spring Security RBAC, 3 rôles, change-password"],
        ["Sprint 3", "2 semaines", "Entretiens & Évaluations", "Interview CRUD, Evaluation 3 critères"],
        ["Sprint 4", "2 semaines", "Notifications & PDF", "NotificationService, OpenPDF, OpenCSV"],
        ["Sprint 5", "2 semaines", "Frontend recruteur", "Dashboard, Pipeline, Rapports"],
        ["Sprint 6", "2 semaines", "Portail candidat", "7 pages portail, composants réutilisables"],
        ["Sprint 7", "1 semaine", "Tests, corrections, rapport", "MVP validé, rapport PFA"],
      ],
      [10, 12, 38, 40]
    ),

    h2("4.2 Répartition des tâches"),
    para("Le travail a été réparti de manière complémentaire entre les deux membres de l'équipe :"),
    makeTable(
      ["Tâche", "Responsable principal"],
      [
        ["Architecture backend, entités JPA, relations", "Dhafer Smeti"],
        ["Spring Security, JWT, gestion des rôles", "Dhafer Smeti"],
        ["Services métier (Application, Evaluation, Notification)", "Dhafer Smeti"],
        ["Génération PDF (OpenPDF) et export CSV (OpenCSV)", "Khedhri Takoua"],
        ["Dashboard API, DashboardService, KPIs", "Khedhri Takoua"],
        ["Frontend React : routage, AuthContext, Sidebar", "Khedhri Takoua"],
        ["Frontend : pages portail candidat (7 pages)", "Dhafer Smeti"],
        ["Frontend : composants réutilisables (Pipeline, Timeline, etc.)", "Dhafer Smeti"],
        ["Frontend : pages recruteur (Dashboard, Rapports)", "Khedhri Takoua"],
        ["DataInitializer & tests manuels", "Les deux"],
      ],
      [70, 30]
    ),

    h2("4.3 Outils de pilotage"),
    bullet("Développement : VS Code (frontend), IntelliJ IDEA (backend)."),
    bullet("Gestion de versions : Git avec dépôt local."),
    bullet("Test API : Postman (collections organisées par groupe d'endpoints)."),
    bullet("Base de données locale : XAMPP (Apache + MySQL 8.x)."),
    bullet("Build backend : Maven 3.9.x (mvn spring-boot:run)."),
    bullet("Build frontend : Vite 5.x (npm run dev, port 5173)."),
    pbk(),
  ];
}

// ─── Chapitre 5 ───────────────────────────────────────────────────────────────

function chapitre5() {
  return [
    h1("Chapitre 5 — Architecture et conception technique"),

    h2("5.1 Vue d'ensemble — Architecture en couches"),
    para("RecruitTracker est basé sur une architecture trois-tiers classique, avec une séparation stricte des responsabilités entre les couches de présentation, de traitement métier et de persistance."),
    ...codePara([
      "┌─────────────────────────────────────────────────────────────────┐",
      "│                    COUCHE PRÉSENTATION                          │",
      "│   React 18 + Vite + Tailwind CSS   (port 5173)                  │",
      "│   axios ──► JWT interceptor ──► AuthContext ──► React Router    │",
      "├─────────────────────────────────────────────────────────────────┤",
      "│                      API REST (JSON)                            │",
      "│           HTTP/S   ──   /api/**   ──   JWT Bearer               │",
      "├─────────────────────────────────────────────────────────────────┤",
      "│                  COUCHE CONTRÔLEUR (Spring MVC)                 │",
      "│  AuthController │ CandidateController │ ApplicationController   │",
      "│  InterviewController │ EvaluationController │ DashboardCtrl     │",
      "│  CandidatePortalController │ RecruiterController │ AdminCtrl    │",
      "├─────────────────────────────────────────────────────────────────┤",
      "│                   COUCHE SERVICE (Métier)                       │",
      "│  CandidateService │ ApplicationService │ EvaluationService      │",
      "│  NotificationService │ MailService │ OfferEmbaucheService       │",
      "│  ReportService │ DashboardService │ InterviewService            │",
      "├─────────────────────────────────────────────────────────────────┤",
      "│              COUCHE PERSISTANCE (Spring Data JPA)               │",
      "│  Repository<T, Long>  ──  Hibernate ORM  ──  MySQL 8            │",
      "│           (port 3306, schéma recrutement_db)                    │",
      "└─────────────────────────────────────────────────────────────────┘",
    ]),

    h2("5.2 Choix techniques"),
    makeTable(
      ["Composant", "Technologie", "Version", "Justification"],
      [
        ["Runtime backend", "Java (JDK)", "21 LTS", "Dernière LTS, performances améliorées"],
        ["Framework backend", "Spring Boot", "3.2.5", "Auto-configuration, écosystème complet"],
        ["ORM", "Hibernate / Spring Data JPA", "6.x", "Abstraction BDD, migrations auto ddl-auto=update"],
        ["Sécurité", "Spring Security + JJWT", "6.x / 0.12.5", "Stateless, RBAC, token JWT signé HMAC-SHA256"],
        ["BDD", "MySQL", "8.x via XAMPP", "Relationnel, stable, facile à installer localement"],
        ["Génération PDF", "OpenPDF", "2.0.3", "Fork de iText v5, licence LGPL, API simple"],
        ["Export CSV", "OpenCSV", "5.9", "Standard de facto pour la génération CSV en Java"],
        ["Build backend", "Maven", "3.9.x", "Standard écosystème Spring, géré par Spring Initializr"],
        ["Framework frontend", "React", "18", "Composants fonctionnels, hooks, performance"],
        ["Bundler frontend", "Vite", "5.x", "Démarrage ultra-rapide, HMR instantané"],
        ["Style CSS", "Tailwind CSS", "3.x", "Utility-first, design cohérent sans CSS custom"],
        ["HTTP client", "axios", "1.x", "Intercepteurs JWT, gestion d'erreurs centralisée"],
        ["Routing frontend", "react-router-dom", "v6", "Routing déclaratif, loaders, ProtectedRoute"],
        ["Notifications UI", "react-hot-toast", "2.x", "Toasts contextuels légers"],
        ["Icônes", "lucide-react", "latest", "SVG propres, tree-shakeable"],
        ["Hachage mdp", "BCrypt", "(via Spring Security)", "Algorithme de référence, coût ajustable"],
        ["Lombok", "Lombok", "1.18.x", "Réduction boilerplate @Data, @Builder, @RequiredArgsConstructor"],
      ],
      [20, 20, 18, 42]
    ),

    h2("5.3 Diagrammes de conception"),

    h3("5.3.1 Diagramme de cas d'utilisation"),
    ...codePara([
      "                    ┌─────────────────────────────────────────────────────┐",
      "                    │                   RecruitTracker                    │",
      "                    │                                                     │",
      "   ┌────────┐       │  ┌─────────────────────────────────────────────┐   │",
      "   │ ADMIN  │──────►│  │ Gérer les recruteurs (créer/lister/supprimer)│   │",
      "   └────────┘       │  └─────────────────────────────────────────────┘   │",
      "                    │                                                     │",
      "   ┌──────────┐     │  ┌─────────────────┐   ┌─────────────────────┐    │",
      "   │RECRUTEUR │─────│──│ Gérer candidats  │   │  Gérer offres       │    │",
      "   └──────────┘     │  └─────────────────┘   └─────────────────────┘    │",
      "         │          │  ┌─────────────────┐   ┌─────────────────────┐    │",
      "         └──────────│──│ Gérer candidatures│  │ Planifier entretiens│    │",
      "                    │  └─────────────────┘   └─────────────────────┘    │",
      "                    │  ┌─────────────────┐   ┌─────────────────────┐    │",
      "                    │  │ Évaluer entretien│   │Générer offre PDF    │    │",
      "                    │  └─────────────────┘   └─────────────────────┘    │",
      "                    │  ┌─────────────────┐   ┌─────────────────────┐    │",
      "                    │  │ Dashboard KPIs  │   │ Export CSV / PDF    │    │",
      "                    │  └─────────────────┘   └─────────────────────┘    │",
      "                    │                                                     │",
      "   ┌──────────┐     │  ┌─────────────────┐   ┌─────────────────────┐    │",
      "   │CANDIDAT  │─────│──│Consulter candidat│   │Mettre à jour profil │    │",
      "   └──────────┘     │  └─────────────────┘   └─────────────────────┘    │",
      "         │          │  ┌─────────────────┐   ┌─────────────────────┐    │",
      "         └──────────│──│Voir entretiens  │   │Accepter/Refuser offre│    │",
      "                    │  └─────────────────┘   └─────────────────────┘    │",
      "                    │  ┌─────────────────┐   ┌─────────────────────┐    │",
      "                    │  │Voir notifications│   │Changer mot de passe │    │",
      "                    │  └─────────────────┘   └─────────────────────┘    │",
      "                    └─────────────────────────────────────────────────────┘",
    ]),

    h3("5.3.2 Diagramme de classes (entités principales)"),
    ...codePara([
      "  ┌──────────────┐        ┌──────────────────────┐",
      "  │    User      │1      1│      Candidate        │",
      "  ├──────────────┤────────├──────────────────────┤",
      "  │ id: Long     │        │ id: Long              │",
      "  │ name: String │        │ name, email, phone    │",
      "  │ email        │        │ skills, coverLetter   │",
      "  │ password     │        │ experiences, diplomas │",
      "  │ role: ENUM   │        │ cvFilePath            │",
      "  │ firstLogin   │        │ user: User (1:1)      │",
      "  │ candidateId  │        │ targetJobOffer (M:1)  │",
      "  └──────────────┘        └──────────┬───────────┘",
      "                                      │ 1",
      "  ┌──────────────┐         ┌──────────┴───────────┐",
      "  │   JobOffer   │1       *│    Application        │",
      "  ├──────────────┤─────────├──────────────────────┤",
      "  │ id: Long     │         │ id: Long              │",
      "  │ title        │         │ status: ENUM          │",
      "  │ description  │         │ appliedDate           │",
      "  │ requiredSkills│        │ statusHistory (1:N)   │",
      "  │ status: ENUM │         │ interviews (1:N)      │",
      "  │ datePosted   │         │ offerEmbauche (1:1)   │",
      "  └──────────────┘         └──────────┬───────────┘",
      "                                        │ 1",
      "          ┌─────────────────────────────┼─────────────────────┐",
      "          │                             │                     │",
      "  ┌───────┴──────┐           ┌──────────┴──────┐  ┌──────────┴────────┐",
      "  │  Interview   │           │StatusHistoryEntry│  │ JobOfferEmbauche  │",
      "  ├──────────────┤           ├─────────────────┤  ├───────────────────┤",
      "  │ date, time   │           │ oldStatus        │  │ position, salary  │",
      "  │ location     │           │ newStatus        │  │ startDate, benefits│",
      "  │ meetingLink  │           │ changedAt        │  │ status: ENUM      │",
      "  │ status: ENUM │           │ changedBy        │  │ pdfPath           │",
      "  └──────┬───────┘           └─────────────────┘  └───────────────────┘",
      "         │ 1",
      "  ┌──────┴───────┐    ┌───────────────────────────┐",
      "  │  Evaluation  │    │       Notification        │",
      "  ├──────────────┤    ├───────────────────────────┤",
      "  │ competence   │    │ userId: Long              │",
      "  │ attitude     │    │ title, message            │",
      "  │ potential    │    │ type: ENUM                │",
      "  │ globalScore  │    │ read: boolean             │",
      "  │ recommendation│   │ relatedEntityId           │",
      "  └──────────────┘    └───────────────────────────┘",
    ]),
    pbk(),
  ];
}

// ─── Chapitre 6 ───────────────────────────────────────────────────────────────

function chapitre6() {
  return [
    h1("Chapitre 6 — Implémentation backend (Spring Boot)"),

    h2("6.1 Structure des packages"),
    ...codePara([
      "src/main/java/com/recrutement/app/",
      "├── RecrutementAppApplication.java       # Point d'entrée Spring Boot",
      "├── config/",
      "│   ├── SecurityConfig.java              # Filter chain, CORS, RBAC",
      "│   ├── DataInitializer.java             # Données de test au démarrage",
      "│   └── JwtAuthFilter.java               # Filtre JWT (OncePerRequestFilter)",
      "├── controller/",
      "│   ├── AuthController.java              # /api/auth/login, /change-password",
      "│   ├── CandidateController.java         # /api/candidates/**",
      "│   ├── JobOfferController.java          # /api/job-offers/**",
      "│   ├── ApplicationController.java       # /api/applications/**",
      "│   ├── InterviewController.java         # /api/interviews/**",
      "│   ├── EvaluationController.java        # /api/evaluations/**",
      "│   ├── DashboardController.java         # /api/recruiter/dashboard",
      "│   ├── RecruiterController.java         # /api/recruiter/**",
      "│   ├── CandidatePortalController.java   # /api/candidate/me/**",
      "│   └── AdminController.java             # /api/admin/**",
      "├── service/",
      "│   ├── CandidateService.java",
      "│   ├── ApplicationService.java",
      "│   ├── InterviewService.java",
      "│   ├── EvaluationService.java",
      "│   ├── JobOfferService.java",
      "│   ├── NotificationService.java",
      "│   ├── MailService.java",
      "│   ├── OfferEmbaucheService.java",
      "│   ├── DashboardService.java",
      "│   └── ReportService.java",
      "├── repository/",
      "│   ├── UserRepository.java",
      "│   ├── CandidateRepository.java",
      "│   ├── ApplicationRepository.java",
      "│   ├── InterviewRepository.java",
      "│   ├── EvaluationRepository.java",
      "│   ├── JobOfferRepository.java",
      "│   ├── NotificationRepository.java",
      "│   ├── StatusHistoryEntryRepository.java",
      "│   └── JobOfferEmbaucheRepository.java",
      "├── entity/",
      "│   ├── User.java, Candidate.java, JobOffer.java",
      "│   ├── Application.java, Interview.java, Evaluation.java",
      "│   ├── Notification.java, StatusHistoryEntry.java",
      "│   └── JobOfferEmbauche.java",
      "├── dto/",
      "│   ├── LoginResponse.java               # + mustChangePassword",
      "│   ├── ChangePasswordRequest.java",
      "│   ├── CandidateDto.java, ApplicationDto.java",
      "│   ├── EvaluationDto.java               # 3 scores + globalScore",
      "│   ├── DashboardStatsDto.java           # KPIs enrichis",
      "│   ├── StatusHistoryEntryDto.java",
      "│   └── JobOfferEmbaucheDto.java",
      "└── security/",
      "    └── JwtService.java                  # generateToken, validateToken",
    ]),

    h2("6.2 Modèle de données — Entités"),

    h3("6.2.1 Entité User"),
    makeTable(
      ["Champ", "Type", "Contraintes", "Description"],
      [
        ["id", "Long", "PK, auto-increment", "Identifiant unique"],
        ["name", "String", "NOT NULL", "Nom complet"],
        ["email", "String", "UNIQUE, NOT NULL", "Email de connexion"],
        ["password", "String", "NOT NULL", "Mot de passe BCrypt"],
        ["role", "ENUM", "NOT NULL (ADMIN/RECRUITER/CANDIDATE)", "Rôle RBAC"],
        ["firstLogin", "boolean", "default true", "Oblige le changement de mdp"],
        ["enabled", "boolean", "default true", "Activation du compte"],
        ["phone", "String", "nullable", "Téléphone"],
        ["candidateId", "Long", "nullable, FK vers Candidate", "Lien backward-compat"],
      ],
      [20, 15, 30, 35]
    ),

    h3("6.2.2 Entité Candidate"),
    makeTable(
      ["Champ", "Type", "Description"],
      [
        ["id", "Long", "Identifiant unique"],
        ["name, email, phone", "String", "Informations de contact"],
        ["skills", "TEXT", "Compétences (format libre)"],
        ["coverLetter", "TEXT", "Lettre de motivation"],
        ["experiences", "TEXT", "Expériences professionnelles"],
        ["diplomas", "TEXT", "Diplômes obtenus"],
        ["cvFileName / cvFilePath", "String", "Référence du fichier CV uploadé"],
        ["targetJobOffer", "ManyToOne → JobOffer", "Poste visé par défaut"],
        ["user", "OneToOne → User (LAZY)", "Compte de connexion associé"],
        ["createdAt", "LocalDateTime", "@CreationTimestamp"],
      ],
      [30, 25, 45]
    ),

    h3("6.2.3 Entité Application"),
    makeTable(
      ["Champ", "Type", "Description"],
      [
        ["id", "Long", "Identifiant unique"],
        ["candidate", "ManyToOne → Candidate", "Candidat concerné"],
        ["jobOffer", "ManyToOne → JobOffer", "Offre d'emploi"],
        ["status", "ENUM", "RECEIVED | UNDER_REVIEW | INTERVIEW | EVALUATION | ACCEPTED | REJECTED"],
        ["appliedDate", "@CreationTimestamp", "Date de dépôt de la candidature"],
        ["updatedAt", "@UpdateTimestamp", "Dernière mise à jour"],
        ["statusHistory", "OneToMany → StatusHistoryEntry", "Historique des transitions de statut"],
        ["interviews", "OneToMany → Interview", "Entretiens planifiés"],
        ["offerEmbauche", "OneToOne → JobOfferEmbauche", "Offre d'embauche générée"],
      ],
      [25, 30, 45]
    ),

    h3("6.2.4 Entité Evaluation"),
    makeTable(
      ["Champ", "Type", "Description"],
      [
        ["competenceScore", "int (1-5)", "Note compétences techniques"],
        ["attitudeScore", "int (1-5)", "Note attitude/comportement"],
        ["potentialScore", "int (1-5)", "Note potentiel"],
        ["globalScore", "double", "Moyenne des 3 scores (calculée @PrePersist)"],
        ["recommendation", "ENUM", "HIRE (globalScore ≥ 3.5) ou REJECT"],
        ["comment", "TEXT", "Commentaire libre du recruteur"],
        ["interview", "OneToOne → Interview", "Entretien évalué"],
      ],
      [25, 20, 55]
    ),

    h2("6.3 Sécurité — Spring Security + JWT"),
    para("La sécurité de l'application est gérée par Spring Security 6.x avec une architecture stateless basée sur les tokens JWT (JSON Web Tokens), signés avec l'algorithme HMAC-SHA256."),

    h3("6.3.1 Chaîne de filtres"),
    para("À chaque requête HTTP entrante, le JwtAuthFilter (OncePerRequestFilter) intercepte la requête, extrait le token Bearer depuis l'en-tête Authorization, le valide via JwtService, et charge l'utilisateur depuis la base de données. Si le token est valide, un UsernamePasswordAuthenticationToken est placé dans le SecurityContext."),

    h3("6.3.2 RBAC — Contrôle d'accès par rôle"),
    makeTable(
      ["URL pattern", "Rôle(s) autorisé(s)"],
      [
        ["/api/auth/**", "Public (non authentifié)"],
        ["/api/admin/**", "ADMIN uniquement"],
        ["/api/recruiter/**", "RECRUITER ou ADMIN"],
        ["/api/candidates/**, /api/job-offers/**, /api/applications/**, /api/interviews/**, /api/evaluations/**", "RECRUITER ou ADMIN"],
        ["/api/candidate/**", "CANDIDATE uniquement"],
        ["/api/auth/change-password", "Tout utilisateur authentifié"],
      ],
      [55, 45]
    ),

    h3("6.3.3 Changement de mot de passe au premier login"),
    para("Lors du login, si l'utilisateur a le flag firstLogin=true, la réponse LoginResponse inclut le champ mustChangePassword: true. Le frontend détecte ce flag et redirige obligatoirement vers la page de changement de mot de passe. L'endpoint POST /api/auth/change-password valide l'ancien mot de passe, encode le nouveau avec BCrypt, passe firstLogin à false et renvoie un nouveau token JWT."),

    h2("6.4 API REST — Endpoints par groupe"),
    makeTable(
      ["Méthode", "URL", "Rôle", "Description"],
      [
        ["POST", "/api/auth/login", "Public", "Authentification, retourne JWT + mustChangePassword"],
        ["POST", "/api/auth/change-password", "Auth", "Change le mot de passe, retourne nouveau JWT"],
        ["GET", "/api/admin/recruiters", "ADMIN", "Liste des recruteurs"],
        ["POST", "/api/admin/recruiters", "ADMIN", "Crée un recruteur"],
        ["DELETE", "/api/admin/recruiters/{id}", "ADMIN", "Supprime un recruteur"],
        ["GET", "/api/candidates", "REC/ADM", "Liste tous les candidats"],
        ["POST", "/api/candidates", "REC/ADM", "Crée candidat + User CANDIDATE automatiquement"],
        ["PUT", "/api/candidates/{id}", "REC/ADM", "Met à jour un candidat"],
        ["DELETE", "/api/candidates/{id}", "REC/ADM", "Supprime candidat + User associé"],
        ["GET", "/api/job-offers", "REC/ADM", "Liste des offres d'emploi"],
        ["POST/PUT/DELETE", "/api/job-offers/**", "REC/ADM", "CRUD offres d'emploi"],
        ["GET", "/api/applications", "REC/ADM", "Liste toutes les candidatures"],
        ["POST", "/api/applications", "REC/ADM", "Crée une candidature"],
        ["PUT", "/api/applications/{id}/status", "REC/ADM", "Change le statut → historique + notification"],
        ["GET", "/api/interviews", "REC/ADM", "Liste des entretiens"],
        ["POST", "/api/interviews", "REC/ADM", "Planifie un entretien"],
        ["POST", "/api/evaluations", "REC/ADM", "Crée une évaluation (3 critères)"],
        ["GET", "/api/recruiter/dashboard", "REC/ADM", "KPIs du tableau de bord"],
        ["GET", "/api/recruiter/reports/by-position", "REC/ADM", "Rapport par poste"],
        ["GET", "/api/recruiter/reports/export/csv", "REC/ADM", "Export CSV (blob)"],
        ["GET", "/api/recruiter/reports/export/pdf", "REC/ADM", "Export PDF (blob)"],
        ["POST", "/api/recruiter/applications/{id}/offer", "REC/ADM", "Génère une offre d'embauche PDF"],
        ["GET", "/api/candidate/me", "CANDIDATE", "Profil + statut candidature"],
        ["PUT", "/api/candidate/me", "CANDIDATE", "Mise à jour profil"],
        ["POST", "/api/candidate/me/cv", "CANDIDATE", "Upload CV (multipart/form-data)"],
        ["GET", "/api/candidate/me/application", "CANDIDATE", "Détails candidature + historique"],
        ["GET", "/api/candidate/me/interviews", "CANDIDATE", "Liste des entretiens"],
        ["GET", "/api/candidate/me/notifications", "CANDIDATE", "Notifications in-app"],
        ["PUT", "/api/candidate/me/notifications/{id}/read", "CANDIDATE", "Marque une notification lue"],
        ["GET", "/api/candidate/me/offer", "CANDIDATE", "Voir l'offre d'embauche"],
        ["POST", "/api/candidate/me/offer/accept", "CANDIDATE", "Accepter l'offre"],
        ["POST", "/api/candidate/me/offer/reject", "CANDIDATE", "Refuser l'offre"],
      ],
      [10, 38, 12, 40]
    ),

    h2("6.5 Services métier clés"),

    h3("6.5.1 NotificationService"),
    para("Ce service est le cœur du système de communication. À chaque événement métier, il crée une entrée dans la table notifications (toujours), puis délègue à MailService l'envoi d'un email si app.mail.enabled=true. Événements couverts : création de compte (CREDENTIALS), changement de statut (STATUS_CHANGE), convocation d'entretien (INTERVIEW), envoi d'offre d'embauche (OFFER)."),
    para("La méthode resolveUserId() utilise userRepository.findByCandidateId() pour retrouver l'userId depuis l'ID du candidat, assurant la compatibilité avec les deux modes de navigation (User → Candidate et Candidate → User)."),

    h3("6.5.2 ApplicationService"),
    para("La méthode updateStatus(Long id, Application.Status newStatus, String changedBy) est le seul point d'entrée pour tout changement de statut. Elle sauvegarde un StatusHistoryEntry avec l'ancien et le nouveau statut, le timestamp et l'auteur du changement, puis déclenche une notification via NotificationService."),

    h3("6.5.3 EvaluationService"),
    para("Lors de la création d'une évaluation, le service calcule automatiquement le globalScore = (competenceScore + attitudeScore + potentialScore) / 3.0 via l'annotation @PrePersist sur l'entité Evaluation. La recommendation est automatiquement définie : HIRE si globalScore ≥ 3.5, REJECT sinon. La candidature associée est automatiquement passée au statut EVALUATION."),

    h3("6.5.4 OfferEmbaucheService"),
    para("Ce service génère un PDF d'offre d'embauche avec OpenPDF (com.lowagie.text.*). Le document PDF inclut : en-tête ITEAM, informations du candidat, poste, salaire, date de début, avantages et bloc de signature. Le fichier est sauvegardé dans uploads/offers/ et le chemin est stocké en base pour téléchargement ultérieur."),

    h3("6.5.5 ReportService"),
    para("Deux exports sont fournis : (1) CSV via OpenCSV — toutes les candidatures avec colonnes ID, Candidat, Email, Poste, Statut, Date ; (2) PDF via OpenPDF — tableau récapitulatif en format A4 paysage avec alternance de couleurs de lignes pour la lisibilité."),

    pbk(),
  ];
}

// ─── Chapitre 7 ───────────────────────────────────────────────────────────────

function chapitre7() {
  return [
    h1("Chapitre 7 — Implémentation frontend (React)"),

    h2("7.1 Structure du projet frontend"),
    ...codePara([
      "frontend/src/",
      "├── api/                          # Couche d'accès API (axios)",
      "│   ├── axiosInstance.js          # Instance axios + intercepteur JWT",
      "│   ├── authApi.js                # login, changePassword",
      "│   ├── candidatesApi.js          # CRUD candidats + uploadCv",
      "│   ├── jobOffersApi.js           # CRUD offres",
      "│   ├── applicationsApi.js        # CRUD candidatures",
      "│   ├── interviewsApi.js          # CRUD entretiens",
      "│   ├── evaluationsApi.js         # create, findByInterview",
      "│   ├── dashboardApi.js           # getStats, getReportByPos, exportCsv, exportPdf",
      "│   └── candidatePortalApi.js     # portail candidat (12 méthodes)",
      "├── components/                   # Composants réutilisables",
      "│   ├── Layout.jsx                # Sidebar + zone de contenu",
      "│   ├── Sidebar.jsx               # Navigation par rôle",
      "│   ├── ProtectedRoute.jsx        # Garde de route par rôle",
      "│   ├── StatusBadge.jsx           # Badge coloré selon statut",
      "│   ├── Pipeline.jsx              # Pipeline visuel 5 étapes",
      "│   ├── Timeline.jsx              # Historique vertical des statuts",
      "│   ├── KPICard.jsx               # Carte KPI avec gradient",
      "│   ├── EmptyState.jsx            # État vide (icône + message)",
      "│   ├── NotificationBell.jsx      # Cloche avec compteur non-lus",
      "│   └── Spinner.jsx               # Indicateur de chargement",
      "├── context/",
      "│   └── AuthContext.jsx           # Contexte global : user, token, login, logout",
      "├── pages/",
      "│   ├── LoginPage.jsx",
      "│   ├── DashboardPage.jsx         # Tableau de bord recruteur",
      "│   ├── candidates/               # CandidatesPage, CandidateFormPage, CandidateDetailPage",
      "│   ├── joboffers/                # JobOffersPage, JobOfferFormPage",
      "│   ├── applications/             # ApplicationsPage, ApplicationFormPage",
      "│   ├── interviews/               # InterviewsPage, InterviewFormPage, EvaluationPage",
      "│   ├── reports/                  # ReportsPage",
      "│   └── portal/                   # 7 pages portail + ChangePasswordPage",
      "└── App.jsx                       # Routeur principal",
    ]),

    h2("7.2 Routage par rôle"),
    para("La gestion du routage est assurée par react-router-dom v6 avec un composant ProtectedRoute. Ce composant vérifie si l'utilisateur est authentifié (token présent dans AuthContext) et si son rôle figure dans la liste allowedRoles de la route. En cas d'échec, il redirige vers /login."),
    makeTable(
      ["Route", "Composant", "Rôles autorisés"],
      [
        ["/", "DashboardPage", "ADMIN, RECRUITER"],
        ["/reports", "ReportsPage", "ADMIN, RECRUITER"],
        ["/candidates/**", "CandidatesPage / CandidateFormPage", "ADMIN, RECRUITER"],
        ["/job-offers/**", "JobOffersPage / JobOfferFormPage", "ADMIN, RECRUITER"],
        ["/applications/**", "ApplicationsPage / ApplicationFormPage", "ADMIN, RECRUITER"],
        ["/interviews/**", "InterviewsPage / InterviewFormPage / EvaluationPage", "ADMIN, RECRUITER"],
        ["/portal", "PortalHomePage", "CANDIDATE"],
        ["/portal/profile", "PortalProfilePage", "CANDIDATE"],
        ["/portal/application", "PortalApplicationPage", "CANDIDATE"],
        ["/portal/interviews", "PortalInterviewsPage", "CANDIDATE"],
        ["/portal/notifications", "PortalNotificationsPage", "CANDIDATE"],
        ["/portal/offer", "PortalOfferPage", "CANDIDATE"],
        ["/portal/change-password", "ChangePasswordPage", "CANDIDATE"],
        ["/change-password", "ChangePasswordPage", "ADMIN, RECRUITER"],
      ],
      [30, 35, 35]
    ),

    h2("7.3 Gestion de l'authentification"),
    para("L'AuthContext centralise l'état d'authentification : token JWT, objet user (name, role, mustChangePassword), fonctions login() et logout(). Le token est persisté dans localStorage. À chaque démarrage, le contexte relit localStorage pour restaurer la session."),
    para("L'instance axios (axiosInstance.js) configure automatiquement l'en-tête Authorization: Bearer <token> pour toutes les requêtes sortantes via un intercepteur de requête. Un intercepteur de réponse gère les erreurs 401 (token expiré) en déclenchant une déconnexion automatique."),
    para("Après le login, si la réponse contient mustChangePassword: true, l'utilisateur est redirigé vers /portal/change-password (candidat) ou /change-password (staff) avant d'accéder à l'application."),

    h2("7.4 Portail Candidat — 7 pages"),
    makeTable(
      ["Page", "Route", "Fonctionnalité principale"],
      [
        ["PortalHomePage", "/portal", "Tableau de bord personnel, pipeline du statut actuel, raccourcis"],
        ["PortalProfilePage", "/portal/profile", "Édition profil (téléphone, compétences, LM, exp., diplômes), upload CV"],
        ["PortalApplicationPage", "/portal/application", "Détails offre, Pipeline visuel, liste entretiens, Timeline historique statuts"],
        ["PortalInterviewsPage", "/portal/interviews", "Entretiens avec date/heure, lien visio, instructions, score d'évaluation"],
        ["PortalNotificationsPage", "/portal/notifications", "Notifications classées par type, marquage lu/non lu individuel et global"],
        ["PortalOfferPage", "/portal/offer", "Offre d'embauche (poste, salaire, date début, avantages), accepter/refuser"],
        ["ChangePasswordPage", "/portal/change-password", "Ancien + nouveau mdp, validation, nouveau JWT sauvegardé"],
      ],
      [28, 27, 45]
    ),

    h2("7.5 Interface Recruteur"),
    para("Le tableau de bord recruteur (DashboardPage) affiche quatre KPI cards en gradient (postes ouverts, candidats actifs, taux de conversion, délai moyen de recrutement), un pipeline segmenté en six couleurs représentant la répartition des candidatures par statut, et la liste des huit candidatures les plus récentes."),
    para("La page Rapports (ReportsPage) présente un tableau by-position avec mini-barres de progression en CSS, ainsi que des boutons d'export CSV et PDF. Les téléchargements sont gérés via des blobs axios avec création dynamique d'un élément <a> dans le DOM."),

    h2("7.6 Composants réutilisables"),
    makeTable(
      ["Composant", "Description"],
      [
        ["Pipeline", "Pipeline visuel horizontal à 5 étapes avec cercles colorés, connecteurs et labels. États : done (vert), active (indigo scalé), rejected (rouge), future (gris)."],
        ["Timeline", "Historique vertical des changements de statut avec icône de statut, date et auteur du changement."],
        ["StatusBadge", "Badge coloré selon le statut : RECEIVED (sky), UNDER_REVIEW (amber), INTERVIEW (blue), EVALUATION (violet), ACCEPTED (emerald), REJECTED (red), PUBLISHED, DRAFT, CLOSED, etc."],
        ["KPICard", "Carte avec gradient de couleur, icône, valeur principale et sous-titre."],
        ["EmptyState", "État vide centré avec icône configurable, titre et description."],
        ["NotificationBell", "Cloche avec badge de compteur non-lus, dropdown avec liste des notifications et type-icons emoji."],
      ],
      [22, 78]
    ),

    h2("7.7 Design system et style"),
    para("Le design système est construit sur Tailwind CSS avec des classes utilitaires personnalisées définies dans index.css : .btn-primary, .btn-secondary, .card, .input-field, .page-title. La palette de couleurs primaires est centrée sur l'indigo (primary-600 = #4F46E5) avec des accents émeraude pour les succès, rouge pour les erreurs et ambre pour les avertissements."),
    para("L'interface est entièrement responsive grâce aux breakpoints Tailwind (sm:, md:, xl:). La sidebar est fixe sur desktop et se masque sur mobile. Tous les formulaires utilisent des messages d'erreur inline avec validation côté client avant l'envoi API."),
    pbk(),
  ];
}

// ─── Chapitre 8 ───────────────────────────────────────────────────────────────

function chapitre8() {
  return [
    h1("Chapitre 8 — Fonctionnalités phares"),

    h2("8.1 Pipeline visuel candidat"),
    para("Le composant Pipeline est l'élément central de l'expérience candidat. Il représente les 5 étapes du processus (Reçu, En examen, Entretien, Évaluation, Décision) sous forme de cercles connectés par des barres horizontales. L'état de chaque cercle est calculé à partir du statut actuel de la candidature :"),
    bullet("Étapes passées (done) : cercle vert avec icône ✓"),
    bullet("Étape active (active) : cercle indigo légèrement agrandi (scale-110) avec anneau coloré"),
    bullet("Étape refusée (rejected) : cercle rouge avec icône ✕ (uniquement pour REJECTED)"),
    bullet("Étapes futures : cercle gris clair avec numéro"),
    para("Les connecteurs entre étapes deviennent verts une fois l'étape franchie, offrant une représentation visuelle de la progression. Le composant gère également le cas spécial REJECTED (qui partage le même index que ACCEPTED mais s'affiche différemment)."),

    h2("8.2 Notifications email et in-app"),
    para("Le système de notifications fonctionne sur deux niveaux complémentaires :"),
    h3("8.2.1 Notifications in-app"),
    para("Chaque événement crée une entrée dans la table notifications avec les champs userId, title, message, type (STATUS_CHANGE, INTERVIEW, OFFER, CREDENTIALS, GENERAL), read=false et createdAt. Le candidat consulte ses notifications depuis la page /portal/notifications ou via la cloche (NotificationBell) présente dans la sidebar. Les notifications non lues apparaissent en surbrillance avec une pastille de couleur selon le type."),
    h3("8.2.2 Notifications email (MailService)"),
    para("MailService lit le flag app.mail.enabled depuis application.properties. Si false (mode développement), le contenu de l'email est loggé en console INFO avec le destinataire, le sujet et le corps du message. Si true, l'email est réellement envoyé via JavaMailSender (SMTP Gmail). Cela permet de développer sans serveur SMTP tout en validant le contenu des emails."),

    h2("8.3 Génération automatique des comptes candidats"),
    para("Lorsqu'un recruteur crée un candidat via POST /api/candidates, le flux suivant est déclenché automatiquement :"),
    bullet("CandidateService.create() génère un mot de passe aléatoire de 10 caractères alphanumériques."),
    bullet("Un User est créé avec rôle=CANDIDATE, email=candidat.email, password=BCrypt(mdp), firstLogin=true."),
    bullet("Le Candidate est sauvegardé avec user=User créé précédemment."),
    bullet("User.candidateId est mis à jour avec l'ID du Candidate pour la navigation bidirectionnelle."),
    bullet("NotificationService.sendCredentials() crée une notification in-app de type CREDENTIALS et envoie (ou logue) l'email avec les identifiants de connexion."),

    h2("8.4 Évaluation multi-critères"),
    para("L'interface d'évaluation (EvaluationPage) présente trois sliders HTML range (input type=range, min=1, max=5) pour les critères Compétences techniques, Attitude/comportement et Potentiel. Le score global est calculé et affiché en temps réel (moyenne des 3 curseurs) avant soumission, donnant au recruteur un aperçu immédiat de sa note. Côté backend, l'annotation @PrePersist sur l'entité Evaluation recalcule le globalScore à chaque sauvegarde, garantissant la cohérence des données."),

    h2("8.5 Génération d'offre d'embauche PDF"),
    para("L'OfferEmbaucheService génère un fichier PDF avec OpenPDF. Le document inclut : un en-tête avec le nom de l'entreprise et le titre « Offre d'Embauche », les informations du candidat (nom, poste), les conditions d'emploi (salaire mensuel en TND, date de début), la liste des avantages, et un bloc de signature avec emplacement pour le cachet de l'entreprise. Le fichier est sauvegardé sur disque (uploads/offers/) et le chemin est stocké en base. Le candidat peut visualiser l'offre depuis /portal/offer et l'accepter ou la refuser."),

    h2("8.6 Dashboard KPIs"),
    para("Le tableau de bord recruteur affiche en temps réel les indicateurs suivants :"),
    makeTable(
      ["KPI", "Source", "Calcul"],
      [
        ["Postes ouverts", "DashboardService", "COUNT(job_offers WHERE status = 'PUBLISHED')"],
        ["Candidats actifs", "DashboardService", "COUNT(candidates) — total"],
        ["Taux de conversion", "DashboardService", "COUNT(ACCEPTED) / COUNT(total) × 100"],
        ["Délai moyen recrutement", "ApplicationRepository (native query)", "AVG(DATEDIFF(updatedAt, appliedDate)) WHERE status IN (ACCEPTED, REJECTED)"],
        ["Répartition par statut", "DashboardService", "MAP statut → COUNT pour les 6 statuts"],
        ["Candidatures récentes", "ApplicationRepository", "findTop8ByOrderByAppliedDateDesc"],
      ],
      [22, 23, 55]
    ),

    h2("8.7 Export CSV et PDF des rapports"),
    para("Le ReportService expose deux méthodes d'export : (1) exportCsv() utilise CSVWriter (OpenCSV) pour générer un flux CSV en mémoire avec les colonnes ID, Candidat, Email, Poste, Statut, Date ; (2) exportPdf() utilise PdfPTable (OpenPDF) pour générer un tableau en format A4 paysage avec fond d'en-tête bleu marine et alternance des couleurs de lignes. Les deux formats sont téléchargeables directement depuis la page Rapports de l'interface recruteur."),

    pbk(),
  ];
}

// ─── Chapitre 9 ───────────────────────────────────────────────────────────────

function chapitre9() {
  return [
    h1("Chapitre 9 — Tests et validation"),

    h2("9.1 Scénario de test end-to-end principal"),
    para("Le scénario de validation principal couvre l'intégralité du pipeline de recrutement, de la création du candidat jusqu'à la réponse à l'offre d'embauche :"),
    makeTable(
      ["Étape", "Action", "Résultat attendu", "Statut"],
      [
        ["1", "Admin crée un recruteur via POST /api/admin/recruiters", "Recruteur créé, email loggé", "✓ OK"],
        ["2", "Recruteur crée une offre d'emploi (statut PUBLISHED)", "Offre visible dans la liste", "✓ OK"],
        ["3", "Recruteur crée un candidat (nom, email, compétences)", "User CANDIDATE créé, credentials loggés en console", "✓ OK"],
        ["4", "Recruteur crée une candidature (candidat → offre)", "Candidature au statut RECEIVED, notification créée", "✓ OK"],
        ["5", "Candidat se connecte avec l'email et mdp reçu", "Redirection vers /portal/change-password (firstLogin=true)", "✓ OK"],
        ["6", "Candidat change son mot de passe", "firstLogin=false, nouveau JWT, redirection /portal", "✓ OK"],
        ["7", "Recruteur passe la candidature à INTERVIEW", "Notification STATUS_CHANGE créée, email loggé", "✓ OK"],
        ["8", "Recruteur crée un entretien (date, heure, lien visio)", "Entretien créé, notification INTERVIEW loggée", "✓ OK"],
        ["9", "Candidat consulte /portal/interviews", "Entretien visible avec date, lien et instructions", "✓ OK"],
        ["10", "Recruteur évalue l'entretien (3 critères)", "globalScore calculé, statut → EVALUATION", "✓ OK"],
        ["11", "Recruteur génère une offre d'embauche", "PDF généré dans uploads/offers/, statut → ACCEPTED", "✓ OK"],
        ["12", "Candidat consulte /portal/offer, accepte l'offre", "Statut offre → ACCEPTED, notification créée", "✓ OK"],
        ["13", "Recruteur exporte le rapport CSV", "Fichier .csv téléchargé, lignes correctes", "✓ OK"],
        ["14", "Recruteur exporte le rapport PDF", "Fichier .pdf téléchargé, tableau lisible", "✓ OK"],
      ],
      [5, 35, 35, 12]
    ),

    h2("9.2 Validation des endpoints (Postman)"),
    para("Tous les endpoints ont été testés avec Postman. Les collections sont organisées par groupe : Auth, Admin, Recruiter (CRUD), Recruiter (Actions), Candidate Portal. Chaque requête inclut l'en-tête Authorization: Bearer {{token}} paramétré via une variable d'environnement Postman."),
    para("Les codes de réponse HTTP ont été validés : 200 OK pour les GETs réussis, 201 Created pour les POST de création, 400 Bad Request pour les validations échouées, 401 Unauthorized pour les tokens manquants, 403 Forbidden pour les accès non autorisés."),

    h2("9.3 Couverture des objectifs MVP"),
    makeTable(
      ["Objectif", "Statut", "Commentaire"],
      [
        ["Authentification JWT, 3 rôles", "✅ Livré", "ADMIN, RECRUITER, CANDIDATE avec Spring Security"],
        ["Changement mdp au premier login", "✅ Livré", "firstLogin flag, endpoint change-password, nouveau JWT"],
        ["CRUD Candidats enrichi", "✅ Livré", "coverLetter, experiences, diplomas, targetJobOffer, upload CV"],
        ["Pipeline 6 statuts avec historique", "✅ Livré", "StatusHistoryEntry, notifications automatiques"],
        ["Évaluation multi-critères", "✅ Livré", "3 scores + globalScore @PrePersist + recommendation"],
        ["Portail candidat 7 pages", "✅ Livré", "Home, Profil, Candidature, Entretiens, Notifications, Offre, Mdp"],
        ["Pipeline visuel animé", "✅ Livré", "Composant Pipeline avec 5 étapes, états colorés"],
        ["Génération PDF offre d'embauche", "✅ Livré", "OpenPDF, stockage uploads/offers/"],
        ["Export CSV candidatures", "✅ Livré", "OpenCSV, 6 colonnes, téléchargement blob"],
        ["Export PDF rapport recrutement", "✅ Livré", "OpenPDF, tableau A4 paysage"],
        ["Dashboard KPIs temps réel", "✅ Livré", "taux conversion, délai moyen, répartition par statut"],
        ["Notifications in-app", "✅ Livré", "5 types, badge compteur, cloche sidebar"],
        ["Notifications email (mode log)", "✅ Livré", "MailService, app.mail.enabled=false → console log"],
        ["DataInitializer complet", "✅ Livré", "5 candidats couvrant tous les statuts du pipeline"],
      ],
      [40, 12, 48]
    ),
    pbk(),
  ];
}

// ─── Chapitre 10 ──────────────────────────────────────────────────────────────

function chapitre10() {
  return [
    h1("Chapitre 10 — Déploiement et utilisation"),

    h2("10.1 Prérequis"),
    makeTable(
      ["Composant", "Version minimale", "Lien"],
      [
        ["JDK (Java Development Kit)", "21 LTS", "https://adoptium.net"],
        ["Apache Maven", "3.9.x", "https://maven.apache.org"],
        ["Node.js", "20 LTS", "https://nodejs.org"],
        ["XAMPP (Apache + MySQL)", "8.x", "https://www.apachefriends.org"],
        ["Git", "2.x", "https://git-scm.com"],
      ],
      [30, 20, 50]
    ),

    h2("10.2 Installation pas à pas"),
    h3("Étape 1 — Préparer la base de données"),
    bullet("Lancer XAMPP et démarrer le service MySQL."),
    bullet("Ouvrir phpMyAdmin (http://localhost/phpmyadmin)."),
    bullet("Exécuter : DROP DATABASE IF EXISTS recrutement_db; CREATE DATABASE recrutement_db;"),
    bullet("Note : à répéter si les enums ont été modifiés (ddl-auto=update ne gère pas les changements d'enum)."),

    h3("Étape 2 — Lancer le backend"),
    ...codePara([
      "cd backend",
      "mvn clean compile          # Vérifier que la compilation passe (BUILD SUCCESS)",
      "mvn spring-boot:run        # Démarrage sur le port 8080",
      "",
      "# Vérifier dans les logs :",
      "# - 'Started RecrutementAppApplication'",
      "# - 'DataInitializer : données initialisées'",
      "# - Les 5 candidats créés (RECEIVED, INTERVIEW, EVALUATION, ACCEPTED, REJECTED)",
    ]),

    h3("Étape 3 — Lancer le frontend"),
    ...codePara([
      "cd frontend",
      "npm install                # Installer les dépendances",
      "npm run dev                # Démarrage sur http://localhost:5173",
    ]),

    h3("Étape 4 — Tester l'application"),
    bullet("Ouvrir http://localhost:5173 dans un navigateur."),
    bullet("Se connecter avec admin@iteam.tn / admin123 pour l'interface admin."),
    bullet("Ou avec les comptes candidats ci-dessous."),

    h2("10.3 Comptes de test"),
    makeTable(
      ["Rôle", "Email", "Mot de passe", "Accès"],
      [
        ["ADMIN", "admin@iteam.tn", "admin123", "Interface admin (gestion recruteurs)"],
        ["RECRUITER", "recruiter1@iteam.tn", "recruiter123", "Dashboard complet recruteur"],
        ["RECRUITER", "recruiter2@iteam.tn", "recruiter123", "Dashboard complet recruteur"],
        ["CANDIDATE (RECEIVED)", "alice.martin@example.com", "candidate123", "Portail — statut : Reçu"],
        ["CANDIDATE (INTERVIEW)", "bob.dupont@example.com", "candidate123", "Portail — statut : Entretien"],
        ["CANDIDATE (EVALUATION)", "clara.leclerc@example.com", "candidate123", "Portail — statut : Évaluation"],
        ["CANDIDATE (ACCEPTED)", "david.moreau@example.com", "candidate123", "Portail — offre d'embauche disponible"],
        ["CANDIDATE (REJECTED)", "emma.bernard@example.com", "candidate123", "Portail — statut : Refusé"],
      ],
      [20, 30, 17, 33]
    ),

    h2("10.4 Configuration des emails"),
    para("Pour activer l'envoi réel d'emails, modifier backend/src/main/resources/application.properties :"),
    ...codePara([
      "app.mail.enabled=true                              # Activer l'envoi réel",
      "spring.mail.username=votre-email@gmail.com",
      "spring.mail.password=votre-app-password-gmail      # App Password Gmail (2FA requis)",
    ]),
    para("Pour Gmail, il est nécessaire d'activer l'authentification à deux facteurs et de générer un « App Password » depuis les paramètres de sécurité du compte Google. Ce mot de passe applicatif remplace le mot de passe du compte pour les connexions SMTP."),
    pbk(),
  ];
}

// ─── Chapitre 11 ──────────────────────────────────────────────────────────────

function chapitre11() {
  return [
    h1("Chapitre 11 — Limites et perspectives"),

    h2("11.1 Limites actuelles"),
    para("Comme tout MVP, RecruitTracker comporte des limites connues qui ont été consciemment mises hors périmètre :"),
    bullet("Absence de pipeline CI/CD : le déploiement est purement manuel (mvn spring-boot:run + npm run dev). Il n'existe pas de configuration Jenkins, GitHub Actions ou Docker pour l'automatisation."),
    bullet("Pas de déploiement en production : l'application tourne uniquement en environnement local. Un déploiement sur un VPS ou un cloud (AWS, Azure, OVH) n'a pas été réalisé."),
    bullet("Pas d'IA ni de matching CV/offre : la sélection des candidats est entièrement manuelle. Il n'y a pas de scoring automatique basé sur les compétences ou l'analyse de CV."),
    bullet("Pas d'intégration jobboards : les candidatures proviennent uniquement de saisies manuelles par les recruteurs. Aucune connexion avec LinkedIn, Indeed ou d'autres plateformes."),
    bullet("Tests unitaires absents : faute de temps, la couverture par tests JUnit/Mockito n'a pas été réalisée. Les tests sont exclusivement manuels."),
    bullet("Gestion des fichiers basique : les CVs et PDFs sont stockés sur le filesystem local (uploads/). Une solution de stockage objet (AWS S3, MinIO) serait plus robuste en production."),

    h2("11.2 Pistes d'évolution"),
    para("Les améliorations suivantes sont envisagées pour les versions futures de RecruitTracker :"),

    h3("11.2.1 Court terme (3-6 mois)"),
    bullet("Tests unitaires et d'intégration : couverture minimale de 70 % avec JUnit 5, Mockito et Spring Boot Test."),
    bullet("Containerisation Docker : Dockerfile pour le backend Spring Boot et docker-compose.yml intégrant MySQL et le frontend."),
    bullet("Variables d'environnement sécurisées : migration vers Spring Cloud Config ou Vault pour les secrets (clé JWT, SMTP)."),
    bullet("Validation avancée : utilisation de Spring Validation (@Valid, @NotBlank, @Email) sur tous les DTOs."),

    h3("11.2.2 Moyen terme (6-18 mois)"),
    bullet("Module IA de scoring CV : analyse automatique des CVs (extraction d'entités, NLP) pour calculer un score de compatibilité candidat/offre."),
    bullet("Notifications temps réel : WebSocket (Spring WebSocket + STOMP) pour les notifications push sans polling."),
    bullet("Intégration LinkedIn API : import automatique du profil LinkedIn du candidat lors de la création."),
    bullet("Module tests en ligne : interface de QCM pour évaluer techniquement les candidats avant l'entretien."),

    h3("11.2.3 Long terme (18 mois+)"),
    bullet("Multi-tenancy : architecture multi-entreprises permettant à plusieurs organisations d'utiliser la plateforme de manière isolée."),
    bullet("Application mobile : développement d'une application React Native (iOS + Android) pour le portail candidat."),
    bullet("Analytics avancés : tableaux de bord prédictifs (durée de filling par poste, taux d'abandon par étape, benchmarking salarial)."),
    bullet("Intégration SIRH : connecteurs avec les principaux SIRH du marché (SAP SuccessFactors, Workday, SAGE RH)."),
    pbk(),
  ];
}

// ─── Chapitre 12 ──────────────────────────────────────────────────────────────

function chapitre12() {
  return [
    h1("Chapitre 12 — Conclusion"),
    para("Ce projet de fin d'année nous a permis de concevoir et de développer de bout en bout une application web professionnelle couvrant un domaine métier complet et complexe : la gestion du recrutement. De la définition du cahier des charges à la livraison d'un MVP fonctionnel, en passant par la conception de l'architecture, l'implémentation des fonctionnalités et la validation par les tests manuels, ce projet a été une expérience formatrice à tous les niveaux."),
    para("Sur le plan technique, nous avons consolidé notre maîtrise de l'écosystème Spring Boot (sécurité JWT, persistance JPA, services métier, génération PDF) et approfondi nos compétences en développement frontend moderne (React 18, hooks, routing par rôle, Tailwind CSS, gestion d'état par contexte). La mise en œuvre d'une architecture en couches stricte, d'un RBAC robuste et d'un système de notifications a constitué les défis les plus enrichissants du projet."),
    para("Sur le plan méthodologique, la gestion du projet en binôme en sprints itératifs nous a appris l'importance de la communication, de la division du travail et de la revue mutuelle du code. Les contraintes de temps ont exigé une priorisation rigoureuse des fonctionnalités, exercice essentiel dans tout contexte professionnel."),
    para("L'application livrée répond à l'ensemble des objectifs du MVP définis en début de projet : authentification sécurisée à trois rôles, pipeline candidat complet avec six statuts, portail self-service candidat en sept pages, tableau de bord analytique en temps réel, et exports de rapports multi-formats. Bien que plusieurs améliorations restent possibles (tests automatisés, déploiement cloud, IA de scoring), le produit est pleinement fonctionnel et déployable localement en moins de cinq minutes."),
    para("Nous remercions chaleureusement notre encadrant M. Hassen Lazreg pour son accompagnement tout au long de ce projet, ainsi que l'ITEAM University pour la formation de qualité qui nous a donné les bases nécessaires à sa réalisation."),
    pbk(),
  ];
}

// ─── Annexes ──────────────────────────────────────────────────────────────────

function annexes() {
  return [
    h1("Annexes"),

    h2("Annexe A — Liste exhaustive des endpoints API REST"),
    makeTable(
      ["Méthode", "URL complète", "Rôle requis", "Description"],
      [
        ["POST", "/api/auth/login", "Public", "Authentification, retourne JWT"],
        ["POST", "/api/auth/change-password", "Authentifié", "Changement de mot de passe"],
        ["GET", "/api/admin/recruiters", "ADMIN", "Liste des recruteurs"],
        ["POST", "/api/admin/recruiters", "ADMIN", "Créer un recruteur"],
        ["DELETE", "/api/admin/recruiters/{id}", "ADMIN", "Supprimer un recruteur"],
        ["GET", "/api/candidates", "REC/ADM", "Lister tous les candidats"],
        ["GET", "/api/candidates/{id}", "REC/ADM", "Détail d'un candidat"],
        ["POST", "/api/candidates", "REC/ADM", "Créer candidat + User CANDIDATE"],
        ["PUT", "/api/candidates/{id}", "REC/ADM", "Modifier un candidat"],
        ["DELETE", "/api/candidates/{id}", "REC/ADM", "Supprimer candidat + User"],
        ["POST", "/api/candidates/{id}/cv", "REC/ADM", "Upload CV (PDF)"],
        ["GET", "/api/candidates/{id}/cv", "REC/ADM", "Télécharger CV"],
        ["GET", "/api/job-offers", "REC/ADM", "Lister les offres d'emploi"],
        ["GET", "/api/job-offers/{id}", "REC/ADM", "Détail d'une offre"],
        ["POST", "/api/job-offers", "REC/ADM", "Créer une offre"],
        ["PUT", "/api/job-offers/{id}", "REC/ADM", "Modifier une offre"],
        ["DELETE", "/api/job-offers/{id}", "REC/ADM", "Supprimer une offre"],
        ["GET", "/api/applications", "REC/ADM", "Lister les candidatures"],
        ["POST", "/api/applications", "REC/ADM", "Créer une candidature"],
        ["PUT", "/api/applications/{id}/status", "REC/ADM", "Changer le statut"],
        ["GET", "/api/interviews", "REC/ADM", "Lister les entretiens"],
        ["POST", "/api/interviews", "REC/ADM", "Planifier un entretien"],
        ["PUT", "/api/interviews/{id}", "REC/ADM", "Modifier un entretien"],
        ["POST", "/api/evaluations", "REC/ADM", "Créer une évaluation"],
        ["GET", "/api/evaluations/interview/{id}", "REC/ADM", "Évaluation d'un entretien"],
        ["GET", "/api/recruiter/dashboard", "REC/ADM", "KPIs du tableau de bord"],
        ["GET", "/api/recruiter/reports/by-position", "REC/ADM", "Rapport par poste"],
        ["GET", "/api/recruiter/reports/export/csv", "REC/ADM", "Export CSV"],
        ["GET", "/api/recruiter/reports/export/pdf", "REC/ADM", "Export PDF rapport"],
        ["POST", "/api/recruiter/applications/{id}/offer", "REC/ADM", "Générer offre d'embauche PDF"],
        ["GET", "/api/recruiter/offers/{id}/pdf", "REC/ADM", "Télécharger PDF offre"],
        ["GET", "/api/candidate/me", "CANDIDATE", "Profil + statut"],
        ["PUT", "/api/candidate/me", "CANDIDATE", "Mettre à jour profil"],
        ["POST", "/api/candidate/me/cv", "CANDIDATE", "Upload son CV"],
        ["GET", "/api/candidate/me/application", "CANDIDATE", "Sa candidature + historique"],
        ["GET", "/api/candidate/me/interviews", "CANDIDATE", "Ses entretiens"],
        ["GET", "/api/candidate/me/notifications", "CANDIDATE", "Ses notifications"],
        ["PUT", "/api/candidate/me/notifications/{id}/read", "CANDIDATE", "Marquer lue"],
        ["PUT", "/api/candidate/notifications/read-all", "CANDIDATE", "Tout marquer lu"],
        ["GET", "/api/candidate/notifications/unread-count", "CANDIDATE", "Nombre non lus"],
        ["GET", "/api/candidate/me/offer", "CANDIDATE", "Son offre d'embauche"],
        ["POST", "/api/candidate/me/offer/accept", "CANDIDATE", "Accepter l'offre"],
        ["POST", "/api/candidate/me/offer/reject", "CANDIDATE", "Refuser l'offre"],
      ],
      [10, 40, 12, 38]
    ),

    h2("Annexe B — Dépendances backend (pom.xml)"),
    makeTable(
      ["Dépendance", "Groupe:Artefact", "Version"],
      [
        ["Spring Boot Starter Web", "org.springframework.boot:spring-boot-starter-web", "3.2.5"],
        ["Spring Boot Starter Data JPA", "org.springframework.boot:spring-boot-starter-data-jpa", "3.2.5"],
        ["Spring Boot Starter Security", "org.springframework.boot:spring-boot-starter-security", "3.2.5"],
        ["Spring Boot Starter Mail", "org.springframework.boot:spring-boot-starter-mail", "3.2.5"],
        ["MySQL Connector/J", "com.mysql:mysql-connector-j", "runtime"],
        ["JJWT API", "io.jsonwebtoken:jjwt-api", "0.12.5"],
        ["JJWT Impl", "io.jsonwebtoken:jjwt-impl", "0.12.5"],
        ["JJWT Jackson", "io.jsonwebtoken:jjwt-jackson", "0.12.5"],
        ["Lombok", "org.projectlombok:lombok", "1.18.x"],
        ["OpenPDF", "com.github.librepdf:openpdf", "2.0.3"],
        ["OpenCSV", "com.opencsv:opencsv", "5.9"],
        ["Spring Boot DevTools", "org.springframework.boot:spring-boot-devtools", "optionnel"],
      ],
      [28, 45, 27]
    ),

    h2("Annexe C — Dépendances frontend (package.json)"),
    makeTable(
      ["Package", "Version", "Usage"],
      [
        ["react", "^18.3.1", "Framework UI principal"],
        ["react-dom", "^18.3.1", "Rendu DOM React"],
        ["react-router-dom", "^6.x", "Routing SPA"],
        ["axios", "^1.x", "Client HTTP avec intercepteurs JWT"],
        ["react-hot-toast", "^2.x", "Notifications toast"],
        ["lucide-react", "latest", "Icônes SVG"],
        ["tailwindcss", "^3.x", "Framework CSS utility-first (devDep)"],
        ["vite", "^5.x", "Bundler et serveur de développement (devDep)"],
        ["@vitejs/plugin-react", "^4.x", "Plugin React pour Vite (devDep)"],
      ],
      [28, 15, 57]
    ),

    h2("Annexe D — Glossaire"),
    makeTable(
      ["Terme", "Définition"],
      [
        ["API REST", "Application Programming Interface de type Representational State Transfer. Architecture d'échange de données via HTTP utilisant les verbes GET, POST, PUT, DELETE."],
        ["BCrypt", "Algorithme de hachage de mots de passe conçu pour être lent et résistant aux attaques par force brute, intégré dans Spring Security."],
        ["DTO", "Data Transfer Object. Objet simple transportant des données entre les couches de l'application sans logique métier."],
        ["JPA", "Jakarta Persistence API. Standard Java pour le mapping objet-relationnel (ORM), implémenté par Hibernate dans ce projet."],
        ["JWT", "JSON Web Token. Standard RFC 7519 pour l'échange sécurisé d'informations entre parties sous forme de token signé numériquement."],
        ["Lombok", "Bibliothèque Java générant automatiquement le code boilerplate (getters, setters, constructeurs) via des annotations."],
        ["MVP", "Minimum Viable Product. Version initiale d'un produit incluant uniquement les fonctionnalités essentielles pour valider le concept."],
        ["ORM", "Object-Relational Mapping. Technique permettant de manipuler des données relationnelles en base via des objets Java."],
        ["RBAC", "Role-Based Access Control. Modèle de contrôle d'accès où les permissions sont attribuées à des rôles plutôt qu'à des utilisateurs individuels."],
        ["SPA", "Single Page Application. Application web chargée une seule fois, naviguant via du JavaScript côté client sans rechargement de page."],
        ["Spring Security", "Module du framework Spring gérant l'authentification, l'autorisation et la protection des endpoints d'une application Java."],
        ["Tailwind CSS", "Framework CSS utility-first permettant de styliser les composants directement dans le HTML via des classes prédéfinies."],
        ["Vite", "Outil de build frontend nouvelle génération offrant un démarrage ultra-rapide grâce à l'utilisation des modules ES natifs du navigateur."],
      ],
      [18, 82]
    ),
  ];
}

// ─── Header / Footer ─────────────────────────────────────────────────────────

const docHeader = new Header({
  children: [
    new Paragraph({
      children: [
        new TextRun({ text: "RecruitTracker — Rapport PFA", font: "Calibri", size: 18, color: "888888" }),
        new TextRun({ text: "    |    ITEAM University 2025/2026", font: "Calibri", size: 18, color: "bbbbbb" }),
      ],
      border: { bottom: { color: MID_GRAY, space: 1, style: BorderStyle.SINGLE, size: 4 } },
    }),
  ],
});

const docFooter = new Footer({
  children: [
    new Paragraph({
      children: [
        new TextRun({ text: "ITEAM University – 2025/2026  |  Khedhri Takoua & Dhafer Smeti  |  Encadrant : Hassen Lazreg    ", font: "Calibri", size: 16, color: "888888" }),
        new SimpleField("PAGE", new TextRun({ text: "1", font: "Calibri", size: 16, color: "888888" })),
      ],
      alignment: AlignmentType.RIGHT,
      border: { top: { color: MID_GRAY, space: 1, style: BorderStyle.SINGLE, size: 4 } },
    }),
  ],
});

// ─── Assemble document ────────────────────────────────────────────────────────

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullet-list",
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT },
          { level: 1, format: LevelFormat.BULLET, text: "◦", alignment: AlignmentType.LEFT },
        ],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: coverPage(),
    },
    {
      headers: { default: docHeader },
      footers: { default: docFooter },
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
        },
      },
      children: [
        ...remerciements(),
        ...resume(),
        ...toc(),
        ...chapitre1(),
        ...chapitre2(),
        ...chapitre3(),
        ...chapitre4(),
        ...chapitre5(),
        ...chapitre6(),
        ...chapitre7(),
        ...chapitre8(),
        ...chapitre9(),
        ...chapitre10(),
        ...chapitre11(),
        ...chapitre12(),
        ...annexes(),
      ],
    },
  ],
});

// ─── Generate ─────────────────────────────────────────────────────────────────

Packer.toBuffer(doc).then((buffer) => {
  const outPath = "Rapport_PFA_RecruitTracker.docx";
  fs.writeFileSync(outPath, buffer);
  const size = (buffer.length / 1024).toFixed(1);
  console.log(`\n✅  Rapport généré avec succès !`);
  console.log(`📄  Fichier : ${outPath}`);
  console.log(`📦  Taille  : ${size} KB`);
  console.log(`\nPour modifier une section, éditez la fonction correspondante dans generate_report.js et relancez : node generate_report.js`);
}).catch(err => {
  console.error("❌ Erreur lors de la génération :", err);
  process.exit(1);
});
