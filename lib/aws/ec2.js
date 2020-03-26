
const utils                         = require('../utils');
const { deref,addKeyToMirror }      = utils;

var   s = {};

s.fix = {};

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

s.fix.instances = function(reservations) {

  // This is the return value
  var r = {
    items:[],
    by: {...indexBy}
  };

  // Loop over the reservations/instances structure
  reservations.Reservations.forEach((resv) => {
    resv.Instances.forEach((instance) => {
      const index = r.items.length;

      var   newValue = instance;

      // Figure out the Tag situation.
      //
      // {
      //   tag_Name_webtier: true
      //   tag_fqdns_jenkins_cdr0_net: true,
      //   tag_fqdns_api_cdr0_net: true,
      //   ...
      //   tags: {
      //     fqdns: [ 'jenkins_cdr0_net', 'api_cdr0_net' ]
      //     ...
      //   }
      //   tags0: {
      //     fqdns: [ 'jenkins.cdr0.net', 'api.cdr0.net' ]
      //     ...
      //   }
      // }

      var   tags0 = {};
      var   tags  = {};
      instance.Tags.forEach((tag) => {
        const key       = tag.Key.replace(/[^a-z0-9_]/gi, '_');
        const value0    = tag.Value.split(',');
        const value     = tag.Value.split(',').map((s) => s.replace(/[^a-z0-9_]/gi, '_'));

        tags0[key]  = value0;
        tags[key]   = value;

        value.forEach((v) => {
          //const indexKey = `tag_${key}___${v}`.replace(/_+$/g, '');
          const indexKey = `tag_${key}_${v}`.replace(/_+$/g, '');
          const orig = r.by[indexKey] || [];

          r.by[indexKey] = [...orig, newValue];

          instance[indexKey] = true;
        });
      });

      // Update the instance with the tags we created
      instance.tags               = tags;
      instance.tags0              = tags0;

      // Update the instance with its index and a unique ID
      instance.index              = index;
      instance._uniqId            = instance.InstanceId;

      // Put onto the root of the instance object items that are usually deeper
      instance.AvailabilityZone   = instance.Placement.AvailabilityZone;
      instance.State              = instance.State.Name;
      instance.OwnerId            = ((instance.NetworkInterfaces ||[])[0] ||{}).OwnerId;
      instance.GroupName          = ((instance.SecurityGroups ||[])[0] ||{}).GroupName;
      instance.GroupId            = ((instance.SecurityGroups ||[])[0] ||{}).GroupId;

      // Come up with a 'guaranteed' commonName
      instance.commonName         = deref(instance, 'tags0.fqdns.0') ||
                                    deref(instance, 'tags0.role.0') ||
                                    deref(instance, 'tags.Name') ||
                                    deref(instance, 'InstanceId');

      // Save it
      r.items.push(instance);


      Object.keys(indexBy).forEach((indexKey) => {
        const subKey  = instance[indexKey];

        if (subKey) {
          const orig              = r.by[indexKey][subKey] || [];
          r.by[indexKey][subKey]  = [...orig, newValue];
        }
      });
    });
  });

  return r;
};

/**
 *  The instances object from fix.instances() is huge because of the `by` index.
 *
 *  Replace all items in the `by` index with just the index of the instance.
 */
s.fix.instanceLogging = function(instanceData) {

  // Deep copy
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

