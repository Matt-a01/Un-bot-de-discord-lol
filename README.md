# Base de Bot de Discord (Node.js + TypeScript)

Base modular para un bot de Discord desarrollada con **Node.js**, **TypeScript**, **discord.js v14** y **@discordjs/voice**.

Soporta comandos híbridos (**Slash Commands `/`** y **Comandos por Prefijo `!`**) e incluye un sistema exclusivo para que el bot se conecte y **permanezca** en el canal de voz donde se encuentre el **Owner**.

---

## Características

- **Soporte Dual (Slash + Prefix):** Cada comando funciona tanto con `/` como con el prefijo configurado (por defecto `!`) y soporta alias.
- **Permanencia en Llamadas del Owner (`OWNER_ID`):**
  - **Al invocar Slash Commands:** Cuando el Owner invoca al bot mediante Slash Commands (`/join`, `/autovoice`, `/ping`, etc.), el bot se une a su canal de voz y **se queda en el VC** de forma permanente (no se sale aunque el Owner abandone la llamada y se reconecta automáticamente ante caídas de red) hasta que se use explícitamente `/leave` o `!leave`.
  - `/join [canal]` o `!join` (`!unirse`, `!vc`, `!conectar`, `!stay`, `!quedarse`): Conecta al bot al canal de voz donde está el Owner (o al canal indicado) y hace que permanezca en él.
  - `/leave` o `!leave` (`!salir`, `!dc`, `!desconectar`): Único comando que desconecta al bot del canal de voz y desactiva su permanencia en ese canal.
  - `/autovoice` o `!autovoice` (`!seguirme`, `!autofollow`): Activa o desactiva que el bot te siga automáticamente cuando entres o cambies de canal de voz, quedándose en el último canal al que entró.
  - **Protección `ownerOnly`:** Solo el usuario cuyo ID coincida con `OWNER_ID` puede ejecutar los comandos de voz.
- **Comandos Base:**
  - `/ping` o `!ping` (`!latencia`): Comprueba la latencia de mensajes y del WebSocket.

---

## Requisitos Previos

1. **Node.js** v18 o superior.
2. En el [Discord Developer Portal](https://discord.com/developers/applications):
   - Activar **Message Content Intent** y **Server Members Intent** en la sección **Bot > Privileged Gateway Intents**.

---

## Configuración e Instalación

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Copia el archivo `.env.example` a `.env` y completa tus datos:
   ```bash
   cp .env.example .env
   ```

3. Ejecuta el bot en modo desarrollo:
   ```bash
   npm run dev
   ```

4. Para compilar a JavaScript (`dist/`) y ejecutar en producción:
   ```bash
   npm run build
   npm start
   ```
