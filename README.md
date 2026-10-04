# ASTRA Desktop

Aplicación desktop con interfaz moderna, chat en tiempo real y navegador embebido.

## Requisitos

- Node.js 18+
- npm

## Ejecutar

```bash
npm install
npm run dev
```

Abre:

```bash
http://localhost:5173
```

## Back-end esperado

La app usa WebSocket en:

```text
ws://localhost:8000/ws/<room>
```

Por ejemplo:

```text
ws://localhost:8000/ws/general
```

## Construcción de producción

```bash
npm run build
```

## Notas

- La interfaz de login está lista.
- El chat se conecta al backend de ASTRA Core.
- El navegador embebido permite abrir una URL dentro de la app.
- El diseño está pensado para ser una base de escritorio premium.
