import { Injectable, inject } from '@angular/core';
import {
  ReadmeBlock,
  WorkspaceService,
} from '../../features/readme-builder/state/workspace.service';
import { toast } from '@spartan-ng/brain/sonner';

export interface PackageJson {
  name?: string;
  description?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

@Injectable({
  providedIn: 'root',
})
export class GithubScannerService {
  private builder = inject(WorkspaceService);

  async scanRepository(repoInput: string) {
    if (!repoInput) return;

    const cleanPath = repoInput.replace('https://github.com/', '').trim();
    const url = `https://raw.githubusercontent.com/${cleanPath}/HEAD/package.json`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('package.json nicht gefunden');
      }

      const pkg = (await response.json()) as PackageJson;
      this.generateBlocksFromPackage(pkg, cleanPath);

      toast.success('Repository erfolgreich gescannt!', {
        description: 'Bausteine wurden automatisch generiert.',
        position: 'top-center',
      });
    } catch (err) {
      console.log(err);

      toast.error('Fehler beim Scan', {
        description:
          'Repo nicht gefunden oder keine package.json vorhanden (muss öffentlich sein).',
        position: 'top-center',
      });
    }
  }

  private generateBlocksFromPackage(pkg: PackageJson, repoPath: string) {
    const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

    const headerBlock: ReadmeBlock = {
      id: `header-${Date.now()}-1`,
      name: 'Projekt Header',
      markdown: `# ${pkg.name ? pkg.name.toUpperCase() : repoPath}\n\n${pkg.description || 'Eine kurze Beschreibung dieses Projekts.'}\n\n![GitHub last commit](https://img.shields.io/github/last-commit/${repoPath})`,
      isCustom: true,
    };

    const techStackItems = [
      deps['@angular/core'] ? '- **Angular**' : null,
      deps['react'] ? '- **React**' : null,
      deps['vue'] ? '- **Vue.js**' : null,
      deps['tailwindcss'] ? '- **Tailwind CSS**' : null,
      deps['typescript'] ? '- **TypeScript**' : null,
      deps['vitest'] || deps['jest'] ? '- **Testing:** Vitest/Jest' : null,
    ].filter(Boolean);

    const techBlock: ReadmeBlock | null =
      techStackItems.length > 0
        ? {
            id: `tech-${Date.now()}-2`,
            name: 'Tech Stack',
            markdown: `## 🚀 Technologien\n\nDieses Projekt wurde mit folgenden Frameworks und Tools gebaut:\n\n${techStackItems.join('\n')}`,
            isCustom: true,
          }
        : null;

    const installCmd = pkg.name ? `cd ${pkg.name}` : 'cd project';
    const installBlock: ReadmeBlock = {
      id: `install-${Date.now()}-3`,
      name: 'Installation',
      markdown: `## 💻 Lokales Setup\n\nUm dieses Projekt lokal auszuführen, folge diesen Schritten:\n\n\`\`\`bash\n# Repository klonen\ngit clone https://github.com/${repoPath}.git\n\n# In den Ordner wechseln\n${installCmd}\n\n# Abhängigkeiten installieren\nnpm install\n\n# Server starten\nnpm start\n\`\`\``,
      isCustom: true,
    };

    const blocks = [headerBlock, techBlock, installBlock].filter(
      (block) => block !== null,
    ) as ReadmeBlock[];

    this.builder.setScannedBlocks(blocks);
  }
}
