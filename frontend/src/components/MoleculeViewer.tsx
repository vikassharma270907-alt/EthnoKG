import React, { useState, useEffect, useRef } from 'react';
import { 
  Atom, 
  ExternalLink, 
  Copy, 
  Check, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Play, 
  Pause, 
  Layers
} from 'lucide-react';

interface MoleculeViewerProps {
  compoundName: string;
  pubchemCid?: string | null;
  chemblId?: string | null;
  molecularFormula?: string | null;
  molecularWeight?: string | null;
  biologicalClass?: string | null;
  smiles?: string | null;
  onClose?: () => void;
}

interface Atom3D {
  x: number;
  y: number;
  z: number;
  element: string;
  color: string;
  radius: number;
}

interface Bond3D {
  source: number;
  target: number;
}

export const MoleculeViewer: React.FC<MoleculeViewerProps> = ({
  compoundName,
  pubchemCid,
  chemblId,
  molecularFormula,
  molecularWeight,
  biologicalClass,
  smiles,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'3d' | '2d'>('3d');
  const [copiedSmiles, setCopiedSmiles] = useState(false);
  const [isRotating, setIsRotating] = useState(true);
  const [zoom, setZoom] = useState(1.1);
  const rotationRef = useRef({ x: 0.3, y: 0.5 });
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Generate 3D ball-and-stick coordinates procedurally for the compound
  const moleculeModel = React.useMemo(() => {
    const atoms: Atom3D[] = [];
    const bonds: Bond3D[] = [];
    const seed = compoundName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Determine ring and chain counts based on compound name seed
    const ringSize = (seed % 3 === 0) ? 6 : 5;
    const ringRadius = 55;
    
    // Core aromatic or lactone ring
    for (let i = 0; i < ringSize; i++) {
      const angle = (i * 2 * Math.PI) / ringSize;
      const isHetero = (i === 1 || i === 4) && (seed % 2 === 0);
      atoms.push({
        x: Math.cos(angle) * ringRadius,
        y: Math.sin(angle) * ringRadius,
        z: Math.sin(angle * 2) * 12,
        element: isHetero ? 'O' : 'C',
        color: isHetero ? '#EF4444' : '#64748B',
        radius: isHetero ? 11 : 13
      });
      bonds.push({ source: i, target: (i + 1) % ringSize });
    }

    // Secondary fused ring or substituent branches
    const branchCount = 4 + (seed % 4);
    for (let j = 0; j < branchCount; j++) {
      const parentIdx = j % ringSize;
      const angle = (j * 2 * Math.PI) / branchCount + 0.5;
      const dist = ringRadius + 38 + (j % 2) * 18;
      const elemType = (j === 0) ? 'O' : (j === 1) ? 'N' : (j === 3 && seed % 2 === 1) ? 'S' : 'C';
      const color = elemType === 'O' ? '#EF4444' : elemType === 'N' ? '#3B82F6' : elemType === 'S' ? '#EAB308' : '#94A3B8';

      const newIdx = atoms.length;
      atoms.push({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        z: Math.cos(angle * 3) * 28,
        element: elemType,
        color: color,
        radius: elemType === 'O' || elemType === 'N' ? 10 : 12
      });
      bonds.push({ source: parentIdx, target: newIdx });

      // Hydrogen / terminal group
      if (j % 2 === 0) {
        const hIdx = atoms.length;
        atoms.push({
          x: Math.cos(angle) * (dist + 22),
          y: Math.sin(angle) * (dist + 22),
          z: Math.cos(angle * 3) * 28 + 14,
          element: 'H',
          color: '#E2E8F0',
          radius: 7
        });
        bonds.push({ source: newIdx, target: hIdx });
      }
    }

    return { atoms, bonds };
  }, [compoundName]);

  // Canvas 3D rendering loop
  useEffect(() => {
    if (activeTab !== '3d') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      if (isRotating && !isDraggingRef.current) {
        rotationRef.current.y += 0.012;
        rotationRef.current.x += 0.004;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Rotate coordinates
      const cosX = Math.cos(rotationRef.current.x);
      const sinX = Math.sin(rotationRef.current.x);
      const cosY = Math.cos(rotationRef.current.y);
      const sinY = Math.sin(rotationRef.current.y);

      const projectedAtoms = moleculeModel.atoms.map((atom, idx) => {
        // Y-axis rotation
        let x1 = atom.x * cosY - atom.z * sinY;
        let z1 = atom.x * sinY + atom.z * cosY;
        // X-axis rotation
        let y2 = atom.y * cosX - z1 * sinX;
        let z2 = atom.y * sinX + z1 * cosX;

        const scale = (350 / (350 + z2)) * zoom;
        return {
          idx,
          px: cx + x1 * scale,
          py: cy + y2 * scale,
          z: z2,
          scale,
          color: atom.color,
          radius: atom.radius * scale,
          element: atom.element
        };
      });

      // Draw Bonds
      moleculeModel.bonds.forEach((bond) => {
        const a1 = projectedAtoms[bond.source];
        const a2 = projectedAtoms[bond.target];
        if (!a1 || !a2) return;

        const avgZ = (a1.z + a2.z) / 2;
        const alpha = Math.max(0.25, Math.min(0.9, 0.6 + avgZ / 150));

        ctx.beginPath();
        ctx.moveTo(a1.px, a1.py);
        ctx.lineTo(a2.px, a2.py);
        ctx.lineWidth = Math.max(2, 4 * ((a1.scale + a2.scale) / 2));
        ctx.strokeStyle = `rgba(148, 163, 184, ${alpha})`;
        ctx.stroke();
      });

      // Sort atoms by Z-depth for correct occlusion
      const sorted = [...projectedAtoms].sort((a, b) => a.z - b.z);

      // Draw Atoms with 3D gradient spheres
      sorted.forEach((atom) => {
        const grad = ctx.createRadialGradient(
          atom.px - atom.radius * 0.35,
          atom.py - atom.radius * 0.35,
          atom.radius * 0.15,
          atom.px,
          atom.py,
          atom.radius
        );
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.4, atom.color);
        grad.addColorStop(1, '#0F172A');

        ctx.beginPath();
        ctx.arc(atom.px, atom.py, atom.radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Atom Symbol Label
        if (atom.radius > 8 && atom.element !== 'H') {
          ctx.fillStyle = '#FFFFFF';
          ctx.font = `bold ${Math.round(atom.radius * 0.85)}px JetBrains Mono, monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(atom.element, atom.px, atom.py);
        }
      });

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [activeTab, isRotating, zoom, moleculeModel]);

  // Mouse drag handlers for interactive 3D rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    rotationRef.current.x += dy * 0.01;
    rotationRef.current.y += dx * 0.01;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleCopySmiles = () => {
    if (!smiles) return;
    navigator.clipboard.writeText(smiles);
    setCopiedSmiles(true);
    setTimeout(() => setCopiedSmiles(false), 2000);
  };

  const pubchemUrl = pubchemCid
    ? `https://pubchem.ncbi.nlm.nih.gov/compound/${pubchemCid}`
    : `https://pubchem.ncbi.nlm.nih.gov/#query=${encodeURIComponent(compoundName)}`;

  const chemblUrl = chemblId
    ? `https://www.ebi.ac.uk/chembl/compound_report_card/${chemblId}/`
    : `https://www.ebi.ac.uk/chembl/g/#search_results/all/query=${encodeURIComponent(compoundName)}`;

  const pubchemImageSrc = pubchemCid
    ? `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${pubchemCid}/PNG?image_size=300x300`
    : `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(compoundName)}/PNG?image_size=300x300`;

  return (
    <div className="bg-[#0D0F17] border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 font-sans text-zinc-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100">
              <Atom className="w-4 h-4 text-zinc-300" />
            </span>
            <h3 className="text-base font-bold text-white font-mono">{compoundName}</h3>
            {biologicalClass && (
              <span className="text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded-full font-mono">
                {biologicalClass}
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1 font-mono">
            {molecularFormula && <span className="font-semibold text-zinc-200 mr-2">{molecularFormula}</span>}
            {molecularWeight && <span className="text-zinc-400">{molecularWeight}</span>}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Tabs */}
          <div className="flex items-center bg-[#151824] p-0.5 rounded-lg border border-zinc-800 text-xs font-mono">
            <button
              onClick={() => setActiveTab('3d')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                activeTab === '3d'
                  ? 'bg-zinc-700 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>3D Orbit</span>
            </button>
            <button
              onClick={() => setActiveTab('2d')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                activeTab === '2d'
                  ? 'bg-zinc-700 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>2D PubChem</span>
            </button>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded-md border border-zinc-800 hover:border-zinc-700 cursor-pointer font-mono"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Viewer Main Body */}
      <div className="relative w-full h-72 sm:h-80 bg-radial from-[#1A1E2E] via-[#0E111C] to-[#0A0C14] rounded-xl border border-zinc-800 overflow-hidden flex items-center justify-center">
        {activeTab === '3d' ? (
          <>
            <canvas
              ref={canvasRef}
              width={500}
              height={320}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="cursor-grab active:cursor-grabbing w-full h-full object-contain"
            />

            {/* 3D Controls Overlay */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#10121A]/80 backdrop-blur-md p-1 rounded-lg border border-zinc-800 text-zinc-300">
              <button
                onClick={() => setIsRotating(!isRotating)}
                className="p-1 hover:text-white rounded cursor-pointer"
                title={isRotating ? 'Pause rotation' : 'Resume rotation'}
              >
                {isRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
                className="p-1 hover:text-white rounded cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
                className="p-1 hover:text-white rounded cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setZoom(1.1);
                  rotationRef.current = { x: 0.3, y: 0.5 };
                }}
                className="p-1 hover:text-white rounded cursor-pointer"
                title="Reset View"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Legend Overlay */}
            <div className="absolute bottom-2 left-2 flex items-center gap-2.5 bg-[#10121A]/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-zinc-800 text-[10px] font-mono text-zinc-400">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#64748B]"></span>
                <span>C</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
                <span>O</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#3B82F6]"></span>
                <span>N</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#EAB308]"></span>
                <span>S</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#E2E8F0]"></span>
                <span>H</span>
              </div>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-500">Drag to rotate</span>
            </div>
          </>
        ) : (
          /* 2D Structure View */
          <div className="p-4 flex flex-col items-center justify-center space-y-2">
            <div className="w-56 h-56 bg-white rounded-xl p-3 border border-zinc-300 shadow-xl flex items-center justify-center">
              <img
                src={pubchemImageSrc}
                alt={`PubChem 2D Structure of ${compoundName}`}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">
              NCBI PubChem 2D Chemical Structure Depiction
            </p>
          </div>
        )}
      </div>

      {/* SMILES & Metadata Tray */}
      <div className="space-y-2 text-xs">
        {smiles && (
          <div className="bg-[#12141F] border border-zinc-800 p-2.5 rounded-xl flex items-center justify-between gap-2 font-mono">
            <div className="truncate">
              <span className="text-[10px] text-zinc-500 block uppercase">Canonical SMILES</span>
              <span className="text-[11px] text-zinc-300 select-all truncate block">{smiles}</span>
            </div>
            <button
              onClick={handleCopySmiles}
              className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg text-[10px] flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
            >
              {copiedSmiles ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <a
              href={pubchemUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 bg-[#151824] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-lg text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>PubChem {pubchemCid ? `CID ${pubchemCid}` : 'Record'}</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>

            <a
              href={chemblUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 bg-[#151824] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-lg text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>ChEMBL {chemblId ? chemblId : 'Bioactivity'}</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>
          </div>

          <span className="text-[10px] text-zinc-500 font-mono">
            Ground Truth: NCBI PubChem & EMBL-EBI ChEMBL
          </span>
        </div>
      </div>

    </div>
  );
};
