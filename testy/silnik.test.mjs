// Testy silnika gry na prawdziwych danych „Vae Victis”: node --test testy/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Game, nodeLabel } from '../aplikacja/js/core/engine.js';
import { evaluate, describe } from '../aplikacja/js/core/conditions.js';
import { validateState } from '../aplikacja/js/core/state.js';

const load = (path) => JSON.parse(readFileSync(new URL(`../ksiazki/vae-victis/${path}`, import.meta.url), 'utf8'));
const content = load('tresc.json');
const mechanics = load('mechanika.json');
const manifest = load('ksiazka.json');
const NOW = new Date('2026-11-01T12:00:00Z');

function newGame(options = {}) {
  return Game.newGame({ content, mechanics, manifest, now: NOW, ...options });
}

// Ustawia grę w danym węźle (bez ruchu) — do testów konkretnych paragrafów.
function placeAt(game, nodeId, owned = []) {
  game.state.currentNode = nodeId;
  game.state.history.push(nodeId);
  game.state.visits[nodeId] = (game.state.visits[nodeId] ?? 0) + 1;
  game.state.modules.codewords.owned = [...owned];
  return game;
}

function linkTo(nodeId, target) {
  const link = content.nodes[nodeId].links.find((item) => item.to === target);
  assert.ok(link, `${nodeId} nie ma odnośnika do ${target}`);
  return link.id;
}

const option = (game, linkId) => game.options().find((item) => item.id === linkId);

test('warunki: operatory logiczne, Informacje i odwiedziny', () => {
  const ctx = { hasCodeword: (c) => ['1', '2'].includes(c), visitsOfCurrent: () => 2, visits: (id) => (id === 'p5' ? 1 : 0) };
  assert.equal(evaluate({ has: '1' }, ctx), true);
  assert.equal(evaluate({ notHas: '1' }, ctx), false);
  assert.equal(evaluate({ all: [{ has: '1' }, { has: '3' }] }, ctx), false);
  assert.equal(evaluate({ any: [{ has: '3' }, { has: '2' }] }, ctx), true);
  assert.equal(evaluate({ not: { has: '3' } }, ctx), true);
  assert.equal(evaluate({ visitsAtLeast: 2 }, ctx), true);
  assert.equal(evaluate({ visited: 'p5' }, ctx), true);
  assert.equal(evaluate(null, ctx), true);
  assert.equal(describe({ all: [{ has: '31' }, { has: '33' }] }), 'masz Informację #31 i masz Informację #33');
});

test('nowa gra zaczyna się od Wprowadzenia', () => {
  const game = newGame();
  assert.equal(game.nodeId, 'wprowadzenie');
  assert.deepEqual(game.state.history, ['wprowadzenie']);
  assert.equal(game.visits('wprowadzenie'), 1);
  assert.equal(game.canUndo, false);
  assert.deepEqual(validateState(game.state, content), []);
});

test('Wprowadzenie → Prolog → §1 i odnośniki §1', () => {
  const game = newGame();
  game.choose(linkTo('wprowadzenie', 'prolog'));
  game.choose(linkTo('prolog', 'p1'));
  assert.equal(game.nodeId, 'p1');
  assert.deepEqual(game.options().map((item) => item.to), ['p22', 'p15', 'p16', 'p6']);
  assert.deepEqual(game.state.history, ['wprowadzenie', 'prolog', 'p1']);
});

test('zdobycie Informacji przy wejściu i cofnięcie ruchu', () => {
  const source = content.order.find((id) => content.nodes[id].links.some((link) => link.to === 'p26'));
  const game = placeAt(newGame(), source);
  const notices = game.choose(linkTo(source, 'p26'));
  assert.ok(game.hasCodeword('4'));
  assert.deepEqual(notices, [{ type: 'gain', code: '4' }]);
  assert.equal(game.undo(), true);
  assert.equal(game.nodeId, source);
  assert.equal(game.hasCodeword('4'), false);
  assert.equal(game.visits('p26'), 0);
});

test('zdobycie Informacji przy wyborze linii dialogowej (§57)', () => {
  const game = placeAt(newGame(), 'p57');
  game.choose('p57-l1');
  assert.equal(game.nodeId, 'p54');
  assert.ok(game.hasCodeword('19'));
  assert.equal(game.hasCodeword('17'), false);
});

test('warunek Informacji (§91) i ciąg dalszy (§98)', () => {
  const without = placeAt(newGame(), 'p91');
  assert.equal(option(without, 'p91-l1').met, false);
  assert.equal(option(without, 'p91-l2').met, true);
  const withInfo = placeAt(newGame(), 'p91', ['18']);
  assert.equal(option(withInfo, 'p91-l1').met, true);
  assert.equal(option(withInfo, 'p91-l2').met, false);
  const p98 = placeAt(newGame(), 'p98');
  assert.equal(option(p98, linkTo('p98', 'p98-2')).met, true);
  p98.choose(linkTo('p98', 'p98-2'));
  assert.equal(p98.nodeId, 'p98-2');
});

test('ponowna wizyta (§9) i warunek złożony (§161)', () => {
  const game = placeAt(newGame(), 'p9');
  assert.equal(option(game, 'p9-l1').met, false);
  game.state.visits.p9 = 2;
  assert.equal(option(game, 'p9-l1').met, true);

  const none = placeAt(newGame(), 'p161');
  assert.equal(option(none, 'p161-l5').met, true);
  const with30 = placeAt(newGame(), 'p161', ['30']);
  assert.equal(option(with30, 'p161-l1').met, true);
  assert.equal(option(with30, 'p161-l5').met, false);
  const with11 = placeAt(newGame(), 'p161', ['11', '30']);
  assert.equal(option(with11, 'p161-l5').met, true);
  const with31and33 = placeAt(newGame(), 'p161', ['31', '33']);
  assert.equal(option(with31and33, 'p161-l4').met, true);
});

test('niejednoznaczne wskazówki (§170): przy jednej Informacji obie drogi spełniają warunek', () => {
  const one = placeAt(newGame(), 'p170', ['34']);
  assert.equal(one.ambiguous, true);
  assert.equal(option(one, 'p170-l1').met, true);
  assert.equal(option(one, 'p170-l2').met, true);
  const none = placeAt(newGame(), 'p170');
  assert.equal(option(none, 'p170-l1').met, true);
  assert.equal(option(none, 'p170-l2').met, false);
  const both = placeAt(newGame(), 'p170', ['34', '35']);
  assert.equal(option(both, 'p170-l1').met, false);
  assert.equal(option(both, 'p170-l2').met, true);
});

test('zakończenie: zapis odkrycia, cofnięcie nie kasuje odkrytych zakończeń', () => {
  const source = content.order.find((id) => content.nodes[id].links.some((link) => link.to === 'p122'));
  const game = placeAt(newGame(), source);
  const notices = game.choose(linkTo(source, 'p122'));
  assert.equal(game.state.status, 'finished');
  assert.deepEqual(game.state.endingsFound, ['p122']);
  assert.equal(notices.at(-1).title, 'Ea est natura hominum');
  game.undo();
  assert.equal(game.state.status, 'inProgress');
  assert.deepEqual(game.state.endingsFound, ['p122']);
});

test('„Nowa gra” zachowuje zakończenia; notatki wg wyboru gracza', () => {
  const first = newGame();
  first.state.endingsFound.push('p122');
  first.setNotes('moje notatki');
  const later = new Date('2026-11-08T09:30:00Z');
  const kept = newGame({ previous: first.state, keepNotes: true, now: later });
  // Bez numerowania rozgrywek — nowa gra ma własną datę rozpoczęcia (decyzja właściciela, D56).
  assert.equal('playthrough' in kept.state, false);
  assert.equal(kept.state.startedAt, later.toISOString());
  assert.deepEqual(kept.state.endingsFound, ['p122']);
  assert.equal(kept.state.notes, 'moje notatki');
  const cleared = newGame({ previous: first.state, keepNotes: false });
  assert.equal(cleared.state.notes, '');
  assert.equal(cleared.nodeId, 'wprowadzenie');
});

test('stan ze starszej wersji: numer podejścia (playthrough) usuwany przy wczytaniu', () => {
  const legacy = { ...newGame().state, playthrough: 8 };
  const game = new Game({ content, mechanics, manifest, state: legacy });
  assert.equal('playthrough' in game.state, false);
  assert.deepEqual(validateState(game.state, content), []);
});

test('tryb ręczny: bez automatycznych efektów i bez oceny warunków', () => {
  const game = placeAt(newGame({ mode: 'manual' }), 'p57');
  assert.equal(option(game, 'p57-l1').met, null);
  game.choose('p57-l1');
  assert.equal(game.hasCodeword('19'), false);
  game.setCodeword('19', true);
  assert.ok(game.hasCodeword('19'));
});

test('etykiety węzłów', () => {
  assert.equal(nodeLabel(content, 'p22'), '§22');
  assert.equal(nodeLabel(content, 'p91A'), '§91 A');
  assert.equal(nodeLabel(content, 'p98-2'), '§98 (ciąg dalszy)');
  assert.equal(nodeLabel(content, 'prolog'), 'Prolog');
});
