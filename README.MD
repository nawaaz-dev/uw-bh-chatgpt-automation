# 🧠 ChatGPT Automation Script (Node.js + Puppeteer)

This project automates logging into ChatGPT, sending two prompts (initial + follow-up), and saving the responses as a beautifully formatted Markdown CSV.

Built with **TypeScript**, equipped with ESLint, Prettier, and Husky for code quality — and designed with modularity and scalability in mind.

---

## 📌 Features

- 🔐 Authenticates with ChatGPT using **email and password**
- 💬 Chats using **two prompts** — prompt + reply flow
- 📦 Stores responses in a **well-structured Markdown-formatted CSV**
- 📁 Uses a **scalable folder structure** for clean code separation
- ✅ Written in **TypeScript**
- 🔍 Enforced by **ESLint, Prettier, Husky (pre-commit hook)**
- 🌱 Organized via **Git feature branches**

---

## 🚀 How to Use

### 1. Clone the repository
```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### 2. Install dependencies
```bash
yarn
```

### 3. Provide credentials and prompts

#### Option A: Using `.env`
Create a `.env` file in the root:

```env
EMAIL=your@email.com
PASSWORD=yourpassword
PROMPT1=Tell me a joke
PROMPT2=Haha, another one?
```

#### Option B: Pass via CLI flags
```bash
yarn start \
  --email="your@email.com" \
  --password="yourpassword" \
  --prompt1="Tell me a joke" \
  --prompt2="Haha, another one?"
```

---

## ⚠️ Important Notes

1. 🧾 **Email Verification**: During login, ChatGPT may require email verification. If prompted, check your email for a code and paste it into the terminal when asked.
2. 💾 Once the script completes, the output will be saved as a CSV at:
   ```
   /data/csv/response_<timestamp>.csv
   ```
   It contains the prompt + reply and their respective ChatGPT responses — in **Markdown format** for easy readability.
3. 🛑 **Cloudflare Blocking**: The script does **not bypass Cloudflare** protection. If blocked:
   - Try using a different IP or VPN
   - Consider logging in manually and using cookies instead

4. 🔄 **Changing Login Flows**: OpenAI occasionally changes its login UI/flow. The script is built to work with the current flow as of development time. If it breaks, updating the selectors may be necessary.

---

## 🗂️ Folder Structure

```
src/
├── config/              # Global config (CLI args, paths, env)
├── modules/             # Modular code for each feature
│   ├── auth/            # Handles login and session
│   ├── chat/            # Handles prompt + reply flow
│   └── consent/         # Cookie consent / onboarding flow
│
├── types/               # Commonly used global types
├── utils/               # Utility functions
│   ├── browser.ts       # Browser setup
│   ├── cli.ts           # CLI helpers
│   ├── csv.ts           # CSV writer utilities
│   └── cookies.ts       # Load/save session cookies
```

> ✨ **Note:** Modules can contain submodules within `modules/<module-name>/modules/` for deeper separation if needed.

---

## 🛠️ Dev & Code Quality Tools

- 🟨 **TypeScript**: Strict typing and interfaces
- 🧹 **ESLint + Prettier**: Code linting and consistent formatting
- 🛑 **Husky**: Pre-commit hook to prevent committing bad code
- 🌿 **Branch-based Git Workflow**: Feature-driven branches like `feat/login`, `setup/linting`, etc.

---

## 📈 Output Example

The generated CSV contains:

| Prompt           | Response (Markdown)                             |
|------------------|--------------------------------------------------|
| `Tell me a joke` | `**Sure!**\n\nWhy did the dev go broke?\n...\n` |

The markdown structure preserves:
- Bullet points
- Code blocks
- Line breaks
- Bold/italic text

---

## 👨‍💻 Author

Built with love and caffeine by [Nawaaz Kortiwala](https://www.linkedin.com/in/nawaaz-kortiwala)

---

## 🧪 Bonus Ideas (Future Improvements)

- Add support for logging in using cookies to bypass Cloudflare
- Enhance support for HTML-to-Markdown fallback if DOM breaks
- Add a GUI or web interface for inputs & visual output

---

## 📦 Open Source Usage

This project was built entirely from scratch, leveraging open-source libraries only for tooling, automation, and utility support — **no part of the core business logic was copied**.

### ✔️ OSS Libraries Used

#### **Core Automation**
- [`puppeteer`](https://github.com/puppeteer/puppeteer) – Headless browser automation
- [`puppeteer-extra`](https://github.com/berstend/puppeteer-extra) – Enhanced Puppeteer features
- [`puppeteer-extra-plugin-stealth`](https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth) – Anti-bot detection plugin

#### **Data Handling**
- [`turndown`](https://github.com/mixmark-io/turndown) – Convert HTML responses into Markdown
- [`csv-writer`](https://github.com/ryu1kn/csv-writer) – Write Markdown-formatted responses to CSV

#### **CLI & Config**
- [`yargs`](https://github.com/yargs/yargs) – Parse command-line arguments
- [`dotenv`](https://github.com/motdotla/dotenv) – Load `.env` environment variables

#### **Dev Tooling**
- [`TypeScript`](https://github.com/microsoft/TypeScript) – Type-safe development
- [`tsx`](https://github.com/esbuild-kit/tsx) – Zero-config TypeScript runner
- [`eslint`](https://github.com/eslint/eslint) + plugins – Linting and import sorting
- [`prettier`](https://github.com/prettier/prettier) – Code formatting
- [`husky`](https://github.com/typicode/husky) – Git pre-commit hook setup

---

> 💡 All core logic for DOM traversal, session management, prompt interaction, markdown conversion, and CSV formatting was **manually written** to meet project-specific needs. No snippets or implementations were copied from tutorials or open sources.