# Creatorium
### Forge Fast, Move Smart. The AI Architect for Cedra Public Goods.

![Next.js](https://img.shields.io/badge/Next.js-15-black) ![Move](https://img.shields.io/badge/Move-Language-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4) ![Vercel AI SDK](https://img.shields.io/badge/Vercel-AI%20SDK-black)

---

## 2. The Problem (The "Why")

### The "Cold Start" Problem
Building on a new high-performance Layer 1 blockchain like **Cedra** is an immense opportunity, but it can be intimidating. The **Move** programming language, while secure and robust, is Rust-based and presents a steep learning curve for developers coming from Solidity or JavaScript backgrounds.

### Documentation Fatigue
Developers often spend more time reading documentation than writing code. Navigating through complex framework specifications, resource management rules, and capability patterns can stall the creative process before it even begins.

### Empty Editors
The hardest part of coding is the first line. Staring at an empty IDE while trying to architect a secure dApp structure leads to analysis paralysis.

---

## 3. The Solution (The "What")

**Creatorium** is an "Intelligent Scaffolding Agent" designed to bridge the gap between natural language intent and production-ready Move smart contracts.

### Intelligent Scaffolding
It doesn't just print code; it acts as a senior architect. It builds the entire project structure—`Move.toml`, `sources/` directory, entry functions, and frontend integrations—tailored to the Cedra ecosystem.

### Educational by Design
Creatorium is a teaching tool. It includes "Architect Notes" alongside the generated code, explaining *why* specific Move capabilities (like `store`, `copy`, `drop`) or resource patterns (like `Coin<T>`) were chosen.

### Public Good
By lowering the barrier to entry, Creatorium acts as a critical onboarding funnel for the entire Cedra ecosystem, empowering a new wave of builders to create public goods.

---

## 4. Key Features

### 🤖 The Architect Engine
Powered by **Google Gemini** via the **Vercel AI SDK**, the engine understands complex prompts (e.g., "Build a DAO with quadratic voting") and breaks them down into valid, idiomatic Move modules and strictly typed interfaces.

### 📝 Interactive "Forge" Interface
A unified, split-screen IDE experience featuring a read-only **Monaco Editor**. It provides syntax highlighting for Rust/Move and TypeScript, allowing developers to inspect every line of the generated solution.

### ⚡ Rapid Prototyping
From zero to dApp in seconds. Creatorium instantly generates the correct directory structures, dependency definitions (`Move.toml`), and React frontend components needed to start building on Cedra.

### 🛡️ Local-First Deployment
Security is paramount. Creatorium does not hold your private keys. Instead, it generates a custom `deploy.sh` script included in the project download. This allows you to audit the deployment process and execute it from your own trusted local terminal using the standard Cedra CLI.

---

## 5. Technical Architecture (The "How")

*   **Frontend**: Built with **Next.js 15 (App Router)** and **React 19**, ensuring a highly reactive, server-side rendered interface with optimal performance.
*   **Styling**: A futuristic "Cyberpunk/Void" aesthetic crafted with **Tailwind CSS**, optimized for dark mode to reduce eye strain during long coding sessions.
*   **State Management**: Uses React Context and Custom Hooks (`useCreatoriumState`, `useAIGeneration`) to manage the complex state of the virtual file system and tab navigation.
*   **AI Integration**: Leverages the **Vercel AI SDK** to stream responses from the LLM, ensuring a responsive user experience even during complex code generation.
*   **Simulation**: Features a unique **Wallet Injection Shim** within the Sandpack-based "Preview" environment. This allows the generated frontend code to import and use `@cedra/wallet-adapter` libraries *inside the browser preview*, simulating a real wallet connection without requiring a live blockchain connection.

---

## 6. The "Forge" Workflow (User Journey)

1.  **Ideate**: You enter a prompt, such as *"Create a Token Vesting contract for early investors."*
2.  **Architect**: The AI engine processes the request, explains the architectural decisions, and generates the complete file tree.
3.  **Preview**: You inspect the generated code in the **Preview** tab. You can interact with the UI, click "Connect Wallet" (simulated), and verify the logic.
4.  **Export**: Satisfied with the result, you click the **"DEPLOY"** button to download a `.zip` file containing the entire project.
5.  **Deploy**: You extract the project and run the included `deploy.sh` script in your terminal to compile and publish the smart contract to the Cedra Network.

---

## 7. Roadmap / Future Improvements

*   **Mainnet Integration**: Direct integration with WalletConnect for Mainnet deployments.
*   **Visual Node Graph**: A drag-and-drop interface for visualizing contract dependencies and resource flow.
*   **One-click Audit**: An integrated AI agent dedicated to security auditing, checking for common Move vulnerabilities before download.

---

### Local-First Deployment Architecture Note

*Creatorium focuses on the 'Architect' phase of development. It simulates the dApp environment in the browser for rapid prototyping. For the final 'Forge' (Deployment), we generate a secure shell script (`deploy.sh`) that allows the developer to publish from their local CLI, ensuring they maintain full custody of their keys and environment variables.*
