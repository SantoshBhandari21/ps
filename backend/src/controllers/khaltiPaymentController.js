// src/controllers/khaltiPaymentController.js
const { runQuery, getOne, getAll } = require("../config/database");
const axios = require("axios");

// ============ KHALTI CONFIGURATION ============
const KHALTI_CONFIG = {
  secretKey:
    process.env.KHALTI_SECRET_KEY || "05bf95cc57244045b8df5fad06748dab",
  apiUrl: process.env.KHALTI_API_URL || "https://dev.khalti.com/api/v2",
  websiteUrl: process.env.KHALTI_WEBSITE_URL || "http://localhost:3000",
  successUrl:
    process.env.KHALTI_SUCCESS_URL ||
    "http://localhost:3000/rental/payment-success",
};

// ============ HELPER FUNCTIONS ============

// Generate unique purchase order ID
const generatePurchaseOrderId = () => `Order${Date.now()}`;

// Validate minimum amount
const validateAmount = (amount) => {
  if (!amount || amount <= 0) {
    return { valid: false, error: "Invalid amount" };
  }
  if (amount < 10) {
    return { valid: false, error: "Minimum amount required is Rs 10" };
  }
  return { valid: true };
};

// Format phone number for Khalti
const formatPhoneNumber = (phone) => {
  const defaultPhone = "9800000000";
  if (!phone) return defaultPhone;
  return phone.length > 10 ? phone.slice(-10) : phone;
};

// Calculate months from dates
const calculateMonthsFromDates = (moveInDate, moveOutDate) => {
  const start = new Date(moveInDate);
  const end = new Date(moveOutDate);
  const daysRented = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return Math.ceil(daysRented / 30);
};

// ============ CONTROLLER FUNCTIONS ============

// Initiate Khalti Payment
exports.initiatePayment = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;
    const userId = req.user.id;
    const user = req.user;

    // Validate input
    if (!bookingId || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const amountValidation = validateAmount(amount);
    if (!amountValidation.valid) {
      return res.status(400).json({ message: amountValidation.error });
    }

    // Check if booking exists and belongs to user
    const booking = await getOne(
      "SELECT * FROM bookings WHERE id = ? AND tenant_id = ?",
      [bookingId, userId],
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const purchaseOrderId = generatePurchaseOrderId();

    // Create payment record
    const paymentResult = await runQuery(
      `INSERT INTO khalti_payments (booking_id, user_id, amount, purchase_order_id, status)
       VALUES (?, ?, ?, ?, 'initiated')`,
      [bookingId, userId, amount, purchaseOrderId],
    );

    try {
      // Prepare Khalti payload
      const khaltiPayload = {
        return_url: KHALTI_CONFIG.successUrl,
        website_url: KHALTI_CONFIG.websiteUrl,
        amount: Math.round(amount * 100), // Convert to paisa
        purchase_order_id: purchaseOrderId,
        purchase_order_name: "Room Rental",
        customer_info: {
          name: (user.full_name || user.email || "Customer").substring(0, 50),
          email: user.email,
          phone: formatPhoneNumber(user.phone),
        },
      };

      // Call Khalti API
      const khaltiResponse = await axios.post(
        `${KHALTI_CONFIG.apiUrl}/epayment/initiate/`,
        khaltiPayload,
        {
          headers: {
            Authorization: `Key ${KHALTI_CONFIG.secretKey}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("✅ Khalti Response Success:", khaltiResponse.data);

      // Update payment record with Khalti response
      await runQuery(
        `UPDATE khalti_payments 
         SET pidx = ?, payment_url = ?, khalti_response = ? 
         WHERE purchase_order_id = ?`,
        [
          khaltiResponse.data.pidx,
          khaltiResponse.data.payment_url,
          JSON.stringify(khaltiResponse.data),
          purchaseOrderId,
        ],
      );

      return res.json({
        payment_url: khaltiResponse.data.payment_url,
        pidx: khaltiResponse.data.pidx,
        expires_at: khaltiResponse.data.expires_at,
      });
    } catch (khaltiErr) {
      console.error(
        "❌ KHALTI API ERROR:",
        khaltiErr.response?.data || khaltiErr.message,
      );
      return res.status(500).json({
        message:
          khaltiErr.response?.data?.detail ||
          khaltiErr.response?.data?.message ||
          "Failed to initiate Khalti payment",
      });
    }
  } catch (err) {
    console.error("Payment initiation error:", err);
    res.status(500).json({ message: "Failed to initiate payment" });
  }
};

// Verify Payment from Khalti
exports.verifyPayment = async (req, res) => {
  try {
    const { pidx, status, transaction_id, purchase_order_id } = req.query;

    // Validate callback parameters
    if (!pidx || !status || !purchase_order_id) {
      return res.status(400).json({
        message: "Invalid callback parameters",
        received: { pidx, status, purchase_order_id },
      });
    }

    // Check if status is successful
    if (status !== "Completed") {
      return res.status(400).json({
        message: "Payment not completed",
        status,
      });
    }

    // Verify payment with Khalti API
    let khaltiResponse;
    try {
      const verifyResponse = await axios.post(
        `${KHALTI_CONFIG.apiUrl}/epayment/lookup/`,
        { pidx },
        {
          headers: {
            Authorization: `Key ${KHALTI_CONFIG.secretKey}`,
            "Content-Type": "application/json",
          },
        },
      );
      khaltiResponse = verifyResponse.data;
    } catch (khaltiErr) {
      console.error("Khalti verification error:", khaltiErr.response?.data);
      return res.status(500).json({
        message: "Failed to verify payment with Khalti",
        error: khaltiErr.response?.data?.detail || khaltiErr.message,
      });
    }

    // Check payment status
    if (khaltiResponse.status !== "Completed") {
      return res.status(400).json({
        message: `Payment status is ${khaltiResponse.status}. Transaction must be Completed.`,
        khalti_status: khaltiResponse.status,
      });
    }

    // Update payment record
    await runQuery(
      `UPDATE khalti_payments 
       SET status = 'completed', 
           transaction_id = ?, 
           khalti_lookup_response = ? 
       WHERE pidx = ?`,
      [
        transaction_id || khaltiResponse.transaction_id,
        JSON.stringify(khaltiResponse),
        pidx,
      ],
    );

    // Get booking details
    const paymentRecord = await getOne(
      `SELECT 
        kp.booking_id, 
        b.room_id, 
        b.tenant_id,
        b.move_in_date, 
        b.move_out_date, 
        r.title as room_title, 
        r.location as room_location, 
        r.price as room_price
       FROM khalti_payments kp
       JOIN bookings b ON kp.booking_id = b.id
       JOIN rooms r ON b.room_id = r.id
       WHERE kp.pidx = ?`,
      [pidx],
    );

    if (!paymentRecord) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    // Update booking status to approved
    await runQuery(
      "UPDATE bookings SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [paymentRecord.booking_id],
    );

    // Mark room as unavailable
    await runQuery("UPDATE rooms SET is_available = 0 WHERE id = ?", [
      paymentRecord.room_id,
    ]);

    // Create notification
    try {
      await runQuery(
        `INSERT INTO notifications (user_id, type, title, message, booking_id, is_read)
         VALUES (?, 'booking_approved', 'Rental Booking Confirmed', 
                 'Your rental booking has been confirmed after payment', ?, 0)`,
        [paymentRecord.tenant_id, paymentRecord.booking_id],
      );
    } catch (notifErr) {
      console.error("Notification creation error:", notifErr);
      // Don't fail payment if notification fails
    }

    // Calculate months for response
    const monthsRented = calculateMonthsFromDates(
      paymentRecord.move_in_date,
      paymentRecord.move_out_date,
    );

    return res.json({
      message: "Payment verified and booking approved",
      pidx,
      booking_id: paymentRecord.booking_id,
      transaction_id: khaltiResponse.transaction_id,
      amount: khaltiResponse.total_amount,
      room: {
        id: paymentRecord.room_id,
        title: paymentRecord.room_title,
        location: paymentRecord.room_location,
        price: paymentRecord.room_price,
      },
      rental: {
        months: monthsRented,
        startDate: paymentRecord.move_in_date,
        moveOutDate: paymentRecord.move_out_date,
      },
    });
  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ message: "Failed to verify payment" });
  }
};

// Get Payment Status
exports.getPaymentStatus = async (req, res) => {
  try {
    const { pidx } = req.params;

    if (!pidx) {
      return res.status(400).json({ message: "pidx is required" });
    }

    const payment = await getOne(
      "SELECT * FROM khalti_payments WHERE pidx = ?",
      [pidx],
    );

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    return res.json({
      pidx: payment.pidx,
      purchase_order_id: payment.purchase_order_id,
      amount: payment.amount,
      status: payment.status,
      transaction_id: payment.transaction_id,
      created_at: payment.created_at,
      updated_at: payment.updated_at,
    });
  } catch (err) {
    console.error("Error fetching payment status:", err);
    res.status(500).json({ message: "Failed to fetch payment status" });
  }
};

// Get Payment by Booking ID
exports.getPaymentByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!bookingId) {
      return res.status(400).json({ message: "bookingId is required" });
    }

    const payment = await getOne(
      "SELECT * FROM khalti_payments WHERE booking_id = ? ORDER BY created_at DESC LIMIT 1",
      [bookingId],
    );

    if (!payment) {
      return res
        .status(404)
        .json({ message: "Payment not found for this booking" });
    }

    return res.json({
      pidx: payment.pidx,
      booking_id: payment.booking_id,
      amount: payment.amount,
      status: payment.status,
      transaction_id: payment.transaction_id,
      created_at: payment.created_at,
    });
  } catch (err) {
    console.error("Error fetching payment by booking:", err);
    res.status(500).json({ message: "Failed to fetch payment details" });
  }
};

// Get all payments for logged-in user (tenant)
exports.getMyPayments = async (req, res) => {
  try {
    const userId = req.user.id;

    const payments = await getAll(
      `SELECT 
        kp.id,
        kp.booking_id,
        kp.amount,
        kp.status,
        kp.transaction_id,
        kp.created_at,
        kp.payment_method,
        b.room_id,
        b.move_in_date,
        b.move_out_date,
        b.total_price,
        r.title as room_title,
        r.location as room_location,
        tenant.full_name as tenant_name,
        tenant.email as tenant_email,
        owner.full_name as owner_name,
        owner.email as owner_email
       FROM khalti_payments kp
       JOIN bookings b ON kp.booking_id = b.id
       JOIN rooms r ON b.room_id = r.id
       JOIN users tenant ON kp.user_id = tenant.id
       JOIN users owner ON b.owner_id = owner.id
       WHERE kp.user_id = ?
       ORDER BY kp.created_at DESC`,
      [userId],
    );

    return res.json({ payments: payments || [] });
  } catch (err) {
    console.error("Error fetching user payments:", err);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
};
