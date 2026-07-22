export function formatOrderDateTime(input: Date | string): { date: string; time: string } {
  const value = typeof input === 'string' ? new Date(input) : input;
  return {
    date: value.toLocaleDateString('nl-NL'),
    time: value.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
  };
}
