const LEGACY_SHELL_URL = 'src/features/legacy/legacy-shell.html';

export async function mountLegacyFeature({ document }) {
  const response = await fetch(LEGACY_SHELL_URL, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Legacy shell could not be loaded: ${response.status}`);
  }

  const html = await response.text();

  document.open();
  document.write(html);
  document.close();
}
