# Daily Board

Daily Board to aplikacja webowa do planowania dnia i tygodnia. Użytkownik może
założyć konto, tworzyć własne planery, dodawać do nich zadania i wydarzenia,
przeglądać plan na statycznym lub dynamicznym boardzie oraz edytować i usuwać
swoje dane. Dynamiczny board pozwala przełączać tygodnie bez utraty kontekstu
planu.

Aktualny rdzeń MVP obejmuje uwierzytelnianie, dane przypisane do użytkownika,
pełny CRUD planerów i zadań, kontrolę kolizji terminów oraz istniejący przepływ
boardu. Asystent AI opisany w PRD pozostaje opcjonalnym, przyszłym rozszerzeniem
i nie jest obecnie zaimplementowany.

## Architektura

- `frontend/` — Angular 21, TypeScript, Angular Material i NgRx;
- `backend/dailyboard-backend/` — Spring Boot 3.4, Java 22, Maven Wrapper,
  Spring Security i JPA;
- MySQL — lokalna baza aplikacji, zarządzana migracjami Flyway;
- H2 w trybie zgodności z MySQL — izolowana baza używana przez testy backendu;
- REST/OpenAPI — kontrakt backendu i generowany klient TypeScript.

Frontend domyślnie działa pod `http://localhost:4200`, a backend pod
`http://localhost:8080`.

## Wymagania

- Node.js 22 i npm;
- JDK 22;
- MySQL dostępny lokalnie lub przez własny URL JDBC;
- Chromium zainstalowany przez Playwright — tylko do testów e2e.

Wersje Javy i Node odpowiadają konfiguracji CI w `.github/workflows/ci.yml`.

## Uruchomienie lokalne

### 1. Baza danych

Domyślna konfiguracja backendu oczekuje bazy MySQL `daily-board` pod adresem
`localhost:3306`, użytkownika `root` i pustego hasła. Bazę można utworzyć
poleceniem:

```sql
CREATE DATABASE `daily-board`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Zamiast domyślnych wartości można ustawić:

```bash
export SPRING_DATASOURCE_URL='jdbc:mysql://localhost:3306/daily-board'
export SPRING_DATASOURCE_USERNAME='dailyboard'
export SPRING_DATASOURCE_PASSWORD='local-password'
export APP_AUTH_JWT_SECRET='replace-with-a-long-random-local-secret'
```

Nie należy commitować haseł ani sekretu JWT. Domyślny sekret w kodzie służy
wyłącznie do lokalnego developmentu.

### 2. Backend

```bash
cd backend/dailyboard-backend
./mvnw spring-boot:run
```

Przed uruchomieniem upewnij się, że `java -version` wskazuje JDK 22. Na macOS
można wskazać je jednorazowo:

```bash
JAVA_HOME=$(/usr/libexec/java_home -v 22) ./mvnw spring-boot:run
```

Flyway automatycznie zastosuje migracje przy starcie. Dokumentacja API będzie
dostępna pod `http://localhost:8080/swagger-ui/index.html`, a specyfikacja
OpenAPI pod `http://localhost:8080/v3/api-docs`.

### 3. Frontend

W drugim terminalu:

```bash
cd frontend
npm ci --legacy-peer-deps
npm run start
```

Otwórz `http://localhost:4200`. Adres API jest konfigurowany w
`frontend/src/assets/app-config.json`; domyślnie wskazuje lokalny backend.

## Weryfikacja jakości

### Frontend

```bash
cd frontend
npm run lint
npm test -- --watch=false --browsers=ChromeHeadless
npm run build
```

### Backend

```bash
cd backend/dailyboard-backend
./mvnw test
```

Testy backendu korzystają z H2 i nie wymagają działającego MySQL. Muszą być
uruchamiane na JDK 22.

### End-to-end

Jednorazowo zainstaluj przeglądarkę:

```bash
cd frontend
npx playwright install chromium
```

Następnie uruchom:

```bash
npm run e2e -- --project=chromium
```

Konfiguracja Playwright na macOS sama uruchamia backend testowy z H2 oraz
frontend. Na innych systemach uruchom oba serwery ręcznie pod domyślnymi
adresami przed testem; Playwright wykorzysta już działające procesy. Szczegóły
są w `frontend/e2e/README.md`.

## Konfiguracja

Najważniejsze zmienne backendu:

| Zmienna | Domyślna wartość | Znaczenie |
|---|---|---|
| `PORT` | `8080` | port HTTP backendu |
| `SPRING_DATASOURCE_URL` | lokalny MySQL `daily-board` | URL JDBC |
| `SPRING_DATASOURCE_USERNAME` | `root` | użytkownik bazy |
| `SPRING_DATASOURCE_PASSWORD` | puste | hasło bazy |
| `APP_AUTH_JWT_SECRET` | sekret developerski | klucz podpisujący JWT |
| `APP_AUTH_JWT_EXPIRATION_MS` | `3600000` | czas życia JWT w ms |
| `APP_CORS_ALLOWED_ORIGINS` | `http://localhost:4200` | dozwolone originy, rozdzielone przecinkami |

Frontend może zmienić bazowy adres API przez pole `apiBaseUrl` w
`frontend/src/assets/app-config.json`.

## Generowanie klienta API

Po uruchomieniu backendu:

```bash
cd frontend
npm run openapi-generate
```

Polecenie pobiera lokalną specyfikację OpenAPI i aktualizuje kod w
`frontend/src/api/`. Zmiany w wygenerowanym kliencie powinny wynikać ze zmiany
kontraktu backendu.

## Struktura repozytorium

```text
.
├── frontend/                    # aplikacja Angular i testy Playwright
├── backend/dailyboard-backend/  # API Spring Boot i migracje Flyway
├── context/foundation/          # PRD, roadmapa i strategia jakości
├── context/changes/             # aktywne zmiany
└── context/archive/             # ukończone, niezmienne zmiany
```

## Dokumentacja projektu

- [PRD](context/foundation/prd.md) — problem, zakres i wymagania produktu;
- [roadmapa](context/foundation/roadmap.md) — stan pionowych etapów MVP;
- [plan testów](context/foundation/test-plan.md) — ryzyka i strategia jakości;
- [infrastruktura](context/foundation/infrastructure.md) — decyzje dotyczące
  docelowego uruchomienia;
- [instrukcja frontendu](frontend/README.md);
- [instrukcja backendu](backend/dailyboard-backend/README.md).

## Stan funkcjonalności

| Obszar | Stan |
|---|---|
| rejestracja, logowanie i wylogowanie | gotowe |
| własność i izolacja danych użytkowników | gotowe |
| tworzenie, odczyt, edycja i usuwanie planerów | gotowe |
| tworzenie, odczyt, edycja i usuwanie zadań/wydarzeń | gotowe |
| statyczny i dynamiczny board oraz przełączanie tygodni | gotowe |
| wykrywanie konfliktów terminów | gotowe |
| propozycja planu generowana przez AI | opcjonalne / niezrealizowane |

## Zrzuty ekranu

ekran logowania:

<img width="1800" height="961" alt="Zrzut ekranu 2026-07-25 o 12 46 22" src="https://github.com/user-attachments/assets/548d1c24-96f3-4030-9839-25784d487c4f" />

strona główna:

<img width="1800" height="999" alt="Zrzut ekranu 2026-07-25 o 12 47 35" src="https://github.com/user-attachments/assets/7c30b4a7-a8c7-4c90-a28c-c1290562fba5" />

Główna funkcjonalność nr 1 (Tworzenie nowego planera z określeniem nazwy, godzin i trybu działania):

<img width="1800" height="999" alt="Zrzut ekranu 2026-07-25 o 12 50 25" src="https://github.com/user-attachments/assets/03661258-da16-49cf-9732-1ff98deb5cac" />

Główna funkcjonalność nr 2 (Tygodniowy widok planera z zadaniami przypisanymi do dni i godzin):

<img width="1759" height="972" alt="Zrzut ekranu 2026-07-25 o 13 25 57" src="https://github.com/user-attachments/assets/225f154c-9ba5-4027-abeb-f96f7c50ea18" />

## Wyniki testów

backend:
<img width="2288" height="394" alt="image" src="https://github.com/user-attachments/assets/6edf5bbf-0db1-42f4-9b64-073e8a3441b7" />

frontend:
<img width="2288" height="108" alt="image" src="https://github.com/user-attachments/assets/8994b74c-c3c8-4901-9231-a43a507a351a" />
