const db = require("../Database/connection");
const bcrypt = require("bcrypt");
const { func } = require("joi");
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv')

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "secret"; // Ensure this is set in your environment variables
console.log("lfgjkfdjgkdfg",JWT_SECRET)

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
    INSERT INTO user( name, mobile_number, email, password, address, company_name, gst_number) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      name,
      mobile_number,
      email,
      password,
      address,
      company_name,
      gst_number
    ];

    db.query(insertSql, values, (error, result) => {
      if (error) {
        console.error("Error While inserting data:", error);
        reject(error);
      } else {
        const sellerId = result.insertId;

        if (sellerId > 0) {
          const successMessage = "Created user successfully";
          resolve(successMessage);
        } else {
          const errorMessage = "Failed to create seller";
          reject(errorMessage);
        }
      }
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


function loginseller(email, password, callback) {
  const query = "SELECT * FROM user  WHERE email = ?";
  db.query(query, [email], async (err, results) => {
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

    const secretKey = "secretkey";
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secretKey
    );
    console.log("token", token);
    return callback(null, {
      data: {
        id: user.id,
        email: user.email,
        password: user.password,
        role: user.role,
        token: token,
      },
    });
  });
}



function sellergister(
  mobile_number,
  otp
) {
  return new Promise((resolve, reject) => {
    const insertSql = `
    INSERT INTO user_otp(mobile_number, otp) 
    VALUES (?, ?)
    `;

    const values = [
      mobile_number,
      otp
    ];

    db.query(insertSql, values, (error, result) => {
      if (error) {
        console.error("Error While inserting data:", error);
        reject(error);
      } else {
        const sellerId = result.insertId;

        if (sellerId > 0) {
          const successMessage = "otp send successfully";
          resolve(successMessage);
        } else {
          const errorMessage = "Failed to send otp";
          reject(errorMessage);
        }
      }
    });
  });
}



function generateOTP() {
  let digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < 4; i++) {
      OTP += digits[Math.floor(Math.random() * digits.length)];
  }
  return OTP;
}

function storeOTP(mobile_number, otp) {
  return new Promise((resolve, reject) => {
    const insertSql = `
      INSERT INTO user_otp (mobile_number, otp)
      VALUES (?, ?)
    `;
    const values = [mobile_number, otp];

    db.query(insertSql, values, (error, result) => {
      if (error) {
        console.error("Error while inserting data:", error);
        reject(error);
      } else {
        const successMessage = "OTP sent successfully";
        resolve(successMessage);
      }
    });
  });
}


// Function to generate a JWT token
function generateToken(mobile_number) {
  const token = jwt.sign({ mobile_number }, JWT_SECRET, { expiresIn: '1h' });
  return token;
}
module.exports = {
  sellergister,
  checkname,
  loginseller,
  checkemail,
  generateOTP,
  storeOTP,
  checkphone,
  generateToken
};
