export function exportWallToJSON(wallTitle: string, notes: unknown[]): void {
  if (typeof window === 'undefined') return;
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ wallTitle, notes, exportedAt: new Date().toISOString() }, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `${wallTitle.toLowerCase().replace(/\s+/g, '-')}-backup.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportWallToCSV(wallTitle: string, notes: Array<{ sender_name?: string; message?: string; created_at?: string }>): void {
  if (typeof window === 'undefined') return;
  const headers = ['Sender', 'Message', 'Date'];
  const rows = notes.map(n => [
    `"${(n.sender_name || 'Anonymous').replace(/"/g, '""')}"`,
    `"${(n.message || '').replace(/"/g, '""')}"`,
    `"${n.created_at || ''}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${wallTitle.toLowerCase().replace(/\s+/g, '-')}-notes.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}