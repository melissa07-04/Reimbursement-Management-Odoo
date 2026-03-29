import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  domain: { type: String, required: true, unique: true },
  defaultCurrency: { type: String, required: true },
}, { timestamps: true });

export const Company = mongoose.model('Company', companySchema);
