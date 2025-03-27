
const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true , unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'UserSocialMedia', required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshToken = mongoose.model('RefreshTokenSocialMedia', refreshTokenSchema);

module.exports = RefreshToken;

// Index Key: { expiresAt: 1 } means MongoDB will index the field expiresAt in ascending order.

// expireAfterSeconds: 0: Documents will be removed as soon as the date stored in the expiresAt field is reached.