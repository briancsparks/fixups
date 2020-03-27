
var u = {};

u.augment = function(items, keys, table, tableKey) {
  return items.map((item) => {
    var extras = {};

    keys.forEach((key) => {
      extras[key] = firstItem(table[item[tableKey]])[key];
    });

    return {...item, ...extras};
  });
};

// Export
Object.keys(u).forEach((key)  => {
  module.exports[key] = u[key];
});

function firstItem(arr) {
  if (Array.isArray(arr)) {
    return arr[0];
  }

  return arr;
}

