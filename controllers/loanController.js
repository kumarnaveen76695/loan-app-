const Loan = require("../models/Loan");

// Create Loan
const createLoan = async (req, res) => {
  try {
    const { amount, term } = req.body;

    if (!amount || !term || term <= 0 || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount or term." });
    }

    // Generate weekly repayments
    const repayments = Array.from({ length: term }).map((_, i) => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (i + 1) * 7); // Weekly intervals
      const repaymentAmount = (amount / term).toFixed(2);
      return { dueDate, amount: repaymentAmount, status: "PENDING" };
    });

    const loan = await Loan.create({
      userId: req.user.userId,
      amount,
      term,
      repayments,
    });

    res.status(201).json({ message: "Loan created successfully", loan });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Approve Loan
const approveLoan = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ error: "Loan not found" });
    }

    if (loan.status !== "PENDING") {
      return res.status(400).json({ error: "Loan is already approved or paid" });
    }

    loan.status = "APPROVED";
    await loan.save();

    res.status(200).json({ message: "Loan approved", loan });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// View Loans (Customer-specific)
const getUserLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ userId: req.user.userId });
    res.status(200).json({ loans });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Add Repayment
const addRepayment = async (req, res) => {
  try {
    const { loanId, amount } = req.body;

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ error: "Loan not found" });
    }

    if (loan.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (loan.status !== "APPROVED") {
      return res.status(400).json({ error: "Loan is not approved for repayments" });
    }

    const nextRepayment = loan.repayments.find(
      (repayment) => repayment.status === "PENDING"
    );

    if (!nextRepayment) {
      return res.status(400).json({ error: "No pending repayments" });
    }

    if (amount < nextRepayment.amount) {
      return res.status(400).json({ error: "Repayment amount is insufficient" });
    }

    // Mark repayment as paid
    nextRepayment.status = "PAID";

    // Check if all repayments are paid
    const allPaid = loan.repayments.every(
      (repayment) => repayment.status === "PAID"
    );
    if (allPaid) {
      loan.status = "PAID";
    }

    await loan.save();

    res.status(200).json({ message: "Repayment successful", loan });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { createLoan, approveLoan, getUserLoans, addRepayment };
