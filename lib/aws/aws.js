
const AWS                           = require('aws-sdk');

var   s = {};


var   awsConfig = config({
  region:           'us-east-1',
});

const aws                     = s.AWS           = s.AWS           || AWS;
const config_                 = s.config        = s.config        || new AWS.Config(awsConfig);
const route53                 = s.route53       = s.route53       || new AWS.Route53(s.config);
const ec2                     = s.ec2           = s.ec2           || new AWS.EC2(s.config);
const s3                      = s.s3            = s.s3            || new AWS.S3(s.config);
const lambda                  = s.lambda        = s.lambda        || new AWS.Lambda(s.config);
const dynamoDb                = s.dynamoDb      = s.dynamoDb      || new AWS.DynamoDB(s.config);

const rds                     = s.rds           = s.rds           || new AWS.RDS(s.config);
const ses                     = s.ses           = s.ses           || new AWS.SES(s.config);
const sns                     = s.sns           = s.sns           || new AWS.SNS(s.config);
const sqs                     = s.sqs           = s.sqs           || new AWS.SQS(s.config);

const eventBridge             = s.eventBridge   = s.eventBridge   || new AWS.EventBridge(s.config);
const gameLift                = s.gameLift      = s.gameLift      || new AWS.GameLift(s.config);
const lightsail               = s.lightsail     = s.lightsail     || new AWS.Lightsail(s.config);
const roboMaker               = s.roboMaker     = s.roboMaker     || new AWS.RoboMaker(s.config);

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


// Export
Object.keys(s).forEach((key)  => {
  module.exports[key] = s[key];
});

