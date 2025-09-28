import LocationModel from "../../models/location.model.js";

/**
 * Get list of all locations
 * @returns {Promise<{id: string, name: string, email: string, role: string}[]>} User info
 */
const getLocations = async () => {
  return LocationModel.find();
};

/**
 * Find or create a location based on name
 * @param {Object} locationData - Location data object
 * @param {string} locationData.name - Location name
 * @param {string} locationData.address - Location address
 * @param {string} locationData.postCode - Location postcode
 * @param {Object} locationData.cordinates - Location coordinates
 * @param {number} locationData.cordinates.longitude - Longitude
 * @param {number} locationData.cordinates.latitude - Latitude
 * @returns {Promise<Object>} Location document
 */
const findOrCreateLocation = async (locationData) => {
  let location = await LocationModel.findOne({ name: locationData.name });

  if (!location) {
    location = new LocationModel(locationData);
    await location.save();
  }

  return location;
};

export { getLocations, findOrCreateLocation };
