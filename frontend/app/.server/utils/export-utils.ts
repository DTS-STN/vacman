function toKebabCase(str: string) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

export function exportSpreadsheet(buffer: ArrayBuffer, name: string) {
  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.oasis.opendocument.spreadsheet',
      'Content-Disposition': `attachment; filename=${toKebabCase(name)}.ods`,
    },
  });
}
