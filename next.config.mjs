/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/HolidayGO-CN",
  assetPrefix: "/HolidayGO-CN",
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
};

export default nextConfig;
