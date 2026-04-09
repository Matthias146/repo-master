import { Injectable, inject } from '@angular/core';
import {
  ReadmeBlock,
  WorkspaceService,
} from '../../features/readme-builder/state/workspace.service';
import { toast } from '@spartan-ng/brain/sonner';
import {
  GithubRepo,
  GithubTreeItem,
  GithubTreeResponse,
  PackageJson,
} from '../models/github-scanner.model';
@Injectable({
  providedIn: 'root',
})
export class GithubScannerService {
  private builder = inject(WorkspaceService);
  private readonly IGNORE_LIST = ['node_modules', '.git', '.angular', 'dist', '.vscode', 'cache'];

  async scanRepository(repoInput: string) {
    if (!repoInput) return;

    const repoPath = repoInput.replace('https://github.com/', '').trim();

    try {
      const repoResponse = await fetch(`https://api.github.com/repos/${repoPath}`);
      if (!repoResponse.ok) throw new Error('Repo Details nicht gefunden');
      const repoData: GithubRepo = await repoResponse.json();

      const pkgResponse = await fetch(
        `https://raw.githubusercontent.com/${repoPath}/HEAD/package.json`,
      );
      const pkg: PackageJson = pkgResponse.ok ? await pkgResponse.json() : {};

      let treeItems = await this.fetchTree(repoPath, 'main');
      if (!treeItems) treeItems = await this.fetchTree(repoPath, 'master');

      const treeMarkdown = treeItems ? this.generateTreeMarkdown(treeItems) : '';
      this.generateBlocksFromData(pkg, repoPath, repoData, treeMarkdown);

      toast.success('Repository erfolgreich analysiert!', {
        description: 'Struktur und Beschreibung wurden generiert.',
        position: 'top-center',
      });
    } catch (err) {
      console.error(err);
      toast.error('Fehler beim Scan', {
        description: 'Struktur konnte nicht gelesen werden.',
        position: 'top-center',
      });
    }
  }

  private async fetchTree(repoPath: string, branch: string): Promise<GithubTreeItem[] | null> {
    const res = await fetch(
      `https://api.github.com/repos/${repoPath}/git/trees/${branch}?recursive=1`,
    );
    if (!res.ok) return null;
    const data: GithubTreeResponse = await res.json();
    return data.tree;
  }

  private generateTreeMarkdown(tree: GithubTreeItem[]): string {
    const treeLines = tree
      .filter((item) => !this.IGNORE_LIST.some((ignore) => item.path.includes(ignore)))
      .slice(0, 50)
      .map((item) => {
        const parts = item.path.split('/');
        const level = parts.length;
        const prefix = '│   '.repeat(level - 1) + '├── ';
        return `${prefix}${parts[parts.length - 1]}`;
      })
      .join('\n');

    return `## Projekt-Struktur\n\n\`\`\`text\n.\n${treeLines}\n\`\`\``;
  }

  private createSmartDescription(repoData: GithubRepo, pkg: PackageJson): string {
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    const techFeatures = [repoData.language, ...(repoData.topics || []).slice(0, 3)].filter(
      Boolean,
    );

    return [
      repoData.description || pkg.description,

      techFeatures.length > 0 ? `Dieses Projekt basiert auf **${techFeatures.join(', ')}**.` : null,

      deps['@angular/core']
        ? 'Es nutzt eine moderne **Angular-Architektur** für eine skalierbare Web-Applikation.'
        : deps['react']
          ? 'Die Benutzeroberfläche ist mit **React** und funktionalen Komponenten aufgebaut.'
          : null,
    ]
      .filter(Boolean)
      .join(' ');
  }

  private generateBlocksFromData(
    pkg: PackageJson,
    repoPath: string,
    repoData: GithubRepo,
    treeMarkdown: string,
  ) {
    const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

    const smartDescription = this.createSmartDescription(repoData, pkg);

    const headerBlock: ReadmeBlock = {
      id: `header-${Date.now()}`,
      name: 'Projekt Header',
      markdown:
        `# ${repoData.name.toUpperCase()}\n\n${smartDescription}\n\n` +
        `![GitHub last commit](https://img.shields.io/github/last-commit/${repoPath}) ` +
        `![GitHub stars](https://img.shields.io/github/stars/${repoPath}) ` +
        `![License](https://img.shields.io/github/license/${repoPath})`,
      isCustom: true,
    };

    const treeBlock: ReadmeBlock = {
      id: `tree-${Date.now()}`,
      name: 'Projekt Struktur',
      markdown: treeMarkdown,
      isCustom: true,
    };

    const techStackItems = [
      deps['@angular/core'] ? '- **Angular**' : null,
      deps['tailwindcss'] ? '- **Tailwind CSS**' : null,
      deps['typescript'] ? '- **TypeScript**' : null,
      repoData.language ? `- **Main Language:** ${repoData.language}` : null,
    ].filter(Boolean);

    const techBlock: ReadmeBlock = {
      id: `tech-${Date.now()}`,
      name: 'Tech Stack',
      markdown: `## Technologien\n\n${techStackItems.join('\n')}`,
      isCustom: true,
    };

    const installBlock: ReadmeBlock = {
      id: `install-${Date.now()}`,
      name: 'Installation',
      markdown: `## Setup\n\n\`\`\`bash\ngit clone https://github.com/${repoPath}.git\nnpm install\nnpm start\n\`\`\``,
      isCustom: true,
    };

    this.builder.setScannedBlocks([headerBlock, techBlock, treeBlock, installBlock]);
  }
}
