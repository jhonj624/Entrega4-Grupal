## Intrucciones

## Descripción

Este código permite la creación de cursos de extensión y la inscripción a ellos por parte del público, además envia notificaciones por correo electronico y tiene chat para el contacto entre aspirantes

## Requisitos para modo local

1. Antes de iniciar realizar la instalación de npm: npm install
2. Crear en la carpeta config/ el archivo sg_key.js y
   agregar la linea: process.env.SG_KEY = "" con una clave sendgrid funcional

## Ejemplo de uso

1. Ejecutar la aplicación: node src/app
2. En el navegador escribir: http://localhost:3000/
3. Comenzar a interactuar con la aplicación: El usuario de administrador/coordinador es nombre: isabel documento: 123
4. En heroku el usuario admin es jhon clave 11
