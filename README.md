# Prestador App

Una aplicación moderna para la gestión de préstamos personales, diseñada para facilitar el seguimiento de clientes, créditos y pagos.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- PostgreSQL 16 + Prisma ORM
- NextAuth.js (credenciales email/password)
- Tailwind CSS 4 + shadcn/ui
- Docker + Docker Compose para despliegue local

## Puesta en marcha local

Este proyecto depende de una BD PostgreSQL compartida que vive en `C:\Projects\docker-infra`. Lee el README de esa carpeta para arrancar la BD antes de levantar la app.

Pasos resumidos:

```powershell
# 1. (una sola vez) crear la red Docker compartida
docker network create shared-network

# 2. levantar la BD central (en C:\Projects\docker-infra)
cd C:\Projects\docker-infra ; docker compose up -d

# 3. crear .env.local en la raiz de este proyecto (ver .env.example)

# 4. levantar la app
cd C:\Projects\prestador-app ; docker compose up -d --build
```

La app quedara en http://localhost:3000 (y accesible desde otros dispositivos via Tailscale usando la IP de esta PC).

## Dashboard

El dashboard es tu centro de control financiero. Aquí encontrarás:

- **Capital Disponible:** Muestra cuánto dinero tienes disponible para prestar (tu capital inicial más intereses ganados, menos lo que está prestado actualmente).
- **Capital Prestado:** Total de dinero que tienes actualmente en préstamos activos.
- **Ganancias Totales:** Suma de todos los intereses que has ganado hasta la fecha.
- **Crecimiento:** Porcentaje de crecimiento de tu capital respecto al inicial.
- **Gráfico Mensual:** Visualiza tus ganancias mes a mes.

## 👥 Gestión de Clientes

### Agregar un Cliente

1.  Ve a la sección **Clientes** desde el menú lateral.
2.  Haz clic en **Agregar Cliente**.
3.  Completa el formulario con:
    - Nombre completo
    - Número de teléfono
    - Dirección
    - URL de imagen de pagare (opcional)
4.  Guarda el cliente.

### Ver Clientes

Todos tus clientes aparecen en una lista con su información básica y el total de préstamos activos que tienen.

## 💰 Gestión de Préstamos

### Crear un Préstamo

1.  Ve a la sección **Préstamos**.
2.  Haz clic en **Nuevo Préstamo**.
3.  Selecciona el cliente (debe estar registrado previamente).
4.  Ingresa:
    - Monto del préstamo
    - Tasa de interés mensual (%)
    - Número de meses
5.  El sistema calculará automáticamente:
    - Cuota mensual
    - Total de intereses
    - Total a pagar
6.  Confirma y el préstamo se creará con todos los pagos mensuales programados.

### Ver Préstamos

- **Activos:** Préstamos que aún tienen pagos pendientes.
- **Completados:** Préstamos totalmente pagados.
- Cada préstamo muestra el progreso de pagos y el saldo pendiente.

## 💳 Gestión de Pagos

### Registrar un Pago

1.  Ve a la sección **Pagos**.
2.  Busca el pago pendiente del mes correspondiente.
3.  Haz clic en **Marcar como Pagado**.
4.  El sistema automáticamente:
    - Actualiza el estado del pago
    - Suma el interés a tus ganancias totales
    - Genera el siguiente pago mensual si quedan cuotas

### Ver Historial

- **Pendientes:** Pagos que aún no se han recibido.
- **Completados:** Historial de todos los pagos recibidos.

## 💼 Gestión de Capital

1.  Ve a la sección **Capital**.
2.  Aquí puedes:
    - Ver tu capital inicial
    - Ver tu capital actual (inicial + intereses ganados)
    - Actualizar tu capital inicial si realizas nuevas inversiones
3.  El sistema calcula automáticamente:
    - Total de intereses ganados
    - Porcentaje de crecimiento
    - Capital disponible para nuevos préstamos

## Seguridad

- Autenticacion con NextAuth.js (JWT + credenciales email/password, passwords hasheadas con bcrypt).
- Cada usuario solo puede ver y gestionar sus propios datos (verificado a nivel de API route).
- Las sesiones se mantienen seguras mediante JWT firmados con `NEXTAUTH_SECRET`.
