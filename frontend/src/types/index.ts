export interface SynonymBrief {
  id: number;
  synonym_name: string;
  synonym_type: string;
  taxonomic_source: string;
}

export interface PlantBrief {
  id: number;
  scientific_name: string;
  family?: string;
  genus?: string;
  species?: string;
  authority?: string;
  common_names: string[];
  taxonomic_status: string;
  relationships_count?: number;
}

export interface PlantDetail {
  id: number;
  scientific_name: string;
  family?: string;
  genus?: string;
  species?: string;
  authority?: string;
  common_names: string[];
  taxonomic_status: string;
  mpns_id?: string;
  description?: string;
  synonyms: SynonymBrief[];
  relationships_count: number;
  reported_conditions: string[];
  reported_compounds: string[];
  knowledge_traditions: string[];
  parts_used: string[];
  preparation_methods: string[];
  evidence_breakdown: Record<string, number>;
  supporting_publications: Array<{
    id: number;
    title: string;
    authors?: string;
    year?: number;
    doi?: string;
    journal?: string;
  }>;
  relationships: Array<{
    id: number;
    relation_type: string;
    condition?: string;
    compound?: string;
    plant_part?: string;
    preparation_method?: string;
    pharmacological_activity?: string;
    evidence_tier: string;
    supporting_excerpt?: string;
    confidence: number;
    verification_status: string;
    document_title?: string;
    document_doi?: string;
  }>;
}

export interface ConditionBrief {
  id: number;
  name: string;
  category: string;
  icd11_code?: string;
  umls_cui?: string;
  description?: string;
  relationships_count?: number;
}

export interface CompoundBrief {
  id: number;
  name: string;
  pubchem_cid?: string;
  chembl_id?: string;
  molecular_formula?: string;
  smiles?: string;
  biological_class: string;
  relationships_count?: number;
}

export interface DocumentBrief {
  id: number;
  title: string;
  authors?: string;
  publication_year?: number;
  journal?: string;
  doi?: string;
  source_url?: string;
  license: string;
  document_type: string;
  char_count: number;
  relationships_count?: number;
  ingested_at: string;
}

export interface DocumentDetail extends DocumentBrief {
  raw_text: string;
}

export interface ExtractionRecord {
  plant_name: string;
  scientific_name: string;
  plant_synonyms: string[];
  reported_use: string;
  medical_condition: string;
  plant_part: string;
  preparation_method: string;
  bioactive_compounds: string[];
  pharmacological_activity: string;
  geographic_context: string;
  knowledge_tradition: string;
  evidence_category: string;
  evidence_statement: string;
  source_document: string;
  source_url: string;
  publication_year?: number;
  page_or_section: string;
  supporting_excerpt: string;
  extraction_confidence: number;
  verification_status: string;
}

export interface ExtractionRunResponse {
  extracted_count: number;
  document_id?: number;
  document_title?: string;
  results: ExtractionRecord[];
}

export interface RelationshipDetail {
  id: number;
  plant_id: number;
  plant_scientific_name: string;
  condition_id?: number;
  condition_name?: string;
  compound_id?: number;
  compound_name?: string;
  document_id: number;
  document_title: string;
  document_doi?: string;
  document_year?: number;
  relation_type: string;
  reported_use?: string;
  plant_part?: string;
  preparation_method?: string;
  pharmacological_activity?: string;
  geographic_context?: string;
  knowledge_tradition: string;
  evidence_tier: string;
  evidence_statement?: string;
  supporting_excerpt?: string;
  page_or_section?: string;
  extraction_confidence: number;
  verification_status: string;
  created_at: string;
  updated_at: string;
}

export interface CytoscapeElement {
  data: Record<string, any>;
}

export interface GraphResponse {
  nodes: CytoscapeElement[];
  edges: CytoscapeElement[];
  meta: Record<string, any>;
}

export interface CitedSource {
  document_title: string;
  authors?: string;
  year?: number;
  doi?: string;
  excerpt: string;
  evidence_tier: string;
}

export interface AssistantQueryResponse {
  answer: string;
  cited_plants: string[];
  cited_conditions: string[];
  cited_compounds: string[];
  cited_sources: CitedSource[];
  evidence_tiers_involved: string[];
  confidence: number;
  medical_disclaimer: string;
}

export interface DashboardStatsResponse {
  total_plants: number;
  total_relationships: number;
  total_compounds: number;
  indexed_publications: number;
  verified_relationships: number;
  pending_verifications: number;
  rejected_verifications: number;
  avg_extraction_confidence: number;
  evidence_distribution: Record<string, number>;
  confidence_distribution: Record<string, number>;
  traditions_distribution: Record<string, number>;
  recent_documents: Array<{
    id: number;
    title: string;
    authors?: string;
    year?: number;
    journal?: string;
    char_count: number;
    relationships_count: number;
    ingested_at: string;
  }>;
}

export interface SourceItem {
  id: string;
  name: string;
  organization: string;
  category: string;
  url: string;
  license: string;
  integration_status: string;
  description: string;
}

export interface DiscoveryIndexItem {
  plant_id: number;
  plant_name: string;
  common_names: string[];
  condition_name: string;
  compound_name: string;
  tradition: string;
  discovery_score: number;
  readiness_stage: string;
  stage_badge: string;
  evidence_counts: {
    traditional: number;
    in_vitro: number;
    in_vivo: number;
    clinical: number;
  };
  average_confidence: number;
  conservation_status: string;
  harvesting_risk: string;
  excerpts: string[];
  dois: string[];
}

export interface ConvergenceItem {
  condition: string;
  traditions: string[];
  traditions_count: number;
  convergent_plants: string[];
  plants_count: number;
  convergence_score: number;
  convergence_level: string;
  total_literature_records: number;
}

export interface SovereigntyCertificate {
  certificate_id: string;
  sha256_provenance_hash: string;
  plant_id: number;
  scientific_name: string;
  common_names: string[];
  certificate: {
    certificate_authority: string;
    species_taxonomic_name: string;
    botanical_authority: string;
    kew_mpns_status: string;
    originating_traditions: string[];
    documented_conditions: string[];
    isolated_phytochemicals: string[];
    iucn_red_list_status: string;
    cites_trade_category: string;
    biodiversity_harvesting_notice: string;
    primary_literature_dois: string[];
    nagoya_abs_status: string;
    timestamp_utc: string;
  };
}

export interface BenchmarkRow {
  dimension: string;
  rule_based_f1: number;
  llm_only_f1: number;
  ethnokg_hybrid_f1: number;
  precision: number;
  recall: number;
  advantage: string;
}

export interface EvaluationBenchmarkResponse {
  benchmark_dataset: string;
  eval_timestamp: string;
  summary_table: BenchmarkRow[];
}

export interface BotanicalTaxonResolution {
  query: string;
  matched: boolean;
  confidence: number;
  scientific_name?: string;
  genus?: string;
  species?: string;
  authority?: string;
  family?: string;
  kew_status?: string;
  resolution_type?: string;
  knowledge_tradition?: string;
  common_names?: string[];
  verified_bioactive_compounds?: string[];
  principal_traditional_uses?: string[];
  plant_id?: number | null;
  source?: string;
  message?: string;
  suggestion?: string;
  kew_powo_url?: string;
}

export interface CompoundDetail extends CompoundBrief {
  pubchem_url?: string;
  chembl_url?: string;
  associated_plants: Array<{
    id: number;
    scientific_name: string;
    common_names: string[];
  }>;
  associated_conditions: Array<{
    id: number;
    name: string;
    category: string;
  }>;
  evidence_records: Array<{
    relationship_id: number;
    plant_name: string;
    condition_name: string;
    evidence_tier: string;
    evidence_statement?: string;
    tradition?: string;
    confidence: number;
    verification_status: string;
    document_title?: string;
    doi?: string;
  }>;
}

export interface GraphCacheStats {
  cached_queries: number;
  cache_hits: number;
  cache_misses: number;
  ttl_seconds: number;
}
