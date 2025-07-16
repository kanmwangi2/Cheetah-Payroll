/**
 * Performance Hook
 * Provides performance monitoring and optimization utilities
 */

import { useCallback, useRef } from 'react';
import { logger } from '../utils/logger';

interface PerformanceMetrics {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

export const usePerformance = () => {
  const metricsRef = useRef<Map<string, PerformanceMetrics>>(new Map());

  const startMeasure = useCallback((name: string) => {
    const startTime = performance.now();
    metricsRef.current.set(name, {
      name,
      startTime,
    });
    logger.debug(`Performance measure started: ${name}`);
  }, []);

  const endMeasure = useCallback((name: string) => {
    const metric = metricsRef.current.get(name);
    if (!metric) {
      logger.warn(`Performance measure not found: ${name}`);
      return;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    const updatedMetric = {
      ...metric,
      endTime,
      duration,
    };

    metricsRef.current.set(name, updatedMetric);
    logger.debug(`Performance measure completed: ${name} (${duration.toFixed(2)}ms)`);

    return updatedMetric;
  }, []);

  const getMetrics = useCallback(() => {
    return Array.from(metricsRef.current.values());
  }, []);

  const clearMetrics = useCallback(() => {
    metricsRef.current.clear();
    logger.debug('Performance metrics cleared');
  }, []);

  // Measure component render time
  const measureRender = useCallback(
    (componentName: string) => {
      const measureName = `render-${componentName}`;
      startMeasure(measureName);

      return () => {
        endMeasure(measureName);
      };
    },
    [startMeasure, endMeasure]
  );

  return {
    startMeasure,
    endMeasure,
    getMetrics,
    clearMetrics,
    measureRender,
  };
};

export default usePerformance;
