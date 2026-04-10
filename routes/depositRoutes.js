const router = require("express").Router();

const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const User = require("../models/User");
const DepositRequest = require("../models/DepositRequest");

const {
  requestDeposit,
  getAllDeposits,
  approveDeposit,
  rejectDeposit,
  getBep20Address,
  getTrc20Address,
  getBankAccount
} = require("../controllers/depositController");

// =====================================================
// USER → Create deposit request
// =====================================================
router.post("/request", auth, requestDeposit);

// =====================================================
// ADMIN → Get all deposit requests
// =====================================================
router.get("/all", auth, admin, getAllDeposits);

// =====================================================
// USER → Get own deposit address
// =====================================================
// BEP20
router.get("/address", auth, getBep20Address);

// TRC20
router.get("/trc20-address", auth, getTrc20Address);

// BANK
router.get("/bank-account", auth, getBankAccount);

// =====================================================
// ADMIN → Approve deposit
// =====================================================
router.post("/approve/:id", auth, admin, approveDeposit);

// =====================================================
// ADMIN → Reject deposit
// =====================================================
router.post("/reject/:id", auth, admin, rejectDeposit);

// =====================================================
// USER → GET DEPOSIT RECORDS (🆕 ADDED, SAFE)
// =====================================================
router.get("/deposit-records/:invitationCode", auth, async (req, res) => {
  try {
    const { invitationCode } = req.params;

    // 🔍 Find user by invitation code
    const user = await User.findOne({ invitationCode });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // ✅ IMPORTANT: user (NOT userId)
    const records = await DepositRequest.find({ user: user._id })
      .sort({ createdAt: -1 });

    const totalDeposits = records
      .filter(r => r.status === "approved")
      .reduce((sum, r) => sum + r.amount, 0);

    const todayDeposits = records
      .filter(
        r =>
          r.status === "approved" &&
          new Date(r.createdAt).toDateString() ===
            new Date().toDateString()
      )
      .reduce((sum, r) => sum + r.amount, 0);

    res.json({
      success: true,
      records,
      userInfo: {
        nickname: user.nickname,
        phone: user.phone,
        invitationCode: user.invitationCode,
        totalDeposits,
        todayDeposits
      }
    });
  } catch (err) {
    console.error("Deposit records error:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;
