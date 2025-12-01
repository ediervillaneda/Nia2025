# Nia2025

Este proyecto es una aplicación web construida con [Angular](https://github.com/angular/angular) versión 16. Utiliza Firebase para el backend y hosting, y Bootstrap para el diseño de la interfaz.

## 🚀 Características Principales

*   **Frontend Framework:** Angular 16
*   **UI Framework:** Bootstrap 5
*   **Backend & Hosting:** Firebase (Hosting, Authentication, Firestore)
*   **Efectos Visuales:** @fireworks-js/angular

## 📋 Requisitos Previos

Asegúrate de tener instalado lo siguiente:

*   [Node.js](https://nodejs.org/)
*   [Angular CLI](https://github.com/angular/angular-cli): `npm install -g @angular/cli`
*   [Firebase CLI](https://github.com/firebase/firebase-tools): `npm install -g firebase-tools`

## 🛠️ Instalación

1.  Clona el repositorio (si aún no lo has hecho):
    ```bash
    git clone https://github.com/ediervillaneda/Nia2025.git
    ```
2.  Instala las dependencias del proyecto:
    ```bash
    npm install
    ```

## 💻 Servidor de Desarrollo

Ejecuta el siguiente comando para iniciar el servidor de desarrollo:

```bash
ng serve
```

Navega a `http://localhost:4200/`. La aplicación se recargará automáticamente si cambias algún archivo fuente.

## 📦 Construcción (Build)

Para construir el proyecto para producción, ejecuta:

```bash
ng build
```

Los artefactos de construcción se almacenarán en el directorio `dist/Nia2025`.

## ☁️ Despliegue en Firebase

Este proyecto está configurado para desplegarse en Firebase Hosting.

1.  Inicia sesión en Firebase (si no lo has hecho):
    ```bash
    firebase login
    ```
2.  Construye el proyecto:
    ```bash
    ng build
    ```
3.  Despliega en Firebase:
    ```bash
    firebase deploy
    ```

## 📁 Estructura del Proyecto

*   `src/app`: Contiene el código fuente de la aplicación (componentes, servicios, módulos).
*   `src/assets`: Recursos estáticos como imágenes e iconos.
*   `src/environments`: Archivos de configuración de entorno (Firebase config, etc.).
*   `angular.json`: Configuración del CLI de Angular.
*   `firebase.json`: Configuración de despliegue de Firebase.
