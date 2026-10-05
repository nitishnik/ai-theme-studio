import type { NextConfig } from 'next';
const config: NextConfig = {outputFileTracingRoot:process.cwd(),async rewrites(){return [{source:'/api/:path*',destination:`http://127.0.0.1:${process.env.API_PORT || '4000'}/api/:path*`}];}};
export default config;
