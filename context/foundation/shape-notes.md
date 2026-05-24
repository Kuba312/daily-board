---
project: "Daily Board"
context_type: brownfield
created: 2026-05-23
updated: 2026-05-23
product_type: web-app
target_scale:
  users: small
timeline_budget:
  delivery_weeks: 6
  hard_deadline: null
  after_hours_only: true
checkpoint:
  current_phase: 8
  phases_completed: [1, 2, 3, 4, 5, 6, 7]
  gray_areas_resolved:
    - topic: "context type"
      decision: "brownfield"
    - topic: "primary persona"
      decision: "specjalista wiedzy planujacy tydzien laczacy prace, nauke i zycie prywatne"
    - topic: "load-bearing preserved behavior"
      decision: "board/kalendarz, przelaczanie tygodni, tworzenie plannerow, dodawanie zadan i wydarzen, relacja uzytkownik-planner-elementy, prostota recznego planowania, AI tylko za zgoda uzytkownika"
    - topic: "auth strategy"
      decision: "email plus haslo"
    - topic: "roles"
      decision: "jedna rola uzytkownika bez zaawansowanych uprawnien i bez wspoldzielenia plannerow w MVP"
    - topic: "timeline decision"
      decision: "commit to 6-week after-hours delivery"
    - topic: "preserved data"
      decision: "istniejace dane powinny pozostac dostepne, jesli reprezentuja realne dane uzytkownika; migracja danych developerskich lub testowych nie jest wymagana w MVP"
    - topic: "business logic delta"
      decision: "existing planning flow is preserved, user ownership is added, and AI proposals persist only after explicit acceptance"
    - topic: "product type"
      decision: "web app; no product-type change"
    - topic: "target user scale"
      decision: "small"
  frs_drafted: 17
  quality_check_status: accepted
---

## Current System Overview

System purpose: Daily Board to aplikacja do planowania dnia i tygodnia, w ktorej uzytkownik organizuje planery oraz zadania lub wydarzenia i przeglada je w widoku boardu lub kalendarza.

Key architecture: Aplikacja jest podzielona na frontend i backend. Istnieje juz dzialajacy flow planowania oraz dwa warianty boardu: statyczny i dynamiczny.

Tech stack: Frontend: Angular. Backend: Java + Spring Boot. Baza danych: MySQL. Auth nie jest jeszcze dostepny dla uzytkownika. Funkcja AI jest planowana, ale nie jest jeszcze dostepna.

Current user base: Docelowo aplikacja sluzy osobom planujacym w jednym miejscu prace, nauke i zycie prywatne. W obecnym stanie projekt ma juz zaimplementowane podstawowe funkcje planowania, ale bez modelu konta koncowego uzytkownika.

Core functionality:
- tworzenie planera,
- dodawanie zadan i wydarzen do planera,
- wyswietlanie boardu lub kalendarza,
- board statyczny,
- board dynamiczny ze zmieniajacymi sie tygodniami.

## Problem Statement & Motivation

The specific pain or gap: Obecna aplikacja wspiera samo planowanie, ale nie ma jeszcze logowania, przypisania danych do konkretnego uzytkownika, edycji i usuwania plannerow oraz elementow planu, ani funkcji AI wspierajacej szkic tygodnia.

Why this change is needed now: Zmiana jest potrzebna, poniewaz projekt ma juz dzialajacy model planowania i widoki boardu, ale bez konta uzytkownika i pelnego zarzadzania danymi nie domyka glownego przeplywu korzystania z aplikacji. Funkcja AI ma wspierac glowne zalozenie produktu, czyli szybkie ulozenie realistycznego planu tygodnia bez rezygnacji z kontroli po stronie uzytkownika.

Current workaround and its cost: Dzis planery, zadania i wydarzenia nie sa jeszcze osadzone w kontekscie konkretnego uzytkownika, przez co aplikacja nie wspiera bezpiecznego powrotu do swoich danych ani pelnego zarzadzania nimi. Brak AI oznacza tez, ze pierwszy szkic planu uzytkownik musi ukladac calkowicie recznie.

Why this is non-trivial: Projekt ma juz istniejacy model planowania oraz dzialajace widoki boardu, wiec nowe funkcje trzeba dodac bez zepsucia obecnego flow. Szczegolnie wrazliwy jest dynamiczny board, bo zalezy od poprawnego przypisania zadan i wydarzen do tygodni. Dodanie logowania zmienia tez model danych z globalnego na per-user, a AI nie moze samodzielnie modyfikowac planu bez swiadomej decyzji uzytkownika.

## User & Persona

### Primary persona

Specjalista wiedzy, ktory planuje swoj tydzien, laczac prace, nauke i zycie prywatne.

Ma wiele roznych aktywnosci: zadania zawodowe, nauke, obowiazki domowe, sport, spotkania i prywatne plany. Jego glownym problemem jest to, ze trudno mu zobaczyc caly tydzien w jednym miejscu i ocenic, czy plan jest realistyczny. Daily Board ma pomoc tej osobie szybko stworzyc plan, zobaczyc rozklad zadan w czasie i latwo go poprawiac.

## Access Control Changes

Current model: Brak dostepnego logowania dla uzytkownika w aplikacji. Brak rol dostepnych w UI.

Planned change: Dodac uwierzytelnianie email plus haslo oraz przypisac planery, zadania i wydarzenia do konkretnego uzytkownika.

Roles: Jedna rola uzytkownika w MVP.

Preserved boundaries: Bez zaawansowanych uprawnien i bez wspoldzielenia plannerow miedzy uzytkownikami.

## Success Criteria

### Primary

- Uzytkownik loguje sie do aplikacji, widzi tylko swoje planery, wybiera istniejacy planner albo tworzy nowy, dodaje zadania i wydarzenia recznie albo uruchamia asystenta AI, przeglada propozycje planu, akceptuje albo odrzuca wynik, a po akceptacji widzi zapisane elementy na boardzie lub kalendarzu i moze dalej przelaczac tygodnie oraz edytowac lub usuwac planery i elementy planu.

### Secondary

- Uzytkownik przechodzi pelna petle planowania bez pomocy technicznej: loguje sie, tworzy albo wybiera planner, dodaje lub generuje zadania, akceptuje plan, widzi go na boardzie, a pozniej edytuje lub usuwa elementy.

### Guardrails

- Istniejacy widok boardu lub kalendarza oraz przelaczanie tygodni w dynamicznym boardzie nadal dzialaja poprawnie.
- AI nigdy nie zapisuje ani nie modyfikuje danych planera bez jawnej akceptacji uzytkownika.

## Timeline acknowledgment

Acknowledged on 2026-05-23: 6-week MVP requires sustained dedication; user accepted.

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

### Authentication

- FR-001: User can register an account with email and password. Priority: must-have. Change: new
  > Socrates: Counter-argument considered: "MVP could avoid separate registration by
  > using a preseeded user or manual account creation." Resolution: kept; registration
  > is required by project scope and is the basis for ownership of data.
- FR-002: User can log in and log out with email and password. Priority: must-have. Change: new
  > Socrates: Counter-argument considered: "logout adds little value in a single-device
  > first slice." Resolution: kept; login is load-bearing for user data and logout
  > should exist even if the first implementation is simple.
- FR-003: User can access only their own planners, tasks, and events after logging in. Priority: must-have. Change: modified
  > Socrates: Counter-argument considered: "data isolation may be mostly technical and
  > not visible to the user." Resolution: kept; user-visible ownership is core product
  > value because the user must see only their own planners.

### Planners

- FR-004: User can choose an existing planner within their own account context. Priority: must-have. Change: modified
  > Socrates: Counter-argument considered: "choosing an existing planner and creating a
  > new one are distinct behaviors." Resolution: revised; split planner selection from
  > planner creation.
- FR-005: User can create a new planner within their own account context. Priority: must-have. Change: modified
  > Socrates: Counter-argument considered: "planner creation was already grouped with
  > selection and hid different risks." Resolution: revised; creating a planner remains
  > required but is captured separately from selection.
- FR-006: User can edit their own planner. Priority: must-have. Change: new
  > Socrates: Counter-argument considered: "editing and deleting a planner carry
  > different risks." Resolution: revised; planner edit remains in MVP as its own
  > capability.
- FR-007: User can delete their own planner with explicit confirmation and clear consequences for dependent tasks and events. Priority: must-have. Change: new
  > Socrates: Counter-argument considered: "planner delete can become a landmine if the
  > effect on dependent data is unclear." Resolution: revised; keep delete, but only
  > with confirmation and explicit behavior for child items.

### Tasks And Events

- FR-008: User can add a task or event manually only within a planner that belongs to the logged-in user. Priority: must-have. Change: modified
  > Socrates: Counter-argument considered: "manual add already exists, so the real
  > change is ownership rather than a new capability." Resolution: revised; the FR now
  > makes the ownership delta explicit.
- FR-009: User can edit a task or event in their own planner. Priority: must-have. Change: new
  > Socrates: Counter-argument considered: "edit and delete should not be bundled
  > because they have different UX and risk." Resolution: revised; edit remains a
  > separate capability.
- FR-010: User can delete a task or event in their own planner with confirmation or equally clear dismissal UX. Priority: must-have. Change: new
  > Socrates: Counter-argument considered: "delete needs stronger guardrails than edit."
  > Resolution: revised; keep delete with explicit protective UX.

### Board Experience

- FR-011: User can view only their own planner data on the existing board or calendar. Priority: must-have. Change: modified
  > Socrates: Counter-argument considered: "board filtering and dynamic week switching
  > are separate risks." Resolution: revised; split data visibility from week
  > navigation.
- FR-012: User can switch weeks in the dynamic board while viewing user-owned planner data. Priority: must-have. Change: modified
  > Socrates: Counter-argument considered: "week switching may fail independently of
  > data visibility once ownership is introduced." Resolution: revised; keep as a
  > separate FR because it is load-bearing.
- FR-013: User can continue using the existing board or calendar flow and dynamic week switching without regression after the ownership model changes. Priority: must-have. Change: preserved
  > Socrates: Counter-argument considered: "this reads more like a guardrail than a new
  > capability." Resolution: kept as a defensive FR because the board is the most
  > load-bearing area of the system.

### AI Planning

- FR-014: User can submit a weekly intent to AI and receive a proposed weekly plan without automatic persistence. Priority: must-have. Change: new
  > Socrates: Counter-argument considered: "AI proposal may be too large for MVP if
  > quality requires multiple iterations." Resolution: kept; AI without auto-save is a
  > core part of the project value.
- FR-015: User can explicitly accept an AI proposal before any planner data is changed. Priority: must-have. Change: new
  > Socrates: Counter-argument considered: "accept and reject have different UX
  > requirements, and explicit acceptance is the load-bearing part." Resolution:
  > revised; explicit acceptance is captured separately.
- FR-016: User can dismiss or reject an AI proposal without changing planner data. Priority: must-have. Change: new
  > Socrates: Counter-argument considered: "rejection may be explicit or implicit by
  > closing preview." Resolution: revised; the capability is to leave data unchanged
  > when the proposal is dismissed or rejected.

### Data Preservation

- FR-017: User can rely on newly created planners, tasks, and events keeping the correct ownership relationship after this change. Priority: must-have. Change: modified
  > Socrates: Counter-argument considered: "existing data migration may not be required
  > if current data is only developer or test data." Resolution: revised; mandatory
  > ownership preservation applies to new data, while migration of existing data
  > remains open.

## Business Logic Changes

The system currently lets a user create planners, add tasks and events, and view them on a board or calendar in static or dynamic form.

This change modifies the rule so planners and tasks or events operate in the context of the logged-in user, and AI may generate a proposed weekly plan, but data is saved only after the user explicitly accepts the proposal.

## Constraints & Preserved Behavior

- The existing flow for creating planners, adding tasks and events, viewing the board or calendar, and switching weeks in the dynamic board must remain intact.
- Existing API contracts for planners and tasks or events should be preserved or extended compatibly to include user ownership.
- The AI proposal flow must never bypass manual user acceptance before data changes.
- Data migration is optional for MVP when current data is developer or test data only.
- Data migration becomes required only if existing user data must be preserved after accounts and ownership are introduced.
- Manual planning must continue working without UX regression after user ownership is added.
- Extending the data model with user ownership must not break the existing planner to task or event relationships.

## Non-Functional Requirements

- A user receives clear visible feedback after login, save, edit, delete, and AI-plan acceptance actions.
- A user can view and modify only their own planners, tasks, and events.
- AI-generated proposals never persist or alter planner data before explicit user acceptance.
- The existing board and dynamic week switching do not become slower or less stable than the current product behavior after this change ships.
- The product remains usable in a typical desktop browser layout, because the board or calendar is the primary workspace.

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

## Quality cross-check

- Access Control: present.
- Business Logic: present.
- Project artifacts: present.
- Timeline-cost acknowledgment: present.
- Non-Goals: present.
- Preserved behavior: present.
