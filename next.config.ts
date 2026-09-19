import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/cursos', destination: '/#academy', permanent: true },
      { source: '/prototipos', destination: '/#lab', permanent: true },
      { source: '/eva', destination: '/#eva', permanent: true },
      { source: '/estudios-juridicos', destination: '/#contacto', permanent: true },
      { source: '/informes', destination: '/#academy', permanent: true },
      { source: '/panel', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
