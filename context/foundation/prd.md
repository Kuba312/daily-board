---
project: "Daily Board"
version: 1
status: draft
created: 2026-05-23
updated: 2026-07-25
context_type: brownfield
product_type: web-app
target_scale:
  users: small
  qps: "# TODO: qps — see Open Questions"
  data_volume: "# TODO: data_volume — see Open Questions"
timeline_budget:
  delivery_weeks: 6
  hard_deadline: null
  after_hours_only: true
---

## Current System Overview

System purpose: Daily Board to aplikacja do planowania dnia i tygodnia, w ktorej uzytkownik organizuje planery oraz zadania lub wydarzenia i przeglada je w widoku boardu lub kalendarza.

Key architecture: Aplikacja jest podzielona na frontend i backend. Istnieje juz dzialajacy flow planowania oraz dwa warianty boardu: statyczny i dynamiczny.

Tech stack: Frontend: Angular. Backend: Java + Spring Boot. Baza danych: MySQL. Uwierzytelnianie email + haslo, tokeny JWT i wlasnosc danych per-user sa zaimplementowane. Funkcja AI pozostaje opcjonalnym, przyszlym rozszerzeniem i nie jest jeszcze dostepna.

Current user base: Aplikacja sluzy osobom planujacym w jednym miejscu prace, nauke i zycie prywatne. Obecny rdzen MVP ma model konta uzytkownika, dane per-user oraz pelny CRUD plannerow i elementow planu.

Core functionality:
- rejestracja, logowanie i wylogowanie,
- tworzenie planera,
- dodawanie zadan i wydarzen do planera,
- edycja i usuwanie plannerow oraz elementow planu,
- wyswietlanie boardu lub kalendarza,
- board statyczny,
- board dynamiczny ze zmieniajacymi sie tygodniami.

### Implementation Status Snapshot (2026-07-25)

- Core MVP implemented: auth, account-owned planner and duty data, planner/duty CRUD, static and dynamic board behavior, and ownership-boundary coverage.
- Preserved behavior: dynamic week switching remains part of the implemented manual planning flow.
- Optional/later: AI weekly proposal preview and explicit accept/reject flow. No AI integration or AI-triggered persistence exists in the current codebase.
- Delivery status is tracked in `context/foundation/roadmap.md`; this PRD remains the broader product and requirements foundation.

## Problem Statement & Motivation

Baseline pain at shaping time: Aplikacja wspierala samo planowanie, ale nie miala jeszcze logowania, przypisania danych do konkretnego uzytkownika, edycji i usuwania plannerow oraz elementow planu ani funkcji AI wspierajacej szkic tygodnia. Auth, ownership i CRUD zostaly od tego czasu zaimplementowane; AI pozostaje opcjonalne i niezrealizowane.

Why this change is needed now: Zmiana jest potrzebna, poniewaz projekt ma juz dzialajacy model planowania i widoki boardu, ale bez konta uzytkownika i pelnego zarzadzania danymi nie domyka glownego przeplywu korzystania z aplikacji. Funkcja AI ma wspierac glowne zalozenie produktu, czyli szybkie ulozenie realistycznego planu tygodnia bez rezygnacji z kontroli po stronie uzytkownika.

Baseline workaround and its cost: Przed wdrozeniem kont planery, zadania i wydarzenia nie byly osadzone w kontekscie konkretnego uzytkownika, przez co aplikacja nie wspierala bezpiecznego powrotu do swoich danych ani pelnego zarzadzania nimi. Ten problem zostal rozwiazany w rdzeniu MVP. Brak opcjonalnej funkcji AI nadal oznacza, ze pierwszy szkic planu uzytkownik uklada recznie.

## User & Persona

### Primary persona

Specjalista wiedzy, ktory planuje swoj tydzien, laczac prace, nauke i zycie prywatne.

Ma wiele roznych aktywnosci: zadania zawodowe, nauke, obowiazki domowe, sport, spotkania i prywatne plany. Jego glownym problemem jest to, ze trudno mu zobaczyc caly tydzien w jednym miejscu i ocenic, czy plan jest realistyczny. Daily Board ma pomoc tej osobie szybko stworzyc plan, zobaczyc rozklad zadan w czasie i latwo go poprawiac.

## Success Criteria

### Primary

- Uzytkownik loguje sie do aplikacji, widzi tylko swoje planery, wybiera istniejacy planner albo tworzy nowy, dodaje zadania i wydarzenia recznie albo uruchamia asystenta AI, przeglada propozycje planu, akceptuje albo odrzuca wynik, a po akceptacji widzi zapisane elementy na boardzie lub kalendarzu i moze dalej przelaczac tygodnie oraz edytowac lub usuwac planery i elementy planu.

### Secondary

- Uzytkownik przechodzi pelna petle planowania bez pomocy technicznej: loguje sie, tworzy albo wybiera planner, dodaje lub generuje zadania, akceptuje plan, widzi go na boardzie, a pozniej edytuje lub usuwa elementy.

### Guardrails

- Istniejacy widok boardu lub kalendarza oraz przelaczanie tygodni w dynamicznym boardzie nadal dzialaja poprawnie.
- AI nigdy nie zapisuje ani nie modyfikuje danych planera bez jawnej akceptacji uzytkownika.

## User Stories

### US-01: User plans a week with manual and AI-assisted flow

- **Given** a registered user who is logged into Daily Board
- **When** they choose an existing planner or create a new one, add tasks and events manually or ask AI for a weekly proposal, and then explicitly accept the proposal
- **Then** the accepted items are saved only to that user's selected planner and become visible on the board or calendar, where the user can still switch weeks and later edit or delete items

#### Acceptance Criteria

- AI proposal is visible before any persistence happens
- Rejected AI proposal does not modify planner data
- Accepted AI proposal saves items only into the selected planner
- Board or calendar shows only the logged-in user's data
- Dynamic week switching continues to work after accepted items are saved

## Scope of Change

- [new] Authentication for end users: register, log in, log out (email + password).
- [modified] Ownership model: planners, tasks, and events belong to the logged-in user; user can access only their own data.
- [new] Planner management: edit planner; delete planner with explicit confirmation and clear consequences for dependent tasks and events.
- [new] Item management: edit task/event; delete task/event with confirmation (or equally clear dismissal UX).
- [new] AI planning flow: user submits weekly intent to AI and receives a proposed weekly plan without automatic persistence.
- [new] AI acceptance: user explicitly accepts an AI proposal before any planner data is changed.
- [new] AI dismissal: user can dismiss/reject an AI proposal without changing planner data.
- [modified] Board experience: show only user-owned planner data; dynamic week switching continues to work with the new ownership model.
- [preserved] Existing planning flow (board/calendar) remains intact; dynamic week switching must not regress after ownership is introduced.

## Constraints & Compatibility

- Backward compatibility: Existing API contracts for planners and tasks/events should be preserved or extended compatibly to include user ownership.
- Data migration: Optional for MVP when current data is developer/test-only; becomes required only if existing real user data must be preserved after accounts/ownership are introduced.
- Preserved behavior: Creating planners, adding tasks/events, viewing board/calendar, and switching weeks in the dynamic board must remain intact.
- Manual planning: Must continue working without UX regression after user ownership is added.
- Relationship integrity: Extending the data model with user ownership must not break existing planner ↔ task/event relationships.
- UX feedback: Clear visible feedback after login, save, edit, delete, and AI-plan acceptance actions.
- Performance/stability: Existing board and dynamic week switching do not become slower or less stable than current behavior.
- Layout: Remains usable in a typical desktop browser layout (board/calendar is primary workspace).

## Business Logic Changes

Current rule: The system lets a user create planners, add tasks and events, and view them on a board or calendar in static or dynamic form.

Change: Planners and tasks/events operate in the context of the logged-in user (ownership), and AI may generate a proposed weekly plan, but planner data is saved only after the user explicitly accepts the proposal.

## Access Control Changes

Baseline model at shaping time: Brak dostepnego logowania dla uzytkownika w aplikacji. Brak rol dostepnych w UI.

Implemented change: Uwierzytelnianie email plus haslo oraz przypisanie plannerow, zadan i wydarzen do konkretnego uzytkownika sa zaimplementowane.

Roles: Jedna rola uzytkownika w MVP.

Preserved boundaries: Bez zaawansowanych uprawnien i bez wspoldzielenia plannerow miedzy uzytkownikami.

## Non-Goals

- No shared planners between users, because the MVP is focused on single-user ownership and control.
- No advanced roles or permission model, because one user role is sufficient for the first release.
- No Google Calendar integration, because the MVP should validate planning inside Daily Board first.
- No mobile app, because the primary workspace is a desktop board or calendar view.
- No push notifications, because planning and board visibility matter more than reminder infrastructure in this slice.
- No advanced productivity analytics, because the MVP focuses on planning and editing rather than retrospective measurement.
- No payments, because monetization is outside the scope of this change.
- No file import, because the MVP assumes planning starts directly inside the app.
- No very advanced planning algorithm, because AI should provide a sensible starting proposal rather than a fully optimized scheduler.
- No full project-management workflow, because Daily Board remains a planning app rather than a broad work-management system.

## Open Questions

1. **What target `qps` ballpark should we assume for `target_scale`?** — Owner: user.
2. **What target `data_volume` ballpark should we assume for `target_scale`?** — Owner: user.
3. **Is preserving existing data required for any real users, or is all current data developer/test-only (so migration can be skipped for MVP)?** — Owner: user. Block: yes.
