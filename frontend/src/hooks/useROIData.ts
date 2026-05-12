import { useState, useEffect } from 'react';
import { ROIRecord, ROIPaginatedResponse } from '../types';

export const useROIData = (apiUrl: string, intervalMs: number = 2000) => {
  const [data, setData] = useState<ROIPaginatedResponse | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch(`${apiUrl}/stream/roi-data?limit=20&offset=0`);
      if (response.ok) {
        const json = await response.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to poll ROI data:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, intervalMs);
    return () => clearInterval(interval);
  }, [apiUrl, intervalMs]);

  return data;
};
