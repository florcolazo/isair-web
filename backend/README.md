# Backend — ISAIR

> ⚠️ Esta carpeta es un **placeholder** para la futura API backend de ISAIR.

## Estado actual

Actualmente el sitio es **100% frontend**:
- El formulario de contratación envía los datos por **WhatsApp** directo al número de la agencia.
- El verificador de cobertura usa la API pública **Nominatim (OpenStreetMap)** para geocodificación.
- Los precios se cargan desde `frontend/public/precios.json`.

## Roadmap futuro

Cuando se implemente el backend, este directorio contendrá:

```
backend/
├── src/
│   ├── routes/         → Endpoints de la API
│   ├── services/       → Lógica de negocio
│   └── db/             → Conexión a base de datos
├── package.json
└── README.md
```

### Funcionalidades planificadas
- [ ] API de verificación de cobertura conectada a Gestion Real
- [ ] Gestión de solicitudes de contratación
- [ ] Integración con sistema de facturación
- [ ] Notificaciones automáticas por WhatsApp (WhatsApp Business API)
