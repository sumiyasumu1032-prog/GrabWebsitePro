const router = require('express').Router();

// CONTROLLERS (AS IT IS)
const {
  signup,
  login,
  getAllUsers,
  getMyProfile,
  saveWallet
} = require('../controllers/authController');

// MIDDLEWARES (AS IT IS)
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const resetTodayProfit = require("../middleware/resetTodayProfit");

// MODEL (NEW – FOR PROFILE PHOTO)
const User = require("../models/User");

/* =========================
   AUTH
========================= */

router.post('/signup', signup);
router.post('/login', login);

/* =========================
   WALLET
========================= */

router.post("/wallet", authMiddleware, saveWallet);

/* =========================
   PROFILE (EXISTING)
========================= */

router.get('/me', authMiddleware, resetTodayProfit, getMyProfile);

/* =========================
   🔥 UPDATE PROFILE
   (PHOTO + NICKNAME)
========================= */

router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { nickname, profilePhoto } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (nickname !== undefined) {
      user.nickname = nickname;
    }

    if (profilePhoto !== undefined) {
      user.profilePhoto = profilePhoto; // base64
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        nickname: user.nickname,
        profilePhoto: user.profilePhoto
      }
    });

  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/* =========================
   🔥 DELETE PROFILE PHOTO
   (BACKEND DIRECT)
========================= */

router.delete("/profile/photo", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.profilePhoto = "";
    await user.save();

    res.json({
      success: true,
      message: "Profile photo deleted successfully"
    });

  } catch (err) {
    console.error("Profile photo delete error:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/* =========================
   ADMIN
========================= */

router.get('/users', authMiddleware, adminMiddleware, getAllUsers);

module.exports = router;
