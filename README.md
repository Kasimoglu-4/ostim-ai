# 📚 Ostim.AI – Local LLM Chat & Document Platform

A full-stack application that lets you run Large-Language-Model (LLM) chat and document analysis **locally** via [Ollama](https://ollama.ai/).  
Backend is built with **Spring Boot 3 (Java 21)**, the web UI with **React 18** and **Material-UI 7**.

---

## 🎯 Project Goals

- **Local Privacy-First AI** – Run state-of-the-art language models entirely on your own machine via Ollama; no data ever leaves your network.
- **One-Stop Knowledge Hub** – Combine chat, document upload, and AI-powered extraction in a single UI.
- **Developer-Friendly** – Simple Spring Boot + React stack you can hack on, extend, or self-host.
- **Minimal Ops** – Ship as one JAR + a React build; MySQL can even run in Docker for quick spins.

## ⚙️ Technologies Used

| Layer | Stack |
|-------|-------|
| Backend | Java 21 • Spring Boot 3 • Spring Security • JWT • Spring Data JPA • MySQL 8 / H2 • Apache Tika • PDFBox • POI • Lombok • Maven |
| Frontend | React 18 • Material-UI 7 • React Router 6 • Axios • Emotion • Create-React-App |
| AI / DevOps | Ollama • Spring AI • Docker (optional for MySQL) • Node.js 18 • npm |

## 🔑 Key Features

- 💬 **LLM Chat** – Converse with any Ollama-compatible model (default: `deepseek-r1:1.5b`).
- 🗂 **Document Upload & Analysis** – PDF, DOCX, PPTX, TXT, images; text is extracted and routed to the LLM.
- 👥 **User Accounts & JWT Auth** – Sign-up, login, change password, delete account.
- 📝 **Multi-Chat Management** – Create, rename, delete chats; each chat keeps its own history.
- 👍 **Message Voting** – Up/down-vote AI answers for future ranking.
- 🎨 **Themes** – Dark, light, and sepia out of the box.
- 📊 **Server Monitoring** – Periodic reachability checks for each Ollama server with live status endpoints.

## 🧠 Skills Gained

Working on this project exercises and demonstrates:

- Crafting secure, RESTful APIs with Spring Boot, Security & JWT.
- Building responsive UIs with React 18, Material-UI and modern CSS variables.
- Integrating local Large-Language-Models using Spring AI and Ollama.
- Parsing and processing complex file formats with Apache Tika/PDFBox/POI.
- Managing state and side-effects in React using hooks and context providers.
- Implementing background tasks & scheduling in Spring (`@EnableScheduling`).
- Optimizing production bundles (code-splitting, minification, compression).
- Containerizing services (Dockerized MySQL) and environment configuration.

---

## ✨ What's in the Codebase

### Backend (`src/main/java/com/omer/ostim/ai`)

* **Authentication API** – JWT-secured login, sign-up, password change & account deletion (`/api/auth/*`).
* **Chat API** – create, list, update, delete chats; ask the LLM for a response (`/api/chat/*`).
* **Message Voting** – up/down-vote individual AI messages (`/api/vote/*`).
* **File Upload & Processing**
  * Upload files to a chat (`/api/files/*`).
  * Extract text with Apache Tika / PDFBox / POI and store it.
  * Send file content to the LLM for analysis (`/api/files/ai/*`).
* **Ollama Server Management** – keep a list of Ollama instances, regenerate access tokens, run reachability checks (`/api/server/*`).
* **Scheduled Monitoring** – `ServerMonitoringService` probes each Ollama server and updates its status.
* **Persistence** – Spring Data JPA with MySQL (H2 usable for tests).

### Front-End (`frontend/my-app`)

* React 18 app boot-strapped with Create-React-App.
* Material-UI components & icons.
* Dark, light **and** sepia themes (CSS variables in `App.css`).
* Pages & components for:
  * Authentication (Login / Sign-Up).
  * Chat list & chat window with streaming responses.
  * File uploader with drag-and-drop & progress bar.
  * Server status dashboard & settings sidebar.
* Axios service layer talking to the Spring Boot REST API.

---

## 🏗️ Project Layout

```
ostim.ai/
├── src/main/java/com/omer/ostim/ai        # Spring Boot application
│   ├── controller/                        # REST controllers
│   ├── service/                           # Business logic
│   ├── repository/                        # JPA repositories
│   ├── model/                             # Entities
│   ├── security/                          # JWT security config
│   └── config/                            # Misc. configuration
├── src/main/resources
│   ├── application.yaml                   # Spring configuration
│   └── static/                            # Static assets (non-CRA)
├── frontend/my-app                        # React application
│   ├── src/
│   └── public/
└── uploads/                               # File storage for uploads
```

---

## 🚀 Getting Started

### Prerequisites

* **Java 21**
* **Node.js 18** & npm
* **MySQL 8** (database `ostim_ai_db`)
* **Ollama** with at least one downloaded model (e.g. `deepseek-r1:1.5b`)

> 💡 **Tip** – If you prefer Docker, spin up a local MySQL instance with:

```bash
docker run -d --name ostim-mysql -e MYSQL_ROOT_PASSWORD=pass -e MYSQL_DATABASE=ostim_ai_db -p 3306:3306 mysql:8.0
```

The default JDBC URL in `application.yaml` expects the database to be reachable at `localhost:3306` with user `root` and an **empty** password. Adjust the values or the container env-vars as needed.

The backend auto-creates / updates tables (`spring.jpa.hibernate.ddl-auto=update`).

### 1. Clone & Configure

```bash
git clone <repo-url>
cd ostim.ai
```

Edit `src/main/resources/application.yaml` if you need to adapt database credentials or the Ollama base URL (`http://localhost:11434/` by default).

### 2. Start the Backend

```bash
mvn spring-boot:run
# ⇒  http://localhost:9191
```

### 3. Start the Frontend

```bash
cd frontend/my-app
npm ci
npm start            # ⇒  http://localhost:3000
```

### 4. Run Ollama

```bash
ollama serve &
ollama pull deepseek-r1:1.5b   # or any other model you like
```

Uploaded files are stored on disk under the directory set in `application.yaml`:

```yaml
file:
  upload-dir: ./uploads
```

Make sure the process has write permission there (or change the path).

Open the browser at `http://localhost:3000`, sign-up, create a chat and start talking to the model running **locally**.

---

## 🛠️ Building for Production

```bash
# Build & minify the React app
cd frontend/my-app
npm run build

# Copy the build artefacts into the backend's static folder
cp -R build/* ../../src/main/resources/static/

# Build a single-jar executable
cd ../../
mvn clean package
java -jar target/ostim.ai-0.0.1-SNAPSHOT.jar
```
The site will now be served by Spring Boot on `http://localhost:9191` without the separate React dev server.

---

## 🌐 Quick API Reference

| Area | Method & Path |
|------|---------------|
| **Auth** | `POST /api/auth/login`, `POST /api/auth/signup`, `POST /api/auth/change-password`, `DELETE /api/auth/delete-account`, `GET /api/auth/validate-token` |
| **Chat** | `POST /api/chat`, `GET /api/chat`, `GET /api/chat/{id}`, `DELETE /api/chat/{id}`, `PUT /api/chat/{id}/title`, `POST /api/chat/generate` |
| **Files** | `POST /api/files/upload`, `GET /api/files/chat/{chatId}`, `DELETE /api/files/{fileId}` |
| **Messages** | `POST /api/message`, `GET /api/message/chat/{chatId}`, `GET /api/message/{id}`, `DELETE /api/message/{id}` |
| **Votes** | `POST /api/vote`, `GET /api/vote/chat/{chatId}` |
| **Servers** | `POST /api/server`, `GET /api/server`, `GET /api/server/{id}`, `DELETE /api/server/{id}`, `PUT /api/server/{id}/status`, `PUT /api/server/{id}/token` |

See the individual controller classes for full request/response details.

---

## ⚖️ License

This codebase is provided for educational & research purposes. All responsibility for the use of local LLM models stays with the user.