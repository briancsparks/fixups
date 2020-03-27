
var u = {};

u.augment = function(arr, keys, table, tableKey) {
  return arr.map((item) => {
    var extra = {};
    keys.forEach((key) => {
      extra[key] = firstItem(table[item[tableKey]]);
    });

    return {...item, ...extra};
  });
};

// Export
Object.keys(u).forEach((key)  => {
  module.exports[key] = s[key];
});

function firstItem(arr) {
  if (Array.isArray(arr)) {
    return arr[0];
  }

  return arr;
}

