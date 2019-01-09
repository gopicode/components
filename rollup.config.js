import postcss from 'rollup-plugin-postcss';
import babel from 'rollup-plugin-babel';

const babelConfig = require('./.babelrc.js');

module.exports = {
    input: 'src/main.js',
    output: {
      file: 'dist/main.js',
      format: 'iife'
    },
    plugins: [
        postcss({
        	plugins: [],
        	extract: true,
        	use: ['less']
        }),
        babel(babelConfig)
    ]
}
