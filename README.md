# REPO-MASTER

Dieses Angular Projekt ist zum erstellen der Readme.md. Man kann es direkt von seiner Github Repo importieren. Wenn man eingeloggt ist kann man seinen letzten fortschritt speichern.

![GitHub last commit](https://img.shields.io/github/last-commit/matthias146/repo-master) ![GitHub stars](https://img.shields.io/github/stars/matthias146/repo-master) ![License](https://img.shields.io/github/license/matthias146/repo-master)

## Technologien

- **Angular 21**
- **Tailwind CSS**
- **TypeScript**
- **Main Language:** TypeScript

## Projekt-Struktur

```text
.
├── .editorconfig
├── .husky
│   ├── commit-msg
│   ├── pre-commit
├── .postcssrc.json
├── README.md
├── angular.json
├── commitlint.config.mjs
├── components.json
├── eslint.config.js
├── package-lock.json
├── package.json
├── public
│   ├── favicon.ico
├── src
│   ├── app
│   │   ├── app.config.ts
│   │   ├── app.html
│   │   ├── app.routes.ts
│   │   ├── app.scss
│   │   ├── app.spec.ts
│   │   ├── app.ts
│   │   ├── core
│   │   │   ├── db
│   │   │   │   ├── supabase.spec.ts
│   │   │   │   ├── supabase.ts
│   │   │   ├── layout
│   │   │   │   ├── shell
│   │   │   │   │   ├── shell.html
│   │   │   │   │   ├── shell.scss
│   │   │   │   │   ├── shell.spec.ts
│   │   │   │   │   ├── shell.ts
│   │   │   ├── services
│   │   │   │   ├── github-scanner.service.ts
│   │   ├── features
│   │   │   ├── git-commit
│   │   │   │   ├── git-commit.html
│   │   │   │   ├── git-commit.scss
│   │   │   │   ├── git-commit.spec.ts
│   │   │   │   ├── git-commit.ts
│   │   │   ├── readme-builder
│   │   │   │   ├── state
│   │   │   │   │   ├── builder.store.ts
│   │   │   │   │   ├── workspace.service.spec.ts
│   │   │   │   │   ├── workspace.service.ts
│   │   │   │   ├── workspace
│   │   │   │   │   ├── editor
│   │   │   │   │   │   ├── editor.html
│   │   │   │   │   │   ├── editor.scss
│   │   │   │   │   │   ├── editor.spec.ts
```

## Setup

```bash
git clone https://github.com/matthias146/repo-master.git
npm install
npm start
```
