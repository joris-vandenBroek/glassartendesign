export function formatCurrency(amount: number): string {
  return amount.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' }).replace(/ /g, ' ');
}
