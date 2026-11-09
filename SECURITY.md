# Política de seguridad

## Reportar una vulnerabilidad

Si encuentras un problema de seguridad o de privacidad en este sitio, **no abras un issue público**.
Repórtalo de forma privada desde la pestaña **Security → Report a vulnerability** de este repositorio
(GitHub Private Vulnerability Reporting). Te responderemos por ese mismo canal.

## Medidas implementadas

| Riesgo | Medida |
| --- | --- |
| Inyección de código (XSS) | CSP estricta en `<meta>`: `default-src 'none'`, `script-src 'self'`, `style-src 'self'`, sin `unsafe-inline`. El JavaScript no usa `innerHTML`, `eval` ni similares; todo texto del usuario se trata como texto. |
| Cadena de suministro | Sin CDNs en tiempo de ejecución. Lenis 1.1.20 y la fuente Inter se sirven desde el repositorio. SHA-256 de `js/vendor/lenis.min.js` (original de npm, antes de añadir el comentario de licencia y quitar la referencia al sourcemap): `978450a5e7638047c692941acdac7bc25e507289069d033f485569c42c4c7be3`; SHA-256 del archivo publicado: `66a21e9ff4b6cb94a06fbdc18d630e242880b9d01661975d4ccf25a0b881f3d5`. |
| Rastreo de visitantes por terceros | Ninguna petición a terceros al cargar la página. Google Maps se carga solo con el consentimiento explícito del visitante (botón «Ver mapa»). |
| Datos personales | El formulario no guarda, no registra y no envía datos a ningún servidor: arma un mensaje y abre WhatsApp para que la persona decida enviarlo. Pide solo nombre, celular (se valida como celular peruano de 9 dígitos), edad e interés; no se pide el nombre del menor. Se limitan longitudes y se eliminan caracteres de control y de dirección de texto (bidi). |
| Clickjacking | `js/init.js` oculta la página si se carga dentro de un iframe ajeno. |
| Fuga de referer / `window.opener` | `rel="noopener noreferrer"` en enlaces externos y `<meta name="referrer" content="strict-origin-when-cross-origin">`. |
| Iframe de terceros | El mapa se inserta con `sandbox` y solo se acepta una URL que empiece por `https://maps.google.com/`. |
| Envío de formularios a otros destinos | CSP `form-action 'none'` y `base-uri 'none'`. |
| Contenido mixto | CSP `upgrade-insecure-requests`; GitHub Pages con HTTPS obligatorio. |
| Metadatos en archivos | Imágenes sin metadatos EXIF/texto; SVG limpios (sin rutas ni datos del autor). |

## Limitaciones conocidas

GitHub Pages no permite configurar cabeceras HTTP propias. Por eso no se pueden enviar
`X-Frame-Options`/`frame-ancestors`, `Permissions-Policy`, `X-Content-Type-Options` ni una CSP por cabecera
(la CSP va en `<meta>`, que no admite `frame-ancestors`). Si en el futuro se usa un dominio propio,
se recomienda ponerlo detrás de un proxy (p. ej. Cloudflare) para añadir esas cabeceras.

## Configuración del repositorio

- Secret scanning y push protection activados.
- Alertas de Dependabot activadas.
- Reporte privado de vulnerabilidades activado.
- Rama `master` protegida contra force-push y eliminación.
