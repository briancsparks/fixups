
module.exports.identifierify = module.exports.idify = function(x) {
  return x.replace(/[^a-z0-9_]/ig, '_');
};

const isnt = module.exports.isnt = function(x) {
  if (x === null || x === undefined)  { return true; }
  if (x !== x)  { return true; }

  return false;
};

const arrayify = module.exports.arrayify = function(arr) {
  if (Array.isArray(arr))   { return arr; }
  if (isnt(arr))            { return []; }
  return [arr];
};

const addTo = module.exports.addTo = function(arr, items) {
  return [...(arr ||[]), ...arrayify(items)];
};

module.exports.addKeyToMirror = function(keyMirror, keys) {
  keys.forEach((key) => {
    keyMirror[key] = key;
  });
  return keyMirror;
};

module.exports.keyMirror = function(keys) {
  return module.exports.addKeyToMirror({}, keys);
};

module.exports.reflect = function(keyMirror, obj) {
  return Object.keys(keyMirror).reduce((m,k)=> {
    return {...m, [k]: obj[k]};
  }, {});
};

module.exports.omit = function(obj, ...keys) {
  if (keys.length === 1 && Array.isArray(keys[0])) { return omit(arr, ...keys[0]); }

  const newKeys = Object.keys(obj).filter((key) => keys.indexOf(key) !== -1);

  return newKeys.reduce((m, key) => {
    m = {...m, [key]: obj[key]};
    return m;
  }, {});
}

/**
 *  Gets a sub-sub-key.
 */
module.exports.deref = function(x, keys_) {
  if (isnt(x))      { return; /* undefined */ }
  if (isnt(keys_))  { return; /* undefined */ }

  var keys    = Array.isArray(keys_) ? keys_.slice() : keys_.split('.'), key;
  var result  = x;

  while (keys.length > 0) {
    key = keys.shift();
    if (!(result = result[key])) {
      // We got a falsy result.  If this was the last item, return it (so, for example
      // we would return a 0 (zero) if looked up.
      if (keys.length === 0) { return result; }

      /* otherwise -- return undefined */
      return; /* undefined */
    }
  }

  return result;
};


