# Daily Board — frontend

Frontend Daily Board jest aplikacją Angular 21 napisaną w TypeScripcie. Obsługuje
rejestrację i logowanie, listę planerów, formularze planerów i zadań oraz
statyczny i dynamiczny widok tygodnia. Stan danych planerów i zadań jest
zarządzany przez NgRx.

Ogólny opis projektu i pełna instrukcja uruchomienia znajdują się w
[`../README.md`](../README.md).

## Wymagania i instalacja

- Node.js 22;
- npm;
- działający backend pod adresem skonfigurowanym w
  `src/assets/app-config.json`.

```bash
npm ci --legacy-peer-deps
npm run start
```

Aplikacja jest dostępna pod `http://localhost:4200`.

## Konfiguracja API

Konfiguracja runtime jest ładowana z `src/assets/app-config.json`:

```json
{
  "apiBaseUrl": "http://localhost:8080"
}
```

Pozwala to zmienić adres backendu bez modyfikowania kodu TypeScript. Jeżeli plik
nie zostanie załadowany, aplikacja użyje `http://localhost:8080`.

## Dostępne polecenia

```bash
npm run start
npm run lint
npm test -- --watch=false --browsers=ChromeHeadless
npm run build
npm run e2e -- --project=chromium
npm run openapi-generate
```

- `start` — serwer developerski;
- `lint` — ESLint dla plików TypeScript i szablonów;
- `test` — testy jednostkowe i komponentowe Karma/Jasmine;
- `build` — produkcyjny build do `dist/daily-board`;
- `e2e` — krytyczne przepływy Playwright;
- `openapi-generate` — ponowne wygenerowanie klienta API z działającego
  backendu.

Przed pierwszym uruchomieniem e2e wykonaj:

```bash
npx playwright install chromium
```

Konfiguracja testów e2e i ograniczenia platformowe są opisane w
[`e2e/README.md`](e2e/README.md).

## Struktura

```text
src/
├── api/                 # klient wygenerowany ze specyfikacji OpenAPI
├── app/
│   ├── core/            # auth, konfiguracja i usługi aplikacyjne
│   ├── shared/          # komponenty i usługi współdzielone
│   ├── shared-store/    # stan, reducery i efekty NgRx
│   └── views/           # widoki i formularze routingu
└── assets/
    ├── app-config.json  # runtime API base URL
    ├── i18n/            # tłumaczenia
    └── scss/            # style
```

## Kontrakt OpenAPI

`openapi-config.json` pobiera specyfikację z
`http://localhost:8080/v3/api-docs`. Backend musi działać podczas generowania:

```bash
npm run openapi-generate
```

Nie należy ręcznie poprawiać wygenerowanych plików w `src/api/`; źródłem zmian
jest kontrakt backendu.
