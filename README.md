<div align="center">
<img width="1200" height="475" alt="Radio Vesánico Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Radio Vesánico - Reproductor Web con Panel de Comentarios

Reproductor de radio en vivo con interfaz responsive, panel de comentarios integrado y sistema de lyrics. Diseñado con enfoque mobile-first, mantiene una experiencia de usuario coherente entre dispositivos móviles y desktop.

## 🚀 Ejecución Local

**Requisitos:** Node.js 18+

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Ejecutar en modo desarrollo:
   ```bash
   npm run dev
   ```

3. Abrir en el navegador: `http://localhost:3000`

## 📦 Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo (puerto 3000) |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |
| `npm run lint` | Verificación TypeScript |

## 🛠️ Stack Tecnológico

- **React 19** - Framework UI
- **TypeScript 5.8** - Tipado estático
- **Vite 6.2** - Build tool
- **Tailwind CSS v4** - Estilos
- **Framer Motion** - Animaciones
- **Lucide React** - Iconos

## 📁 Estructura del Proyecto

```
radio-O/
├── src/
│   ├── App.tsx           # Componente principal
│   ├── main.tsx          # Entry point
│   └── index.css         # Estilos globales
├── widget/
│   ├── panel/            # Plugin WordPress
│   └── voces/            # Widget React independiente
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🎯 Características

- ✅ Mini player sticky con controles básicos
- ✅ Reproductor a pantalla completa con vinilo animado
- ✅ Panel de comentarios "Voces del Subsuelo"
- ✅ Panel de lyrics con gestos táctiles
- ✅ Responsive design (mobile-first)
- ✅ Widget WordPress integrado

## 📄 Documentación

Ver [DOCUMENTACION.md](./DOCUMENTACION.md) para detalles técnicos completos.

## 📝 Licencia

Proyecto privado - Radio Vesánico © 2026
