import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function TermsPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </Link>

        <h1 className="font-display font-bold text-4xl text-gray-900 mb-8">
          Términos y Condiciones
        </h1>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="font-display font-bold text-2xl text-gray-900 mb-3">1. Uso del Sitio</h2>
            <p>
              Al acceder y utilizar este sitio web, aceptas cumplir con los presentes términos y condiciones.
              Tekni Campo se reserva el derecho de modificar estos términos en cualquier momento,
              notificando los cambios mediante la publicación de la versión actualizada en esta página.
              El uso continuado del sitio después de dichas modificaciones constituye la aceptación de las mismas.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-2xl text-gray-900 mb-3">2. Registro de Usuario</h2>
            <p>
              Para realizar compras en nuestro sitio, es necesario crear una cuenta proporcionando información
              veraz y completa. Eres responsable de mantener la confidencialidad de tus credenciales de acceso
              y de todas las actividades que ocurran bajo tu cuenta. Tekni Campo no será responsable por
              pérdidas derivadas del uso no autorizado de tu cuenta.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-2xl text-gray-900 mb-3">3. Productos y Precios</h2>
            <p>
              Nos esforzamos por presentar descripciones precisas y precios actualizados de todos nuestros
              productos. Sin embargo, los precios están sujetos a cambios sin previo aviso. En caso de
              error en el precio o la descripción de un producto, nos reservamos el derecho de cancelar
              o modificar el pedido correspondiente. Todas las ofertas y promociones están sujetas a
              disponibilidad de stock.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-2xl text-gray-900 mb-3">4. Pagos</h2>
            <p>
              Aceptamos diversos métodos de pago seguros, incluyendo tarjetas de crédito, débito y
              transferencias bancarias. Todos los pagos se procesan a través de plataformas seguras
              con encriptación SSL. El cargo se realizará al momento de confirmar el pedido. Tekni Campo
              no almacena ni tiene acceso a los datos completos de tu tarjeta bancaria.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-2xl text-gray-900 mb-3">5. Envíos</h2>
            <p>
              Realizamos envíos a todo el país a través de servicios de mensajería confiables.
              Los plazos de entrega varían según la ubicación y estarán especificados durante el proceso
              de compra. Tekni Campo no se hace responsable por retrasos ocasionados por factores externos
              como condiciones climáticas o problemas logísticos del transportista. El costo de envío se
              calculará automáticamente al ingresar tu código postal.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-2xl text-gray-900 mb-3">6. Devoluciones</h2>
            <p>
              Aceptamos devoluciones dentro de los 30 días posteriores a la recepción del producto,
              siempre que se encuentre en su estado original y empaque sin abrir. Los gastos de envío
              de la devolución correrán por cuenta del cliente, excepto en casos de productos defectuosos
              o errores en el envío. Para iniciar una devolución, contáctanos a través de nuestro centro
              de atención al cliente.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-2xl text-gray-900 mb-3">7. Propiedad Intelectual</h2>
            <p>
              Todo el contenido presente en este sitio web, incluyendo imágenes, textos, logotipos,
              diseños y software, es propiedad de Tekni Campo o de sus respectivos titulares y está
              protegido por las leyes de propiedad intelectual. Queda prohibida la reproducción,
              distribución o modificación total o parcial sin autorización expresa por escrito.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
