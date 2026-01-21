# Prestador App

Una aplicación moderna para la gestión de préstamos personales, diseñada para facilitar el seguimiento de clientes, créditos y pagos.

## � Dashboard

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

## 🔐 Seguridad

- Todos los datos están protegidos con autenticación de Supabase.
- Cada usuario solo puede ver y gestionar sus propios datos.
- Las sesiones se mantienen seguras mediante tokens encriptados.

<!-- v1.0.1 -->
