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
    const blocks: ReadmeBlock[] = [];

    blocks.push({
      id: `header-${Date.now()}`,
      name: 'Projekt Header',
      markdown: `# ${pkg.name ? pkg.name.toUpperCase() : repoPath}\n\n${pkg.description || 'Eine kurze Beschreibung dieses Projekts.'}\n\n![GitHub last commit](https://img.shields.io/github/last-commit/${repoPath})`,
    });

    let techStack =
      '## 🚀 Technologien\n\nDieses Projekt wurde mit folgenden Frameworks und Tools gebaut:\n\n';
    let techFound = false;

    if (deps['@angular/core']) {
      techStack += '- **Angular**\n';
      techFound = true;
    }
    if (deps['react']) {
      techStack += '- **React**\n';
      techFound = true;
    }
    if (deps['vue']) {
      techStack += '- **Vue.js**\n';
      techFound = true;
    }
    if (deps['tailwindcss']) {
      techStack += '- **Tailwind CSS**\n';
      techFound = true;
    }
    if (deps['typescript']) {
      techStack += '- **TypeScript**\n';
      techFound = true;
    }
    if (deps['vitest'] || deps['jest']) {
      techStack += '- **Testing:** Vitest/Jest\n';
      techFound = true;
    }

    if (techFound) {
      blocks.push({ id: `tech-${Date.now()}`, name: 'Tech Stack', markdown: techStack });
    }

    const installCmd = pkg.name ? `cd ${pkg.name}` : 'cd project';
    blocks.push({
      id: `install-${Date.now()}`,
      name: 'Installation',
      markdown: `## 💻 Lokales Setup\n\nUm dieses Projekt lokal auszuführen, folge diesen Schritten:\n\n\`\`\`bash\n# Repository klonen\ngit clone https://github.com/${repoPath}.git\n\n# In den Ordner wechseln\n${installCmd}\n\n# Abhängigkeiten installieren\nnpm install\n\n# Server starten\nnpm start\n\`\`\``,
    });

    this.builder.setSelectedBlocks(blocks);
  }
}
