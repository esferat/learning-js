import { useEffect, useState } from 'react';
import type { Chapter } from '../types';
import { loadChapter } from './content';

/** Loads several chapters in parallel; resets on chapter list change. */
export function useChapters(nums: number[]): { chapters: Chapter[] | null; error: string | null } {
  const [chapters, setChapters] = useState<Chapter[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const signature = nums.join(',');

  useEffect(() => {
    let alive = true;
    setChapters(null);
    setError(null);
    if (!signature) {
      return () => {
        alive = false;
      };
    }
    Promise.all(signature.split(',').map((n) => loadChapter(Number(n))))
      .then((loaded) => {
        if (alive) setChapters(loaded);
      })
      .catch((e: unknown) => {
        if (alive) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      alive = false;
    };
  }, [signature]);

  return { chapters, error };
}
