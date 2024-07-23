const db = require("../Database/connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { resposne } = require("../Middleware/resposne");
let saltRounds = 10;
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "secret";

function sellergister(
  name,
  mobile_number,
  email,
  password,
  address,
  company_name,
  gst_number
) {
  return new Promise((resolve, reject) => {
    const insertSql = `
      INSERT INTO user (name, mobile_number, email, password, address, company_name, gst_number) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      name,
      mobile_number,
      email,
      password,
      address,
      company_name,
      gst_number,
    ];

    db.query(insertSql, values, (error, result) => {
      if (error) {
        console.error("Error while inserting data:", error);
        reject(error);
      } else {
        const sellerId = result.insertId;
        if (sellerId) {
          resolve(sellerId);
        } else {
          reject(new Error("Failed to create seller"));
        }
      }
    });
  });
}

function RegisterOtp(userid, otp, mobile_number) {
  return new Promise((resolve, reject) => {
    const deleteSql = `
      DELETE FROM register_otp_verify WHERE mobile_number = ?
    `;
    const insertSql = `
      INSERT INTO register_otp_verify (userid, otp, mobile_number)
      VALUES (?, ?, ?)
    `;
    db.beginTransaction((err) => {
      if (err) {
        console.error("Error starting transaction:", err);
        return reject(err);
      }

      db.query(deleteSql, [mobile_number], (error) => {
        if (error) {
          return db.rollback(() => {
            console.error("Error deleting existing OTP:", error);
            reject(error);
          });
        }

        db.query(insertSql, [userid, otp, mobile_number], (error, result) => {
          if (error) {
            return db.rollback(() => {
              console.error("Error while inserting data:", error);
              reject(error);
            });
          }

          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                console.error("Error committing transaction:", err);
                reject(err);
              });
            }

            const successMessage = "OTP sent successfully";
            resolve(successMessage);
          });
        });
      });
    });
  });
}

function checkname(name) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM user WHERE name = ?";
    db.query(query, [name], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

function checkphone(mobile_number) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM user WHERE mobile_number = ?";
    db.query(query, [mobile_number], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

function checkemail(email) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM user WHERE email = ?";
    db.query(query, [email], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

function checkphone(mobile_number) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM user WHERE mobile_number = ?";
    db.query(query, [mobile_number], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

function loginseller(emailOrMobile, password, callback) {
  const query = "SELECT * FROM user WHERE email = ? OR mobile_number = ?";
  db.query(query, [emailOrMobile, emailOrMobile], async (err, results) => {
    if (err) {
      return callback(err, null);
    }

    if (results.length === 0) {
      return callback(null, { error: "Invalid user" });
    }

    const user = results[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return callback(null, { error: "Invalid password" });
    }

    const secretKey = JWT_SECRET;
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role,mobile_number:user.mobile_number },
      secretKey
    );
    console.log("token", token);
    return callback(null, {
      data: {
        id: user.id,
        email: user.email,
        mobile_number: user.mobile_number,
        role: user.role,
        token: token,
      },
    });
  });
}

// function sellergister(
//   mobile_number,
//   otp
// ) {
//   return new Promise((resolve, reject) => {
//     const insertSql = `
//     INSERT INTO user_otp(mobile_number, otp)
//     VALUES (?, ?)
//     `;

//     const values = [
//       mobile_number,
//       otp
//     ];

//     db.query(insertSql, values, (error, result) => {
//       if (error) {
//         console.error("Error While inserting data:", error);
//         reject(error);
//       } else {
//         const sellerId = result.insertId;

//         if (sellerId > 0) {
//           const successMessage = "otp send successfully";
//           resolve(successMessage);
//         } else {
//           const errorMessage = "Failed to send otp";
//           reject(errorMessage);
//         }
//       }
//     });
//   });
// }

function generateOTP() {
  let OTP = "123456";
  return OTP;
}

function storeOTP(mobile_number, otp) {
  return new Promise((resolve, reject) => {
    const deleteSql = `
      DELETE FROM user_otp WHERE mobile_number = ?
    `;
    const insertSql = `
      INSERT INTO user_otp (mobile_number, otp)
      VALUES (?, ?)
    `;
    db.beginTransaction((err) => {
      if (err) {
        console.error("Error starting transaction:", err);
        return reject(err);
      }

      db.query(deleteSql, [mobile_number], (error) => {
        if (error) {
          return db.rollback(() => {
            console.error("Error deleting existing OTP:", error);
            reject(error);
          });
        }

        db.query(insertSql, [mobile_number, otp], (error, result) => {
          if (error) {
            return db.rollback(() => {
              console.error("Error while inserting data:", error);
              reject(error);
            });
          }

          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                console.error("Error committing transaction:", err);
                reject(err);
              });
            }

            const successMessage = "OTP sent successfully";
            resolve(successMessage);
          });
        });
      });
    });
  });
}

function verifyOTP(mobile_number, otp) {
  return new Promise((resolve, reject) => {
    const selectSql = `
      SELECT * FROM user_otp WHERE mobile_number = ? AND otp = ?
    `;
    const updateSql = `
      UPDATE user_otp SET is_verified = 1 WHERE mobile_number = ? AND otp = ?
    `;

    db.query(selectSql, [mobile_number, otp], (error, results) => {
      if (error) {
        console.error("Error while selecting data:", error);
        reject(error);
      } else if (results.length === 0) {
        reject(new Error("Invalid OTP"));
      } else {
        db.query(
          updateSql,
          [mobile_number, otp],
          (updateError, updateResult) => {
            if (updateError) {
              console.error("Error while updating data:", updateError);
              reject(updateError);
            } else {
              resolve("OTP verified successfully");
            }
          }
        );
      }
    });
  });
}

async function changePassword({ mobile_number, password }) {
  return new Promise((resolve, reject) => {
    const selectSql =
      "SELECT * FROM user_otp WHERE mobile_number = ? AND is_verified = 1";
    const updateSql = "UPDATE user SET password = ? WHERE mobile_number = ?";

    db.query(selectSql, [mobile_number], async (error, results) => {
      if (error) {
        console.error("Error while selecting data:", error);
        return reject(error);
      }

      if (results.length === 0) {
        return reject(new Error("OTP not verified"));
      }

      try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        db.query(updateSql, [hashedPassword, mobile_number], (updateError) => {
          if (updateError) {
            console.error("Error while updating data:", updateError);
            return reject(updateError);
          }

          resolve("Password changed successfully");
        });
      } catch (hashError) {
        console.error("Error while hashing password:", hashError);
        reject(hashError);
      }
    });
  });
}

function checkSubId(sub_id) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM subscription WHERE id = ?";
    db.query(query, [sub_id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? results[0] : null);
      }
    });
  });
}

function userSubscription(sub_id, userId) {
  return new Promise((resolve, reject) => {
    const updateSql = `
      UPDATE user_subscription SET is_deleted = 1 WHERE user_id = ?
    `;

    const insertSql = `
      INSERT INTO user_subscription (sub_id, user_id) 
      VALUES (?, ?)
    `;

    db.query(updateSql, [userId], (updateError, updateResult) => {
      if (updateError) {
        console.error(
          "Error while marking previous subscriptions as deleted:",
          updateError
        );
        return reject(updateError);
      }

      const values = [sub_id, userId];
      db.query(insertSql, values, (insertError, insertResult) => {
        if (insertError) {
          console.error("Error while inserting new subscription:", insertError);
          return reject(insertError);
        }

        const subscriptionId = insertResult.insertId;

        if (subscriptionId > 0) {
          const selectSql = `
            SELECT 
              c.id AS subscription_id, 
              c.sub_id, 
              c.user_id, 
              u.id AS user_id, 
              u.name AS user_name
            FROM user_subscription c
            LEFT JOIN user u ON c.user_id = u.id
            WHERE c.id = ?
          `;

          db.query(selectSql, [subscriptionId], (selectError, selectResult) => {
            if (selectError) {
              console.error(
                "Error while fetching subscription details:",
                selectError
              );
              return reject(selectError);
            }

            const result = selectResult[0]; // Assuming there is only one result
            const subscriptionDetails = {
              subscription_id: result.subscription_id,
              sub_id: result.sub_id,
              user: {
                id: result.user_id,
                name: result.user_name,
              },
            };

            resolve(subscriptionDetails);
          });
        } else {
          const errorMessage = "Failed to create user subscription";
          reject(errorMessage);
        }
      });
    });
  });
}

async function ListAllSubId() {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM subscription ";
    db.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

function checkphoneotp(mobile_number) {
  return new Promise((resolve, reject) => {
    const query =
      "SELECT * FROM user_otp WHERE mobile_number = ? AND is_verified = 1";
    db.query(query, [mobile_number], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0);
      }
    });
  });
}

function updateOtpUserId(userid, mobile_number) {
  return new Promise((resolve, reject) => {
    const updateSql = `
      UPDATE register_otp_verify SET userid = ? WHERE mobile_number = ?
    `;
    db.query(updateSql, [userid, mobile_number], (error, result) => {
      if (error) {
        console.error("Error while updating OTP with user ID:", error);
        reject(error);
      } else {
        resolve("OTP updated with user ID successfully");
      }
    });
  });
}

function verifyUserOtp(mobile_number, otp) {
  return new Promise((resolve, reject) => {
    const selectOtpSql = `
      SELECT * FROM register_otp_verify WHERE mobile_number = ? AND otp = ?
    `;
    const updateOtpSql = `
      UPDATE register_otp_verify SET is_verified = 1 WHERE mobile_number = ? AND otp = ?
    `;
    const selectUserSql = `
      SELECT * FROM user WHERE id = ?
    `;

    db.query(selectOtpSql, [mobile_number, otp], (error, results) => {
      if (error) {
        console.error("Error while selecting OTP data:", error);
        return reject(error);
      }
      if (results.length === 0) {
        return reject(new Error("Invalid OTP"));
      }

      const userOtpData = results[0];
      const userid = userOtpData.userid;

      db.query(
        updateOtpSql,
        [mobile_number, otp],
        (updateError, updateResult) => {
          if (updateError) {
            return reject(updateError);
          }

          db.query(selectUserSql, [userid], (userError, userResults) => {
            if (userError) {
              return reject(userError);
            }
            if (userResults.length === 0) {
              return reject(new Error("User not found"));
            }

            const userData = userResults[0];
            const secretKey = process.env.JWT_SECRET;
            const token = jwt.sign(
              {
                id: userData.id,
                email: userData.email,
                role: userData.role,
                mobile_number: userData.mobile_number,
              },
              secretKey
            );

            console.log("token", token);
            resolve({
              message: "OTP verified successfully",
              data: {
                id: userData.id,
                email: userData.email,
                mobile: userData.mobile_number,
                role: userData.role,
                token: token,
              },
            });
          });
        }
      );
    });
  });
}

const checkverifed = (emailOrMobile) => {
  return new Promise((resolve, reject) => {
    const queryEmail = "SELECT * FROM register_otp_verify WHERE mobile_number = (SELECT mobile_number FROM user WHERE email = ?)";
    const queryMobile = "SELECT * FROM register_otp_verify WHERE mobile_number = ?";
    
    const query = emailOrMobile.includes('@') ? queryEmail : queryMobile;

    db.query(query, [emailOrMobile], (err, results) => {
      if (err) {
        return reject(err);
      }
      if (results.length === 0 || results[0].is_verified !== 1) {
        return reject(new Error("Your mobile number is not verified"));
      }
      resolve(true);
    });
  });
};


module.exports = {
  sellergister,
  checkname,
  loginseller,
  checkemail,
  generateOTP,
  storeOTP,
  checkphone,
  verifyOTP,
  changePassword,
  checkSubId,
  userSubscription,
  ListAllSubId,
  checkphoneotp,
  RegisterOtp,
  updateOtpUserId,
  verifyUserOtp,
  checkverifed
};
