const mongoose = require("mongoose");
const { Schema } = mongoose;

const WithdrawRequestSchema = new Schema(
{
    // User
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // Amount
    amount: {
        type: Number,
        required: true
    },

    // Wallet Type
    walletType: {
        type: String,
        enum: ["BEP20", "TRC20", "BANK"],
        required: true
    },

    // Wallet Name
    walletName: {
        type: String,
        default: ""
    },

    // Holder Name
    holderName: {
        type: String,
        default: ""
    },

    // Wallet Address / Bank Account Number
    walletAddress: {
        type: String,
        required: true
    },

    // Network
    network: {
        type: String,
        enum: ["BSC", "TRON", "BANK"],
        required: true
    },

    // Invitation Code
    invitationCode: {
        type: String,
        default: ""
    },

    // Status
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    }

},
{ timestamps: true }
);

module.exports = mongoose.model("WithdrawRequest", WithdrawRequestSchema);
