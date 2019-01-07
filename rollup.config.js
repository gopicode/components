// import less from 'rollup-plugin-less';
import postcss from 'rollup-plugin-postcss';

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
        	// output: 'dist/'
        })
    ]
}
