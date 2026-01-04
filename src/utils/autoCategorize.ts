export const autoCategorize = (title: string): string => {
  const t = title.toLowerCase();

  if (t.includes('zomato') || t.includes('swiggy') || t.includes('food')) {
    return 'Food';
  }
  if (t.includes('uber') || t.includes('ola') || t.includes('bus')) {
    return 'Travel';
  }
  if (t.includes('netflix') || t.includes('prime') || t.includes('movie')) {
    return 'Entertainment';
  }
  if (t.includes('rent') || t.includes('electricity') || t.includes('bill')) {
    return 'Bills';
  }

  return 'Others';
};
