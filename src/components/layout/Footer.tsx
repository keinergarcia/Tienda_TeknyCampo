import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import logoImg from '@/assets/images/logotipo/teknycampo-icon.png';

export function Footer() {
  return (
    <footer className="bg-primary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src={logoImg} alt="Tekny Campo" className="h-10 w-auto" />
              <span className="font-display font-bold text-xl">Tekny Campo</span>
            </Link>
            <p className="text-primary-200 text-sm leading-relaxed">
              Tu tienda especializada en productos agropecuarios. Calidad y confianza para el campo.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Enlaces Rapidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/productos" className="text-primary-200 hover:text-white transition-colors text-sm">
                  Todos los Productos
                </Link>
              </li>
              <li>
                <Link to="/categorias" className="text-primary-200 hover:text-white transition-colors text-sm">
                  Categorias
                </Link>
              </li>
              <li>
                <Link to="/ofertas" className="text-primary-200 hover:text-white transition-colors text-sm">
                  Ofertas Especiales
                </Link>
              </li>
              <li>
                <Link to="/mi-cuenta" className="text-primary-200 hover:text-white transition-colors text-sm">
                  Mi Cuenta
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-primary-200 text-sm">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>Oca&ntilde;a, Norte de Santander, Colombia</span>
              </li>
              <li className="flex items-center gap-3 text-primary-200 text-sm">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>311 549 9784</span>
              </li>
              <li className="flex items-center gap-3 text-primary-200 text-sm">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>Teknycampos@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Siguenos</h3>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary-800 rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary-800 rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary-800 rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-primary-300 text-sm">
            &copy; {new Date().getFullYear()} Tekny Campo. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            <Link to="/terminos" className="text-primary-300 hover:text-white text-sm transition-colors">
              Terminos y Condiciones
            </Link>
            <Link to="/privacidad" className="text-primary-300 hover:text-white text-sm transition-colors">
              Politica de Privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
