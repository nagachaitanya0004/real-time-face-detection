/**
 * Purpose: Custom hook for polling ROI data from the backend.
 */

import { useState, useEffect } from 'react';
import { ROIRecord } from '../types';

/**
 * Polls the ROI data endpoint at regular intervals.
 * @param apiUrl Base API URL.
 * @param pollInterval Frequency of polling in milliseconds.
 * @returns Array of ROI records.
 */
export const useROIData = (apiUrl: string, pollInterval: number) => {
  const [data, setData] = useState<ROIRecord[]>([]);

  const fetchData = async () => {
    try {
      const response = await fetch(`${apiUrl}/roi/data?limit=50`);
      if (response.ok) {
        const json = await response.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch ROI data', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, pollInterval);
    return () => clearInterval(interval);
  }, [apiUrl, pollInterval]);

  return data;
};
