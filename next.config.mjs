/** @type {import('next').NextConfig} */
const nextConfig = {
    // Next only runs at build time: it emits plain HTML/JS/CSS into ./out,
    // which the Rust server (./server) serves together with the API.
    output: "export",
    images: { unoptimized: true },
};

export default nextConfig;
