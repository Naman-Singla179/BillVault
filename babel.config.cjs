module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  plugins: [
    function transformImportMeta() {
      return {
        visitor: {
          MetaProperty(path) {
            if (
              path.node.meta &&
              path.node.meta.name === 'import' &&
              path.node.property &&
              path.node.property.name === 'meta'
            ) {
              path.replaceWithSourceString(
                '({ url: "", env: { ...process.env, DEV: process.env.NODE_ENV !== "production", MODE: process.env.NODE_ENV || "test" } })'
              );
            }
          },
        },
      };
    },
  ],
};

