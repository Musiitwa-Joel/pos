export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '0';
  return Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleString();
};
