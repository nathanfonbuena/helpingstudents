export const average = (values: number[]) => {
  if (values.length === 0) return null;
  const sum = values.reduce((total, value) => total + value, 0);
  return sum / values.length;
};
