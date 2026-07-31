/**
 * Dr. Abeer Alshammari's published research, sourced from her ORCID record
 * (https://orcid.org/0009-0003-9379-2667). Titles are kept in English on
 * both locales, matching standard academic citation practice -- only the
 * surrounding page chrome (headings, labels) is translated via next-intl.
 *
 * Excludes: the doctoral dissertation (already has its own section above
 * this list on the Research page) and one incomplete ORCID entry with no
 * title (a co-authored Kuwait University catalog search link).
 */
export interface Publication {
  title: string;
  venue: string;
  year: string;
  doiUrl: string;
}

export const PUBLICATIONS: Publication[] = [
  {
    title: "A Practical Framework for Adaptive Data Classification in Cybersecurity",
    venue: "SSRN Preprint",
    year: "2026",
    doiUrl: "https://doi.org/10.2139/ssrn.6163367",
  },
  {
    title: "AI-Driven Adaptive Data Classification for Quantum-Resilient Cybersecurity Architectures",
    venue: "SSRN Preprint",
    year: "2026",
    doiUrl: "https://doi.org/10.2139/ssrn.6397219",
  },
  {
    title: "Challenges of Implementing Data Classification Frameworks in Large Organizations: A Practical Governance-Driven Approach",
    venue: "SSRN Preprint",
    year: "2026",
    doiUrl: "https://doi.org/10.2139/ssrn.6163526",
  },
  {
    title: "Design of Turbo-NAFS: A Quantum-Resilient Encryption Scheme Based on Functional Superposition",
    venue: "SSRN Preprint",
    year: "2026",
    doiUrl: "https://doi.org/10.2139/ssrn.6167526",
  },
  {
    title: "Cybersecurity Governance vs IT Governance: Why Conflating the Two Weakens Organizational Resilience",
    venue: "Zenodo Preprint",
    year: "2026",
    doiUrl: "https://doi.org/10.5281/zenodo.18526815",
  },
  {
    title: "Defining Cybersecurity Roles and Responsibilities Across Organizational Size and Criticality: A Governance-Oriented Framework for Public and Private Sectors",
    venue: "Zenodo Preprint",
    year: "2026",
    doiUrl: "https://doi.org/10.5281/zenodo.18520086",
  },
];
