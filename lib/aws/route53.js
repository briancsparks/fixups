
const utils                         = require('../utils');
const { deref,addKeyToMirror,idify }= utils;

var   s = {};

s.fns = {};
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



// Export
Object.keys(s).forEach((key)  => {
  module.exports[key] = s[key];
});


