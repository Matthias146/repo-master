export type BlockType = 'hero' | 'tech-stack' | 'setup' | 'custom';

export interface ReadMeBlock {
  id: string;
  type: BlockType;
  data: Record<string, unknown>;
}

export interface Project {
  id: string;
  title: string;
  blocks: ReadMeBlock[];
  created_at: string;
}
