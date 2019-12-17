/* eslint-disable import/no-extraneous-dependencies */
const merge = require('deepmerge');
const slSettings = require('@advanced-rest-client/testing-karma-sl/sl-settings.js');
const createBaseConfig = require('./karma.conf.js');

module.exports = (config) => {
  const slConfig = merge(slSettings(config), {
    sauceLabs: {
      testName: 'cc-authorization-method',
    },
  });
  slConfig.browsers = [
    'SL_Chrome',
    'SL_Chrome-1',
    'SL_Firefox',
    'SL_Firefox-1',
    'SL_Safari',
    'SL_Safari-1',
    // 'SL_EDGE', // IDK why but this fails in test env as it cannot load test files
  ];
  config.set(merge(createBaseConfig(config), slConfig));
  return config;
};
