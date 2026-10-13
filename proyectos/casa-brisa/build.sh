#!/bin/bash
# Une las piezas de src/ en dos archivos:
#   casa-brisa.html -> cuerpo de página para publicar como artefacto (sin <html>/<head>)
#   index.html      -> página completa, se abre directo en el navegador
set -e
cd "$(dirname "$0")"
JS="src/01-core.js src/02-materials.js src/03-builder.js src/04-house.js src/05-furniture.js src/06-exterior.js src/07-env.js src/08-app.js"
{ cat src/shell.html; echo '<script type="module">'; cat $JS; echo '</script>'; } > casa-brisa.html
{ echo '<!doctype html>'; echo '<html lang="es">'; echo '<head>'; echo '<meta charset="utf-8">'; echo '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'; echo '</head>'; echo '<body>'; cat casa-brisa.html; echo '</body>'; echo '</html>'; } > index.html
rm casa-brisa.html
echo "index.html listo"
