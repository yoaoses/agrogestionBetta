export const calculateParticipation = (items, totalKey = 'total') => {
  if (!Array.isArray(items) || items.length === 0) return [];

  const total = items.reduce((sum, item) => sum + (item[totalKey] || 0), 0);

  return items.map(item => ({
    ...item,
    percentage: total > 0 ? ((item[totalKey] / total) * 100).toFixed(1) : 0
  }));
}

export const sumSeries = (series) => {
  if (!Array.isArray(series) || series.length === 0) return { labels: [], values: [] };

  const validSeries = series.filter(s => s.values && Array.isArray(s.values) && s.values.length > 0 && s.dates && Array.isArray(s.dates));

  if (validSeries.length === 0) return { labels: [], values: [] };

  const dateMap = new Map();

  validSeries.forEach(s => {
    s.dates.forEach((date, index) => {
      if (index < s.values.length) {
        const dateKey = date.toDateString();
        const value = s.values[index];
        if (typeof value === 'number' && !isNaN(value)) {
          dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + value);
        }
      }
    });
  });

  const sortedEntries = Array.from(dateMap.entries()).sort(([a], [b]) => new Date(a) - new Date(b));
  const values = sortedEntries.map(([_, value]) => value);
  const dates = sortedEntries.map(([dateStr, _]) => new Date(dateStr));

  const labels = dates.map(date => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  });

  return { labels, values };
}
