// Ocena i opis warunków mechaniki zapisanych deklaratywnie w mechanika.json.
// Warunki odczytują stan gry przez obiekt kontekstu, dzięki czemu moduł nie zależy od silnika.

export function evaluate(condition, ctx) {
  if (!condition) return true;
  if ('all' in condition) return condition.all.every((item) => evaluate(item, ctx));
  if ('any' in condition) return condition.any.some((item) => evaluate(item, ctx));
  if ('not' in condition) return !evaluate(condition.not, ctx);
  if ('has' in condition) return ctx.hasCodeword(condition.has);
  if ('notHas' in condition) return !ctx.hasCodeword(condition.notHas);
  if ('visitsAtLeast' in condition) return ctx.visitsOfCurrent() >= condition.visitsAtLeast;
  if ('visited' in condition) return ctx.visits(condition.visited) > 0;
  throw new Error(`Nieznany warunek: ${JSON.stringify(condition)}`);
}

// Opis warunku dla gracza (tekst aplikacji, nie książki), np. „masz Informację #18”.
export function describe(condition, labels = {}) {
  const prefix = labels.prefix ?? '#';
  if (!condition) return '';
  if ('all' in condition) return condition.all.map((item) => wrap(item, labels)).join(' i ');
  if ('any' in condition) return condition.any.map((item) => wrap(item, labels)).join(' lub ');
  if ('not' in condition) return `nie jest prawdą, że ${wrap(condition.not, labels)}`;
  if ('has' in condition) return `masz Informację ${prefix}${condition.has}`;
  if ('notHas' in condition) return `nie masz Informacji ${prefix}${condition.notHas}`;
  if ('visitsAtLeast' in condition) {
    return condition.visitsAtLeast === 2
      ? 'jesteś w tym miejscu po raz drugi lub kolejny'
      : `jesteś w tym miejscu co najmniej ${condition.visitsAtLeast}. raz`;
  }
  if ('visited' in condition) return `odwiedzono ${labels.nodeLabel?.(condition.visited) ?? condition.visited}`;
  return '';
}

function wrap(condition, labels) {
  const text = describe(condition, labels);
  return 'all' in condition || 'any' in condition ? `(${text})` : text;
}
