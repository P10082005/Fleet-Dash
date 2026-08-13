// models/Document.js

const mongoose = require('mongoose');

const AstNodeSchema = new mongoose.Schema({
  type: { type: String, required: true },
  text: String,
  code: String,
  language: String,
  level: Number,
  ordered: Boolean,
  href: String,
  value: String,
  children: [Object],  // or [AstNodeSchema] if you want nesting
}, { _id: false });

const DocumentSchema = new mongoose.Schema({
  title: String,
  ast: AstNodeSchema,      // root document node
  // other fields: owner, createdAt, etc.
});

module.exports = mongoose.model('Document', DocumentSchema);