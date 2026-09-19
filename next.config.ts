import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // Rutas de versiones anteriores. Los universos ya no existen: todo lleva al laboratorio.
      { source: '/cursos', destination: '/', permanent: true },
      { source: '/prototipos', destination: '/', permanent: true },
      { source: '/eva', destination: '/#origen', permanent: true },
      { source: '/estudios-juridicos', destination: '/', permanent: true },
      { source: '/informes', destination: '/', permanent: true },
      { source: '/panel', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
