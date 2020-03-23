
const isnt = module.exports.isnt = function(x) {
  if (x === null || x === undefined)  { return true; }
  if (x !== x)  { return true; }

  return false;
};

const arrayify = function(arr) {
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


