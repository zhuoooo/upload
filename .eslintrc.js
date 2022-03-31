module.exports = {
    env: {
        browser: true,
        es2021: true,
        jest: true // 支持jest
    },
    extends: [
        'standard',
        'eslint:recommended'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    plugins: [
        '@typescript-eslint'
    ],
    rules: {
        indent: ['error', 4]
    }
}
