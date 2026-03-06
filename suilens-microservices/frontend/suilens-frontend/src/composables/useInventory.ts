import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';

interface BranchStock {
  branchCode: string;
  branchName: string;
  branchLocation: string;
  branchNotes: string | null;
  availableQuantity: number;
  totalQuantity: number;
}

interface LensStock {
  lensId: string;
  branches: BranchStock[];
}

export function useLensStock(lensId: string | Ref<string>) {
  const id = typeof lensId === 'string' ? lensId : lensId;
  const idValue = computed(() => typeof id === 'string' ? id : id.value);

  return useQuery<LensStock>({
    queryKey: ['inventory', idValue],
    queryFn: async () => {
      const res = await fetch(`/api/inventory/lenses/${idValue.value}`);
      if (!res.ok) throw new Error('Failed to fetch stock');
      return res.json();
    },
    enabled: computed(() => !!idValue.value),
  });
}

interface Branch {
  code: string;
  name: string;
  location: string;
  notes: string | null;
}

export function useBranches() {
  return useQuery<Branch[]>({
    queryKey: ['branches'],
    queryFn: async () => {
      const res = await fetch('/api/inventory/branches');
      if (!res.ok) throw new Error('Failed to fetch branches');
      return res.json();
    },
  });
}
