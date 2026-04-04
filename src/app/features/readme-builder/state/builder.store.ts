import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { BlockType, ReadMeBlock } from '../../../shared/models/project.interface';

export interface BuilderState {
  projectId: string | null;
  title: string;
  blocks: ReadMeBlock[];
  isLoading: boolean;
}

const initialState: BuilderState = {
  projectId: null,
  title: 'Neues Projekt',
  blocks: [],
  isLoading: false,
};

export const BuilderStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withMethods((store) => ({
    addBlock(type: BlockType) {
      const newBlock: ReadMeBlock = {
        id: crypto.randomUUID(),
        type,
        data: {},
      };

      patchState(store, (state) => ({
        blocks: [...state.blocks, newBlock],
      }));
    },
  })),
);
