
const util = require('util');

var logger = {...console};

//logger.log = console.error;

module.exports.log = function(msg, ...args) {
  args.forEach((arg) => {
    console.log(msg, util.inspect(arg, {depth: null, colors: true}));
  });
};
const log = module.exports.log;

/**
 *  Runs a top-level async function.
 */
module.exports.runAsyncMain = function(main, argv) {
  (async() => {

    try {
      const mainResult_P    = main(argv);

      // Do other things like timing

      const mainResult      = await mainResult_P;
      var   result          = mainResult;
      var   err;

      // They may have returned result in [err, result] format
      if (Array.isArray(mainResult) && mainResult.length === 2) {
        ([err, result]      = mainResult);
      }

      if (err) {
        return handleErr(err);
      }

      if (result) {
        log('result', result);
  //      const output = JSON.stringify(result);
  //      logger.log(output);
        return result;
      }
    } catch(err) {
      return handleErr(err);
    }

  // Handle a thrown error
  })().catch((err) => {
    return handleErr(err);
  });
};

function handleErr(err) {
  logger.error('Caught err:', err);

  const code = ('code' in err ? err.code : 113);

  if (code !== 0) {
    setTimeout(() => process.exit(code), 0);
  }
}



