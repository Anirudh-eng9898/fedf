/**
 * Database configuration
 * Uses JSON file-based storage as fallback when MySQL is not connected
 */
const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const collections = ['users', 'activities', 'sleep', 'hydration', 'goals', 'challenges', 'notifications'];

// Initialize JSON files if they don't exist
collections.forEach(collection => {
  const filePath = path.join(DB_DIR, `${collection}.json`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
  }
});

/**
 * Read data from a JSON collection
 * @param {string} collection - Name of the collection
 * @returns {Array} Array of records
 */
const readCollection = (collection) => {
  const filePath = path.join(DB_DIR, `${collection}.json`);
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

/**
 * Write data to a JSON collection
 * @param {string} collection - Name of the collection
 * @param {Array} data - Array of records to write
 */
const writeCollection = (collection, data) => {
  const filePath = path.join(DB_DIR, `${collection}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

/**
 * Find records matching a query
 * @param {string} collection - Name of the collection
 * @param {Object} query - Key-value pairs to match
 * @returns {Array} Matching records
 */
const find = (collection, query = {}) => {
  const data = readCollection(collection);
  return data.filter(item => {
    return Object.keys(query).every(key => item[key] === query[key]);
  });
};

/**
 * Find a single record by ID
 * @param {string} collection - Name of the collection
 * @param {string} id - Record ID
 * @returns {Object|null} Found record or null
 */
const findById = (collection, id) => {
  const data = readCollection(collection);
  return data.find(item => item.id === id) || null;
};

/**
 * Insert a new record
 * @param {string} collection - Name of the collection
 * @param {Object} record - Record to insert
 * @returns {Object} Inserted record
 */
const insert = (collection, record) => {
  const data = readCollection(collection);
  data.push(record);
  writeCollection(collection, data);
  return record;
};

/**
 * Update a record by ID
 * @param {string} collection - Name of the collection
 * @param {string} id - Record ID
 * @param {Object} updates - Fields to update
 * @returns {Object|null} Updated record or null
 */
const updateById = (collection, id, updates) => {
  const data = readCollection(collection);
  const index = data.findIndex(item => item.id === id);
  if (index === -1) return null;
  data[index] = { ...data[index], ...updates };
  writeCollection(collection, data);
  return data[index];
};

/**
 * Delete a record by ID
 * @param {string} collection - Name of the collection
 * @param {string} id - Record ID
 * @returns {boolean} Whether deletion was successful
 */
const deleteById = (collection, id) => {
  const data = readCollection(collection);
  const index = data.findIndex(item => item.id === id);
  if (index === -1) return false;
  data.splice(index, 1);
  writeCollection(collection, data);
  return true;
};

module.exports = {
  readCollection,
  writeCollection,
  find,
  findById,
  insert,
  updateById,
  deleteById
};
