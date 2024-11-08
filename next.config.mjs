/** @type {import('next').NextConfig} */
const config = {
    images: {
        unoptimized: true,
        dangerouslyAllowSVG: true,
        domains: ['localhost'],
        remotePatterns: [
            {
                protocol: 'http',
                hostname: '**',
            },
            {
                protocol: 'https',
                hostname: '**',
            }
        ]
    },
    webpack: (config) => {
        config.resolve.fallback = { fs: false, path: false };
        return config;
    }
}

export default config