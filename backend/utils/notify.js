const Notification = require('../models/Notification');

/**
 * Create notifications for one or many users.
 * @param {Array|String} userIds - single id or array of ids
 * @param {Object} payload - { title, message, type, link }
 */
const notify = async (userIds, payload) => {
  const ids = Array.isArray(userIds) ? userIds : [userIds];
  if (!ids.length) return;
  const docs = ids.map((user) => ({ user, ...payload }));
  try {
    await Notification.insertMany(docs);
  } catch (err) {
    console.error('Notification creation failed:', err.message);
  }
};

module.exports = notify;
