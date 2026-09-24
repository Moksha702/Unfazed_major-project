const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  gateway_transaction_id: {
    type: String,
    sparse: true
  },
  therapist_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Therapist',
    required: true,
    index: true
  },
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true
  },
  session_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  },
  package_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package'
  },
  amount: {
    type: Number,
    required: true
  },
  platform_fee: {
    type: Number,
    default: 0
  },
  net_amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['pending', 'captured', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: String,
    default: 'UPI / Card'
  },
  razorpayOrderId: {
    type: String
  },
  razorpayPaymentId: {
    type: String
  },
  razorpaySignature: {
    type: String
  },
  invoiceNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  invoiceUrl: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
