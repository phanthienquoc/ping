const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { expo: baseConfig } = require('./app.json');

const APP_ENV = process.env.APP_ENV;
const allowedEnvs = ['dev', 'stag', 'prod'];

if (!APP_ENV) {
  throw new Error('Missing APP_ENV. Expected one of: dev, stag, prod');
}

if (!allowedEnvs.includes(APP_ENV)) {
  throw new Error(`Invalid APP_ENV: ${APP_ENV}. Allowed values: ${allowedEnvs.join(', ')}`);
}

const envFile = path.resolve(__dirname, `env/.env.${APP_ENV}`);
const requiredVars = [
  'EXPO_PUBLIC_APP_NAME',
  'EXPO_PUBLIC_API_URL',
  'EXPO_PUBLIC_CHANNEL',
  'IOS_BUNDLE_IDENTIFIER',
  'ANDROID_PACKAGE',
];

const hasAllRequiredFromProcessEnv = requiredVars.every((key) => !!process.env[key]);

if (!hasAllRequiredFromProcessEnv) {
  if (!fs.existsSync(envFile)) {
    throw new Error(
      `Missing required env vars in process.env and missing fallback file: ${envFile}`
    );
  }
  dotenv.config({ path: envFile, override: false });
}

const missingVars = requiredVars.filter((key) => !process.env[key]);
if (missingVars.length > 0) {
  throw new Error(
    `Missing required env vars for APP_ENV=${APP_ENV}: ${missingVars.join(', ')}`
  );
}

const projectId = baseConfig?.extra?.eas?.projectId;

module.exports = {
  expo: {
    ...baseConfig,
    name: process.env.EXPO_PUBLIC_APP_NAME,
    slug: 'ping',
    runtimeVersion: {
      policy: 'appVersion',
    },
    extra: {
      ...baseConfig.extra,
      appEnv: APP_ENV,
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      channel: process.env.EXPO_PUBLIC_CHANNEL,
    },
    ios: {
      ...baseConfig.ios,
      bundleIdentifier: process.env.IOS_BUNDLE_IDENTIFIER,
      buildNumber: '1',
      infoPlist: {
        ...(baseConfig.ios?.infoPlist || {}),
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      ...baseConfig.android,
      package: process.env.ANDROID_PACKAGE,
      versionCode: 1,
    },
    updates: {
      ...(baseConfig.updates || {}),
      url: projectId ? `https://u.expo.dev/${projectId}` : undefined,
    },
  },
};
