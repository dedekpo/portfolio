export const splitIntoRows = <T,>(array: T[], itemsPerRow: number): T[][] => {
  const rows: T[][] = [];

  for (let i = 0; i < array.length; i += itemsPerRow) {
    rows.push(array.slice(i, i + itemsPerRow));
  }

  return rows;
};
