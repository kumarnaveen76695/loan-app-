const express = require("express");
const {
  createLoan,
  approveLoan,
  getUserLoans,
  addRepayment,
} = require("../controllers/loanController");
const auth = require("../middleware/auth");
const router = express.Router();

// Customer routes
router.post("/", auth, createLoan);
router.get("/", auth, getUserLoans);
router.post("/repayment", auth, addRepayment);

// Admin routes
router.patch("/:id/approve", auth, approveLoan);

module.exports = router;
