import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FileText, FileSpreadsheet, FileCode, FileType } from 'lucide-react';
import { exportToPDF, exportToExcel, exportToCSV, exportToWord } from '../../utils/exportUtils';

const ExportDropdown = ({ data, filename, onBeforeExport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (format) => {
    setIsOpen(false);
    setIsExporting(true);
    
    try {
      let exportData = data;
      if (onBeforeExport) {
        exportData = await onBeforeExport();
      }
      
      if (!exportData || exportData.length === 0) {
        alert("No data available to export.");
        return;
      }

      switch (format) {
        case 'pdf': exportToPDF(exportData, filename); break;
        case 'excel': exportToExcel(exportData, filename); break;
        case 'csv': exportToCSV(exportData, filename); break;
        case 'word': exportToWord(exportData, filename); break;
        default: break;
      }
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to generate report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const options = [
    { id: 'pdf', label: 'PDF Document', icon: <FileText size={18} />, color: '#ef4444' },
    { id: 'excel', label: 'Excel Spreadsheet', icon: <FileSpreadsheet size={18} />, color: '#10b981' },
    { id: 'csv', label: 'CSV File', icon: <FileCode size={18} />, color: '#6366f1' },
    { id: 'word', label: 'Word Document', icon: <FileType size={18} />, color: '#3b82f6' },
  ];

  return (
    <div className="export-dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
      <button 
        className="btn btn-primary" 
        disabled={isExporting}
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          padding: '0.75rem 1.25rem',
          borderRadius: '12px',
          fontWeight: 700,
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
        }}
      >
        <Download size={18} />
        {isExporting ? 'Generating...' : 'Export Report'}
        <ChevronDown size={16} style={{ 
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', 
          transition: 'transform 0.3s ease',
          opacity: 0.7
        }} />
      </button>

      {isOpen && (
        <div className="dropdown-menu fade-in" style={{
          position: 'absolute',
          top: 'calc(100% + 10px)',
          right: 0,
          backgroundColor: '#fff',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
          padding: '0.75rem',
          zIndex: 1000,
          minWidth: '240px',
          border: '1px solid rgba(0,0,0,0.05)',
          animation: 'dropdownFadeIn 0.2s ease-out'
        }}>
          <div style={{ padding: '0.5rem 1rem 0.75rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Select Format
          </div>
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleExport(opt.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.85rem 1rem',
                border: 'none',
                background: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                textAlign: 'left'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: `${opt.color}15`,
                color: opt.color
              }}>
                {opt.icon}
              </div>
              {opt.label}
            </button>
          ))}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes dropdownFadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
};

export default ExportDropdown;
