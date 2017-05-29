OptionService.$inject = ['dataService'];

function OptionService(dataService) {

  var options = {};

  /**
   * Set an option value
   */
  function set(key, value) {
    options[key] = value;
  }

  /**
   * Get an option value
   */
  function get(key) {
    return options[key];
  }

  /**
   * Fetch options from backend and populate data
   */
  function populate(records) {
    records.forEach(record => {
      let { key, value } = record;
      if( key.endsWith('Duration')) {
        key = key.replace('Duration', '');
        value = parseInt(value, 10);
      }
      set(key, value);
    });
  }

  /**
   * Expose functions
   */
  return {
    set, get, populate
  };
}

module.exports = OptionService;