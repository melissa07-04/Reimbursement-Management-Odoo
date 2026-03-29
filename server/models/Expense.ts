import mongoose from 'mongoose';

const approvalSchema = new mongoose.Schema({
  role: String,
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  approvals: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Approved', 'Rejected'] },
    comment: String,
    date: Date
  }],
  requiredPercentage: Number,
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'] }
});

const expenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  convertedAmount: { type: Number, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  receiptFile: { type: String }, // base64 or URL
  status: { type: String, enum: ['Draft', 'Pending Manager', 'Pending Finance', 'Pending Director', 'Approved', 'Rejected'], default: 'Pending Manager' },
  approvalFlow: [approvalSchema],
  currentStageIndex: { type: Number, default: 0 }
}, { timestamps: true });

export const Expense = mongoose.model('Expense', expenseSchema);
