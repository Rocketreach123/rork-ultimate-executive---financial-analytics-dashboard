import React, { useMemo, useState, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { FiltersPayload } from '@/types/finance';

export const [FiltersProvider, useFilters] = createContextHook(() => {
  const today = new Date();
  const to = today.toISOString().slice(0,10);
  const fromDate = new Date(today);
  fromDate.setMonth(fromDate.getMonth() - 3);
  const from = fromDate.toISOString().slice(0,10);

  const [filters, setFilters] = useState<FiltersPayload>({ from, to, compare: false });

  const set = useCallback((next: Partial<FiltersPayload>) => {
    setFilters(prev => ({ ...prev, ...next }));
  }, []);

  return { filters, set };
});
