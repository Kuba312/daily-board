# Daily Board - kontekst domenowy

## Główny problem

Planowanie dnia i tygodnia często jest chaotyczne.

Użytkownik ma wiele zadań, wydarzeń i pomysłów, ale trudno mu zobaczyć cały plan w jednym miejscu. Przez to łatwo przeciążyć jeden dzień, zapomnieć o ważnym zadaniu albo stworzyć plan, który wygląda dobrze na papierze, ale jest nierealny do wykonania.

Daily Board ma pomóc użytkownikowi lepiej organizować dzień i tydzień w prostym, czytelnym widoku boardu/kalendarza.

## Cel aplikacji

Daily Board to aplikacja do planowania dnia i tygodnia.

Użytkownik może utworzyć konto, zalogować się, tworzyć własne planery, dodawać do nich zadania lub wydarzenia, a następnie przeglądać je na boardzie.

Aplikacja ma pomagać użytkownikowi zobaczyć:

- co jest zaplanowane,
- na który dzień przypada dane zadanie lub wydarzenie,
- jak wygląda aktualny tydzień,
- czy plan jest sensownie rozłożony.

## Aktualny stan aplikacji

Projekt jest już rozpoczęty.

Aktualnie aplikacja posiada:

- tworzenie planera,
- dodawanie zadań/wydarzeń do planera,
- wyświetlanie boardu/kalendarza,
- board statyczny,
- board dynamiczny ze zmieniającymi się tygodniami.

Na ten moment nie ma jeszcze:

- logowania/rejestracji użytkownika,
- przypisania danych do konkretnego użytkownika,
- edycji planera,
- usuwania planera,
- edycji zadania/wydarzenia,
- usuwania zadania/wydarzenia.

## Główne pojęcia domenowe

### Użytkownik

Użytkownik to osoba korzystająca z aplikacji.

Użytkownik powinien mieć dostęp do własnych plannerów, zadań i wydarzeń.

Dane jednego użytkownika nie powinny mieszać się z danymi innych użytkowników.

### Konto użytkownika

Konto pozwala użytkownikowi wrócić do swoich plannerów i kontynuować planowanie w późniejszym czasie.

Minimalny zakres konta użytkownika to:

- możliwość rejestracji,
- możliwość logowania,
- możliwość wylogowania,
- dostęp do własnych danych po zalogowaniu.

### Planner

Planner to miejsce, w którym użytkownik organizuje swoje zadania i wydarzenia.

Przykłady:

- plan tygodnia,
- plan nauki,
- plan pracy,
- plan prywatny,
- plan konkretnego celu.

Planner należy do konkretnego użytkownika.

### Zadanie / wydarzenie

Zadanie lub wydarzenie to element dodawany do planera.

Może reprezentować coś do zrobienia, spotkanie, aktywność, obowiązek albo zaplanowany blok czasu.

Przykłady:

- zrobić zakupy,
- przygotować prezentację,
- iść na siłownię,
- pouczyć się Angulara,
- spotkanie z zespołem,
- code review.

Zadanie lub wydarzenie należy do konkretnego planera.

### Board

Board to widok, w którym użytkownik widzi swoje zadania i wydarzenia rozłożone na dni.

Board może być statyczny albo dynamiczny.

### Board statyczny

Board statyczny pokazuje stały układ planowania.

Może być używany do prostszego planowania bez przechodzenia między tygodniami.

### Board dynamiczny

Board dynamiczny pozwala przechodzić między tygodniami.

Użytkownik może zobaczyć plan dla aktualnego, poprzedniego lub następnego tygodnia.

## MVP

Minimalny sensowny zakres aplikacji powinien pozwalać użytkownikowi:

- utworzyć konto,
- zalogować się,
- wylogować się,
- pracować na własnych danych,
- stworzyć planner,
- dodać zadanie lub wydarzenie,
- zobaczyć zadania/wydarzenia na boardzie,
- przełączać tygodnie w dynamicznym boardzie,
- edytować istniejące elementy,
- usuwać istniejące elementy.

Aplikacja powinna być czymś więcej niż prostą listą zadań. Główną wartością jest widok planu w czasie, szczególnie w układzie tygodnia.

## Możliwy AI feature

Najbardziej naturalnym AI feature dla tej aplikacji jest asystent planowania.

Użytkownik opisuje, co chce zrobić w danym tygodniu, a AI proponuje rozłożenie tych zadań na konkretne dni.

Przykład:

Użytkownik wpisuje:

„W tym tygodniu chcę iść 3 razy na siłownię, zrobić zakupy, przygotować prezentację i pouczyć się Angulara.”

AI może zaproponować plan tygodnia:

- poniedziałek: nauka Angulara,
- wtorek: siłownia,
- środa: przygotowanie prezentacji,
- czwartek: siłownia,
- piątek: zakupy,
- sobota: siłownia.

Użytkownik powinien zobaczyć propozycję planu i zdecydować, czy chce ją zaakceptować.

AI nie powinno automatycznie zmieniać planu bez decyzji użytkownika.

## Cel AI feature

AI ma pomóc użytkownikowi szybciej stworzyć pierwszy szkic planu.

Nie musi tworzyć idealnego harmonogramu. Ważne, żeby dawało użytkownikowi sensowną propozycję startową, którą można potem poprawić.

AI feature powinien wspierać główny cel aplikacji, czyli planowanie dnia i tygodnia.

## Co nie jest celem MVP

Na ten moment poza zakresem są:

- współdzielenie plannerów między użytkownikami,
- zaawansowane role i uprawnienia,
- integracja z Google Calendar,
- aplikacja mobilna,
- powiadomienia push,
- rozbudowane statystyki produktywności,
- płatności,
- import plików,
- bardzo zaawansowany algorytm planowania,
- pełny system zarządzania projektami.

## Kryteria sukcesu

Projekt można uznać za sensowny MVP, jeśli użytkownik może:

- utworzyć konto,
- zalogować się,
- wylogować się,
- zobaczyć tylko swoje dane,
- stworzyć planner,
- dodać do niego zadania lub wydarzenia,
- zobaczyć je na boardzie,
- zarządzać nimi przez edycję i usuwanie,
- przełączać widok tygodnia,
- wygenerować propozycję planu z pomocą AI,
- zaakceptować lub odrzucić propozycję AI.

## Ogólna zasada

Daily Board ma być prostą aplikacją do planowania, a nie rozbudowanym systemem do zarządzania całym życiem.

Najważniejsze jest to, żeby użytkownik szybko zobaczył swój plan i mógł go łatwo zmieniać.