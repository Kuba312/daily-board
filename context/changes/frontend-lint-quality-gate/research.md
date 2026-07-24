---
date: 2026-07-24T20:23:33+02:00
researcher: Codex
git_commit: 76fbb0db06c9ba33cd61f52303091391eea5b023
branch: DB-61
repository: daily-board
topic: "Jak bezpiecznie wyzerować błędy linta, obsłużyć generowane src/api/** i dodać lint jako wymagany gate w CI?"
tags: [research, codebase, angular, eslint, generated-api, github-actions]
status: complete
last_updated: 2026-07-24
last_updated_by: Codex
---

# Research: Frontend lint baseline and required CI gate

**Date**: 2026-07-24T20:23:33+02:00\
**Researcher**: Codex\
**Git Commit**: 76fbb0db06c9ba33cd61f52303091391eea5b023\
**Branch**: DB-61\
**Repository**: daily-board

## Research Question

Jak bezpiecznie wyzerować błędy linta, obsłużyć generowane `src/api/**`
i dodać lint jako wymagany gate w CI?

## Summary

Aktualne `npm run lint` raportuje 84 problemy: 70 błędów i 14 ostrzeżeń.
Generowane `frontend/src/api/**` odpowiada za dokładnie 30 błędów i 10
ostrzeżeń, wszystkie pochodzące z nagłówków dodawanych przez
`ng-openapi-gen`. Kod wygenerowany sam deklaruje `DO NOT EDIT` i wyłącza
ESLint dla całych plików, więc ręczne poprawianie go lub utrzymywanie
własnych kopii szablonów nie daje proporcjonalnego sygnału jakości.

Najbezpieczniejsza ścieżka:

1. Dodać globalne `ignores: ['src/api/**']` jako pierwszy, samodzielny obiekt
   flat config w `frontend/eslint.config.js`. Pozostawić szerokie wzorce
   `src/**/*.ts` i `src/**/*.html` w Angular CLI.
2. Uruchomić autofix dopiero po ustanowieniu granicy dla kodu generowanego.
   Usunie on 26 błędów w kodzie własnym bez zmiany zachowania.
3. Ręcznie naprawić pozostałe 14 błędów: osiem typów zwrotnych helperów
   testowych, trzy dynamiczne klucze fixture'ów oraz trzy deklaracje
   Angular output. Zmiany outputów muszą objąć deklaracje, emisje i wszystkie
   template bindings w jednym kroku.
4. Usunąć cztery obecne ostrzeżenia `typedef`, ale nie wprowadzać
   `--max-warnings=0`; obecna polityka repozytorium traktuje ostrzeżenia jako
   widoczne i nieblokujące.
5. Po zielonym lint/test/build dodać `npm run lint` bezpośrednio po
   `npm ci` w istniejącym frontendowym jobie CI.

Ignorowanie `src/api/**` przez ESLint nie wyłącza kompilacji używanego klienta:
Angular build nadal kompiluje importowane modele, funkcje i serwisy.
Regenerowanie klienta i wykrywanie backend/frontend contract drift pozostaje
osobnym gate'em przewidzianym w planie testów.

## Detailed Findings

### Generated API ownership and lint boundary

- Skrypt generatora i jego konfiguracja jednoznacznie wskazują
  `src/api/` jako output
  ([`package.json:12`](https://github.com/Kuba312/daily-board/blob/76fbb0db06c9ba33cd61f52303091391eea5b023/frontend/package.json#L12),
  [`openapi-config.json:2-5`](https://github.com/Kuba312/daily-board/blob/76fbb0db06c9ba33cd61f52303091391eea5b023/frontend/openapi-config.json#L2-L5)).
- Wszystkie 30 plików TypeScript w tym katalogu zaczyna się od
  `tslint:disable`, `eslint-disable` i `Code generated ... DO NOT EDIT`
  (przykład:
  [`api-configuration.ts:1-3`](https://github.com/Kuba312/daily-board/blob/76fbb0db06c9ba33cd61f52303091391eea5b023/frontend/src/api/api-configuration.ts#L1-L3)).
- Każdy z 30 plików generuje błąd `ban-tslint-comment`; 10 plików generuje
  dodatkowo ostrzeżenie o nieużywanym `eslint-disable`. Nie znaleziono błędów
  pochodzących z treści klienta, ponieważ generator wyłącza dla niej ESLint.
- `ng-openapi-gen` domyślnie nadpisuje zmienione pliki i usuwa stare pliki
  w katalogu output. Ręczne poprawki oraz post-generation `eslint --fix`
  zostałyby utracone przy kolejnej generacji.
- Generator wspiera własne Handlebars templates, lecz nagłówek jest powielony
  w wielu szablonach. Utrzymywanie wersjozależnych kopii tylko po to, aby
  zmienić komentarze, zwiększa koszt aktualizacji bez zwiększenia ochrony
  kodu produktu.
- Wzorzec Angular CLI obejmuje dziś całe `src/**/*.ts` i `src/**/*.html`
  ([`angular.json:95-99`](https://github.com/Kuba312/daily-board/blob/76fbb0db06c9ba33cd61f52303091391eea5b023/frontend/angular.json#L95-L99)).
  Globalny ignore w flat config jest lepszą granicą własności niż negatywny
  glob w jednym runnerze, bo działa niezależnie od sposobu wywołania ESLint.

Opcje odrzucone:

- ręczna edycja lub formatowanie wygenerowanych plików — nietrwałe;
- wyjątki tylko dla dwóch reguł nagłówkowych — sugerują fałszywe pokrycie,
  chociaż treść pliku nadal ma `eslint-disable`;
- własne szablony generatora — duży koszt utrzymania dla zerowego sygnału
  produktowego;
- pełne lintowanie klienta — wymaga usunięcia generatorowego disable i
  dopasowywania zewnętrznego outputu do lokalnych reguł po każdej aktualizacji.

### First-party lint baseline

Po pominięciu `src/api/**` pozostają 44 problemy: 40 błędów i 4 ostrzeżenia.
Z tych błędów 26 jest automatycznie naprawialnych:

- 25 brakujących trailing commas w dekoratorach komponentów;
- mapowany index signature w
  [`form-errors.consts.ts:41`](https://github.com/Kuba312/daily-board/blob/76fbb0db06c9ba33cd61f52303091391eea5b023/frontend/src/app/core/form-errors.consts.ts#L41),
  który ESLint może bezpiecznie zapisać jako `Record<ValidatorNames, string>`.

Pozostałe ręczne rodziny:

- osiem helperów tworzących efekty bez jawnego typu zwrotnego:
  [`duty.effects.spec.ts:320-364`](https://github.com/Kuba312/daily-board/blob/76fbb0db06c9ba33cd61f52303091391eea5b023/frontend/src/app/shared-store/duty-store/duty.effects.spec.ts#L320-L364)
  i
  [`planner.effects.spec.ts:180-211`](https://github.com/Kuba312/daily-board/blob/76fbb0db06c9ba33cd61f52303091391eea5b023/frontend/src/app/shared-store/planner-store/planner.effects.spec.ts#L180-L211).
  `ReturnType<typeof factory>` zachowuje dokładny kontrakt funkcji produkcyjnej
  bez duplikowania złożonego typu Observable;
- trzy dynamiczne klucze `'planner-a'` w oczekiwaniach reducera
  ([`duty.reducer.spec.ts:59-64`](https://github.com/Kuba312/daily-board/blob/76fbb0db06c9ba33cd61f52303091391eea5b023/frontend/src/app/shared-store/duty-store/duty.reducer.spec.ts#L59-L64)).
  Wspólna stała `plannerId` i computed property `{ [plannerId]: ... }`
  reprezentują prawdziwy runtime key i nie osłabiają naming convention;
- trzy deklaracje outputów łamiące `no-output-on-prefix`. To dwie połączone
  ścieżki zdarzeń:
  - `onChipRemoved`:
    [`chip-tag.component.ts:13`](https://github.com/Kuba312/daily-board/blob/76fbb0db06c9ba33cd61f52303091391eea5b023/frontend/src/app/shared/components/chip-tag/chip-tag.component.ts#L13),
    emisja w template i binding kontenera;
  - `onPlannerAnimationEnd`: output kafelków
    ([`planner-board-tile-duties.component.ts:37`](https://github.com/Kuba312/daily-board/blob/76fbb0db06c9ba33cd61f52303091391eea5b023/frontend/src/app/shared/components/planner-board/planner-board-tile-duties/planner-board-tile-duties.component.ts#L37))
    oraz reemitujący output boardu
    ([`planner-board.component.ts:76-80`](https://github.com/Kuba312/daily-board/blob/76fbb0db06c9ba33cd61f52303091391eea5b023/frontend/src/app/shared/components/planner-board/planner-board.component.ts#L76-L80)).

Zmiana nazw outputów jest jedynym cleanupem o średnim ryzyku. Zalecane nazwy
to `chipRemoved` i `plannerAnimationEnd`. Nazwę metody obsługi zdarzenia
`onPlannerAnimationEnd()` w komponencie widoku można zachować, ponieważ reguła
dotyczy publicznych output bindings, a nie handlerów.

Cztery ostrzeżenia dotyczą inferowanych pól w
[`planner-form.component.ts:57-66`](https://github.com/Kuba312/daily-board/blob/76fbb0db06c9ba33cd61f52303091391eea5b023/frontend/src/app/views/planner-form/planner-form.component.ts#L57-L66).
Można dodać jawne typy `string`, odpowiedni typ signal oraz `boolean`, aby
osiągnąć zerowy bieżący output linta. Nie należy jednak zmieniać globalnej
polityki warnings w tej zmianie.

### Safe implementation order

1. Dodać globalny ignore `src/api/**`.
2. Uruchomić pełny lint i potwierdzić baseline `40 errors / 4 warnings`.
3. Uruchomić autofix na kodzie własnym i przejrzeć diff; oczekiwane jest
   usunięcie 25 błędów comma-dangle oraz jednego index-signature.
4. Dodać typy zwrotne ośmiu helperów testowych i computed keys w trzech
   oczekiwaniach reducera.
5. Atomowo zmienić oba łańcuchy outputów we wszystkich deklaracjach, emisjach
   i template bindings.
6. Dodać cztery jawne typy pól, pozostawiając `typedef` jako warning.
7. Zweryfikować kolejno lint, testy frontendowe i produkcyjny build.
8. Dopiero przy zielonym baseline dodać lint do CI.

Ta kolejność izoluje mechaniczne poprawki od zmian kontraktów template i
ułatwia review. Nie wymaga refaktoryzacji logiki board/week switching.

### Required CI gate

Istniejący workflow ma wspólny frontendowy job z Node 22, cache npm i
`frontend/` jako working directory
([`.github/workflows/ci.yml:15-39`](https://github.com/Kuba312/daily-board/blob/76fbb0db06c9ba33cd61f52303091391eea5b023/.github/workflows/ci.yml#L15-L39)).
Minimalna integracja to jeden krok:

```yaml
- name: Run frontend lint
  run: npm run lint
```

Krok powinien znaleźć się bezpośrednio po `npm ci --legacy-peer-deps`, przed
testami i buildem. Jest to fail-fast bez drugiej instalacji zależności.

Nie należy dodawać `--max-warnings=0`. Reguła `typedef` jest świadomie
ustawiona na `warn`
([`eslint.config.js:218-230`](https://github.com/Kuba312/daily-board/blob/76fbb0db06c9ba33cd61f52303091391eea5b023/frontend/eslint.config.js#L218-L230)),
a scoped post-edit hook blokuje tylko niezerowy exit code
([`post-edit-validation.py:98-105`](https://github.com/Kuba312/daily-board/blob/76fbb0db06c9ba33cd61f52303091391eea5b023/.codex/hooks/post-edit-validation.py#L98-L105)).
Plain `npm run lint` zachowuje parytet lokalny/CI: errors blokują, warnings są
widoczne, ale nieblokujące.

Hook nie wymaga zmiany. Nadal daje szybki lint plików edytowanych, natomiast CI
i końcowa weryfikacja uruchamiają pełny scope.

### Documentation scope

Sekcja CI w `AGENTS.md` jest nieaktualna: nadal mówi o frontend-only workflow
i braku backend CI
([`AGENTS.md:27-29`](https://github.com/Kuba312/daily-board/blob/76fbb0db06c9ba33cd61f52303091391eea5b023/AGENTS.md#L27-L29)).
Aktualizacja tej sekcji należy do zmiany, ponieważ opisuje właśnie modyfikowany
quality gate.

Nie należy przy okazji edytować:

- `context/archive/**` — archiwum jest immutable;
- `health-check*.md` — są datowanymi snapshotami oceny;
- zamrożonych sekcji §1-§5 `test-plan.md` — sam lint nie kończy Phase 4,
  która obejmuje też e2e i contract smoke.

Nieaktualny status Phase 1 i historyczna wzmianka o backend CI gap w
`test-plan.md` wymagają osobnego uzgodnienia przez `/10x-test-plan`.

## Code References

- `frontend/eslint.config.js:6-15` - flat config entry point and TypeScript scope
- `frontend/eslint.config.js:98-107` - trailing comma policy
- `frontend/eslint.config.js:119-124` - explicit return type policy
- `frontend/eslint.config.js:218-230` - nonblocking typedef warning policy
- `frontend/angular.json:95-99` - Angular lint target scope
- `frontend/openapi-config.json:2-5` - generated API input/output ownership
- `frontend/package.json:10-12` - canonical lint and OpenAPI generation commands
- `frontend/src/api/api-configuration.ts:1-3` - generated-file ownership header
- `frontend/src/app/shared-store/duty-store/duty.effects.spec.ts:320-364` - five missing helper return types
- `frontend/src/app/shared-store/planner-store/planner.effects.spec.ts:180-211` - three missing helper return types
- `frontend/src/app/shared-store/duty-store/duty.reducer.spec.ts:59-64` - representative dynamic fixture key
- `frontend/src/app/shared/components/chip-tag/chip-tag.component.ts:13` - prefixed output declaration
- `frontend/src/app/shared/components/planner-board/planner-board.component.ts:76-80` - re-emitted planner animation output
- `.github/workflows/ci.yml:15-39` - current frontend CI job
- `.codex/hooks/post-edit-validation.py:88-105` - scoped local lint feedback
- `AGENTS.md:27-29` - stale CI guidance

## Architecture Insights

Generated source and authored source need different quality contracts.
Generated output should be checked through deterministic regeneration,
compilation and contract drift checks, not forced through project-specific
style rules. Authored Angular code should remain under the strict ESLint
configuration and fail CI on errors.

The existing monorepo CI structure already provides the right execution
boundary: frontend and backend are independent jobs, while lint/test/build
share one frontend dependency installation. Lint is therefore a step, not a
new job.

The post-edit hook and CI serve different feedback horizons. Scoped lint is a
fast local signal; full lint in CI prevents untouched baseline regressions.
Neither substitutes for Angular test/build validation, especially around
template output renames.

## Historical Context (from prior changes)

- `context/archive/2026-07-24-github-actions-ci/research.md` recorded the same
  `70 errors / 14 warnings` baseline and deferred lint because adding a
  permanently red gate would provide no regression signal.
- `context/archive/2026-07-24-github-actions-ci/plan.md` explicitly excluded
  lint cleanup from the CI bootstrap, making this change the intended
  follow-up.
- `context/changes/codex-hooks/change.md` established scoped lint after
  frontend edits and documented that full lint was deferred until the
  baseline was clean.
- Git history shows `src/api/**` was introduced with DB-21 and has been
  repeatedly regenerated as the backend contract changed, confirming that
  manual formatting would not be durable.

## Related Research

- `context/archive/2026-07-24-github-actions-ci/research.md`
- `context/archive/2026-06-01-testing-ownership-boundary-api-coverage/research.md`

## Open Questions

- Contract drift is still not detected because CI does not start the backend
  or regenerate the client. Keep this for the dedicated Phase 4 gate rather
  than expanding the lint change.
- `test-plan.md` contains stale rollout status and backend-CI wording. Reconcile
  it through `/10x-test-plan`, not as a drive-by lint edit.
- If the team later decides warnings must block, first promote the chosen
  warning rules to errors in `eslint.config.js`; do not hide a stricter CI-only
  policy behind `--max-warnings=0`.
