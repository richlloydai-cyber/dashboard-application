import path from "node:path";
// basePath/assetPrefix default to "" so a local `npm run dev` serves at the
// root (http://localhost:3000). Set NEXT_PUBLIC_DASHBOARD_PATH=/projects only
// for the nginx/Docker deployment where the app lives under a subpath.
const DASHBOARD_PATH = process.env.NEXT_PUBLIC_DASHBOARD_PATH || "";

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // Output configuration for Docker
  output: "standalone",

  ...(DASHBOARD_PATH
    ? { assetPrefix: DASHBOARD_PATH, basePath: DASHBOARD_PATH }
    : {}),

  // Image optimization
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "host.docker.internal",
        port: "3801",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },

  // Experimental features
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },

  // Headers for security
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },

  // Rewrites only apply to the subpath (nginx/Docker) deployment. In local
  // standalone mode the frontend calls NEXT_PUBLIC_API_URL directly (CORS).
  async rewrites() {
    if (!DASHBOARD_PATH) return [];
    return [
      {
        source: `${DASHBOARD_PATH}/api/:path*`,
        destination: `${process.env.NEXT_PUBLIC_HERMES_API || "http://host.docker.internal:3801"}/:path*`,
      },
      {
        source: `${DASHBOARD_PATH}/events`,
        destination: `${process.env.NEXT_PUBLIC_HERMES_API || "http://host.docker.internal:3801"}/events`,
      },
    ];
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Ensure the @/ alias resolves reliably across Next versions
    // (tsconfig paths alone can be ignored by the Next plugin).
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(process.cwd(), "src"),
    };

    // WebSocket-related node builtins are not needed in the browser bundle.
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        ws: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
};

export default nextConfig;