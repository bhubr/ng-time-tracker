var _ = require('lodash');

function snakeAttributes(attributes) {
	var newAttrs = {};
	for(var a in attributes) {
		var snakedAttrKey = _.snakeCase(a);
		newAttrs[snakedAttrKey] = attributes[a];
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

function mapRecords(records, type) {
	return _.map(records, record => {
		const id = record.id;
		delete record.id;
    const attributes = kebabAttributes(record);
		return Object.assign({}, { id, type }, { attributes });
	});
}

module.exports = {
	snakeAttributes, kebabAttributes, mapRecords
}