# Radio Vesánico - Reproductor Web con Panel de Comentarios

## 📋 Descripción General

Reproductor de radio en vivo con interfaz responsive, panel de comentarios integrado y sistema de lyrics. Diseñado con enfoque mobile-first, mantiene una experiencia de usuario coherente entre dispositivos móviles y desktop.

**Versión:** 1.0.0  
**Autor:** Radio Vesánico Team  
**Licencia:** Propietario

---

## 🎯 Características Principales

### 1. **Mini Reproductor Sticky**
- Visible en toda la navegación
- Control de reproducción y volumen
- Indicador de estado (playing/paused)
- Botón de comentarios integrado
- Detección automática de barra de navegación móvil (VisualViewport API)

### 2. **Reproductor a Pantalla Completa**
- Se activa desde el mini player o botón "ESCUCHAR EN VIVO"
- Portada de álbum en formato vinilo giratorio
- Controles de volumen, play/pause, comentarios y like
- Gestos táctiles para navegación

### 3. **Panel de Comentarios "Voces del Subsuelo"**
- **Mobile:** Overlay deslizante desde la derecha
- **Desktop:** Panel integrado que empuja el contenido
- Formulario con alias y comentario
- Lista de comentarios con timestamps
- Swipe para cerrar (derecha en mobile)

### 4. **Panel de Lyrics**
- Pantalla completa desde abajo
- Contenido scrolleable
- Swipe hacia abajo para cerrar

---

## 🏗️ Arquitectura de Componentes

```
App (Main)
├── Navbar (con menú hamburguesa responsive)
├── MiniPlayer (sticky, z-100)
├── FullScreenPlayer (z-60)
│   ├── Header
│   ├── Player Content
│   │   ├── Album Art (vinilo animado)
│   │   ├── Track Info
│   │   └── Controls (volume, play, heart)
│   ├── Lyrics Button
│   ├── Mobile Swipe Indicator (md:hidden)
│   └── CommentsPanel Desktop (children)
├── CommentsPanel
│   ├── Desktop (hidden md:flex, w-400px)
│   └── Mobile Overlay (md:hidden, z-120)
├── Desktop Comments Indicator (fixed, hidden md:flex)
└── LyricsPanel (z-80)
```

---

## 🔄 Estados Globales (App Component)

```typescript
const [miniPlayerOpen, setMiniPlayerOpen] = useState(false);
const [fullScreenPlayerOpen, setFullScreenPlayerOpen] = useState(false);
const [commentsPanelOpen, setCommentsPanelOpen] = useState(false);
const [lyricsPanelOpen, setLyricsPanelOpen] = useState(false);
const [isPlaying, setIsPlaying] = useState(false);
const [volume, setVolume] = useState(75);
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
const [squarePlayerVisible, setSquarePlayerVisible] = useState(false);
const [isDesktop, setIsDesktop] = useState(false);
```

### Estados Derivados
```typescript
// Mini player solo visible si no está el square player en viewport (desktop)
const showMiniPlayer = miniPlayerOpen && !fullScreenPlayerOpen && (!isDesktop || !squarePlayerVisible);
```

---

## 📱 Responsive Design

### Breakpoints (Tailwind)
- **Mobile:** < 768px
- **Tablet:** 768px - 1023px
- **Desktop:** ≥ 1024px

### Comportamiento por Vista

#### Mobile (< 768px)
| Elemento | Comportamiento |
|----------|---------------|
| Mini Player | Siempre visible cuando activo |
| Full Screen Player | Ocupa 100% viewport |
| Comments Panel | Overlay deslizante (z-120) |
| Comments Indicator | Dentro del player, lateral derecho |
| Lyrics Button | Abajo, centrado |

#### Desktop (≥ 768px)
| Elemento | Comportamiento |
|----------|---------------|
| Mini Player | Visible solo si square player no está en viewport |
| Full Screen Player | Flex row con panel lateral |
| Comments Panel | Integrado (w-400px), empuja contenido |
| Comments Indicator | Fixed fuera del player, desaparece al abrir |
| Lyrics Button | Se mueve con el contenido (md:bottom-12) |

---

## 👆 Interacciones y Gestos

### Mini Player
| Acción | Resultado |
|--------|-----------|
| Click en track info | Abre Full Screen Player |
| Click play/pause | Toggle reproducción |
| Click volumen | Muestra slider emergente |
| Click comentarios | Abre panel (desktop: abre FS + panel) |
| Click X | Cierra mini player |

### Full Screen Player
| Acción | Resultado |
|--------|-----------|
| Swipe arriba | Abre Lyrics Panel |
| Swipe izquierda | Abre Comments Panel |
| Click "ABRIR LYRICS" | Abre Lyrics Panel |
| Click indicador VOCES | Abre Comments Panel |
| Click X | Cierra FS + comentarios |

### Comments Panel Desktop
| Acción | Resultado |
|--------|-----------|
| Click X | Cierra panel, contenido vuelve a posición original |
| Click botón en mini player | Toggle panel |

### Comments Panel Mobile
| Acción | Resultado |
|--------|-----------|
| Swipe derecha | Cierra panel |
| Click X | Cierra panel |
| Click backdrop | Cierra panel |

### Lyrics Panel
| Acción | Resultado |
|--------|-----------|
| Swipe abajo | Cierra panel |
| Click X | Cierra panel |
| Click backdrop | Cierra panel |

---

## 🎨 Z-Index Hierarchy

```
z-[120] - Comments Panel Mobile Overlay
z-[110] - Comments Panel Mobile Backdrop
z-[100] - Mini Player Sticky
z-[90]  - Navbar
z-[80]  - Lyrics Panel
z-[70]  - Desktop Comments Indicator
z-[60]  - Full Screen Player
z-[50]  - Contenido principal
z-10    - Elementos decorativos
```

---

## 🔧 Layout Desktop - Panel de Comentarios

### Estructura Flex
```jsx
<motion.div className="flex flex-col md:flex-row">
  {/* Contenido Principal */}
  <div className="flex-1 flex flex-col min-w-0">
    {/* Player content */}
  </div>

  {/* Panel Desktop (400px cuando abierto) */}
  {children}
</motion.div>
```

### Comportamiento
- **Panel cerrado:** Contenido ocupa 100% del ancho
- **Panel abierto:** Contenido = viewport - 400px
- **No hay margen duplicado:** El layout es natural con flexbox

### Indicador Desktop
```jsx
<motion.div className="fixed right-8 ...">
  {/* Fuera del layout, no se mueve */}
</motion.div>
```
- `fixed`: Posicionado relativo al viewport
- `opacity-0` cuando panel abierto
- `opacity-100` cuando panel cerrado

---

## 📐 VisualViewport API - Mobile

### Detección de Barra de Navegación
```typescript
useEffect(() => {
  const handleViewportChange = () => {
    const visualHeight = window.visualViewport.height;
    const windowHeight = window.innerHeight;
    const difference = windowHeight - visualHeight;

    if (difference > 50) {
      setBottomOffset(difference + 10); // Barra visible
    } else {
      setBottomOffset(0); // Barra oculta
    }
  };

  window.visualViewport.addEventListener('resize', handleViewportChange);
  window.visualViewport.addEventListener('scroll', handleViewportChange);
}, []);
```

### Resultado
- Mini player siempre visible sobre la barra del navegador
- Ajuste dinámico del `bottom` property
- Padding extra para safe-area iOS

---

## 🎯 Intersection Observer - Square Player

### Detección de Visibilidad
```typescript
useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      setSquarePlayerVisible(entry.isIntersecting);
    },
    { threshold: 0.5 } // 50% visible
  );

  if (squarePlayerRef.current) {
    observer.observe(squarePlayerRef.current);
  }

  return () => observer.disconnect();
}, []);
```

### Comportamiento
- **Square player visible:** Mini player oculto (desktop)
- **Square player no visible:** Mini player visible
- **Mobile:** Mini player siempre visible

---

## 🎨 Animaciones

### Vinyl Spin
```css
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin-slow {
  animation: spin-slow linear infinite;
  animation-duration: 8s;
}
```

### Panel Slide
```typescript
<motion.div
  initial={{ x: '100%' }}
  animate={{ x: 0 }}
  exit={{ x: '100%' }}
  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
>
```

### Indicator Pulse
```typescript
<motion.div
  animate={{ x: [-5, 0, -5] }}
  transition={{ repeat: Infinity, duration: 1.5 }}
>
```

---

## 📂 Estructura de Archivos

```
radio-O/
├── src/
│   ├── App.tsx          # Componente principal con todos los estados
│   ├── main.tsx         # Entry point
│   └── index.css        # Estilos globales + animaciones custom
├── widget/
│   ├── panel/           # Plugin WordPress
│   │   ├── vesanico-chat.php
│   │   └── assets/
│   └── voces/           # Widget React independiente
│       ├── components/
│       ├── services/
│       └── types.ts
├── package.json
├── vite.config.ts
├── tsconfig.json
└── DOCUMENTACION.md
```

### Dependencias Clave
- `motion`: Animaciones y gestos (Framer Motion)
- `lucide-react`: Iconos
- `react`: Hooks y componentes
- `tailwindcss`: Utility classes

---

## 🚀 Flujo de Usuario Típico

### Desktop
1. Usuario visita sitio → ve square player en hero
2. Click "ESCUCHAR EN VIVO" → abre Full Screen Player
3. Click indicador "VOCES DEL SUBSUELO" → panel se abre (400px)
4. Contenido se empuja exactamente 400px
5. Indicador desaparece (opacity-0)
6. Usuario escribe comentario → envía
7. Click X → panel cierra, contenido vuelve

### Mobile
1. Usuario visita sitio → ve square player
2. Scroll hacia abajo → square player sale del viewport
3. Mini player aparece automáticamente
4. Click en track info → Full Screen Player
5. Swipe izquierda → Comments Panel overlay
6. Swipe derecha → cierra panel
7. Swipe arriba → Lyrics Panel
8. Swipe abajo → cierra panel

---

## ⚠️ Consideraciones Técnicas

### 1. **Evitar Render Duplicado**
```jsx
// ❌ INCORRECTO
<CommentsPanel isDesktop={false} /> // Siempre renderizado
<CommentsPanel isDesktop={true} />  // Siempre renderizado

// ✅ CORRECTO
<div className="md:hidden">
  <CommentsPanel isDesktop={false} />
</div>
{fullScreenPlayerOpen && (
  <CommentsPanel isDesktop={true} />
)}
```

### 2. **Children vs Props**
```jsx
// Panel desktop como children para layout flex natural
<FullScreenPlayer>
  <CommentsPanel isDesktop={true} />
</FullScreenPlayer>
```

### 3. **Conditional Rendering con Animaciones**
```jsx
// Usar AnimatePresence para animaciones de entrada/salida
<AnimatePresence>
  {isOpen && <Panel />}
</AnimatePresence>
```

---

## 🎨 Paleta de Colores

```css
--bg-base: #f2f2f2;      /* Fondo principal */
--ink: #0f0f0f;          /* Texto principal */
--accent: #d90429;       /* Acento rojo */
--surface: #ffffff;      /* Superficies */
```

---

## 📝 Notas de Implementación

### Mobile-First
- Todas las clases base son para mobile
- `md:` prefix para desktop
- `hidden md:flex` para mostrar solo en desktop

### Performance
- `useEffect` cleanup para event listeners
- IntersectionObserver disconnect
- Conditional rendering para evitar mounts innecesarios

### Accesibilidad
- `aria-label` en botones icono
- Focus states en inputs
- Keyboard navigation soportada

---

## 🔍 Debugging Tips

### Verificar Z-Index
```jsx
// En DevTools, buscar elementos con z-[100+]
// Asegurar que overlays estén por encima del contenido
```

### Verificar Layout Desktop
```jsx
// El panel desktop debe tener: hidden md:flex
// El contenedor mobile debe tener: md:hidden
```

### Verificar Estados
```typescript
// Agregar console.log en handlers
const handleOpenComments = () => {
  console.log('Opening comments...', { fullScreenPlayerOpen, commentsPanelOpen });
  // ...
};
```

---

## 📞 Soporte

Para issues relacionados con:
- **Layout duplicado:** Verificar condiciones `md:hidden` y `hidden md:flex`
- **Z-Index:** Revisar jerarquía en la tabla de z-index
- **Gestos táctiles:** Verificar que framer-motion esté instalado
- **VisualViewport:** Solo funciona en navegadores móviles modernos

---

## 📄 Licencia

Proyecto privado - Radio Vesánico © 2026
