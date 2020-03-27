
const AWS                           = require('aws-sdk');
const utils                         = require('./utils');
const { deref,addKeyToMirror }      = utils;
const s_ec2                         = require('./aws/ec2');
const s_route53                     = require('./aws/route53');
const deepMerge                     = require('merge-deep');
var   s                             = require('./aws/aws');

s     = deepMerge(s, {fix:{}, fns:{}});
s     = deepMerge(s, s_ec2);
s     = deepMerge(s, s_route53);

// Export
Object.keys(s).forEach((key)  => {
  module.exports[key] = s[key];
});


function clean(x) {
  var r = {};

  Object.keys(x).forEach((k) => {
    const orig = x[k];

    if (Array.isArray(orig)) {
      r[k] = orig;
    }

    if (!(typeof orig === 'object')) {
      r[k] = orig;
    }

    Object.keys(orig).forEach((k2) => {
      const value = orig[k2];
      if (value !== null && value !== undefined) {
        r[k][k2] = value;
      }
    });
  });

  return r;
}

