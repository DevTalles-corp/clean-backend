# Validadores del dominio

Aquí se definen reglas de validación pequeñas que comparten varias entidades, como comprobar que un identificador sea un UUID o que un enlace sea una URL http/https.

Existe para no duplicar estas reglas en cada módulo y garantizar que todas las entidades validen igual. Son funciones puras, sin dependencias externas.
