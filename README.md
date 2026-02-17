# ReGrow

**Grow through repetition** — a minimalist habit and exercise tracker that helps you build consistency through daily goal tracking and visual progress feedback.

## Features

- **Reps & Time Goals** — track repetition-based exercises or time-based activities
- **Session Tracking** — full-screen focused session view with live counter, timer, and optional auto-count
- **Activity Calendar** — monthly view with color-coded completion status
- **Progress Visualization** — progress bars, completion counts, and relative timestamps
- **Dark/Light Mode** — automatic system preference detection with manual toggle
- **Haptic Feedback** — vibration on mobile devices during sessions
- **Offline & Private** — all data stored in localStorage, no backend or accounts required

## Getting Started

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build static export to `/out` |
| `npm run lint` | Run ESLint |

Open [http://localhost:3000/regrow](http://localhost:3000/regrow) in your browser.

## Desktop App (Tauri)

ReGrow can run as a native desktop app via [Tauri v2](https://v2.tauri.app/).

### Prerequisites

- [Rust](https://rustup.rs/) toolchain
- macOS: Xcode Command Line Tools
- Windows: [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/), Visual Studio C++ Build Tools
- Linux: `libwebkit2gtk-4.1-dev`, `libappindicator3-dev`, `librsvg2-dev`, `patchelf`

### Commands

| Command | Description |
|---------|-------------|
| `npm run tauri:dev` | Run desktop app in dev mode with hot reload |
| `npm run tauri:build` | Build release binary (`.dmg`, `.msi`, `.deb`/`.AppImage`) |

The first run downloads and compiles Rust dependencies — this takes a few minutes.

## License

MIT No Commercial License
