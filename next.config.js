/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb'
        }
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    // Rewrite /uploads/* to /api/uploads/* so uploaded files are served
    // via the API route (standalone mode doesn't serve runtime files from public/)
    async rewrites() {
        return [
            {
                source: '/uploads/:path*',
                destination: '/api/uploads/:path*',
            },
        ];
    },
    // Optimization for VPS deployment (Low Memory)
    typescript: {
        ignoreBuildErrors: true,
    },
}

module.exports = nextConfig
