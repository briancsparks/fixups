
const AWS                           = require('aws-sdk');
const utils                         = require('./utils');
const { deref,addKeyToMirror }      = utils;
const s_ec2                         = require('./aws/ec2');
const deepMerge                     = require('merge-deep');
var   s                             = require('./aws/aws');

//var   s = {};


//var   awsConfig = config({
//  region:           'us-east-1',
//});
//
//const aws                     = s.AWS           = AWS;
//const config_                 = s.config        = new AWS.Config(awsConfig);
//const route53                 = s.route53       = new AWS.Route53(s.config);
//const ec2                     = s.ec2           = new AWS.EC2(s.config);
//const s3                      = s.s3            = new AWS.S3(s.config);
//const lambda                  = s.lambda        = new AWS.Lambda(s.config);
//const dynamoDb                = s.dynamoDb      = new AWS.DynamoDB(s.config);
//
//const rds                     = s.rds      = new AWS.RDS(s.config);
//const ses                     = s.ses      = new AWS.SES(s.config);
//const sns                     = s.sns      = new AWS.SNS(s.config);
//const sqs                     = s.sqs      = new AWS.SQS(s.config);
//
//const eventBridge             = s.eventBridge   = new AWS.EventBridge(s.config);
//const gameLift                = s.gameLift   = new AWS.GameLift(s.config);
//const lightsail               = s.lightsail   = new AWS.Lightsail(s.config);
//const roboMaker               = s.roboMaker   = new AWS.RoboMaker(s.config);

//s.info = {
//  route53: {}
//};
//
//s.info.route53.listHostedZonesByName  = route53.listHostedZonesByName;
//s.info.route53.getHostedZone          = route53.getHostedZone;
//s.info.route53.listResourceRecordSets = route53.listResourceRecordSets;
//
//console.log(typeof route53.listHostedZonesByName);
//console.log(typeof route53.getHostedZone);
//console.log(typeof route53.listResourceRecordSets);

s     = deepMerge(s, {fix:{}, fns:{}});
s     = deepMerge(s, s_ec2);

s.fix.resourceRecordSets = function(sets) {
  var r = {
    items: [...sets.ResourceRecordSets]
  };

  sets.ResourceRecordSets.forEach((set) => {
    r[set.Name] = [...(r[set.Name] ||[]), set];
  });

  return r;
};

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

