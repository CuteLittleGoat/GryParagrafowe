// Silnik gry: nawigacja po węzłach, warunki i efekty mechaniki, odwiedziny, zakończenia, „Cofnij”.
// Nie zależy od DOM — działa w przeglądarce i w testach Node (node --test).
// Zasada neutralności: silnik niczego nie blokuje na stałe; w trybie automatycznym oznacza tylko,
// które drogi spełniają warunki zapisane w książce, a decyzja zawsze należy do gracza.

import { evaluate } from './conditions.js';
import { createState, sortCodes } from './state.js';

export const UNDO_LIMIT = 1000;

export class Game {
  constructor({ content, mechanics = null, manifest, state, mode = 'auto' }) {
    this.content = content;
    this.mechanics = mechanics;
    this.manifest = manifest;
    this.state = state;
    this.mode = mechanics ? mode : 'manual';
    this.notices = [];
  }

  // Nowa rozgrywka; poprzedni stan (jeśli jest) przekazuje odkryte zakończenia, numer podejścia i —
  // na życzenie gracza — notatki.
  static newGame({ content, mechanics, manifest, previous = null, keepNotes = false, mode = 'auto', now }) {
    const state = createState({ manifest, mechanics, previous, keepNotes, now });
    const game = new Game({ content, mechanics, manifest, state, mode });
    game.notices = game.enterNode(state.currentNode, { added: [], removed: [] });
    return game;
  }

  get nodeId() {
    return this.state.currentNode;
  }

  get node() {
    return this.content.nodes[this.state.currentNode];
  }

  rulesFor(nodeId) {
    return this.mechanics?.nodes?.[nodeId] ?? {};
  }

  hasCodeword(code) {
    return this.state.modules.codewords?.owned.includes(code) ?? false;
  }

  visits(nodeId) {
    return this.state.visits[nodeId] ?? 0;
  }

  conditionContext() {
    return {
      hasCodeword: (code) => this.hasCodeword(code),
      visitsOfCurrent: () => this.visits(this.nodeId),
      visits: (nodeId) => this.visits(nodeId),
    };
  }

  // Odnośniki wewnętrzne bieżącego węzła z oceną warunków (tylko w trybie automatycznym).
  options() {
    const rules = this.rulesFor(this.nodeId).links ?? {};
    return this.node.links
      .filter((link) => link.to)
      .map((link) => {
        const rule = rules[link.id] ?? {};
        const condition = this.mode === 'auto' ? rule.if ?? null : null;
        const met = condition ? evaluate(condition, this.conditionContext()) : null;
        return { id: link.id, to: link.to, condition, met, effects: this.mode === 'auto' ? rule.onChoose ?? [] : [] };
      });
  }

  get ambiguous() {
    return Boolean(this.rulesFor(this.nodeId).ambiguous);
  }

  // Wybór odnośnika: efekty wyboru, wejście do węzła docelowego, wpis do listy „Cofnij”.
  choose(linkId) {
    const link = this.node.links.find((item) => item.id === linkId && item.to);
    if (!link) throw new Error(`Nieznany odnośnik ${linkId} w węźle ${this.nodeId}`);
    const entry = {
      from: this.nodeId,
      historyLength: this.state.history.length,
      status: this.state.status,
      added: [],
      removed: [],
    };
    const notices = [];
    if (this.mode === 'auto') {
      notices.push(...this.applyEffects(this.rulesFor(this.nodeId).links?.[linkId]?.onChoose ?? [], entry));
    }
    notices.push(...this.enterNode(link.to, entry));
    this.state.undo.push(entry);
    if (this.state.undo.length > UNDO_LIMIT) this.state.undo.splice(0, this.state.undo.length - UNDO_LIMIT);
    this.notices = notices;
    return notices;
  }

  enterNode(nodeId, entry) {
    const node = this.content.nodes[nodeId];
    if (!node) throw new Error(`Nieznany węzeł ${nodeId}`);
    const notices = [];
    this.state.currentNode = nodeId;
    this.state.history.push(nodeId);
    this.state.visits[nodeId] = this.visits(nodeId) + 1;
    entry.entered = nodeId;
    if (this.mode === 'auto') notices.push(...this.applyEffects(this.rulesFor(nodeId).onEnter ?? [], entry));
    if (node.ending) {
      this.state.status = 'finished';
      if (!this.state.endingsFound.includes(nodeId)) {
        this.state.endingsFound.push(nodeId);
        notices.push({ type: 'ending', nodeId, title: node.ending.title, first: true });
      } else {
        notices.push({ type: 'ending', nodeId, title: node.ending.title, first: false });
      }
    } else {
      this.state.status = 'inProgress';
    }
    return notices;
  }

  applyEffects(effects, entry) {
    const notices = [];
    const codewords = this.state.modules.codewords;
    for (const effect of effects) {
      if ('gain' in effect && codewords && !this.hasCodeword(effect.gain)) {
        codewords.owned = sortCodes([...codewords.owned, effect.gain]);
        entry.added.push(effect.gain);
        notices.push({ type: 'gain', code: effect.gain });
      } else if ('lose' in effect && codewords && this.hasCodeword(effect.lose)) {
        codewords.owned = codewords.owned.filter((code) => code !== effect.lose);
        entry.removed.push(effect.lose);
        notices.push({ type: 'lose', code: effect.lose });
      }
    }
    return notices;
  }

  get canUndo() {
    return this.state.undo.length > 0;
  }

  // Cofa ostatni ruch: miejsce, Informacje zdobyte/utracone w tym ruchu, odwiedziny, historię.
  // Odkryte zakończenia i notatki zostają.
  undo() {
    const entry = this.state.undo.pop();
    if (!entry) return false;
    const codewords = this.state.modules.codewords;
    if (codewords) {
      codewords.owned = sortCodes(codewords.owned.filter((code) => !entry.added.includes(code)));
      for (const code of entry.removed) if (!codewords.owned.includes(code)) codewords.owned.push(code);
      codewords.owned = sortCodes(codewords.owned);
    }
    if (entry.entered) {
      const count = this.visits(entry.entered) - 1;
      if (count > 0) this.state.visits[entry.entered] = count;
      else delete this.state.visits[entry.entered];
    }
    this.state.history.length = entry.historyLength;
    this.state.currentNode = entry.from;
    this.state.status = entry.status;
    this.notices = [];
    return true;
  }

  // Ręczna zmiana karty (jak na papierze) — nie trafia na listę „Cofnij”.
  setCodeword(code, owned) {
    const codewords = this.state.modules.codewords;
    if (!codewords) return;
    const has = codewords.owned.includes(code);
    if (owned && !has) codewords.owned = sortCodes([...codewords.owned, code]);
    if (!owned && has) codewords.owned = codewords.owned.filter((item) => item !== code);
  }

  setNotes(text) {
    this.state.notes = text;
  }
}

// Etykieta węzła do przycisków i historii (tekst aplikacji), np. „§22”, „§91 A”, „§98 (ciąg dalszy)”.
export function nodeLabel(content, nodeId) {
  const node = content.nodes[nodeId];
  if (!node) return nodeId;
  if (node.kind === 'paragraph') return `§${node.label}`;
  if (node.kind === 'part') return `§${content.nodes[node.parent]?.label ?? '?'} ${node.label}`;
  if (node.kind === 'continuation') return `§${content.nodes[node.parent]?.label ?? '?'} (ciąg dalszy)`;
  const first = node.blocks.find((block) => block.inline);
  const text = first ? first.inline.map((item) => item.text ?? '').join('').trim() : '';
  return text || nodeId;
}

// Etykieta z samego identyfikatora węzła (bez wczytywania treści) — np. na ekranie głównym.
// Dla stron wstępnych zwraca null.
export function nodeIdLabel(nodeId) {
  let match = /^p(\d+)$/.exec(nodeId);
  if (match) return `§${match[1]}`;
  match = /^p(\d+)([A-Z])$/.exec(nodeId);
  if (match) return `§${match[1]} ${match[2]}`;
  match = /^p(\d+)-\d+$/.exec(nodeId);
  if (match) return `§${match[1]} (ciąg dalszy)`;
  return null;
}
