const db = require("../Database/connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { resposne } = require("../Middleware/resposne");
let saltRounds = 10;
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "secret";

function sellergister(name, email, password, mobile_number) {
  return new Promise((resolve, reject) => {
    const insertSql = `
      INSERT INTO user (name, email, password, mobile_number) 
      VALUES (?, ?, ?, ?)
    `;

    const values = [name, email, password, mobile_number];

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

async function socialogin(google_id, apple_id) {
  const query = "SELECT * FROM user WHERE google_id = ? OR apple_id = ?";

  return new Promise((resolve, reject) => {
    db.query(query, [google_id, apple_id], (err, results) => {
      if (err) {
        return reject(err);
      }

      if (results.length > 0) {
        const user = results[0];
        const token = jwt.sign(
          {
            id: user.id,
            email: user.email,
            role: user.role,
            mobile_number: user.mobile_number,
            is_location:user.is_location,
            is_vehicle:user.is_vehicle
          },
          JWT_SECRET
        );

        return resolve({
          data: {
            id: user.id,
            email: user.email,
            mobile_number: user.mobile_number,
            role: user.role,
            is_location:user.is_location,
            is_vehicle:user.is_vehicle,
            token: token,
          },
        });
      }

      resolve({ error: "Invalid user" });
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

function loginseller(mobile_number, password) {
  const userQuery = "SELECT * FROM user WHERE mobile_number = ?";

  return new Promise((resolve, reject) => {
    db.query(userQuery, [mobile_number], async (err, results) => {
      if (err) {
        return reject(err);
      }

      if (results.length === 0) {
        return resolve({ error: "Invalid user" });
      }

      const user = results[0];

      // Check if the user has social login fields
      if (user.google_id || user.apple_id) {
        return resolve({ error: "Login not allowed. Use social login." });
      }

      // Ensure both password and user.password are defined
      if (!password || !user.password) {
        return resolve({ error: "Password is missing" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return resolve({ error: "Invalid password" });
      }

      const otpQuery = "SELECT is_verified FROM register_otp_verify WHERE mobile_number = ?";
      db.query(otpQuery, [mobile_number], (otpErr, otpResults) => {
        if (otpErr) {
          return reject(otpErr);
        }

        if (otpResults.length === 0 || otpResults[0].is_verified !== 1) {
          return resolve({ error: "Your mobile number is not verified" });
        }

        const token = jwt.sign(
          { id: user.id, name: user.name, role: user.role, email:user.email ,is_location:user.is_location,
            is_vehicle:user.is_vehicle },
          process.env.JWT_SECRET
        );

        resolve({
          data: {
            id: user.id,
            name: user.name,
            role: user.role,
            is_location:user.is_location,
            is_vehicle:user.is_vehicle,
            token: token,
          },
        });
      });
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
      const userId = userOtpData.userid;

      console.log("User ID from OTP Data:", userId);

      db.query(updateOtpSql, [mobile_number, otp], (updateError) => {
        if (updateError) {
          return reject(updateError);
        }

        db.query(selectUserSql, [userId], (userError, userResults) => {
          if (userError) {
            console.error("Error while selecting user data:", userError);
            return reject(userError);
          }
          if (userResults.length === 0) {
            console.log("No user found with ID:", userId);
            return reject(new Error("User not found"));
          }

          const userData = userResults[0];
          console.log("User Data:", userData);

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

          console.log("Token:", token);
          resolve({
            message: "OTP verified successfully",
            data: {
              id: userData.id,
              email: userData.email,
              mobile_number: userData.mobile_number,
              role: userData.role,
              token: token,
            },
          });
        });
      });
    });
  });
}


const checkverifed = (emailOrMobile) => {
  return new Promise((resolve, reject) => {
    const queryEmail =
      "SELECT * FROM register_otp_verify WHERE mobile_number = (SELECT mobile_number FROM user WHERE email = ?)";
    const queryMobile =
      "SELECT * FROM register_otp_verify WHERE mobile_number = ?";

    const query = emailOrMobile.includes("@") ? queryEmail : queryMobile;

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

const checkverifedmobile = (mobile_number) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM register_otp_verify WHERE mobile_number = ? AND is_verified = 1";

    db.query(query, [mobile_number], (err, results) => {
      if (err) {
        return reject(err);
      }
      if (results.length === 0) {
        return reject(new Error("Your mobile number is not verified"));
      }
      resolve(true);
    });
  });
};


function socialRegister(name, mobile_number, google_id, apple_id) {
  return new Promise((resolve, reject) => {
    const insertSql = `
      INSERT INTO user (name, mobile_number, google_id, apple_id) 
      VALUES (?, ?, ?, ?)
    `;

    const values = [name, mobile_number, google_id, apple_id];

    db.query(insertSql, values, (error, result) => {
      if (error) {
        console.error("Error while inserting data:", error);
        reject(error);
      } else {
        const sellerId = result.insertId;
        if (sellerId) {
          resolve({ id: sellerId });
        } else {
          reject(new Error("Failed to create seller"));
        }
      }
    });
  });
}


function checkphoneexisting(mobile_number) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM register_otp_verify WHERE mobile_number = ? AND is_verified = 1";
    db.query(query, [mobile_number], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

function userSubscription(longitude, latitude, address, userId) {
  return new Promise((resolve, reject) => {
    // Step 1: Check if userId exists in user_location table
    const checkSql = `
      SELECT id FROM user_location WHERE userId = ?
    `;

    db.query(checkSql, [userId], (checkError, checkResult) => {
      if (checkError) {
        reject(checkError);
      } else if (checkResult.length > 0) {
        // Step 2: userId exists, delete the existing record
        const deleteSql = `
          DELETE FROM user_location WHERE userId = ?
        `;

        db.query(deleteSql, [userId], (deleteError, deleteResult) => {
          if (deleteError) {
            reject(deleteError);
          } else {
            // Step 3: Proceed to insert new record
            const insertSql = `
              INSERT INTO user_location (longitude, latitude, address, userId) 
              VALUES (?, ?, ?, ?)
            `;
            const insertValues = [longitude, latitude, address, userId];

            db.query(insertSql, insertValues, (insertError, insertResult) => {
              if (insertError) {
                reject(insertError);
              } else {
                resolve(insertResult.insertId);
              }
            });
          }
        });
      } else {
        // Step 4: userId does not exist, insert a new record
        const insertSql = `
          INSERT INTO user_location (longitude, latitude, address, userId) 
          VALUES (?, ?, ?, ?)
        `;
        const insertValues = [longitude, latitude, address, userId];

        db.query(insertSql, insertValues, (insertError, insertResult) => {
          if (insertError) {
            reject(insertError);
          } else {
            resolve(insertResult.insertId);
          }
        });
      }
    });
  });
}



const updateUserLocation = (userId) => {
  return new Promise((resolve, reject) => {
    const updateSql = `
      UPDATE user
      SET is_vehicle = 1
      WHERE id = ?
    `;

    db.query(updateSql, [userId], (error, result) => {
      if (error) {
        console.error("Error while updating user location:", error);
        return reject(error);
      }

      if (result.affectedRows > 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};
function userVehicle(carname, userId) {
  return new Promise((resolve, reject) => {
    const checkSql = `
      SELECT id FROM user_vehicle WHERE userId = ?
    `;

    db.query(checkSql, [userId], (checkError, checkResult) => {
      if (checkError) {
        reject(checkError);
      } else if (checkResult.length > 0) {
        // UserId exists, delete the existing record
        const deleteSql = `
          DELETE FROM user_vehicle WHERE userId = ?
        `;

        db.query(deleteSql, [userId], (deleteError, deleteResult) => {
          if (deleteError) {
            reject(deleteError);
          } else {
            // Proceed to insert new record
            const insertSql = `
              INSERT INTO user_vehicle (carname, userId) 
              VALUES (?, ?)
            `;
            const insertValues = [carname, userId];

            db.query(insertSql, insertValues, (insertError, insertResult) => {
              if (insertError) {
                reject(insertError);
              } else {
                resolve(insertResult.insertId);
              }
            });
          }
        });
      } else {
        // UserId does not exist, insert a new record
        const insertSql = `
          INSERT INTO user_vehicle (carname, userId) 
          VALUES (?, ?)
        `;
        const insertValues = [carname, userId];

        db.query(insertSql, insertValues, (insertError, insertResult) => {
          if (insertError) {
            reject(insertError);
          } else {
            resolve(insertResult.insertId);
          }
        });
      }
    });
  });
}


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
  checkverifed,
  socialogin,
  socialRegister,
  checkverifedmobile,
  checkphoneexisting,
  updateUserLocation,
  userVehicle
};
