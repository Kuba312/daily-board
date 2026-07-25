# Raport analizy technicznej MVP — Daily Board

Data analizy: 2026-07-25
Podstawa oceny: `frontend/.agents/prompts/mvp-check.md`

## Podsumowanie

Daily Board jest aplikacją webową do planowania dnia i tygodnia. Frontend został
zbudowany w Angularze i TypeScripcie, backend w Spring Boot, a dane są utrwalane
przez JPA w relacyjnej bazie danych. Repozytorium spełnia wszystkie 5
minimalnych kryteriów technicznych.

| Kryterium | Ocena | Wynik |
|---|---:|---:|
| 1. Operacje CRUD | ✅ | spełnione |
| 2. Logika biznesowa | ✅ | spełnione |
| 3. Testy adresujące zdefiniowane ryzyko | ✅ | spełnione |
| 4. Uwierzytelnianie powiązane z użytkownikiem | ✅ | spełnione |
| 5. Dokumentacja | ✅ | spełnione |

**Status projektu: 5/5 = 100%.**

Ocena dotyczy wyłącznie kryteriów technicznych z instrukcji. Nie oceniano
warstwy wizualnej, CSS, dopracowania interfejsu, dostępności ani wdrożenia.

## 1. Operacje CRUD — ✅

Pełny CRUD działa dla głównego, utrwalanego zasobu `Planner`.

- **Create:** `POST /api/v1/planners` w
  `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/controller/PlannerController.java:32`
  wywołuje `PlannerService.savePlanner`, który przypisuje właściciela i zapisuje
  encję przez `plannerRepository.save` (`PlannerService.java:26-29`).
- **Read:** `GET /api/v1/planners/all` i `GET /api/v1/planners/{id}` znajdują się
  w `PlannerController.java:38-45`. Warstwa serwisowa pobiera wyłącznie rekordy
  bieżącego użytkownika (`PlannerService.java:32-39`).
- **Update:** `PUT /api/v1/planners/{id}` znajduje się w
  `PlannerController.java:48-50`; trwały zapis zmian wykonuje
  `PlannerService.updatePlanner` przez `plannerRepository.save`
  (`PlannerService.java:43-67`).
- **Delete:** `DELETE /api/v1/planners/{id}` znajduje się w
  `PlannerController.java:53-56`; `PlannerService.deletePlanner` pobiera zasób
  należący do użytkownika i usuwa go z repozytorium
  (`PlannerService.java:70-74`).

Trwałość danych potwierdzają encje JPA `Planner` i `Duty` oraz migracje Flyway:
`backend/dailyboard-backend/src/main/resources/db/migration/V1__init_tables.sql`
i `V3__add_planner_owner.sql`.

Repozytorium ma również pełny CRUD dla elementów planu (`Duty`):
`DutyController.saveDuty`, `getDutiesByPlannerId`, `updateDuty` i `deleteDuty`,
obsługiwane przez `DutyService.java:29-79`.

## 2. Logika biznesowa — ✅

Projekt zawiera logikę wykraczającą poza prosty zapis i odczyt danych.

Najmocniejszym przykładem jest wykrywanie kolizji terminów w
`DutyService.checkConflictedDuties`
(`backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/DutyService.java:82-111`).
Metoda:

- buduje specyfikacje nakładania się zakresów czasu,
- ogranicza sprawdzanie do wybranego planera,
- przy edycji wyklucza aktualnie modyfikowany element,
- zbiera kolidujące zadania,
- odrzuca operację wyjątkiem `DutyConflictException` z listą konfliktów.

Dodatkowa reguła biznesowa znajduje się w
`PlannerService.updatePlanner` (`PlannerService.java:46-59`). Zmiana godzin lub
typu planera, który ma już zadania, wymaga jawnego potwierdzenia usunięcia
zależnych elementów. Bez potwierdzenia operacja jest odrzucana.

## 3. Testy adresujące zdefiniowane ryzyko — ✅

Plan testów definiuje konkretne ryzyko nr 1:
„User B can access User A planner or duty through direct endpoint/manual URL
even when lists are filtered” w
`context/foundation/test-plan.md:44-50`. Dla tego ryzyka wskazuje testy
integracyjne/API jako najtańszą warstwę dającą właściwy sygnał
(`test-plan.md:60-67`).

Ryzyko jest faktycznie ćwiczone między innymi przez:

- `PlannerOwnershipTest.shouldNotExposeOtherUsersPlannerById`
  (`backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/PlannerOwnershipTest.java:89-98`);
- `PlannerOwnershipTest.shouldNotLetUserMutateAnotherUsersPlanner`
  (`PlannerOwnershipTest.java:206-235`);
- `DutyOwnershipTest.shouldBlockCrossUserDutyReadByPlannerId`
  (`backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/DutyOwnershipTest.java:88-100`);
- test Playwright `Risk #1: User B cannot see or fetch User A planner by direct
  access` (`frontend/e2e/ownership-boundary.spec.ts:10-59`).

Testy backendowe korzystają z pełnego kontekstu Spring Boot, rzeczywistego
przepływu rejestracji i tokenów JWT oraz bazy H2 z migracjami Flyway. Podczas
analizy uruchomiono `./mvnw test` na wymaganej Javie 22: **37 testów przeszło,
0 błędów i 0 niepowodzeń**.

## 4. Uwierzytelnianie powiązane z użytkownikiem — ✅

Backend oferuje rejestrację i logowanie email + hasło w
`AuthController` oraz `AuthService`. Hasła są kodowane przez BCrypt
(`SecurityConfig.java:53-55`), a poprawne logowanie generuje JWT zawierający
identyfikator użytkownika (`AuthService.java:42-59` i `JwtService`).

`JwtAuthenticationFilter`:

- odczytuje token Bearer,
- sprawdza jego ważność,
- pobiera użytkownika po identyfikatorze z tokenu,
- umieszcza go w kontekście Spring Security
  (`backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/config/JwtAuthenticationFilter.java:36-62`).

Endpointy planerów i zadań wymagają uwierzytelnienia
(`SecurityConfig.java:36-49`). Dane są przypisane i filtrowane po użytkowniku:

- `Planner.owner` jest relacją JPA do `User` (`Planner.java:26-28`);
- nowy planer otrzymuje bieżącego użytkownika jako właściciela
  (`PlannerService.java:26-29`);
- lista i szczegóły planera używają `ownerId`
  (`PlannerService.java:32-39`);
- operacje na zadaniach najpierw weryfikują, czy planer należy do bieżącego
  użytkownika (`DutyService.java:121-127`).

Testy integracyjne potwierdzają zarówno dozwolony dostęp właściciela, jak i
odrzucenie odczytu, aktualizacji oraz usuwania danych innego użytkownika.

## 5. Dokumentacja — ✅

Repozytorium ma znaczący README oraz pisaną podstawę produktową.

Główny `README.md`:

- wyjaśnia, czym jest Daily Board i jaki przepływ oferuje użytkownikowi
  (`README.md:1-12`);
- opisuje architekturę Angular + Spring Boot + MySQL/Flyway
  (`README.md:14-24`);
- podaje wymagania, konfigurację bazy i bezpieczne użycie zmiennych
  środowiskowych (`README.md:26-59`);
- zawiera instrukcje uruchomienia frontendu i backendu oraz komendy weryfikacji
  jakości (`README.md:61-131`);
- wskazuje dokumentację foundation i jawnie rozróżnia funkcje gotowe od
  opcjonalnej, niezrealizowanej integracji AI (`README.md:174-194`).

Dokumentację operacyjną uzupełniają:

- `frontend/README.md` — konfiguracja runtime API, skrypty Angular, testy
  Playwright i generowanie klienta OpenAPI;
- `backend/dailyboard-backend/README.md` — konfiguracja MySQL, JWT, CORS,
  migracje Flyway, endpointy i testy na JDK 22.

`context/foundation/prd.md` jest rozbudowanym dokumentem wymagań. Opisuje
problem, personę, kryteria sukcesu, zakres, reguły własności i ograniczenia.
Sekcja `Implementation Status Snapshot` (`prd.md:38-43`) oddziela wdrożony rdzeń
MVP od opcjonalnego rozszerzenia AI. Roadmapa oraz plan testów rozwijają tę
podstawę o stan realizacji i strategię ryzyka.

## Priorytetowe poprawki

Brak niespełnionych kryteriów, więc raport nie wymaga poprawki blokującej
minimalny próg techniczny.

Poza checklistą warto w przyszłości odświeżyć zamrożone sekcje §1-§5 planu
testów przez przewidziany proces `/10x-test-plan --refresh`. Ich tabela rolloutów
jest historycznym snapshotem, natomiast aktualna pokrywa e2e została już opisana
w rozwijanej sekcji §6. Nie wpływa to na spełnienie kryterium: ryzyko i
odpowiadające mu rzeczywiste testy są jednoznacznie udokumentowane.

## Elementy wykraczające ponad minimum

Projekt wykracza ponad podstawowy próg w obszarze ochrony danych: ma testy
integracyjne wielu ścieżek naruszenia własności, nieujawniające odpowiedzi 404,
test e2e granicy użytkowników oraz osobne bramki CI dla lintowania, testów,
budowania frontendu i testów backendu. Nie zmienia to wyniku checklisty, ale
jest wartościowym sygnałem dojrzałości technicznej MVP.
