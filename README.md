# Prestador App

Una aplicación moderna para la gestión de préstamos personales, diseñada para facilitar el seguimiento de clientes, créditos y pagos.

## 🚀 Características

- **Dashboard Interactivo:** Visualiza KPIs financieros clave como Capital Disponible, Capital Prestado, Ganancias Totales y Crecimiento Mensual.
- **Gestión de Clientes:** Registra y administra la información de tus clientes.
- **Control de Préstamos:** Crea nuevos préstamos y lleva un registro detallado de los mismos.
- **Seguimiento de Pagos:** Registra pagos mensuales y visualiza el historial de transacciones.
- **Gestión de Capital:** Administra tu capital inicial y observa cómo crece con los intereses ganados.
- **Seguridad:** Autenticación robusta y protección de datos mediante Supabase.

## 🛠️ Tecnologías Utilizadas

- **Frontend:** [Next.js](https://nextjs.org/) (App Router), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/).
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/) (Iconos).
- **Backend & Base de Datos:** [Supabase](https://supabase.com/) (PostgreSQL, Auth).
- **Gestor de Paquetes:** pnpm.

## 📦 Instalación y Configuración

1.  **Clonar el repositorio:**

    ```bash
    git clone https://github.com/santim025/prestador-app.git
    cd prestador-app
    ```

2.  **Instalar dependencias:**

    ```bash
    pnpm install
    ```

3.  **Configurar variables de entorno:**
    Crea un archivo `.env.local` en la raíz del proyecto y agrega tus credenciales de Supabase:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
    ```

4.  **Ejecutar el servidor de desarrollo:**
    ```bash
    pnpm dev
    ```
    Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🚀 Despliegue

Este proyecto está optimizado para ser desplegado en **Vercel**.

1.  Sube tu código a GitHub.
2.  Importa el proyecto en Vercel.
3.  Configura las variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) en el panel de Vercel.
4.  ¡Despliega!
