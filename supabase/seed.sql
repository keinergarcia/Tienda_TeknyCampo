-- Seed data for Tekny Campo

-- Categories
INSERT INTO categories (id, name, slug, description, image_url, display_order) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Semillas', 'semillas', 'Semillas certificadas de alta calidad para tus cultivos', NULL, 1),
  ('a0000001-0000-0000-0000-000000000002', 'Herramientas', 'herramientas', 'Herramientas profesionales para el trabajo en el campo', NULL, 2),
  ('a0000001-0000-0000-0000-000000000003', 'Fertilizantes', 'fertilizantes', 'Fertilizantes organicos y quimicos para nutrir tus cultivos', NULL, 3),
  ('a0000001-0000-0000-0000-000000000004', 'Maquinaria', 'maquinaria', 'Maquinaria agricola para optimizar tu produccion', NULL, 4),
  ('a0000001-0000-0000-0000-000000000005', 'Plaguicidas', 'plaguicidas', 'Control de plagas efectivo para tus cultivos', NULL, 5),
  ('a0000001-0000-0000-0000-000000000006', 'Riego', 'riego', 'Sistemas de riego y accesorios para tu campo', NULL, 6)
ON CONFLICT (id) DO NOTHING;

-- Products
INSERT INTO products (id, name, slug, description, price, original_price, image_url, category_id, stock, is_featured, is_offer) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'Semilla de Maiz Hibrido DK-390', 'semilla-maiz-dk-390', 'Semilla de maiz hibrido de alto rendimiento. Resistente a sequia y plagas. Paquete de 1kg.', 45000, 52000, NULL, 'a0000001-0000-0000-0000-000000000001', 50, true, true),
  ('b0000001-0000-0000-0000-000000000002', 'Semilla de Frijol Caupi', 'semilla-frijol-caupi', 'Semilla de frijol caupi mejorada. Alta productividad y resistencia. Bolsa de 500g.', 28000, NULL, NULL, 'a0000001-0000-0000-0000-000000000001', 80, true, false),
  ('b0000001-0000-0000-0000-000000000003', 'Semilla de Tomate Chonto', 'semilla-tomate-chonto', 'Semilla de tomate chonto tipo hibrido. Ideal para cultivo en invernadero. Sobre con 100 semillas.', 15000, 18000, NULL, 'a0000001-0000-0000-0000-000000000001', 120, false, true),
  ('b0000001-0000-0000-0000-000000000004', 'Semilla de Pasto Brachiaria', 'semilla-pasto-brachiaria', 'Semilla de pasto brachiaria para pastoreo. Alta resistencia al pisoteo. Bolsa de 2kg.', 38000, NULL, NULL, 'a0000001-0000-0000-0000-000000000001', 60, false, false),
  ('b0000001-0000-0000-0000-000000000005', 'Machete Profesional 22 pulgadas', 'machete-profesional-22', 'Machete de acero al carbono con mango ergonomico. Ideal para labores de desmonte y cosecha.', 32000, 38000, NULL, 'a0000001-0000-0000-0000-000000000002', 45, true, true),
  ('b0000001-0000-0000-0000-000000000006', 'Palin Pala Recta Forjada', 'palin-pala-recta', 'Palin pala recta forjada en acero con mango de madera. Resistente para trabajos pesados.', 25000, NULL, NULL, 'a0000001-0000-0000-0000-000000000002', 35, false, false),
  ('b0000001-0000-0000-0000-000000000007', 'Tijeras de Podar Profesionales', 'tijeras-podar-profesionales', 'Tijeras de podar con hoja de acero templado y mango antideslizante. Corte preciso.', 18000, NULL, NULL, 'a0000001-0000-0000-0000-000000000002', 70, true, false),
  ('b0000001-0000-0000-0000-000000000008', 'Carretilla de Construccion 6ft3', 'carretilla-construccion-6ft3', 'Carretilla con capacidad de 6 pies cubicos. Bastidor de acero y llanta neumatica.', 85000, 95000, NULL, 'a0000001-0000-0000-0000-000000000002', 25, false, true),
  ('b0000001-0000-0000-0000-000000000009', 'Fertilizante Nitrogenado Urea 50kg', 'fertilizante-urea-50kg', 'Urea granulada al 46% de nitrogeno. Ideal para cultivos de maiz, arroz y pastos. Saco de 50kg.', 120000, NULL, NULL, 'a0000001-0000-0000-0000-000000000003', 40, true, false),
  ('b0000001-0000-0000-0000-000000000010', 'Fertilizante Organico Compost 25kg', 'fertilizante-organico-compost-25kg', 'Compost organico mejorado con micronutrientes. Saco de 25kg.', 55000, 65000, NULL, 'a0000001-0000-0000-0000-000000000003', 90, false, true),
  ('b0000001-0000-0000-0000-000000000011', 'Fertilizante Foliar Liquido 1L', 'fertilizante-foliar-liquido-1l', 'Fertilizante foliar liquido concentrado con aminoacidos. Botella de 1 litro.', 22000, NULL, NULL, 'a0000001-0000-0000-0000-000000000003', 100, false, false),
  ('b0000001-0000-0000-0000-000000000012', 'Fumigadora Manual 20 Litros', 'fumigadora-manual-20l', 'Fumigadora manual de mochila con capacidad de 20 litros. Boquilla ajustable y bomba de presion.', 95000, 110000, NULL, 'a0000001-0000-0000-0000-000000000004', 30, true, true),
  ('b0000001-0000-0000-0000-000000000013', 'Bombas de Agua Sumergible 2HP', 'bomba-agua-sumergible-2hp', 'Bomba sumergible de 2 HP para pozos profundos. Caudal de 200 L/min.', 450000, NULL, NULL, 'a0000001-0000-0000-0000-000000000004', 10, false, false),
  ('b0000001-0000-0000-0000-000000000014', 'Molino Electrico para Granos', 'molino-electrico-granos', 'Molino electrico de 1 HP para maiz, trigo y otros granos. Capacidad de 150 kg/h.', 280000, 320000, NULL, 'a0000001-0000-0000-0000-000000000004', 15, false, true),
  ('b0000001-0000-0000-0000-000000000015', 'Glifosato 5 Litros', 'glifosato-5l', 'Herbicida glifosato al 48% para control de malezas. Envase de 5 litros.', 42000, NULL, NULL, 'a0000001-0000-0000-0000-000000000005', 200, false, false),
  ('b0000001-0000-0000-0000-000000000016', 'Insecticida Cipermetrina 1L', 'insecticida-cipermetrina-1l', 'Insecticida de amplio espectro para control de plagas. Envase de 1 litro.', 25000, NULL, NULL, 'a0000001-0000-0000-0000-000000000005', 150, false, false),
  ('b0000001-0000-0000-0000-000000000017', 'Manguera de Riego 50m 1/2 pulgada', 'manguera-riego-50m', 'Manguera de PVC reforzada para sistemas de riego. 50 metros de longitud.', 35000, 40000, NULL, 'a0000001-0000-0000-0000-000000000006', 80, false, true),
  ('b0000001-0000-0000-0000-000000000018', 'Aspersor de Impacto para Riego', 'aspersor-impacto-riego', 'Aspersor de impacto con base metalica. Radio de alcance de hasta 15 metros.', 18000, NULL, NULL, 'a0000001-0000-0000-0000-000000000006', 120, true, false)
ON CONFLICT (id) DO NOTHING;
