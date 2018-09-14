import multiEntry from 'rollup-plugin-multi-entry';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import alias from 'rollup-plugin-alias';
import replace from 'rollup-plugin-replace';
import vue from 'rollup-plugin-vue';
import preprocess from 'rollup-plugin-preprocess';
import uglify from 'rollup-plugin-uglify';
import path from 'path';
import shell from 'shelljs';
import postcss from 'rollup-plugin-postcss';


//process.chdir(path.resolve(__dirname, '..'));
const context = {
  NODE_ENV: process.env.PRODUCTION === 'true' ? 'production' : 'development',
  FIREFOX: process.env.FIREFOX === 'true',
};

function isProduction() {
  return process.env.PRODUCTION === 'true';
}

function getModuleAliases(basePath) {
  const modules = shell.find(`${basePath}/**/*.@(vue|js)`);
  return modules.reduce((aliases, module) => {
    const alias = path.basename(module).replace(path.extname(module), '');
    aliases[alias] = module;
    return aliases;
  }, {});
}

const aliases = getModuleAliases('src');
console.log(aliases);

if (context.NODE_ENV === 'development') {
  aliases.vue = 'vue/dist/vue.esm.js';
}
const plugins = [
  multiEntry(),
  resolve({
    preferBuiltins: true,
  }),
  preprocess({
    context: context,
  }),
  replace({
    'process.env.NODE_ENV': JSON.stringify(context.NODE_ENV),
  }),
  postcss(),
  vue({
    template: {
      isProduction,
      compilerOptions: { preserveWhitespace: false },
    },
    css: true
  }),
  babel(),
  commonjs(),
  alias(aliases),
];

if (context.NODE_ENV === 'production') {
  plugins.push(uglify());
}

export default [
  {
    input: 'src/background/background.js',
    plugins,
    output: {
      name: 'background',
      file: 'dist/background.js',
      format: 'iife',
      sourcemap: process.env.PRODUCTION === 'true' ? false : 'inline',
    },
  },
  {
    input: 'src/settings/settings.js',
    plugins,
    output: {
      name: 'settings',
      file: 'dist/settings.js',
      format: 'iife',
      sourcemap: process.env.PRODUCTION === 'true' ? false : 'inline',
    },
  },
  {
    input: 'src/browser_action/browser_action.js',
    plugins,
    output: {
      name: 'browser_action',
      file: 'dist/browser_action.js',
      format: 'iife',
      sourcemap: process.env.PRODUCTION === 'true' ? false : 'inline',
    },
  },
  {
    input: 'src/parser.js',
    plugins,
    output: {
      name: 'parser',
      file: 'dist/parser.js',
      format: 'iife',
      sourcemap: process.env.PRODUCTION === 'true' ? false : 'inline',
    },
  },
];
