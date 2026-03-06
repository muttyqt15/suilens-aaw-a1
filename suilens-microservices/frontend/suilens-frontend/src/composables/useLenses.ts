import { useQuery } from '@tanstack/vue-query';

interface Lens {
  id: string;
  modelName: string;
  manufacturerName: string;
  minFocalLength: number;
  maxFocalLength: number;
  maxAperture: string;
  mountType: string;
  dayPrice: string;
  weekendPrice: string;
  description: string | null;
}

export function useLenses() {
  return useQuery<Lens[]>({
    queryKey: ['lenses'],
    queryFn: async () => {
      const res = await fetch('/api/lenses');
      if (!res.ok) throw new Error('Failed to fetch lenses');
      return res.json();
    },
  });
}
