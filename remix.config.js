/** @type {import('@remix-run/dev').AppConfig} */
export default {
    cacheDirectory: "./node_modules/.cache/remix",
    ignoredRouteFiles: ['**/.*'],
    serverDependenciesToBundle: ['remix-i18next', 'accept-language-parser'],
    serverModuleFormat: "esm",
    serverPlatform: "node",
    future: {},
    browserNodeBuiltinsPolyfill: {
        modules: {
            path: true,
        },
    },
};
