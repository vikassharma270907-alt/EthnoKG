import type {
  DashboardStatsResponse,
  DocumentBrief,
  DocumentDetail,
  PlantBrief,
  PlantDetail,
  ConditionBrief,
  CompoundBrief,
  RelationshipDetail,
  ExtractionRunResponse,
  GraphResponse,
  AssistantQueryResponse,
  SourceItem,
  DiscoveryIndexItem,
  ConvergenceItem,
  EvaluationBenchmarkResponse,
  SovereigntyCertificate
} from '../types';

const rawBase = (import.meta as any).env?.VITE_API_URL as string | undefined;
const API_BASE = rawBase 
  ? (rawBase.endsWith('/api') ? rawBase : `${rawBase.replace(/\/$/, '')}/api`)
  : '/api';

async function parseError(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    return data?.detail || res.statusText || fallback;
  } catch {
    return res.statusText || fallback;
  }
}

export async function fetchDashboardStats(): Promise<DashboardStatsResponse> {
  const res = await fetch(`${API_BASE}/dashboard/stats`);
  if (!res.ok) throw new Error(`Failed to fetch stats: ${res.statusText}`);
  return res.json();
}

export async function fetchDocuments(skip = 0, limit = 50, query?: string): Promise<DocumentBrief[]> {
  const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() });
  if (query) params.append('query', query);
  const res = await fetch(`${API_BASE}/documents?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch documents: ${res.statusText}`);
  return res.json();
}

export async function fetchDocument(id: number): Promise<DocumentDetail> {
  const res = await fetch(`${API_BASE}/documents/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch document ${id}: ${res.statusText}`);
  return res.json();
}

export async function uploadDocument(formData: FormData): Promise<DocumentDetail> {
  const res = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Upload failed');
  }
  return res.json();
}

export async function ingestDocument(payload: {
  title: string;
  authors?: string;
  publication_year?: number;
  journal?: string;
  doi?: string;
  source_url?: string;
  license?: string;
  raw_text: string;
}): Promise<DocumentDetail> {
  const res = await fetch(`${API_BASE}/documents/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Ingestion failed');
  }
  return res.json();
}

export async function runExtraction(payload: {
  document_id?: number;
  text_override?: string;
  engine?: string;
}): Promise<ExtractionRunResponse> {
  const res = await fetch(`${API_BASE}/extraction/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Extraction failed');
  }
  return res.json();
}

export async function fetchExtractionResults(filters: {
  status?: string;
  plant_id?: number;
  document_id?: number;
  min_confidence?: number;
  evidence_tier?: string;
  skip?: number;
  limit?: number;
} = {}): Promise<RelationshipDetail[]> {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.plant_id) params.append('plant_id', filters.plant_id.toString());
  if (filters.document_id) params.append('document_id', filters.document_id.toString());
  if (filters.min_confidence !== undefined) params.append('min_confidence', filters.min_confidence.toString());
  if (filters.evidence_tier) params.append('evidence_tier', filters.evidence_tier);
  params.append('skip', (filters.skip || 0).toString());
  params.append('limit', (filters.limit || 100).toString());

  const res = await fetch(`${API_BASE}/extraction/results?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch extraction results: ${res.statusText}`);
  return res.json();
}

export async function fetchPlants(filters: {
  query?: string;
  family?: string;
  tradition?: string;
  skip?: number;
  limit?: number;
} = {}): Promise<PlantBrief[]> {
  const params = new URLSearchParams();
  if (filters.query) params.append('query', filters.query);
  if (filters.family) params.append('family', filters.family);
  if (filters.tradition) params.append('tradition', filters.tradition);
  params.append('skip', (filters.skip || 0).toString());
  params.append('limit', (filters.limit || 50).toString());

  const res = await fetch(`${API_BASE}/plants?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch plants: ${res.statusText}`);
  return res.json();
}

export async function fetchPlantDetail(id: number): Promise<PlantDetail> {
  const res = await fetch(`${API_BASE}/plants/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch plant ${id}: ${res.statusText}`);
  return res.json();
}

export async function fetchCompounds(query?: string): Promise<CompoundBrief[]> {
  const params = new URLSearchParams();
  if (query) params.append('query', query);
  const res = await fetch(`${API_BASE}/compounds?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch compounds: ${res.statusText}`);
  return res.json();
}

export async function fetchConditions(query?: string): Promise<ConditionBrief[]> {
  const params = new URLSearchParams();
  if (query) params.append('query', query);
  const res = await fetch(`${API_BASE}/conditions?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch conditions: ${res.statusText}`);
  return res.json();
}

export async function fetchGraph(filters: {
  plant_id?: number;
  condition_id?: number;
  evidence_tier?: string;
  tradition?: string;
  status_filter?: string;
  max_edges?: number;
} = {}): Promise<GraphResponse> {
  const params = new URLSearchParams();
  if (filters.plant_id) params.append('plant_id', filters.plant_id.toString());
  if (filters.condition_id) params.append('condition_id', filters.condition_id.toString());
  if (filters.evidence_tier) params.append('evidence_tier', filters.evidence_tier);
  if (filters.tradition) params.append('tradition', filters.tradition);
  if (filters.status_filter) params.append('status_filter', filters.status_filter);
  params.append('max_edges', (filters.max_edges || 150).toString());

  const res = await fetch(`${API_BASE}/graph?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch graph: ${res.statusText}`);
  return res.json();
}

export async function approveVerification(id: number, payload: { reviewer_name: string; notes?: string }): Promise<RelationshipDetail> {
  const res = await fetch(`${API_BASE}/verification/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseError(res, 'Failed to approve'));
  return res.json();
}

export async function rejectVerification(id: number, payload: { reviewer_name: string; reason?: string }): Promise<RelationshipDetail> {
  const res = await fetch(`${API_BASE}/verification/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseError(res, 'Failed to reject'));
  return res.json();
}

export async function patchVerification(id: number, payload: any): Promise<RelationshipDetail> {
  const res = await fetch(`${API_BASE}/verification/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseError(res, 'Failed to update relationship'));
  return res.json();
}

export async function queryAssistant(question: string): Promise<AssistantQueryResponse> {
  const res = await fetch(`${API_BASE}/assistant/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error(await parseError(res, 'Assistant query failed'));
  return res.json();
}

export async function fetchSources(): Promise<SourceItem[]> {
  const res = await fetch(`${API_BASE}/sources`);
  if (!res.ok) throw new Error(`Failed to fetch sources: ${res.statusText}`);
  return res.json();
}

export async function fetchDiscoveryIndex(): Promise<DiscoveryIndexItem[]> {
  const res = await fetch(`${API_BASE}/analytics/discovery-index`);
  if (!res.ok) throw new Error(`Failed to fetch discovery index: ${res.statusText}`);
  return res.json();
}

export async function fetchConvergence(): Promise<ConvergenceItem[]> {
  const res = await fetch(`${API_BASE}/analytics/convergence`);
  if (!res.ok) throw new Error(`Failed to fetch convergence: ${res.statusText}`);
  return res.json();
}

export async function fetchEvaluationBenchmark(): Promise<EvaluationBenchmarkResponse> {
  const res = await fetch(`${API_BASE}/analytics/evaluation-benchmark`);
  if (!res.ok) throw new Error(`Failed to fetch evaluation benchmark: ${res.statusText}`);
  return res.json();
}

export async function fetchSovereigntyCertificate(plantId: number): Promise<SovereigntyCertificate> {
  const res = await fetch(`${API_BASE}/analytics/sovereignty-certificate/${plantId}`);
  if (!res.ok) throw new Error(`Failed to fetch sovereignty certificate: ${res.statusText}`);
  return res.json();
}


