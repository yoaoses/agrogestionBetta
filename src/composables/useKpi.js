export function useKpi() {
  const calculateKpis = (values) => {
    if (!Array.isArray(values) || values.length === 0) {
      return {
        total: 0,
        average: 0,
        max: 0,
        min: 0,
        median: 0,
        count: 0,
        nonZeroCount: 0
      };
    }

    const numericValues = values.filter(v => typeof v === 'number' && !isNaN(v));
    const nonZeroValues = numericValues.filter(v => v > 0);

    return {
      total: sum(numericValues),
      average: average(numericValues),
      max: max(numericValues),
      min: min(numericValues),
      median: median(numericValues),
      count: numericValues.length,
      nonZeroCount: nonZeroValues.length
    };
  }

  const sum = (values) => {
    return values.reduce((acc, val) => acc + val, 0);
  }

  const average = (values) => {
    return values.length > 0 ? sum(values) / values.length : 0;
  }

  const max = (values) => {
    return values.length > 0 ? Math.max(...values) : 0;
  }

  const min = (values) => {
    return values.length > 0 ? Math.min(...values) : 0;
  }

  const median = (values) => {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  return {
    calculateKpis,
    sum,
    average,
    max,
    min,
    median
  }
}
