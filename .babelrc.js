module.exports = {
    presets: [
        ['@babel/preset-env', {
            // rollupjs 会处理模块，所以设置成 false
            modules: false
        }],
        '@babel/preset-typescript'
    ],
    targets: {
        ie: 10
    },
    plugins: [
        ["@babel/plugin-transform-runtime"]
    ]
}