# Daily Board — backend

Backend Daily Board udostępnia REST API dla uwierzytelniania, planerów i
zadań/wydarzeń. Jest zbudowany w Spring Boot 3.4 na Javie 22. Dane produkcyjne i
lokalne są zapisywane w MySQL przez Spring Data JPA, a schemat jest wersjonowany
migracjami Flyway.

Ogólny opis projektu znajduje się w [`../../README.md`](../../README.md).

## Wymagania

- JDK 22;
- działający MySQL;
- system zgodny z Maven Wrapper (`mvnw` lub `mvnw.cmd`).

## Konfiguracja lokalna

Domyślnie backend łączy się z:

```text
jdbc:mysql://localhost:3306/daily-board
username: root
password: (puste)
```

Zalecana konfiguracja przez zmienne środowiskowe:

```bash
export SPRING_DATASOURCE_URL='jdbc:mysql://localhost:3306/daily-board'
export SPRING_DATASOURCE_USERNAME='dailyboard'
export SPRING_DATASOURCE_PASSWORD='local-password'
export APP_AUTH_JWT_SECRET='replace-with-a-long-random-local-secret'
export APP_CORS_ALLOWED_ORIGINS='http://localhost:4200'
```

Najważniejsze opcje:

| Zmienna | Domyślna wartość | Znaczenie |
|---|---|---|
| `PORT` | `8080` | port serwera |
| `SPRING_DATASOURCE_URL` | lokalny MySQL | URL JDBC |
| `SPRING_DATASOURCE_USERNAME` | `root` | użytkownik bazy |
| `SPRING_DATASOURCE_PASSWORD` | puste | hasło bazy |
| `APP_AUTH_JWT_SECRET` | sekret developerski | klucz podpisujący JWT |
| `APP_AUTH_JWT_EXPIRATION_MS` | `3600000` | czas życia tokenu |
| `APP_CORS_ALLOWED_ORIGINS` | `http://localhost:4200` | dozwolone originy |
| `SPRING_JPA_SHOW_SQL` | `true` | logowanie zapytań SQL |
| `HIBERNATE_FORMAT_SQL` | `true` | formatowanie zapytań SQL |

Domyślnego sekretu JWT nie wolno używać poza lokalnym developmentem.

## Uruchomienie

```bash
./mvnw spring-boot:run
```

Na Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

Flyway automatycznie wykonuje migracje z
`src/main/resources/db/migration/`. Hibernate ma ustawione `ddl-auto: none`,
więc zmiany schematu należy wprowadzać przez nowe migracje, a nie automatyczne
generowanie tabel.

## API

- Swagger UI: `http://localhost:8080/swagger-ui/index.html`;
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`;
- rejestracja i logowanie: `/api/v1/auth/**`;
- planery: `/api/v1/planners/**`;
- zadania/wydarzenia: `/api/v1/duties/**`.

Endpointy planerów i zadań wymagają tokenu:

```http
Authorization: Bearer <token>
```

Zasoby są wyszukiwane w kontekście zalogowanego użytkownika. Brak dostępu do
cudzego zasobu jest zwracany jako nieujawniające `404`.

## Testy

```bash
./mvnw test
```

Testy korzystają z H2 w pamięci, działającego w trybie zgodności z MySQL, oraz
stosują rzeczywiste migracje Flyway. Nie wymagają uruchomionego MySQL.

Główne zestawy:

- `AuthControllerTest` — rejestracja, logowanie i błędne dane;
- `PlannerOwnershipTest` — CRUD i granica własności planerów;
- `DutyOwnershipTest` — CRUD, konflikty terminów i granica własności zadań.

Projekt wymaga JDK 22. Błąd o `class file version 66.0` oznacza, że testy
uruchomiono starszą Javą.

## Struktura

```text
src/main/java/com/dailyboard/dailyboard/
├── config/       # Spring Security, JWT, CORS i OpenAPI
├── controller/   # endpointy REST
├── mapper/       # mapowanie DAO ↔ DTO
├── model/        # encje i DTO
├── repository/   # Spring Data JPA
├── service/      # logika aplikacyjna i reguły biznesowe
└── validation/   # walidatory domenowe

src/main/resources/
├── application.yml
└── db/migration/ # migracje Flyway
```
