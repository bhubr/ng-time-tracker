/*----------------------------------------
 | Lang related stuff
 *----------------------------------------
 |
 */
JsonapiUtils.$inject = ['lodash'];

function JsonapiUtils(_) {

  function lowerFirstChar(string) {
    return string.charAt(0).toLowerCase() + string.substring(1);
  }

  function lowerCamelAttributes(attributes) {
    var newAttrs = {};
    for(var a in attributes) {
      var lowerCamelAttrKey = lowerFirstChar( _.camelCase(a));
      newAttrs[lowerCamelAttrKey] = attributes[a];
    }
    return newAttrs;
  }


  function kebabAttributes(attributes) {
    var newAttrs = {};
    for(var a in attributes) {
    var snakedAttrKey = _.kebabCase(a);
    newAttrs[snakedAttrKey] = attributes[a];
    }
    return newAttrs;
  }

  function unmapRecords(records) {
    return _.map(records, unmapRecord);
  }

  function unmapRecord(record) {
    return Object.assign({ id: record.id },
      lowerCamelAttributes(record.attributes)
    );
  }

  return {
    lowerCamelAttributes,
    kebabAttributes,
    unmapRecords,
    unmapRecord
  }

}

module.exports = JsonapiUtils;