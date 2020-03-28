
const smartAws                      = require('../smart-aws');
const ssg                           = require('../ssg');
const utils                         = require('../utils');
const cmdUtils                      = require('./cmd-utils');
const {
  route53,ec2,fix,fns
}                                   = smartAws;
const {
  lookupByTag
}                                   = fns;
const {
  keyMirror,addKeyToMirror,reflect,arrayify
}                                   = utils;
const {augment}                     = cmdUtils;

const log                           = ssg.log;


//---------------------------------------------------------------------------------------------------------------------
/**
 *  Start EC2 instances by Name or role.
 */
module.exports.start = async function(args, argv) {
  const names       = arrayify(argv.names     || argv.name    || args.slice());
  const roles       = arrayify(argv.roles     || argv.role);

  var   instances, instanceData;

  if (names.length > 0) {
    ({instances, instanceData} = await getInstances('Name', names, {}));
  } else {
    ({instances, instanceData} = await getInstances('role', roles, {}));
  }

  var   InstanceIds = Object.keys(instances);

  // Build up the result
  var r = {};
  if (!argv['dry-run']) {
    r = await smartAws.ec2.startInstances({InstanceIds}).promise();
    r = {...r, StartingInstances: augment(r.StartingInstances, ['tags', 'tags0'], instances, 'InstanceId')};
  }

  return r;
};

//---------------------------------------------------------------------------------------------------------------------
/**
 *  Stop EC2 instances by Name or role.
 */
module.exports.stop = async function(args, argv) {
  const names       = arrayify(argv.names     || argv.name    || args.slice());
  const roles       = arrayify(argv.roles     || argv.role);

  var   instances, instanceData;
console.log(`where it came from `, {argv});

  if (names.length > 0) {
    ({instances, instanceData} = await getInstances('Name', names, {}));
  } else if (roles.length > 0) {
    ({instances, instanceData} = await getInstances('role', roles, {}));
  } else {
    console.error(`Cannot find instances ${argv}`, {argv});
  }

  var   InstanceIds = Object.keys(instances);

  // Build up the result
  var r = {};
  if (!argv['dry-run']) {
    r = await smartAws.ec2.stopInstances({InstanceIds}).promise();
    r = {...r, StoppingInstances: augment(r.StoppingInstances, ['tags', 'tags0'], instances, 'InstanceId')};
  }

  return r;
};

//---------------------------------------------------------------------------------------------------------------------
/**
 *  Reboot EC2 instances by Name or role.
 */
module.exports.reboot = async function(args, argv) {
  log('reboot', {argv});
  const names       = arrayify(argv.names     || argv.name    || args.slice());
  const roles       = arrayify(argv.roles     || argv.role);

  var   instances, instanceData;

  if (names.length > 0) {
    ({instances, instanceData} = await getInstances('Name', names, {}));
  } else {
    ({instances, instanceData} = await getInstances('role', roles, {}));
  }

  var   InstanceIds = Object.keys(instances);

  // Build up the result
  var r = {};
  if (!argv['dry-run']) {
    r = await smartAws.ec2.rebootInstances({InstanceIds}).promise();
    r = {...r, RebootingInstances: augment(r.RebootingInstances, ['tags', 'tags0'], instances, 'InstanceId')};
  }

  return r;
};

//---------------------------------------------------------------------------------------------------------------------
/**
 *  Terminate EC2 instances by Name or role.
 */
module.exports.terminate = async function(args, argv) {
  const names       = arrayify(argv.names     || argv.name    || args.slice());
  const roles       = arrayify(argv.roles     || argv.role);

  var   instances, instanceData;

  if (names.length > 0) {
    ({instances, instanceData} = await getInstances('Name', names, {}));
  } else {
    ({instances, instanceData} = await getInstances('role', roles, {}));
  }

  var   InstanceIds = Object.keys(instances);

  // Build up the result
  var r = {};
  if (!argv['dry-run']) {
    r = await smartAws.ec2.terminateInstances({InstanceIds}).promise();
    r = {...r, TerminatingInstances: augment(r.TerminatingInstances, ['tags', 'tags0'], instances, 'InstanceId')};
  }

  return r;
};


//---------------------------------------------------------------------------------------------------------------------
/**
 *  Get a promise for describeInstances.
 */
async function getInstances_P(params ={}) {
  log('getInstance_P', {params});
  const reservations_P  = ec2.describeInstances(params).promise();

  return reservations_P;
}

//---------------------------------------------------------------------------------------------------------------------
/**
 *  Await for the describeInstances() promose to resolve, then
 *  fixup the result.
 */
async function getInstances(tagName, values, prom_) {
  var prom = prom_;
  if (!('then' in prom)) {
    prom = getInstances_P(prom);
  }
  log(`getInstances`, {tagName, values});

  const reservations  = await prom;
  const instanceData  = fix.instances(reservations);
  //const logInstData   = fix.instanceLogging(instanceData);
  //log(`InstanceData`, {logInstData});

  var   idMirror  = {};
  values.forEach((value) => {
    const instanceList  = lookupByTag(instanceData, tagName, value) || [];
    log(`eavcvalue`, {tagName, value, length: instanceList.length});
    const iIds          = fns.instanceIds(instanceList);
    idMirror            = addKeyToMirror(idMirror, iIds);
  });
  const instances   = reflect(idMirror, instanceData.by.InstanceId);
  //InstanceIds       = Object.keys(idMirror);


  return {instances, instanceData};
}

