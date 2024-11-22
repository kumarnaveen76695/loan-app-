const mongoose = require("mongoose");

const RepaymentSchema = new mongoose.Schema({
  dueDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["PENDING", "PAID"], default: "PENDING" },
});

const LoanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  term: { type: Number, required: true },
  status: { type: String, enum: ["PENDING", "APPROVED", "PAID"], default: "PENDING" },
  repayments: [RepaymentSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Loan", LoanSchema);
