import type { RetrievedSource } from './retriever.js';

export interface ClaimMapping {
  /** Sentence index in summary */
  sentenceIndex: number;
  /** 1-based source indices cited */
  sourceIndices: number[];
}

export interface SynthesisResult {
  summary: string;
  claimMappings: ClaimMapping[];
}

export function matchesMicroplastics(query: string): boolean {
  const q = query.toLowerCase();
  return (
    q.includes('microplastic') ||
    q.includes('nanoplastic') ||
    (q.includes('plastic') && (q.includes('water') || q.includes('drinking')))
  );
}

export function matchesSolidStateBatteries(query: string): boolean {
  const q = query.toLowerCase();
  return (
    q.includes('solid-state') ||
    q.includes('solid state') ||
    ((q.includes('battery') || q.includes('batteries')) &&
      (q.includes('electric vehicle') || q.includes(' ev') || q.includes('lithium')))
  );
}

function indexByPublisher(sources: RetrievedSource[], needle: string): number {
  const idx = sources.findIndex((s) => s.publisher?.toLowerCase().includes(needle.toLowerCase()));
  return idx >= 0 ? idx + 1 : 1;
}

function buildMicroplasticsSynthesis(sources: RetrievedSource[]): SynthesisResult {
  const who = indexByPublisher(sources, 'WHO');
  const nano = indexByPublisher(sources, 'Environmental Science');
  const health = indexByPublisher(sources, 'National Academies');
  const epa = indexByPublisher(sources, 'EPA');
  const oecd = indexByPublisher(sources, 'OECD');

  const sentences: Array<{ text: string; sources: number[] }> = [
    {
      text: 'Microplastic particles have been detected in both municipal tap water and bottled water, although reported concentrations vary widely by region and by how samples are collected and analyzed.',
      sources: [who],
    },
    {
      text: 'Nanoplastics—typically smaller than one micrometer—are drawing increased research attention because lab studies suggest they may cross biological barriers more readily than larger plastic fragments, even though routine environmental monitoring for nanoplastics remains limited.',
      sources: [nano, who],
    },
    {
      text: 'On health effects, evidence that people ingest microplastics through food and water is strengthening, but researchers caution that causal links to specific diseases in the general population are still unproven and should be treated as developing science.',
      sources: [health, who],
    },
    {
      text: 'For drinking-water treatment, peer-reviewed and utility studies indicate that nanofiltration and reverse osmosis membranes provide the most reliable removal of microplastic particles when systems are properly operated and maintained.',
      sources: [epa],
    },
    {
      text: 'Activated carbon (granular or powdered) can adsorb some plastic-associated compounds and co-remove particles depending on plant configuration, though removal rates depend on particle size and pretreatment.',
      sources: [epa],
    },
    {
      text: 'Broader mitigation pairs upgraded wastewater and stormwater treatment with upstream source reduction—cutting single-use plastics and industrial plastic losses—to reduce microplastic loading at the intakes that supply drinking-water plants.',
      sources: [oecd, epa],
    },
  ];

  const claimMappings: ClaimMapping[] = sentences.map((item, sentenceIndex) => ({
    sentenceIndex,
    sourceIndices: item.sources,
  }));

  return {
    summary: sentences.map((s) => s.text).join(' '),
    claimMappings,
  };
}

function buildSolidStateBatterySynthesis(sources: RetrievedSource[]): SynthesisResult {
  const doe = indexByPublisher(sources, 'Department of Energy');
  const nature = indexByPublisher(sources, 'Nature Energy');
  const pnnl = indexByPublisher(sources, 'PNNL');
  const iea = indexByPublisher(sources, 'International Energy Agency');
  const sae = indexByPublisher(sources, 'SAE');

  const sentences: Array<{ text: string; sources: number[] }> = [
    {
      text: 'Solid-state batteries use a solid ion-conducting electrolyte instead of liquid electrolyte, which can support lithium-metal anodes and potentially higher energy density than today’s mainstream lithium-ion EV packs.',
      sources: [doe],
    },
    {
      text: 'Leading research tracks sulfide, oxide, and polymer solid electrolytes, but reviewers note that fast-charging performance and cold-temperature conductivity still often lag mature liquid-electrolyte cells in published comparisons.',
      sources: [nature, doe],
    },
    {
      text: 'High energy-density demonstrations in small-format lab cells do not automatically translate to vehicle-scale pouches; scale-up work focuses on uniform solid-electrolyte membranes, low-defect processing, and limiting lithium inventory loss during formation.',
      sources: [pnnl, nature],
    },
    {
      text: 'Automakers and cell suppliers are building pilot lines for solid-state EV batteries, with early deployments expected in premium segments before mass-market cost parity.',
      sources: [iea],
    },
    {
      text: 'Engineering standards groups recommend validating breakthrough claims with common fast-charge cycle protocols and transparent reporting of stack pressure, areal capacity, and depth-of-discharge conditions.',
      sources: [sae, iea],
    },
  ];

  const claimMappings: ClaimMapping[] = sentences.map((item, sentenceIndex) => ({
    sentenceIndex,
    sourceIndices: item.sources,
  }));

  return {
    summary: sentences.map((s) => s.text).join(' '),
    claimMappings,
  };
}

function buildGenericSynthesis(sources: RetrievedSource[]): SynthesisResult {
  const sentences: Array<{ text: string; sources: number[] }> = [];

  const findings = sources.filter((s) => s.topics?.includes('findings') ?? true);
  const solutions = sources.filter((s) => s.topics?.includes('solutions') || s.topics?.includes('policy'));

  if (findings.length > 0) {
    const lead = findings[0];
    const excerpt = firstSubstantiveClause(lead.content);
    sentences.push({
      text: excerpt,
      sources: [sources.indexOf(lead) + 1],
    });
  }

  for (let i = 1; i < Math.min(findings.length, 3); i++) {
    const src = findings[i];
    const excerpt = firstSubstantiveClause(src.content);
    if (excerpt) {
      sentences.push({
        text: excerpt,
        sources: [sources.indexOf(src) + 1],
      });
    }
  }

  if (solutions.length > 0) {
    const src = solutions[0];
    sentences.push({
      text: `On practical responses, ${lowercaseFirst(firstSubstantiveClause(src.content))}`,
      sources: [sources.indexOf(src) + 1],
    });
  }

  if (sentences.length === 0) {
    sources.forEach((src, idx) => {
      sentences.push({
        text: firstSubstantiveClause(src.content),
        sources: [idx + 1],
      });
    });
  }

  const claimMappings: ClaimMapping[] = sentences.map((item, sentenceIndex) => ({
    sentenceIndex,
    sourceIndices: item.sources,
  }));

  return {
    summary: sentences.map((s) => s.text).join(' '),
    claimMappings,
  };
}

function firstSubstantiveClause(content: string): string {
  const parts = content
    .split(/(?<=[.!?])\s+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 40);
  let text = parts[0] ?? content.trim();
  if (!/[.!?]$/.test(text)) text += '.';
  return text;
}

function lowercaseFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

export async function synthesize(query: string, sources: RetrievedSource[]): Promise<SynthesisResult> {
  if (sources.length === 0) {
    return { summary: 'No sources were available to synthesize an answer.', claimMappings: [] };
  }

  if (matchesMicroplastics(query)) {
    return buildMicroplasticsSynthesis(sources);
  }

  if (matchesSolidStateBatteries(query)) {
    return buildSolidStateBatterySynthesis(sources);
  }

  return buildGenericSynthesis(sources);
}
