# 🐾 Pantero IA: Enterprise Affiliate Automation Engine

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Tauri](https://img.shields.io/badge/Tauri-FFC131?style=for-the-badge&logo=tauri&logoColor=white)

[https://github.com/user-attachments/assets/2dcdd87a-e8f9-4b8f-9222-b42d0bd32fe2](https://github.com/user-attachments/assets/2dcdd87a-e8f9-4b8f-9222-b42d0bd32fe2)

---

### ⚠️ COPYRIGHT & SECURITY NOTICE
**This repository contains a LIMITED DEMONSTRATION VERSION intended strictly for portfolio and educational display.** The full production software includes advanced Anti-Ban algorithms, stealth execution (Ghost Mode), proprietary HWID licensing protocols (KeyAuth), and encrypted local payload management. These core security modules have been **INTENTIONALLY REMOVED** from this public repository to protect the commercial integrity of the SaaS.

*(© 2026 RyK Medeiros. Unauthorized reproduction or commercial use is strictly prohibited).*

---

## 📌 Project Overview & Business Impact
Pantero IA is a high-performance B2B SaaS (Software as a Service) developed specifically for the Brazilian digital marketing ecosystem. It solves a critical bottleneck for promotional group managers: the manual generation and distribution of affiliate links. 

Built with a **Hybrid Architecture** (FastAPI Backend + Next.js/Tauri Frontend), this engine automatically intercepts raw product links, converts them into tracked Amazon and Mercado Livre affiliate links, and broadcasts them across Telegram and WhatsApp networks in milliseconds. 

As a commercial product, Pantero IA operates on a subscription-based model, helping clients scale their affiliate operations and increase their revenue entirely hands-free.

## 🚀 Core Features
* **Automated Affiliate Conversion:** Uses headless browser orchestration (Selenium) to dynamically convert raw URLs into monetized links for Amazon and Mercado Livre.
* **Cross-Platform Dispatching:** Seamlessly integrates with Telegram (via Telethon) and WhatsApp for automated lead engagement and high-volume content distribution.
* **SaaS Licensing & Fintech Integration:** Secure user authentication and license validation via **KeyAuth API**, featuring HWID-locking and subscription tier management for paying clients.
* **Ghost Mode Technology:** Implements low-level Windows API calls (`user32.dll`) to toggle application visibility, ensuring a discreet, background automation experience.
* **Live Analytics Dashboard:** Real-time monitoring of system resources (CPU/RAM), market share tracking, and transaction history, powered by a high-concurrency SQLite backend.

## 🏗️ System Architecture

The application utilizes a decoupled Client-Server architecture, running entirely on the user's local machine for maximum privacy and zero cloud-latency.

```text
[ React / TypeScript ] ---> (RESTful API via HTTP) ---> [ FastAPI / Uvicorn ]
    (Tauri Webview)                                       (Python Backend)
           |                                                     |
           v                                                     v
[ Local Config Store ] <=== (Data Sync / Logs) ===> [ Automation Engine ]
                                                         - Selenium (Web)
                                                         - Telethon (MTProto)
                                                         - SQLite (History)
```

## 🛠️ Technical Stack
* **Backend:** Python (FastAPI), Uvicorn, Multiprocessing, Asynchronous IO.
* **Frontend:** Next.js, React, TypeScript, Tailwind CSS, Tauri (Desktop Bridge).
* **Automation:** Selenium WebDriver, Telethon, Browser Driver Management.
* **Security:** Cryptographic session handling, Environment Variable isolation, hardware-locked licensing.

## ⚙️ Architecture Highlights
* **State Persistence:** Utilizes SQLite with WAL (Write-Ahead Logging) for reliable data integrity during heavy, concurrent automation tasks.
* **Asynchronous Design:** Leverages Python's `BackgroundTasks` to manage heavy browser operations without blocking the API response cycle.
* **Fault Tolerance:** Implements robust process management to handle browser crashes and session timeouts gracefully.

## 📺 Recruiter / Demo Mode
Since this is a proprietary enterprise tool with active paying customers, the backend execution environment and API keys are strictly restricted (`.env` isolated). 

However, the Next.js Frontend includes a **Demo Mode** for code evaluation:
1. Clone the repository and navigate to the `frontend` directory.
2. Run `npm install` and `npm run dev`.
3. On the login screen, click **"Recruiter? Auto-fill Demo Account"** to bypass the KeyAuth API and explore the dashboard UI and React architecture safely.
