import { FlatCompat } from '@eslint/eslintrc';
import prettier from 'eslint-config-prettier';
const compat = new FlatCompat({ baseDirectory: import.meta.dirname });
const config = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  prettier,
  { ignores: ['.next/**', 'dist/**', 'next-env.d.ts'] },
];
export default config;
