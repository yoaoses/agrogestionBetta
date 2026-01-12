export const formatDateForApi = (date) => date.toISOString().split('T')[0];

export const formatDateForDisplay = (date) => date.toLocaleDateString('es-ES', {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
});

export const validateDates = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end && !isNaN(start.getTime()) && !isNaN(end.getTime());
}
