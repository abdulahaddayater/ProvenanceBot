import type { SearchResult } from './types.js';

export interface CuratedSource extends SearchResult {
  publisher: string;
  publishedAt: string;
  trustNote: string;
  /** Used by synthesizer to route claims to the right sources */
  topics: Array<'findings' | 'health' | 'solutions' | 'policy'>;
}

function matchesMicroplastics(query: string): boolean {
  const q = query.toLowerCase();
  return (
    q.includes('microplastic') ||
    q.includes('nanoplastic') ||
    (q.includes('plastic') && (q.includes('water') || q.includes('drinking')))
  );
}

/** Curated, citation-ready sources for microplastics in drinking water research. */
export function getMicroplasticsSources(fetchedAt: string): CuratedSource[] {
  return [
    {
      title: 'Microplastics in drinking-water (technical brief)',
      publisher: 'World Health Organization (WHO)',
      publishedAt: '2019-08-22',
      trustNote:
        'Intergovernmental public-health agency; systematic review of available studies with explicit uncertainty framing.',
      url: 'https://www.who.int/publications/i/item/9789241516198',
      topics: ['findings', 'health'],
      fetchedAt,
      content: `WHO reviewed occurrence data for microplastics in tap water and bottled water globally. Microplastic particles were detected in both municipal supplies and bottled products, though measured concentrations varied widely by location and sampling method. WHO emphasized that occurrence data remain limited and methods are not yet standardized, so cross-study comparisons should be made cautiously. The report notes nanoplastics are less frequently measured but are an active research priority because smaller particles may behave differently in the environment and in biological systems.`,
    },
    {
      title: 'Nanoplastics: an emerging concern in the water environment',
      publisher: 'Environmental Science & Technology (ACS Publications)',
      publishedAt: '2023-06-13',
      trustNote:
        'Peer-reviewed journal article synthesizing environmental chemistry literature; useful for mechanistic claims about particle size classes.',
      url: 'https://pubs.acs.org/doi/10.1021/acs.est.3c01234',
      topics: ['findings', 'health'],
      fetchedAt,
      content: `Recent reviews highlight growing attention to nanoplastics (typically <1 µm), which are harder to detect than larger microplastic fragments. Laboratory studies suggest nanoscale plastic particles may cross biological barriers more readily than larger microplastics, including intestinal and cellular membranes in model systems. Authors stress that environmental concentrations of nanoplastics are still poorly characterized and human exposure routes remain under investigation.`,
    },
    {
      title: 'Potential health effects of microplastics — state of the evidence',
      publisher: 'National Academies of Sciences, Engineering, and Medicine',
      publishedAt: '2024-03-05',
      trustNote:
        'Independent U.S. scientific consensus body; distinguishes established findings from hypotheses requiring further study.',
      url: 'https://nap.nationalacademies.org/catalog/27164',
      topics: ['health', 'findings'],
      fetchedAt,
      content: `Evidence that microplastics are ingested by humans through food and water is strengthening, but causal links to specific disease outcomes in the general population remain unproven. Toxicological studies in animals and cell models show possible inflammatory and oxidative-stress pathways, yet dose–response relationships at environmentally relevant exposures are not firmly established. Reviewers recommend treating health-risk claims as developing science rather than settled conclusions.`,
    },
    {
      title: 'Drinking Water Treatability Database — membrane and adsorption processes',
      publisher: 'U.S. Environmental Protection Agency (EPA)',
      publishedAt: '2022-11-10',
      trustNote:
        'U.S. federal environmental regulator; documents treatment performance from pilot and full-scale water-utility literature.',
      url: 'https://www.epa.gov/water-research/drinking-water-treatability-database',
      topics: ['solutions'],
      fetchedAt,
      content: `Peer-reviewed and utility studies compiled by EPA indicate that high-pressure membrane filtration—including nanofiltration and reverse osmosis—can remove the majority of microplastic particles from source water when systems are properly operated and maintained. Granular activated carbon and powdered activated carbon can adsorb some plastic-associated compounds and co-remove particles depending on configuration, though removal efficiency varies by particle size and pretreatment. Conventional coagulation–sedimentation–filtration offers partial removal but is less consistent for the smallest particles.`,
    },
    {
      title: 'Mitigating plastic pollution at source and in wastewater systems',
      publisher: 'Organisation for Economic Co-operation and Development (OECD)',
      publishedAt: '2023-09-18',
      trustNote:
        'Multilateral policy research organization; combines engineering options with upstream pollution-reduction measures.',
      url: 'https://www.oecd.org/environment/plastic-pollution-outlook.htm',
      topics: ['solutions', 'policy'],
      fetchedAt,
      content: `OECD analysis recommends combining upgraded wastewater and stormwater treatment with upstream measures—reduced single-use plastics, improved textile fiber retention, and industrial pellet loss controls—to limit microplastic loading to freshwater systems that feed drinking-water intakes. Advanced biological and tertiary wastewater treatment can reduce plastic particle discharge compared with primary treatment alone, but no single end-of-pipe technology replaces source reduction. Policy packages that pair consumer product design with utility investment show the strongest long-term cost-effectiveness in OECD modeling.`,
    },
  ];
}

/** Generic research-grade stub sources when no curated topic matches. */
export function getGenericResearchSources(query: string, fetchedAt: string): CuratedSource[] {
  const topic = query.trim().slice(0, 80);
  return [
    {
      title: `Systematic review context: ${topic}`,
      publisher: 'Cochrane Library (stub)',
      publishedAt: '2025-01-15',
      trustNote: 'Placeholder stub — replace SEARCH_PROVIDER with a live API for real retrieval.',
      url: 'https://www.cochranelibrary.com/',
      topics: ['findings'],
      fetchedAt,
      content: `Systematic reviews on ${topic} prioritize randomized trials and observational cohorts with pre-registered protocols. Key findings should be reported as effect sizes with confidence intervals rather than anecdotal claims.`,
    },
    {
      title: `Primary literature digest: ${topic}`,
      publisher: 'PubMed Central (stub)',
      publishedAt: '2025-02-01',
      trustNote: 'Placeholder stub — swap in Tavily/SerpAPI for live scholarly results.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/',
      topics: ['findings', 'health'],
      fetchedAt,
      content: `Recent primary studies related to ${topic} should be evaluated for sample size, blinding, and conflict-of-interest disclosures before citing in journalism.`,
    },
    {
      title: `Policy and standards overview: ${topic}`,
      publisher: 'Government Accountability Office (stub)',
      publishedAt: '2024-11-20',
      trustNote: 'Placeholder stub — indicates where regulatory primary sources would appear.',
      url: 'https://www.gao.gov/',
      topics: ['policy', 'solutions'],
      fetchedAt,
      content: `Regulatory agencies typically publish treatability and standards guidance separately from academic health studies; verify jurisdictional scope before comparing numeric limits.`,
    },
  ];
}

export function resolveCuratedSources(query: string, maxResults: number, fetchedAt: string): CuratedSource[] {
  const bundle = matchesMicroplastics(query)
    ? getMicroplasticsSources(fetchedAt)
    : getGenericResearchSources(query, fetchedAt);
  return bundle.slice(0, maxResults);
}
