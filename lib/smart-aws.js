
const AWS                           = require('aws-sdk');
const utils                         = require('./utils');
const { deref,addKeyToMirror }      = utils;

var   s = {};


var   awsConfig = config({
  region:           'us-east-1',
});

const aws                     = s.AWS           = AWS;
const config_                 = s.config        = new AWS.Config(awsConfig);
const route53                 = s.route53       = new AWS.Route53(s.config);
const ec2                     = s.ec2           = new AWS.EC2(s.config);
const s3                      = s.s3            = new AWS.S3(s.config);
const lambda                  = s.lambda        = new AWS.Lambda(s.config);
const dynamoDb                = s.dynamoDb      = new AWS.DynamoDB(s.config);

const rds                     = s.rds      = new AWS.RDS(s.config);
const ses                     = s.ses      = new AWS.SES(s.config);
const sns                     = s.sns      = new AWS.SNS(s.config);
const sqs                     = s.sqs      = new AWS.SQS(s.config);

const eventBridge             = s.eventBridge   = new AWS.EventBridge(s.config);
const gameLift                = s.gameLift   = new AWS.GameLift(s.config);
const lightsail               = s.lightsail   = new AWS.Lightsail(s.config);
const roboMaker               = s.roboMaker   = new AWS.RoboMaker(s.config);

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


s.fix = {};
s.fix.resourceRecordSets = function(sets) {
  var r = {
    items: [...sets.ResourceRecordSets]
  };

  sets.ResourceRecordSets.forEach((set) => {
    r[set.Name] = [...(r[set.Name] ||[]), set];
  });

  return r;
};

const indexBy = {
  ImageId: {},
  InstanceId: {},
  InstanceType: {},
  PrivateIpAddress: {},
  PublicIpAddress: {},
  SubnetId: {},
  OwnerId: {},
  AvailabilityZone: {},
  State: {},
  GroupName: {},
  GroupId: {},
  VpcId: {}
};

s.fix.instances = function(reservations, indexOnly =false) {
  var r = {
    items:[],
    by: {...indexBy}
  };

  reservations.Reservations.forEach((resv) => {
    resv.Instances.forEach((instance) => {
      const index = r.items.length;

      var   newValue = instance;

      if (indexOnly) {
        newValue = index;
      }

      var   tags0 = {};
      var   tags  = {};
      instance.Tags.forEach((tag) => {
        const key       = tag.Key.replace(/[^a-z0-9_]/gi, '_');
        const value0    = tag.Value.split(',');
        const value     = tag.Value.split(',').map((s) => s.replace(/[^a-z0-9_]/gi, '_'));
        //const value = tag.Value.split(',').map((s) => s.replace(/[^a-z0-9_]/gi, ''));

        tags0[key]  = value0;
        tags[key]   = value;

        value.forEach((v) => {
          //const indexKey = `tag_${key}___${v}`.replace(/_+$/g, '');
          const indexKey = `tag_${key}_${v}`.replace(/_+$/g, '');
          const orig = r.by[indexKey] || [];

          r.by[indexKey] = [...orig, newValue];
        });
      });

      instance.tags               = tags;
      instance.tags0              = tags0;

      instance.index              = index;
      instance._uniqId            = instance.InstanceId;

      instance.AvailabilityZone   = instance.Placement.AvailabilityZone;
      instance.State              = instance.State.Name;
      instance.OwnerId            = ((instance.NetworkInterfaces ||[])[0] ||{}).OwnerId;
      instance.GroupName          = ((instance.SecurityGroups ||[])[0] ||{}).GroupName;
      instance.GroupId            = ((instance.SecurityGroups ||[])[0] ||{}).GroupId;

      instance.commonName         = deref(instance, 'tags0.qn_fqdns.0') ||
                                    deref(instance, 'tags0.role.0') ||
                                    deref(instance, 'tags.Name') ||
                                    deref(instance, 'InstanceId');

      r.items.push(instance);


      Object.keys(indexBy).forEach((indexKey) => {
        const orig    = r.by[indexKey][instance[indexKey]] || [];
        const subKey  = instance[indexKey];

        if (subKey) {
          r.by[indexKey][subKey] = [...orig, newValue];
        }
      });
    });
  });

  return r;
};

s.fix.instanceLogging = function(instanceData) {
  var r = JSON.parse(JSON.stringify(instanceData));

  // get all the tags-based keys
  var   tagKeys = Object.keys(r.by).filter((key) => key.startsWith('tag_'));

  tagKeys.forEach((key) => {
    r.by[key] = r.by[key].map((instance) => instance.index);;
  });

  Object.keys(indexBy).forEach((key) => {
    Object.keys(r.by[key]).forEach((subKey) => {
      r.by[key][subKey] = r.by[key][subKey].map((instance) => instance.index);;
    });
  });

  return r;
};

// Export
Object.keys(s).forEach((key)  => {
  module.exports[key] = s[key];
});


function config(c) {
  var c2 = {};

  // See: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#httpOptions-property
  c2.httpOptions = {
    proxy:            c.proxy           || forExample('http://example.com:8088'),
    connectTimeout:   c.connectTimeout  ||  forExample(5000),
    timeout:          c.timeout         || forExample(22000)
  };

  // See: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#paramValidation-property
  c2.paramValidation = c.paramValidation || true;

  c2.paramValidation = {
    min:              c.min       || true,
    max:              c.max       || true,
    pattern:          c.pattern   || true,
    enum:             c.enum      || true
  };

  // See: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#region-property
  c2.region            = c.region || 'us-east-1';

  // See: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#sslEnabled-property
  c2.sslEnabled        = c.sslEnabled || true;

  return c2;
}

function forExample(x) {
  return;
}

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

