
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
  keyMirror,addKeyToMirror,reflect
}                                   = utils;
const {augment}                     = cmdUtils;

const log                           = ssg.log;




module.exports.stop = async function(argv) {
  var   roles       = argv.slice();

  const {instances, instanceData} = await getInstances('role', roles, {});
  var   InstanceIds = Object.keys(instances);



  var r = {};
  if (!argv['dry-run']) {
    r = await smartAws.ec2.stopInstances({InstanceIds}).promise();
//    r = {...r, startingInstances: r.startingInstances.map((instance) => {
//      const {tags,tags0} = instances[instance.InstanceId][0];
//      return {...instance, tags, tags0};
//    })};
console.log('r', r);
    r = {...r, StoppingInstances: augment(r.StoppingInstances, 'tags,tags0'.split(','), instances, 'InstanceId')};
  }

  return r;
};

module.exports.start = async function(argv) {
  var   roles       = argv.slice();
//  var   instanceids = [];
//
//  // ---------- ec2 -- instances --------------------------------------------------------------------------------------
//
//  // start the query for instances now -- let it work, while we deal with route53.
//  const reservations_p  = ec2.describeinstances({}).promise();
//
//  // ------------------------- ec2
//
//  const reservations  = await reservations_p;
//  const instancedata  = fix.instances(reservations);
//  //const loginstdata   = fix.instancelogging(instancedata);
//  //log(`instancedata`, {loginstdata});
//
//
//  var   idmirror  = {};
//  roles.foreach((role) => {
//    const instancelist  = lookupbytag(instancedata, 'role', role);
//    const iids          = fns.instanceids(instancelist);
//    idmirror            = addkeytomirror(idmirror, iids);
//  });
//  const instances   = reflect(idmirror, instancedata.by.instanceid);
//  instanceids       = Object.keys(idmirror);


  const {instances, instanceData} = await getInstances('role', roles, {});
  var   InstanceIds = Object.keys(instances);



  var r = {};
  if (!argv['dry-run']) {
    r = await smartAws.ec2.startInstances({InstanceIds}).promise();
    r = {...r, StartingInstances: r.StartingInstances.map((instance) => {
      const {tags,tags0} = instances[instance.InstanceId][0];
      return {...instance, tags, tags0};
    })};
  }

  return r;
};


async function getInstances_P(params ={}) {
  const reservations_P  = ec2.describeInstances(params).promise();

  return reservations_P;
}

async function getInstances(tagName, values, prom_) {
  var prom = prom_;
  if (!('then' in prom)) {
    prom = getInstances_P(prom);
  }

  const reservations  = await prom;
  const instanceData  = fix.instances(reservations);
  //const logInstData   = fix.instanceLogging(instanceData);
  //log(`InstanceData`, {logInstData});

console.log(tagName, values);
  var   idMirror  = {};
  values.forEach((value) => {
    const instanceList  = lookupByTag(instanceData, tagName, value);
    const iIds          = fns.instanceIds(instanceList);
    idMirror            = addKeyToMirror(idMirror, iIds);
  });
  const instances   = reflect(idMirror, instanceData.by.InstanceId);
  //InstanceIds       = Object.keys(idMirror);


  return {instances, instanceData};
}

