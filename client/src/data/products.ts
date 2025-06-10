
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  specs?: string[];
  featured?: boolean;
  brand?: string;
  rating?: number;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Sony Alpha A7 IV",
    description: "Cámara mirrorless profesional con sensor full-frame de 33MP",
    price: 2499,
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop",
    category: "Cameras",
    brand: "Sony",
    rating: 4.8,
    featured: true,
    specs: [
      "Sensor CMOS Exmor R Full-Frame de 33MP",
      "Motor de procesamiento de imagen BIONZ XR",
      "Grabación de video 4K 60p",
      "Estabilización de imagen de 5 ejes en el cuerpo",
      "759 puntos AF de detección de fase"
    ]
  },
  {
    id: "2",
    name: "MacBook Pro 16-inch",
    description: "Laptop potente con chip M2 Pro para profesionales creativos",
    price: 2699,
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=400&fit=crop",
    category: "Laptops",
    brand: "Apple",
    rating: 4.9,
    featured: true,
    specs: [
      "Chip Apple M2 Pro",
      "Pantalla Liquid Retina XDR de 16.2 pulgadas",
      "Hasta 22 horas de batería",
      "Cámara FaceTime HD 1080p",
      "Sistema de sonido de seis altavoces"
    ]
  },
  {
    id: "3",
    name: "DJI Mini 4 Pro",
    description: "Drone ultra-compacto con video 4K HDR y funciones avanzadas",
    price: 759,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop",
    category: "Drones",
    brand: "DJI",
    rating: 4.7,
    featured: true,
    specs: [
      "Video 4K/60fps HDR",
      "Tiempo máximo de vuelo de 34 minutos",
      "Detección de obstáculos omnidireccional",
      "Funciones RTH avanzadas",
      "Conectividad Wi-Fi mejorada"
    ]
  },
  {
    id: "4",
    name: "iPad Pro 12.9-inch",
    description: "iPad más avanzado con chip M2 y pantalla Liquid Retina",
    price: 1099,
    image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&h=400&fit=crop",
    category: "Tablets",
    brand: "Apple",
    rating: 4.8,
    featured: true,
    specs: [
      "Chip Apple M2",
      "Pantalla Liquid Retina XDR de 12.9 pulgadas",
      "Batería para todo el día",
      "Cámaras avanzadas con LiDAR",
      "Soporte Thunderbolt / USB 4"
    ]
  },
  {
    id: "5",
    name: "AirPods Pro (2nd gen)",
    description: "Auriculares inalámbricos con cancelación activa de ruido",
    price: 249,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop",
    category: "Audio",
    brand: "Apple",
    rating: 4.6,
    featured: true,
    specs: [
      "Cancelación activa de ruido",
      "Modo de transparencia",
      "Audio espacial con seguimiento dinámico de cabeza",
      "Hasta 30 horas de tiempo de escucha",
      "Estuche de carga MagSafe"
    ]
  },
  {
    id: "6",
    name: "Gaming Mechanical Keyboard",
    description: "Teclado mecánico RGB con retroiluminación para gaming",
    price: 159,
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop",
    category: "Gaming",
    brand: "Razer",
    rating: 4.5,
    featured: true,
    specs: [
      "Switches Cherry MX Blue",
      "Iluminación RGB por tecla",
      "Construcción en aluminio",
      "Teclas macro programables",
      "Conectividad USB-C"
    ]
  },
  {
    id: "7",
    name: "Canon EOS R5",
    description: "Cámara profesional con grabación 8K y estabilización avanzada",
    price: 3899,
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop",
    category: "Cameras",
    brand: "Canon",
    rating: 4.9,
    specs: [
      "Sensor CMOS full-frame de 45MP",
      "Grabación de video 8K RAW",
      "Estabilización de imagen de 5 ejes",
      "Sistema Dual Pixel CMOS AF II",
      "Pantalla táctil LCD de ángulo variable"
    ]
  },
  {
    id: "8",
    name: "Dell XPS 13",
    description: "Ultrabook premium con diseño sin bordes y rendimiento excepcional",
    price: 1299,
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=400&fit=crop",
    category: "Laptops",
    brand: "Dell",
    rating: 4.4,
    specs: [
      "Procesador Intel Core i7",
      "Pantalla InfinityEdge de 13.4 pulgadas",
      "16GB RAM DDR4",
      "SSD de 512GB",
      "Hasta 12 horas de batería"
    ]
  }
];

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter(product => product.featured);
};

export const getSimilarProducts = (productId: string, limit: number = 3): Product[] => {
  const currentProduct = getProductById(productId);
  if (!currentProduct) return [];
  
  return products
    .filter(product => 
      product.id !== productId && 
      product.category === currentProduct.category
    )
    .slice(0, limit);
};

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(product => 
    product.category.toLowerCase() === category.toLowerCase()
  );
};
