import { signalStore, withState } from '@ngrx/signals';
import { ReadMeBlock } from '../../../shared/models/project.interface';

interface BuilderState {
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

export const BuilderStore = signalStore({ providedIn: 'root' }, withState(initialState));
