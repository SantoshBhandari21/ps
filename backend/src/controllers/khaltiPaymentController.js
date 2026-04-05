// src/controllers/khaltiPaymentController.js
const { db } = require("../config/database");
const axios = require("axios");
const crypto = require("crypto");

// Khalti Configuration
const KHALTI_CONFIG = {
  secretKey:
    process.env.KHALTI_SECRET_KEY || "05bf95cc57244045b8df5fad06748dab",
  apiUrl: process.env.KHALTI_API_URL || "https://dev.khalti.com/api/v2",
  websiteUrl: process.env.KHALTI_WEBSITE_URL || "http://localhost:3000",
  successUrl:
    process.env.KHALTI_SUCCESS_URL ||
    "http://localhost:3000/rental/payment-success",
};

// Generate unique purchase order ID
const generatePurchaseOrderId = () => {
  return `RentalOrder_${crypto.randomBytes(8).toString("hex")}_${Date.now()}`;
};

// Initiate Khalti Payment
exports.initiatePayment = (req, res) => {
  try {
    const { bookingId, amount } = req.body;
    const userId = req.user.id;
    const user = req.user;

    // Validation
    if (!bookingId || !amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid booking or amount" });
    }

    // Khalti requires minimum 10 rupees (1000 paisa)
    if (amount < 10) {
      return res
        .status(400)
        .json({ message: "Minimum amount required is Rs 10" });
    }

    // Check if booking exists and belongs to user
    db.get(
      "SELECT * FROM bookings WHERE id = ? AND tenant_id = ?",
      [bookingId, userId],
      async (err, booking) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Database error" });
        }

        if (!booking) {
          return res.status(404).json({ message: "Booking not found" });
        }

        const purchaseOrderId = generatePurchaseOrderId();

        // Create payment record
        const paymentSql = `
          INSERT INTO khalti_payments (booking_id, user_id, amount, purchase_order_id, status)
          VALUES (?, ?, ?, ?, 'initiated')
        `;

        db.run(
          paymentSql,
          [bookingId, userId, amount, purchaseOrderId],
          async function (err) {
            if (err) {
              console.error("Database error:", err);
              return res
                .status(500)
                .json({ message: "Failed to initiate payment" });
            }

            try {
              // Call Khalti API to initiate payment
              const khaltiPayload = {
                return_url: KHALTI_CONFIG.successUrl,
                website_url: KHALTI_CONFIG.websiteUrl,
                amount: Math.round(amount * 100), // Convert to paisa
                purchase_order_id: purchaseOrderId,
                purchase_order_name: `Room Rental - Order ${purchaseOrderId}`,
                customer_info: {
                  name: user.full_name || user.email,
                  email: user.email,
                  phone: "9800000000",
                },
              };

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

              // Update payment record with Khalti response
              const updateSql = `
              UPDATE khalti_payments 
              SET pidx = ?, payment_url = ?, khalti_response = ? 
              WHERE purchase_order_id = ?
            `;

              db.run(
                updateSql,
                [
                  khaltiResponse.data.pidx,
                  khaltiResponse.data.payment_url,
                  JSON.stringify(khaltiResponse.data),
                  purchaseOrderId,
                ],
                (updateErr) => {
                  if (updateErr) {
                    console.error("Database update error:", updateErr);
                    return res
                      .status(500)
                      .json({ message: "Failed to save payment details" });
                  }

                  res.json({
                    payment_url: khaltiResponse.data.payment_url,
                    pidx: khaltiResponse.data.pidx,
                    expires_at: khaltiResponse.data.expires_at,
                  });
                },
              );
            } catch (khaltiErr) {
              console.error(
                "Khalti API error:",
                khaltiErr.response?.data || khaltiErr.message,
              );
              return res.status(500).json({
                message:
                  khaltiErr.response?.data?.purchase_order_id?.[0] ||
                  "Failed to initiate Khalti payment",
              });
            }
          },
        );
      },
    );
  } catch (err) {
    console.error("Payment initiation error:", err);
    res.status(500).json({ message: "Failed to initiate payment" });
  }
};

// Handle Payment Callback
exports.verifyPayment = (req, res) => {
  try {
    const { pidx, status, transaction_id, purchase_order_id } = req.query;

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
        status: status,
      });
    }

    // Verify payment with Khalti API
    axios
      .post(
        `${KHALTI_CONFIG.apiUrl}/epayment/lookup/`,
        { pidx },
        {
          headers: {
            Authorization: `Key ${KHALTI_CONFIG.secretKey}`,
            "Content-Type": "application/json",
          },
        },
      )
      .then((khaltiResponse) => {
        const paymentStatus = khaltiResponse.data.status;

        // Only proceed if payment is Completed
        if (paymentStatus !== "Completed") {
          return res.status(400).json({
            message: `Payment status is ${paymentStatus}. Transaction must be Completed.`,
            khalti_status: paymentStatus,
          });
        }

        // Update payment record in database
        const updatePaymentSql = `
          UPDATE khalti_payments 
          SET status = 'completed', 
              transaction_id = ?, 
              khalti_lookup_response = ? 
          WHERE pidx = ?
        `;

        db.run(
          updatePaymentSql,
          [
            transaction_id || khaltiResponse.data.transaction_id,
            JSON.stringify(khaltiResponse.data),
            pidx,
          ],
          (updateErr) => {
            if (updateErr) {
              console.error("Database update error:", updateErr);
              return res
                .status(500)
                .json({ message: "Failed to update payment status" });
            }

            // Get booking details with room info from khalti_payments
            db.get(
              `SELECT 
                kp.booking_id, 
                b.room_id, 
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
              (selectErr, paymentRecord) => {
                if (selectErr) {
                  console.error("Database select error:", selectErr);
                  return res
                    .status(500)
                    .json({ message: "Failed to retrieve booking details" });
                }

                if (!paymentRecord) {
                  return res
                    .status(404)
                    .json({ message: "Payment record not found" });
                }

                // Calculate number of months from dates or from payment amount
                const startDate = new Date(paymentRecord.move_in_date);
                const moveOutDate = new Date(paymentRecord.move_out_date);
                const daysRented = Math.ceil(
                  (moveOutDate - startDate) / (1000 * 60 * 60 * 24),
                );
                const monthsRented = Math.ceil(daysRented / 30);

                // Update booking status to approved and mark room as unavailable
                const updateBookingSql =
                  "UPDATE bookings SET status = 'approved' WHERE id = ?";

                db.run(
                  updateBookingSql,
                  [paymentRecord.booking_id],
                  (bookingErr) => {
                    if (bookingErr) {
                      console.error(
                        "Database booking update error:",
                        bookingErr,
                      );
                      return res
                        .status(500)
                        .json({ message: "Failed to approve booking" });
                    }

                    // Mark room as unavailable
                    const updateRoomSql =
                      "UPDATE rooms SET is_available = 0 WHERE id = ?";
                    db.run(
                      updateRoomSql,
                      [paymentRecord.room_id],
                      (roomErr) => {
                        if (roomErr) {
                          console.error("Database room update error:", roomErr);
                          return res
                            .status(500)
                            .json({
                              message: "Failed to update room availability",
                            });
                        }

                        // Create notification
                        const notificationSql = `
                      INSERT INTO notifications (user_id, type, title, message, booking_id, is_read)
                      VALUES (
                        (SELECT tenant_id FROM bookings WHERE id = ?),
                        'booking_approved',
                        'Rental Booking Confirmed',
                        'Your rental booking has been confirmed after payment',
                        ?,
                        0
                      )
                    `;

                        db.run(
                          notificationSql,
                          [paymentRecord.booking_id, paymentRecord.booking_id],
                          (notifErr) => {
                            if (notifErr) {
                              console.error(
                                "Notification creation error:",
                                notifErr,
                              );
                              // Don't fail the payment if notification fails
                            }

                            res.json({
                              message: "Payment verified and booking approved",
                              pidx: pidx,
                              booking_id: paymentRecord.booking_id,
                              transaction_id:
                                khaltiResponse.data.transaction_id,
                              amount: khaltiResponse.data.total_amount,
                              // Room details for receipt
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
                          },
                        );
                      },
                    );
                  },
                );
              },
            );
          },
        );
      })
      .catch((khaltiErr) => {
        console.error(
          "Khalti verification error:",
          khaltiErr.response?.data || khaltiErr.message,
        );
        return res.status(500).json({
          message: "Failed to verify payment with Khalti",
          error: khaltiErr.response?.data?.detail || khaltiErr.message,
        });
      });
  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ message: "Failed to verify payment" });
  }
};

// Get Payment Status
exports.getPaymentStatus = (req, res) => {
  try {
    const { pidx } = req.params;

    if (!pidx) {
      return res.status(400).json({ message: "pidx is required" });
    }

    db.get(
      "SELECT * FROM khalti_payments WHERE pidx = ?",
      [pidx],
      (err, payment) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Database error" });
        }

        if (!payment) {
          return res.status(404).json({ message: "Payment not found" });
        }

        res.json({
          pidx: payment.pidx,
          purchase_order_id: payment.purchase_order_id,
          amount: payment.amount,
          status: payment.status,
          transaction_id: payment.transaction_id,
          created_at: payment.created_at,
          updated_at: payment.updated_at,
        });
      },
    );
  } catch (err) {
    console.error("Error fetching payment status:", err);
    res.status(500).json({ message: "Failed to fetch payment status" });
  }
};

// Get Payment by Booking ID
exports.getPaymentByBooking = (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!bookingId) {
      return res.status(400).json({ message: "bookingId is required" });
    }

    db.get(
      "SELECT * FROM khalti_payments WHERE booking_id = ? ORDER BY created_at DESC LIMIT 1",
      [bookingId],
      (err, payment) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Database error" });
        }

        if (!payment) {
          return res
            .status(404)
            .json({ message: "Payment not found for this booking" });
        }

        res.json({
          pidx: payment.pidx,
          booking_id: payment.booking_id,
          amount: payment.amount,
          status: payment.status,
          transaction_id: payment.transaction_id,
          created_at: payment.created_at,
        });
      },
    );
  } catch (err) {
    console.error("Error fetching payment by booking:", err);
    res.status(500).json({ message: "Failed to fetch payment details" });
  }
};

// Get all payments for logged-in user (tenant)
exports.getMyPayments = (req, res) => {
  try {
    const userId = req.user.id;

    const sql = `
      SELECT 
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
        u.full_name as owner_name,
        u.email as owner_email
      FROM khalti_payments kp
      JOIN bookings b ON kp.booking_id = b.id
      JOIN rooms r ON b.room_id = r.id
      JOIN users u ON b.owner_id = u.id
      WHERE kp.user_id = ?
      ORDER BY kp.created_at DESC
    `;

    db.all(sql, [userId], (err, payments) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      res.json({ payments: payments || [] });
    });
  } catch (err) {
    console.error("Error fetching user payments:", err);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
};
