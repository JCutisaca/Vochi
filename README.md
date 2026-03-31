<div align="center">

<img src="vochi-front/public/logo.svg" alt="Vochi" width="80" />

# Vochi — Tu entrenador de entrevistas con IA en tiempo real

**Practica entrevistas laborales con un entrevistador de inteligencia artificial que habla, escucha y te da feedback instantáneo.**

[![Demo en vivo](https://img.shields.io/badge/Demo-vochi.soldierty.app-00C853?style=for-the-badge&logo=vercel&logoColor=white)](https://vochi.soldierty.app)
[![Desplegado en CubePath](https://img.shields.io/badge/Hosting-CubePath-6C5CE7?style=for-the-badge&logo=cloud&logoColor=white)](https://cubepath.com)
[![Hackatón CubePath 2026](https://img.shields.io/badge/Hackat%C3%B3n-CubePath%202026-FF6B6B?style=for-the-badge&logo=trophy&logoColor=white)](https://github.com/midudev/hackaton-cubepath-2026)

</div>

---

## 📖 Tabla de contenido

- [🎯 ¿Qué es Vochi?](#-qué-es-vochi)
- [✨ Características](#-características)
- [🖼️ Capturas de pantalla](#%EF%B8%8F-capturas-de-pantalla)
- [🏗️ Arquitectura](#%EF%B8%8F-arquitectura)
- [🛠️ Tech Stack](#%EF%B8%8F-tech-stack)
- [☁️ Despliegue en CubePath](#%EF%B8%8F-despliegue-en-cubepath)
- [🚀 Instalación local](#-instalación-local)
- [📁 Estructura del proyecto](#-estructura-del-proyecto)
- [👤 Autor](#-autor)

---

## 🎯 ¿Qué es Vochi?

Vochi es una plataforma web que simula **entrevistas laborales en tiempo real** usando inteligencia artificial por voz. Pegas una oferta de empleo, seleccionas el tipo de entrevista (técnica o de RRHH) y un entrevistador IA comienza a hacerte preguntas hablando contigo como lo haría un reclutador real.

Al terminar, recibes un **feedback detallado** con puntuación, fortalezas, áreas de mejora y consejos accionables para tu próxima entrevista.

### El problema que resuelve

- 😰 Muchos candidatos pierden oportunidades por nervios o falta de práctica
- 🕐 Es difícil encontrar alguien que te haga una entrevista de prueba
- 🤷 Sin feedback, no sabes qué mejorar

### La solución

- 🎙️ Entrevistas conversacionales por voz con IA, disponibles 24/7
- 📋 Solo tienes que pegar la descripción del puesto
- 📊 Feedback estructurado al instante con score y recomendaciones

---

## ✨ Características

| Función                                  | Descripción                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------------------ |
| 🎙️ **Entrevista por voz en tiempo real** | Conversación natural con WebRTC + OpenAI Realtime API                          |
| 🧠 **Dos modos de entrevista**           | Técnica (preguntas de código/arquitectura) o RRHH (conductuales/situacionales) |
| 📋 **Basada en la oferta real**          | Pega la descripción del puesto y la IA se adapta al rol                        |
| ✅ **Validación inteligente**            | Verifica que el texto pegado sea una oferta real antes de empezar              |
| 📝 **Transcripción en vivo**             | Ve lo que dices y lo que dice la IA en tiempo real                             |
| 📊 **Feedback con IA**                   | Score general, fortalezas, debilidades y consejos al terminar                  |
| 🔊 **Visualizador de voz**               | Indicador visual de actividad del micrófono con Web Audio API                  |
| ⏱️ **Timer de entrevista**               | Duración en tiempo real visible en la navbar                                   |
| 📱 **Responsive**                        | Funciona en desktop y móvil                                                    |
| 🔐 **Autenticación**                     | Login con Google vía Firebase Auth                                             |
| 📚 **Historial**                         | Revisa tus entrevistas pasadas y su feedback                                   |

---

## 🖼️ Capturas de pantalla

<div align="center">

|            Landing             |           Setup            |
| :----------------------------: | :------------------------: |
| ![Landing](readme/landing.png) | ![Setup](readme/setup.png) |

|        Setup — Oferta validada        |         Entrevista en vivo          |
| :-----------------------------------: | :---------------------------------: |
| ![Setup validado](readme/setup-1.png) | ![Entrevista](readme/interview.png) |

|             Feedback             |
| :------------------------------: |
| ![Feedback](readme/feedback.png) |

</div>

---

## 🏗️ Arquitectura

### ¿Por qué un backend separado con NestJS?

> **Next.js no soporta WebSockets nativos** en sus API Routes / Server Actions. Para una entrevista en vivo necesitamos 3 canales simultáneos que corran en paralelo:

| Canal                    | Protocolo     | Propósito                                        |     ¿Next.js lo soporta?      |
| ------------------------ | ------------- | ------------------------------------------------ | :---------------------------: |
| 🎙️ Voz bidireccional     | **WebRTC**    | Audio en tiempo real entre el usuario y OpenAI   | ⚠️ Solo el SDP inicial (REST) |
| 💬 Transcripción en vivo | **Socket.IO** | Persistir cada mensaje al instante en PostgreSQL | ❌ No soporta WS persistentes |
| 🔐 REST API              | **HTTP**      | CRUD entrevistas, feedback, auth, validación     |             ✅ Sí             |

**NestJS** nos da WebSocket Gateways de primera clase (`@nestjs/websockets`), guards reutilizables, inyección de dependencias y un ciclo de vida perfecto para manejar los 3 canales desde un solo servidor.

---

### Diagrama de arquitectura

<div align="center">
  <img src="readme/diagram.svg" alt="Arquitectura de Vochi" width="100%" />
</div>

---

### 🔄 Flujo completo de una entrevista

<table>
<tr>
<td align="center" width="33%">

#### 📋 Fase 1 — Setup

</td>
<td align="center" width="33%">

#### 🎙️ Fase 2 — Entrevista en vivo

</td>
<td align="center" width="33%">

#### 📊 Fase 3 — Feedback

</td>
</tr>
<tr>
<td>

1. Usuario pega la **oferta de empleo**
2. `POST /validate-job` → **Groq** verifica que sea real y extrae rol + empresa
3. Elige tipo: **Técnica** o **RRHH**
4. `POST /interviews` → Se crea la entrevista en **PostgreSQL**

</td>
<td>

5. `POST /live/token` → NestJS pide un **ephemeral token** a OpenAI con el prompt correspondiente
6. El browser abre una **conexión WebRTC** directa con OpenAI Realtime
7. 🗣️ **Audio bidireccional** — el usuario habla, la IA responde por voz
8. Cada frase se transcribe y se persiste vía **Socket.IO** → PostgreSQL

</td>
<td>

9. Usuario clic **"Terminar entrevista"**
10. `GET /feedback` → NestJS envía toda la conversación a **Groq (LLaMA 3)**
11. Groq analiza y devuelve: **score**, fortalezas, mejoras y consejos
12. Se muestra el **feedback** al usuario

</td>
</tr>
<tr>
<td align="center">

`Next.js` → `NestJS` → `Groq` → `PostgreSQL`

</td>
<td align="center">

`Browser` ↔ `OpenAI` (WebRTC) + `NestJS` (Socket.IO)

</td>
<td align="center">

`NestJS` → `Groq` → `PostgreSQL` → `Next.js`

</td>
</tr>
</table>

---

### ¿Por qué esta arquitectura?

| Decisión                               | Justificación                                                                                                                 |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **WebRTC directo Browser ↔ OpenAI**    | El audio **nunca pasa por nuestro servidor** → latencia mínima (~200ms), sin costos de ancho de banda                         |
| **NestJS como backend**                | WebSocket Gateway nativo para Socket.IO, guards reutilizables, DI — Next.js API Routes no soportan conexiones WS persistentes |
| **Socket.IO para transcripciones**     | Cada frase se persiste en PostgreSQL en tiempo real, sin esperar a que termine la entrevista                                  |
| **Groq (LLaMA 3) para feedback**       | Procesamiento de texto ultra-rápido (~2s) y económico para analizar la conversación completa                                  |
| **OpenAI Realtime con Stored Prompts** | Los prompts se gestionan en el dashboard de OpenAI → iteración rápida sin re-deploy                                           |
| **Firebase Auth**                      | Google Sign-In en 1 clic, sin contraseñas, token verificado tanto en REST como en WebSocket                                   |
| **Prisma 7 + PostgreSQL**              | Type-safe queries, migraciones automáticas, alojado en CubePath                                                               |
| **Todo en CubePath**                   | Frontend, backend y base de datos en un solo proveedor → simplicidad operativa                                                |

---

## 🛠️ Tech Stack

### Frontend — `vochi-front/`

| Tecnología           | Uso                                             |
| -------------------- | ----------------------------------------------- |
| **Next.js 16**       | Framework React con App Router y SSR            |
| **React 19**         | UI reactiva con hooks                           |
| **TypeScript**       | Tipado estático                                 |
| **Tailwind CSS 4**   | Estilos utility-first                           |
| **Radix UI**         | Componentes accesibles (dialogs, selects, etc.) |
| **Framer Motion**    | Animaciones fluidas                             |
| **Firebase Auth**    | Autenticación con Google                        |
| **Socket.IO Client** | Comunicación en tiempo real con el backend      |
| **Web Audio API**    | Visualización de audio del micrófono            |
| **WebRTC**           | Audio bidireccional con OpenAI Realtime         |

### Backend — `vochi-back/`

| Tecnología              | Uso                                            |
| ----------------------- | ---------------------------------------------- |
| **NestJS 11**           | Framework Node.js modular                      |
| **TypeScript**          | Tipado estático                                |
| **Prisma 7**            | ORM para PostgreSQL                            |
| **PostgreSQL**          | Base de datos relacional                       |
| **Socket.IO**           | WebSockets para transcripción en vivo          |
| **Firebase Admin**      | Verificación de tokens de autenticación        |
| **OpenAI Realtime API** | Entrevistador IA por voz                       |
| **Groq (LLaMA)**        | Generación de feedback y validación de ofertas |

---

## ☁️ Despliegue en CubePath

Vochi está 100% desplegado en **[CubePath](https://cubepath.com)** usando un servidor con **[Dokploy](https://dokploy.com/)** como plataforma de gestión, con subdominios para cada servicio.

### Infraestructura en CubePath

| Servicio             | Subdominio                | Tecnología | Descripción                                  |
| -------------------- | ------------------------- | ---------- | -------------------------------------------- |
| 🌐 **Frontend**      | `vochi.soldierty.app`     | Next.js 16 | App React con SSR, servida con `pnpm start`  |
| ⚙️ **Backend**       | `api.vochi.soldierty.app` | NestJS 11  | API REST + WebSocket Gateway (Socket.IO)     |
| 🗄️ **Base de datos** | Interna (no expuesta)     | PostgreSQL | Conectada vía Prisma, gestionada por Dokploy |

### ¿Cómo se usa CubePath?

1. **Un servidor CubePath** con Dokploy instalado como panel de gestión
2. **Dokploy gestiona 2 servicios** desde el mismo servidor:
   - Contenedor del frontend (Next.js)
   - Contenedor del backend (NestJS)
3. **PostgreSQL** externo conectado vía `DATABASE_URL`
4. **Subdominios** configurados vía Dokploy con SSL automático (Let's Encrypt)
5. **Variables de entorno** gestionadas desde el panel de Dokploy para cada servicio

### Pasos de despliegue

1. **Crear cuenta** en [CubePath](https://midu.link/cubepath) (15$ gratis) y levantar un servidor
2. **Instalar Dokploy** en el servidor CubePath
3. **Crear servicio PostgreSQL** en Dokploy → copiar `DATABASE_URL` interna
4. **Desplegar Backend** — Conectar repo Git, configurar variables de entorno:
   - `DATABASE_URL` — Conexión PostgreSQL interna
   - `FIREBASE_*` — Credenciales Firebase
   - `OPENAI_API_KEY` — API key de OpenAI
   - `GROQ_API_KEY` — API key de Groq
   - `FRONTEND_URL` — `https://vochi.soldierty.app`
5. **Desplegar Frontend** — Conectar repo Git, configurar:
   - `NEXT_PUBLIC_API_URL` — `https://api.vochi.soldierty.app`
   - `NEXT_PUBLIC_FIREBASE_*` — Config Firebase
6. **Configurar subdominios** en Dokploy con SSL automático
7. **Ejecutar migraciones** — `pnpm prisma migrate deploy` desde el contenedor del backend

---

## 🚀 Instalación local

### Requisitos previos

- **Node.js** ≥ 20
- **pnpm** ≥ 9
- **PostgreSQL** (local o remoto)
- Cuentas en: **Firebase**, **OpenAI**, **Groq**

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/vochi.git
cd vochi
```

### 2. Backend

```bash
cd vochi-back
pnpm install

# Crear archivo .env con las variables necesarias:
# DATABASE_URL=postgresql://user:pass@localhost:5432/vochi
# FIREBASE_PROJECT_ID=...
# OPENAI_API_KEY=...
# OPENAI_REALTIME_PROMPT_ID_TECHNICAL=...
# OPENAI_REALTIME_PROMPT_ID_RRHH=...
# GROQ_API_KEY=...

# Ejecutar migraciones
pnpm prisma migrate deploy

# Iniciar en modo desarrollo
pnpm run start:dev
```

### 3. Frontend

```bash
cd vochi-front
pnpm install

# Crear archivo .env.local con:
# NEXT_PUBLIC_API_URL=http://localhost:3001
# NEXT_PUBLIC_FIREBASE_*=...

# Iniciar en modo desarrollo
pnpm run dev
```

La app estará disponible en `http://localhost:3000`.

---

## 📁 Estructura del proyecto

```
vochi/
├── README.md                  ← Este archivo
├── vochi-front/               ← Frontend (Next.js 16)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (landing)/     ← Landing page pública
│   │   │   ├── (auth)/        ← Login con Google
│   │   │   ├── (main)/        ← App autenticada
│   │   │   │   ├── setup/     ← Pegar oferta + tipo
│   │   │   │   ├── interview/ ← Entrevista en vivo
│   │   │   │   ├── feedback/  ← Resultados + score
│   │   │   │   └── history/   ← Historial
│   │   │   ├── privacy/       ← Política de privacidad
│   │   │   └── terms/         ← Términos de uso
│   │   ├── components/        ← Componentes UI reutilizables
│   │   ├── hooks/             ← Custom hooks (voz, auth, etc.)
│   │   ├── lib/               ← Utilidades y servicios
│   │   └── providers/         ← Context providers
│   └── public/                ← Assets estáticos
│
└── vochi-back/                ← Backend (NestJS 11)
    ├── src/
    │   ├── auth/              ← Firebase Auth guard
    │   ├── interviews/        ← CRUD de entrevistas + feedback
    │   ├── messages/          ← Mensajes de transcripción
    │   ├── live/              ← WebSocket gateway (transcripción)
    │   ├── validate-job/      ← Validación de ofertas con IA
    │   └── ai/                ← Servicio Groq
    └── prisma/
        └── schema.prisma      ← Modelos de datos
```

---

## 👤 Autor

Desarrollado por **Jhonathan Cutisaca** para la [Hackatón CubePath 2026](https://github.com/midudev/hackaton-cubepath-2026).

---

<div align="center">

**[🌐 Probar Vochi](https://vochi.soldierty.app)** · **[☁️ CubePath](https://cubepath.com)**

Hecho con ❤️

</div>
