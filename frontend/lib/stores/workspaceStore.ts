import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Version {
  id: string;
  content: string;
  type: 'save' | 'optimize';
  createdAt: string;
}

interface WorkspaceState {
  input: string;
  output: string;
  versions: Version[];
  setInput: (input: string) => void;
  setOutput: (output: string) => void;
  addVersion: (version: Version) => void;
  clearVersions: () => void;
  getRecentVersions: () => Version[];
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      input: '',
      output: '',
      versions: [],
      setInput: (input) => set({ input }),
      setOutput: (output) => set({ output }),
      addVersion: (version) =>
        set((state) => ({
          versions: [version, ...state.versions].slice(0, 10), // Keep only 10 most recent
        })),
      clearVersions: () => set({ versions: [] }),
      getRecentVersions: () => {
        const versions = get().versions;
        return versions
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10);
      },
    }),
    {
      name: 'workspace-storage',
    }
  )
);
