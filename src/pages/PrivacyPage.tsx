import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </Link>

        <h1 className="font-display font-bold text-4xl text-gray-900 mb-8">
          Política de Privacidad
        </h1>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="font-display font-bold text-2xl text-gray-900 mb-3">1. Información Recopilada</h2>
            <p>
              En Tekni Campo recopilamos la información que nos proporcionas al registrarte, realizar
              una compra o contactarnos, incluyendo tu nombre, dirección de correo electrónico,
              dirección de envío y datos de pago. También podemos recopilar información automáticamente
              mediante cookies y tecnologías similares, como tu dirección IP, tipo de navegador y
              páginas visitadas.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-2xl text-gray-900 mb-3">2. Uso de Datos</h2>
            <p>
              Utilizamos tu información para procesar pedidos, gestionar tu cuenta, enviarte
              actualizaciones sobre el estado de tus compras y brindarte atención al cliente.
              Con tu consentimiento, también podemos enviarte comunicaciones promocionales sobre
              nuestros productos y ofertas. No compartimos tus datos personales con terceros
              para fines comerciales sin tu autorización explícita.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-2xl text-gray-900 mb-3">3. Cookies</h2>
            <p>
              Este sitio utiliza cookies propias y de terceros para mejorar tu experiencia de navegación,
              recordar tus preferencias y analizar el tráfico del sitio. Puedes configurar tu navegador
              para rechazar todas las cookies o para indicar cuándo se envía una. Sin embargo, algunas
              funcionalidades del sitio podrían no funcionar correctamente si deshabilitas las cookies.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-2xl text-gray-900 mb-3">4. Protección de Datos</h2>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas para proteger tu información
              personal contra accesos no autorizados, pérdida o alteración. Todos los datos sensibles
              se transmiten mediante conexiones cifradas SSL/TLS. Realizamos auditorías periódicas
              para garantizar el cumplimiento de los estándares de seguridad vigentes.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-2xl text-gray-900 mb-3">5. Derechos del Usuario</h2>
            <p>
              Tienes derecho a acceder, rectificar, cancelar u oponerte al tratamiento de tus datos
              personales en cualquier momento. Para ejercer estos derechos, puedes contactarnos a
              través de nuestro formulario de contacto o enviando un correo electrónico. También
              puedes solicitar la eliminación de tu cuenta y todos los datos asociados.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-2xl text-gray-900 mb-3">6. Contacto</h2>
            <p>
              Si tienes preguntas sobre esta política de privacidad o sobre el tratamiento de tus
              datos personales, puedes comunicarte con nosotros a través del correo electrónico
              <a href="mailto:privacidad@teknicampo.com" className="text-primary-600 hover:text-primary-700 ml-1">
                privacidad@teknicampo.com
              </a>
              o mediante nuestro formulario de contacto disponible en el sitio web. Responderemos
              tu consulta en un plazo máximo de 48 horas hábiles.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
