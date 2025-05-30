// next.config.js
const withNextIntl = require("next-intl/plugin")();

module.exports = withNextIntl({
  reactStrictMode: false,
  images: {
    domains: ["lh3.googleusercontent.com"], // ← 추가
  },
});
