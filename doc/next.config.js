/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

const path = require("path");

const withMDX = require("@next/mdx")({ extension: /\.mdx?$/ });

module.exports = withMDX({
    future: { webpack5: true },
    distDir: "build",
    pageExtensions: ["tsx", "mdx"],
    webpack(config, options) {
        config.resolve.alias["components"] = path.join(__dirname, "components");
        config.resolve.alias["api-doc"] = path.join(__dirname, "api-doc");
        config.resolve.alias["templates"] = path.join(__dirname, "templates");
        return config;
    }
});
