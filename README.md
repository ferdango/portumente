# Por tu mente · Verano REC

Landing page del **taller de verano Verano REC** (Regula · Enseña · Conecta) de **Por tu mente**, construida con el manual de identidad de la marca.

🔗 **Sitio publicado:** https://ferdango.github.io/portumente/

## Contenido del taller

- **Fechas:** del 11 de enero al 26 de febrero de 2027
- **Edades:** 4 a 18 años · guardería + estimulación temprana por las mañanas (1 a 3 años)
- **Áreas:** Regula (terapia sensorial) · Enseña (atención y concentración) · Conecta (terapia de conducta)
- **También:** reforzamiento escolar con el enfoque «Primero regulo, luego enseño» (edades, cursos y horarios por WhatsApp)
- **Contacto:** WhatsApp 940 399 776 · Instagram @portu_mente · Av. Mariscal Castilla 263, Huacho (frente al colegio Cristo Rey)

## Estructura

```
index.html                 Página única (HTML semántico, accesible)
css/styles.css             Estilos y animaciones (tokens de color del manual)
js/init.js                 Inicialización temprana + protección anti-clickjacking
js/main.js                 Interacciones (scroll, formulario → WhatsApp, mapa, menú)
js/vendor/lenis.min.js     Desplazamiento suave (Lenis 1.1.20, MIT) alojado localmente
fonts/                     Inter variable (SIL OFL 1.1) alojada localmente
assets/                    Logotipo e isotipo en SVG, imagen para redes (og)
```

Sin dependencias de compilación: es HTML, CSS y JavaScript estático.

## Ver en local

```bash
python3 -m http.server 8080
```

Y abre http://localhost:8080

## Despliegue

GitHub Pages publica automáticamente la rama `master` (carpeta raíz). El archivo `.nojekyll` hace que los archivos se sirvan tal cual, sin procesarlos con Jekyll.

## Seguridad y privacidad

- **Content-Security-Policy estricta** (`default-src 'none'`, scripts y estilos solo del propio sitio, sin código en línea).
- **Sin terceros al cargar la página:** fuentes y librerías alojadas en el repositorio (no se envía la IP de los visitantes a CDNs ni a Google Fonts).
- **Mapa con consentimiento:** Google Maps solo se carga cuando la persona pulsa «Ver mapa», dentro de un iframe con `sandbox`.
- **Formulario sin servidor:** no guarda ni envía datos; solo arma el mensaje y abre WhatsApp. Pide el mínimo de datos (nombre del adulto y edad del menor, sin el nombre del menor) y limpia caracteres de control y de dirección de texto.
- **Enlaces externos** con `rel="noopener noreferrer"` y política de referer `strict-origin-when-cross-origin`.
- **Anti-clickjacking** por JavaScript (GitHub Pages no permite enviar `X-Frame-Options`).

Ver [SECURITY.md](SECURITY.md) para el detalle y cómo reportar vulnerabilidades.

## Licencias de terceros

- Lenis © darkroom.engineering — MIT (`js/vendor/LENIS-LICENSE.txt`)
- Inter © The Inter Project Authors — SIL Open Font License 1.1 (`fonts/INTER-OFL-LICENSE.txt`)

La marca, el logotipo y los contenidos pertenecen a Por tu mente.
