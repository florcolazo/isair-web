# Assets — Archivos estáticos originales

Esta carpeta contiene los recursos estáticos del proyecto ISAIR.

## Estructura

```
assets/
├── images/   → Imágenes, logos y banners del sitio
└── pdfs/     → Documentos PDF (facturas, cupones, etc.)
```

## Nota

Los assets usados en producción por la app React se encuentran en:
- `frontend/public/` → accesibles en runtime desde `/`
- `frontend/src/assets/` → importados directamente por los componentes

Los archivos en esta carpeta son el **backup original** de los recursos del sitio estático anterior.
