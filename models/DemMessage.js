const mongoose = require("mongoose");

const demoMessageSchema = new mongoose.Schema({
  content: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("DemoMessage", demoMessageSchema);
