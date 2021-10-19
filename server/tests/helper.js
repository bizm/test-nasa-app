/**
 * Helper function to create a NEO instance with properties we need for our tests.
 */
exports.neo = (id, distance, diameter) => {
  const item = {
    id: id
  };
  if (distance) {
    item.close_approach_data = [{
      miss_distance: { kilometers: distance }
    }];
  }
  if (diameter) {
    item.estimated_diameter = {
      meters: { estimated_diameter_max: diameter }
    };
  }
  return item;
}
