import React, { useEffect, useRef, useState, useId } from 'react';
import mermaid from 'mermaid';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Copy,
  Download,
  Check,
  Maximize2,
  Minimize2,
  Code2,
  FileText,
  AlertTriangle
} from 'lucide-react';
import Button from './Button';

// Initialize mermaid with dark theme
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
});

const MermaidViewer = ({ chartCode, id, title = 'Architecture Diagram' }) => {
  const containerRef = useRef(null);
  const [svgContent, setSvgContent] = useState('');
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const uniqueId = useId().replace(/:/g, '_');

  useEffect(() => {
    let isMounted = true;
    const renderDiagram = async () => {
      if (!chartCode) return;
      try {
        setError(null);
        const elementId = `mermaid_${id || uniqueId}_${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(elementId, chartCode.trim());
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Mermaid Render Error:', err);
          setError(err.message || 'Failed to parse or render Mermaid diagram syntax.');
        }
      }
    };

    renderDiagram();
    return () => { isMounted = false; };
  }, [chartCode, id, uniqueId]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(chartCode || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSVG = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPNG = () => {
    if (!svgContent) return;
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 2; // High-DPI crisp export
      canvas.width = (img.width || 1200) * scale;
      canvas.height = (img.height || 800) * scale;
      const ctx = canvas.getContext('2d');
      ctx.scale(scale, scale);
      ctx.fillStyle = '#0B0D0F';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `${title.toLowerCase().replace(/\s+/g, '_')}.png`;
      a.click();
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  return (
    <div
      className={`bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl bg-slate-950/98 backdrop-blur' : 'relative'
      }`}
    >
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">{title}</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
            Mermaid.js
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.15).toFixed(2)))}
              className="text-slate-400 hover:text-white p-0.5 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] text-slate-300 min-w-[38px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(3.0, +(z + 0.15).toFixed(2)))}
              className="text-slate-400 hover:text-white p-0.5 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="text-slate-400 hover:text-white p-0.5 ml-1 border-l border-slate-800 pl-1 transition-colors"
              title="Reset Zoom (100%)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSource(!showSource)}
            title="Inspect Diagram Source"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{showSource ? 'Diagram' : 'Source'}</span>
          </Button>

          <Button variant="ghost" size="sm" onClick={handleCopyCode} title="Copy Mermaid Code">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </Button>

          <Button variant="outline" size="sm" onClick={handleDownloadSVG} title="Download Vector SVG">
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SVG</span>
          </Button>

          <Button variant="primary" size="sm" onClick={handleDownloadPNG} title="Export High-Res PNG">
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PNG</span>
          </Button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors ml-1"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {showSource ? (
        <div className="p-4 bg-slate-950 font-mono text-xs text-slate-300 overflow-auto max-h-[600px] border-b border-slate-800">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800 text-slate-400 text-[11px]">
            <span>Mermaid Definition Source</span>
            <button
              onClick={handleCopyCode}
              className="text-teal-400 hover:underline flex items-center gap-1"
            >
              <Copy className="w-3 h-3" /> Copy
            </button>
          </div>
          <pre className="whitespace-pre-wrap">{chartCode || '// No diagram source'}</pre>
        </div>
      ) : (
        <div
          ref={containerRef}
          className={`p-6 overflow-auto min-h-[380px] flex items-center justify-center bg-slate-950/90 relative ${
            isFullscreen ? 'flex-1' : ''
          }`}
        >
          {error ? (
            <div className="p-5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-mono max-w-xl">
              <div className="flex items-center gap-2 text-rose-400 font-semibold mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Mermaid Diagram Syntax Error</span>
              </div>
              <p className="mb-3 text-slate-300">{error}</p>
              <div className="pt-2 border-t border-rose-500/20 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Inspect source or retry generation</span>
                <button
                  onClick={() => setShowSource(true)}
                  className="text-rose-400 hover:underline"
                >
                  View Raw Code
                </button>
              </div>
            </div>
          ) : svgContent ? (
            <div
              className="transition-transform duration-150 transform-gpu"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          ) : (
            <p className="text-xs text-slate-500 animate-pulse">Rendering architecture diagram…</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MermaidViewer;
