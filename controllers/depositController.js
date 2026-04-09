const DepositRequest = require("../models/DepositRequest");
const User = require("../models/User");

// ==============================
// USER → CREATE DEPOSIT REQUEST
// ==============================
exports.requestDeposit = async (req, res) => {
  try {
    const { amount, network, walletAddress, accountNumber, invitationCode } = req.body;

    if (!amount || amount < 20) {
      return res.status(400).json({
        success: false,
        message: "Minimum deposit amount is 20"
      });
    }

    let data = {
      user: req.user.id,
      amount,
      network,
      invitationCode
    };

    // 🔥 NETWORK LOGIC
    if (network === "BSC (BEP20)" || network === "TRC20") {
      if (!walletAddress) {
        return res.status(400).json({ success: false, message: "Wallet address required" });
      }
      data.walletAddress = walletAddress;
    }

    if (network === "Bank Account") {
      if (!accountNumber) {
        return res.status(400).json({ success: false, message: "Account number required" });
      }
      data.accountNumber = accountNumber;
    }

    const deposit = await DepositRequest.create(data);

    return res.json({
      success: true,
      deposit
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

// ==============================
// ADMIN → GET ALL DEPOSIT REQUESTS
// ==============================
exports.getAllDeposits = async (req, res) => {
  try {
    const deposits = await DepositRequest.find()
    .populate("user", "nickname invitationCode")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      deposits
    });
  } catch (error) {
    console.error("Get deposits error:", error);
    res.status(500).json({ success: false });
  }
};

// ==============================
// ADMIN → APPROVE DEPOSIT
// ==============================
exports.approveDeposit = async (req, res) => {
  try {
    const deposit = await DepositRequest.findById(req.params.id);
    if (!deposit) {
      return res.status(404).json({ message: "Deposit not found" });
    }

    const user = await User.findById(deposit.user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Balance update
    
    user.totalBalance += deposit.amount;

    await user.save();

    // Mark approved
    deposit.status = "approved";
    await deposit.save();

    return res.json({
      success: true,
      message: "Deposit approved & balance updated"
    });

  } catch (error) {
    console.error("Approve deposit error:", error);
    res.status(500).json({ success: false });
  }
};

// ==============================
// ADMIN → REJECT DEPOSIT
// ==============================
exports.rejectDeposit = async (req, res) => {
  try {
    const deposit = await DepositRequest.findById(req.params.id);
    if (!deposit) {
      return res.status(404).json({ message: "Deposit not found" });
    }

    deposit.status = "rejected";
    await deposit.save();

    res.json({
      success: true,
      message: "Deposit rejected"
    });

  } catch (error) {
    console.error("Reject deposit error:", error);
    res.status(500).json({ success: false });
  }
};

// ==============================
// GET BEP20 ADDRESS
// ==============================
exports.getBep20Address = async (req, res) => {
  const user = await User.findById(req.user.id);

  res.json({
    success: true,
    address: user.depositWallets?.bep20?.address || ""
  });
};

// ==============================
// GET TRC20 ADDRESS
// ==============================
exports.getTrc20Address = async (req, res) => {
  const user = await User.findById(req.user.id);

  res.json({
    success: true,
    address: user.depositWallets?.trc20?.address || ""
  });
};

// ==============================
// GET BANK ACCOUNT
// ==============================
exports.getBankAccount = async (req, res) => {
  const user = await User.findById(req.user.id);

  res.json({
    success: true,
    accountNumber: user.depositWallets?.bank?.accountNumber || ""
  });
};
