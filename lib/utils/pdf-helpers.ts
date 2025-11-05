// Helper to create Blob from Uint8Array without TypeScript errors
export function createPDFBlob(data: Uint8Array): Blob {
  return new Blob([data as any], { type: 'application/pdf' });
}

export function downloadPDF(data: Uint8Array, filename: string): void {
  const blob = createPDFBlob(data);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
