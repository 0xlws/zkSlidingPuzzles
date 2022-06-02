/** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: false,
// }

// module.exports = {
//   webpack5: true,
//   webpack: (config) => {
//     config.resolve.fallback = { fs: false };

//     return config;
//   },

//   nextConfig
// };

const nextConfig = {
  reactStrictMode: false,
  webpack: function (config, options) {
    if (!options.isServer) {
      config.resolve.fallback.fs = false;
    }
    config.experiments = { asyncWebAssembly: true };
    return config;
  },
};

module.exports = nextConfig;
