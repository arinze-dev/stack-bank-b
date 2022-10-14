
const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");

const accountDetailsSchema = new Schema({
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    balance: {
      type: mongoose.Decimal128,
      required: true,
      default: 0.0,
    },
    totalDeposit: {
      type: mongoose.Decimal128,
      default: 0.00,
      trim:true
    },
  
    totalWithdraw: {
      type: mongoose.Decimal128,
      trim:true,
      default: 0.00
    },
    createdAt: {
      type: Date,
      default: () => Date.now(),
      required:true,
      immutable:true
    },
    updated_at:{ type: Date }
  });


  accountDetailsSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
  });

  const AccountDetails = model("AccountDetails", accountDetailsSchema);

  
module.exports = {AccountDetails};