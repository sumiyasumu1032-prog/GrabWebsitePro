const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    /* ================= BASIC INFO ================= */
    nickname: {
      type: String,
      required: true,
      trim: true
    },

    phone: {
      type: String,
      required: true,
      unique: true
    },

    loginPassword: {
      type: String,
      required: true
    },

    password1: {
      type: String
    },

    invitationCode: {
      type: String,
      required: true,
      unique: true
    },

    // 🔥 PROFILE PHOTO (BASE64)
    profilePhoto: {
      type: String,
      default: ""
    },

    /* ================= BALANCE ================= */
    balance: { type: Number, default: 0 },       // legacy / optional
    totalBalance: { type: Number, default: 0 },
    todayProfit: { type: Number, default: 0 },

    /* ================= ORDERS ================= */
    currentOrders: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },

    /* ================= USER WALLET ================= */
    wallet: {
      platform: { type: String, default: "" },
      address: { type: String, default: "" }
    },

    /* ================= ADMIN FLAGS ================= */
    isAdmin: {
      type: Boolean,
      default: false
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    /* ================= DEPOSIT WALLET (ADMIN CONTROL) ================= */
    depositWallets: {
      bep20: {
        address: { type: String, default: "" }
      },
      trc20: {
        address: { type: String, default: "" }
      },
      bank: {
        accountNumber: { type: String, default: "" }
      }
    }
  },
  { timestamps: true }
);

/* ==================================================
   🔥 AUTO SYNC: isAdmin ↔ role
   (Existing data bhi safe rahega)
================================================== */
UserSchema.pre("save", function (next) {
  if (this.isAdmin === true) {
    this.role = "admin";
  }
  next();
});

module.exports = mongoose.model("User", UserSchema);
