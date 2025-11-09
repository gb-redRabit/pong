# 🎮 Pong - Zaawansowana Edycja v2.3.0

Nowoczesna implementacja klasycznej gry Pong z zaawansowanymi funkcjami, efektami wizualnymi, pełną konfiguracją sterowania i 8 trybami gry!

## ✨ Funkcje

### 🎯 Tryby gry (8 trybów!)

- 🎮 **Classic** - klasyczna gra do 5 punktów
- ⏰ **Time Attack** - maksymalna liczba punktów w 3 minuty
- 🏆 **First to 10** - pierwszy do 10 punktów wygrywa
- 💥 **Speed Mode** - piłka zawsze bardzo szybka
- 🎪 **Chaos Mode** - losowe power-upy co 5 sekund
- 🌟 **Survival** - piłka przyspiesza bez limitu
- 🎯 **Target Practice** - trafiaj w cele przez 60 sekund
- 🏐 **Volleyball** - piłka musi odbić się od podłoża

### ⚙️ Zaawansowane sterowanie

- **Mysz** lub **Klawiatura** dla każdego gracza
- **Przypisywanie własnych klawiszy** - pełna personalizacja
- **Regulacja szybkości rakietki** (5-30) - dostosuj do swojego stylu
- **Niezależne ustawienia** dla Gracza 1 i Gracza 2

### ⚡ Power-upy (11 typów!)

- 🟡 **Speed Up** - przyspiesza piłkę
- 🟢 **Big Pad** - większa rakietka
- 🔴 **Small Pad** - mniejsza rakietka
- 🟠 **Multi Ball** - dodaje 2 dodatkowe piłki
- 🔵 **Freeze** - zamraża przeciwnika na 2s
- 🟣 **Invisible** - piłka niewidoczna na 3s
- ⚫ **Shield** - ochrona przed utratą punktu
- 🔴 **Reverse** - odwraca sterowanie na 5s
- 🟤 **Slow Motion** - spowolnienie gry
- 🟢 **Magnet** - rakietka przyciąga piłkę
- 🔵 **Ghost Pad** - rakietka przechodzi przez piłkę 1x

### 🧱 Przeszkody (8 typów w Chaos Mode!)

- 🟦 **Block** - statyczna przeszkoda odbijająca piłkę
- 🌀 **Portal** - teleportuje piłkę do drugiego portalu
- 💨 **Wind Zone** - wiatr przyspieszający piłkę
- 🎯 **Target** - cel do trafienia (bonus punkty)
- 📦 **Moving Block** - poruszająca się przeszkoda
- 🧱 **Breakout Block** - 3 trafienia do zniszczenia
- ⚡ **Speed Zone** - strefa przyspieszająca (1.5x)
- 🚧 **Barrier** - bariera znikająca po 3 sekundach

### 📊 Statystyki i czas

- ⏱️ **Licznik całkowitej rozgrywki** (MM:SS)
- ⏰ **Czas trwania partki** (resetuje się po golu)
- 🏆 **Najlepszy wynik** (zapisywany w localStorage)
- 📈 **Stopniowe przyspieszanie piłki** - gra się nie nudzi!

### 🎨 Efekty wizualne

- ✨ **Cząsteczki** przy każdym uderzeniu
- **Fajerwerki** przy zdobyciu punktu (50 cząsteczek z grawitacją)
- 📳 **Screen Shake** przy mocnym uderzeniu (300ms, intensywność 8px)
- 💫 **Glow effects** - świecące elementy (shadowBlur)
- 🎭 **Animowane przyciski** z hover effect
- 🌈 **7 motywów kolorystycznych** (neon, retro, dark, light, matrix, sunset, ocean)

### 🎮 UI/UX

- 📋 **Menu główne** z opcjami
- ⚙️ **Ekran ustawień** z pełną konfiguracją
- 📖 **Legenda power-upów** w ustawieniach
- 🏁 **Ekran końca gry** z wynikami i czasem
- 💾 **Automatyczny zapis ustawień**

## 🎯 Sterowanie

### Domyślne

- **Gracz 1**: Mysz (lub W/S dla klawiatury)
- **Gracz 2**: Klawisze ↑/↓
- **Pauza**: ESC
- **Menu**: Klik myszą

### Konfigurowalne

Wszystkie ustawienia sterowania można zmienić w menu **⚙ Ustawienia**:

- Wybór między myszą a klawiaturą
- Przypisanie własnych klawiszy
- Dostosowanie szybkości rakietek

## 🚀 Tech Stack

- **Pure JavaScript** - bez zewnętrznych bibliotek
- **Canvas API** - renderowanie 2D
- **localStorage** - zapis ustawień i rekordów
- **CSS3** - stylowanie i animacje
- **Google Fonts** (Poppins)

## 📦 Struktura projektu

```
pong/
├── index.html                   # Główny plik HTML
├── js/
│   ├── app.js                   # Główna pętla gry (1200+ linii)
│   └── modules/
│       ├── config.js            # Konfiguracja gry
│       ├── state.js             # Stan gry
│       ├── ui.js                # Interfejs użytkownika
│       ├── game.js              # Logika trybów gry
│       └── powerups.js          # Power-upy i przeszkody
├── music/                       # Efekty dźwiękowe
│   └── sound.wav
├── README.md                    # Dokumentacja
├── PROPOZYCJE_ULEPSZEN.md       # Lista przyszłych funkcji
├── CHANGELOG_v2.2.md            # Historia zmian v2.2
└── NOWE_FUNKCJE_v2.3.md         # Nowe funkcje v2.3
```

## 🎮 Jak grać

1. Otwórz grę w przeglądarce
2. Wybierz tryb gry (1 lub 2 graczy)
3. Dostosuj poziom trudności
4. (Opcjonalnie) Skonfiguruj sterowanie w Ustawieniach
5. Kliknij aby rozpocząć!

### Cel gry

Odbij piłkę rakietką i zdobądź **5 punktów** przed przeciwnikiem!

### Taktyki

- Uderzaj piłkę **górą lub dołem rakietki** dla lepszego kąta
- Zbieraj **power-upy** dla przewagi
- Pamiętaj: power-upy działają na gracza który **ostatnio odbił piłkę**!

## 🌐 Demo

**Live:** https://gb-redrabit.github.io/pong/

## 📈 Statystyki kodu

- **1600+ linii JavaScript** (modularny kod ES6)
- **6 modułów** (config, state, ui, game, powerups, app)
- **11 power-upów** z unikalnymi efektami
- **8 trybów gry** (Classic, Time Attack, First to 10, Speed Mode, Chaos Mode, Survival, Target Practice, Volleyball)
- **8 typów przeszkód** (Block, Portal, Wind, Target, Moving Block, Breakout Block, Speed Zone, Barrier)
- **7 motywów kolorystycznych**
- **4 stany gry** (menu/playing/paused/settings/gameover)

## 🔮 Przyszłe funkcje

Zobacz pełną listę propozycji w pliku [PROPOZYCJE_ULEPSZEN.md](./PROPOZYCJE_ULEPSZEN.md):

- Bowling Mode - zbijaj kręgle power-upami
- System osiągnięć (achievements)
- Multiplayer online (WebSocket/WebRTC)
- AI z uczeniem maszynowym (TensorFlow.js)
- Personalizacja (awatary, tła, muzyka)
- Statystyki i wykresy postępu
- I wiele więcej!

## 📝 Changelog

### v2.3.0 (2025-11-09) - "Efekty Wizualne & Nowe Tryby"

- 🎯 **Target Practice** - celuj w pojawiające się cele przez 60 sekund
- 🏐 **Volleyball** - piłka musi odbić się od podłoża z grawitacją
- 🎆 **Fajerwerki** przy zdobyciu punktu (50 cząsteczek z grawitacją)
- 📳 **Screen Shake** przy mocnym uderzeniu i punktach
- 🌈 Usunięto ball trail dla lepszej czytelności planszy

### v2.2.0 (2025-11-09) - "Mega Update"

- ⚡ **3 nowe power-upy**: Slow Motion, Magnet, Ghost Pad
- 🧱 **8 typów przeszkód**: Block, Portal, Wind, Target, Moving Block, Breakout Block, Speed Zone, Barrier
- 🎨 **4 nowe motywy**: Light, Matrix, Sunset, Ocean (razem 7)
- 💾 **Historia gier** - ostatnie 10 meczów zapisywane w localStorage
- 🎭 **Personalizacja** - nazwy i kolory graczy

### v2.0.0 (2025-11-09)

- ✨ Dodano zaawansowane ustawienia sterowania
- ⚡ Inteligentne power-upy z śledzeniem odbić (11 typów!)
- 🎮 6 trybów gry (Classic, Time Attack, First to 10, Speed Mode, Chaos Mode, Survival)
- ⏱️ Liczniki czasu (całkowita gra + partka)
- 📖 Legenda power-upów
- 🎨 Ulepszone efekty wizualne
- 💾 Zapis ustawień w localStorage

### v1.0.0 (Wcześniej)

- 🎮 Podstawowa mechanika gry
- 🤖 AI przeciwnik
- 🎨 Podstawowe efekty wizualne

## 📄 Licencja

MIT License

## 👨‍💻 Autor

gb-redRabit

---

**Enjoy the game! 🎮**
