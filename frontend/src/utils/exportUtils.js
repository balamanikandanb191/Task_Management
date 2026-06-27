import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from 'xlsx';

/**
 * Common download helper
 */
const downloadFile = (content, filename, contentType) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export to PDF
 */
export const exportToPDF = (data, filename) => {
  if (!data || !data.length) return;
  const doc = new jsPDF();
  const headers = Object.keys(data[0]).map(h => h.toUpperCase().replace('_', ' '));
  const rows = data.map(row => Object.values(row));
  
  doc.setFontSize(18);
  doc.text(filename.replace(/-/g, ' ').toUpperCase(), 14, 15);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
  
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 30,
    theme: 'grid',
    headStyles: { fillStyle: 'fill', fillColor: [124, 58, 237], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { top: 30 }
  });
  
  doc.save(`${filename}.pdf`);
};

/**
 * Export to Excel
 */
export const exportToExcel = (data, filename) => {
  if (!data || !data.length) return;
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report Data");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

/**
 * Export to CSV
 */
export const exportToCSV = (data, filename) => {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(h => {
      const val = row[h] === null || row[h] === undefined ? '' : String(row[h]);
      return `"${val.replace(/"/g, '""')}"`;
    }).join(','))
  ].join('\n');
  
  downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
};

/**
 * Export to Word (HTML based)
 */
export const exportToWord = (data, filename) => {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]).map(h => h.toUpperCase().replace('_', ' '));
  
  const html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${filename}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        h1 { color: #7c3aed; border-bottom: 2px solid #7c3aed; padding-bottom: 10px; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th { background-color: #7c3aed; color: white; padding: 12px; text-align: left; border: 1px solid #ddd; }
        td { padding: 10px; border: 1px solid #ddd; font-size: 10pt; }
        .meta { color: #666; font-size: 9pt; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <h1>${filename.replace(/-/g, ' ').toUpperCase()}</h1>
      <p class="meta">Generated on: ${new Date().toLocaleString()}</p>
      <table>
        <thead>
          <tr>
            ${headers.map(h => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${Object.values(row).map(v => `<td>${v === null || v === undefined ? '' : v}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;
  
  downloadFile(html, `${filename}.doc`, 'application/msword');
};
