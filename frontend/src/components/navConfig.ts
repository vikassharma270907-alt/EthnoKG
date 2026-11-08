import {
  Globe2,
  BarChart3,
  Compass,
  Leaf,
  Network,
  Search,
  Database,
  Sparkles,
  ShieldCheck,
  BookOpen,
  FileText
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type NavMode = 'slide' | 'list';
export type NavCategoryId = 'intelligence' | 'evidence' | 'governance';

export interface NavCategory {
  id: NavCategoryId;
  label: string;
  shortLabel: string;
  description: string;
  badgeColor: string;
}

export interface NavItemConfig {
  id: string;
  label: string;
  category: NavCategoryId;
  icon: LucideIcon;
  hotkey: string;
  statusTag: string;
  description: string;
}

export const NAV_CATEGORIES: Record<NavCategoryId, NavCategory> = {
  intelligence: {
    id: 'intelligence',
    label: 'Discovery & Intelligence',
    shortLabel: 'Intelligence',
    description: 'Autonomous exploration, radar signals, taxonomy, and graph visualization',
    badgeColor: 'from-sky-500/20 to-teal-500/20 text-sky-300 border-sky-500/30'
  },
  evidence: {
    id: 'evidence',
    label: 'Scientific Evidence & AI',
    shortLabel: 'Evidence',
    description: 'Literature mining, grounded citations, and multimodal AI co-pilot',
    badgeColor: 'from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30'
  },
  governance: {
    id: 'governance',
    label: 'Validation & Ethics',
    shortLabel: 'Governance',
    description: 'Human-in-the-loop verification, scientific methodology, and Nagoya bioethics',
    badgeColor: 'from-emerald-500/20 to-amber-500/20 text-emerald-300 border-emerald-500/30'
  }
};

export const NAV_ITEMS: readonly NavItemConfig[] = [
  {
    id: 'landing',
    label: 'Overview',
    category: 'intelligence',
    icon: Globe2,
    hotkey: '1',
    statusTag: 'Hub',
    description: 'EthnoKG mission, architecture, and live platform summary'
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    category: 'intelligence',
    icon: BarChart3,
    hotkey: '2',
    statusTag: 'Live Metrics',
    description: 'Real-time extraction velocity and taxonomic distribution analytics'
  },
  {
    id: 'discovery',
    label: 'Discovery Radar',
    category: 'intelligence',
    icon: Compass,
    hotkey: '3',
    statusTag: 'Sonar',
    description: 'Cross-domain serendipity, cluster signals, and bioactivity hotspots'
  },
  {
    id: 'plants',
    label: 'Plant Intelligence',
    category: 'intelligence',
    icon: Leaf,
    hotkey: '4',
    statusTag: 'Taxonomy',
    description: 'Botanical database, phytochemical compounds, and therapeutic indications'
  },
  {
    id: 'graph',
    label: 'Knowledge Graph',
    category: 'intelligence',
    icon: Network,
    hotkey: '5',
    statusTag: 'Multi-Hop',
    description: 'Interactive ontological graph, shortest-path tracing, and node inspection'
  },
  {
    id: 'extraction',
    label: 'Literature Mining',
    category: 'evidence',
    icon: Search,
    hotkey: '6',
    statusTag: 'NLP Pipeline',
    description: 'Extract plants, compounds, and disease relations from PubMed text'
  },
  {
    id: 'evidence',
    label: 'Evidence Explorer',
    category: 'evidence',
    icon: Database,
    hotkey: '7',
    statusTag: 'Traceable',
    description: 'PubMed DOIs, extraction confidence scores, and literature citations'
  },
  {
    id: 'assistant',
    label: 'Research Assistant',
    category: 'evidence',
    icon: Sparkles,
    hotkey: '8',
    statusTag: 'Grounded AI',
    description: 'Grounded question answering co-pilot with exact citation provenance'
  },
  {
    id: 'verification',
    label: 'Verification',
    category: 'governance',
    icon: ShieldCheck,
    hotkey: '9',
    statusTag: 'Audit Queue',
    description: 'Curator consensus interface for reviewing extraction confidence and claims'
  },
  {
    id: 'methodology',
    label: 'Methodology',
    category: 'governance',
    icon: BookOpen,
    hotkey: '0',
    statusTag: 'Pipeline Spec',
    description: '6-stage computational pipeline, formal schemas, and scoring criteria'
  },
  {
    id: 'sources',
    label: 'Sources & Ethics',
    category: 'governance',
    icon: FileText,
    hotkey: 'E',
    statusTag: 'Nagoya/IP',
    description: 'Bioethical framework, Indigenous knowledge sovereignty, and open data'
  }
] as const;
