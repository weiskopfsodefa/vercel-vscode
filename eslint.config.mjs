import harmony from 'eslint-config-harmony';

harmony.forEach((config) => {
  config.rules['no-console'] = 'off';
  config.rules['multiline-comment-style'] = 'off';
});

const config = [{ ignores: ['**/*.json'] }, ...harmony];

export default config;
