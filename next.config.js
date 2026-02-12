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
    // Optimization for VPS deployment (Low Memory)
    typescript: {
        ignoreBuildErrors: true,
    },
}

module.exports = nextConfig
