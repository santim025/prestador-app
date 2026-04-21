/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // pdfkit no debe bundlearse: resuelve sus archivos .afm con __dirname en runtime.
  // Se instala de forma plana en el Dockerfile (ver paso pdfkit-runtime).
  serverExternalPackages: ["pdfkit"],
}

export default nextConfig
