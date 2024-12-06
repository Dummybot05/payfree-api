import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import bcrypt from 'bcryptjs';
import isValidRegex from "./validation.js";
config();

const sql = neon(process.env.DATABASE_URL);

// Login starts here
const checkEmailExist = async (email) => {
    try {
        const result = await sql`SELECT 1 FROM users WHERE email=${email} LIMIT 1`;
        if (result.length == 0) {
            return { accept: false, message: "Your Email does not Exist, please use signup" };
        }
        if (result.length == 1) {
            return { accept: true, message: "Email Exist" };
        }
        return { accept: false, message: "Something Error Occured please report here dummybot0505@gmail.com" };
    } catch (error) {
        return { accept: false, message: `Over DB did something wrong:- ${error.message}` };
    }
}

const getPasswordHashForThisMail = async (email) => {
    const checkEmailFirst = await checkEmailExist(email);
    if (!checkEmailFirst.accept) {
        return checkEmailFirst;
    }
    try {
        const result = await sql`SELECT password FROM users WHERE email=${email} LIMIT 1`;
        if (result.length == 0) {
            return { accept: false, message: "password was not set" };
        }
        if (result.length == 1) {
            return { accept: true, message: result[0].password };
        }
        return { accept: false, message: "Something Error Occured please report here dummybot0505@gmail.com" };
    } catch (error) {
        return { accept: false, message: `Over DB did something wrong:- ${error.message}` };
    }
}

const checkPasswordHashWithActualPassword = async (actualEmail, actualPassword) => {
    const checkEmailFirst = await checkEmailExist(actualEmail);
    if (!checkEmailFirst.accept) {
        return checkEmailFirst;
    }
    const checkPasswordHash = await getPasswordHashForThisMail(actualEmail);
    if (!checkPasswordHash.accept) {
        return checkPasswordHash;
    }
    const passHash = await getPasswordHashForThisMail(actualEmail);
    try {
        const comparePass = await bcrypt.compare(actualPassword, passHash.message);
        if (comparePass) {
            return { accept: true, message: "Email and Password Matched, Login Successfull" };
        }
        return { accept: false, message: "Password Incorrect" };
    } catch (error) {
        return { accept: false, message: `Over DB did something wrong:- ${error.message}` };
    }
}

const getUUIDForThisMail = async (email, password) => {
    const checkingLogin = await checkPasswordHashWithActualPassword(email, password);
    if (!checkingLogin.accept) {
        return checkingLogin;
    }
    try {
        const result = await sql`SELECT uuid FROM users WHERE email=${email} LIMIT 1`;
        if (result.length == 0) {
            return { accept: false, message: "UUID not found" };
        }
        if (result.length == 1) {
            return { accept: true, message: result[0].uuid };
        }
        return { accept: false, message: "Something Error Occured please report here dummybot0505@gmail.com" };
    } catch (error) {
        return { accept: false, message: `Over DB did something wrong:- ${error.message}` };
    }
}

const dbLoginCheck = async (email, password) => {
    const checkingLogin = await getUUIDForThisMail(email, password);
    return checkingLogin;
}

// Signup starts here

const checkEmailExistSignup = async (email) => {
    try {
        const result = await sql`SELECT 1 FROM users WHERE email=${email} LIMIT 1`;
        if (result.length == 0) {
            return { accept: true, message: "Email accepted" };
        }
        if (result.length >= 1) {
            return { accept: false, message: "Email already Exist, use another" };
        }
        return { accept: false, message: "Something Error Occured please report here dummybot0505@gmail.com" };
    } catch (error) {
        return { accept: false, message: `Over DB did something wrong:- ${error.message}` };
    }
}

const checkUsernameExistSignup = async (username) => {
    try {
        const result = await sql`SELECT 1 FROM users WHERE user_name=${username} LIMIT 1`;
        if (result.length == 0) {
            return { accept: true, message: "You can use this Username" };
        }
        if (result.length >= 1) {
            return { accept: false, message: "Username already Exist, use another" };
        }
        return { accept: false, message: "Something Error Occured please report here dummybot0505@gmail.com" };
    } catch (error) {
        return { accept: false, message: `Over DB did something wrong:- ${error.message}` };
    }
}

const insertSignupData = async (uuid, username, email, password) => {
    try {
        const result = await sql`INSERT INTO users (uuid, user_name, email, password) VALUES (${uuid}, ${username}, ${email}, ${password}) RETURNING email, uuid`;
        if (result[0].email == email && result[0].uuid == uuid) {
            return { accept: true, message: result[0].uuid };
        }
        return { accept: false, message: "something went wrong" };
    } catch (error) {
        return { accept: false, message: `Over DB did something wrong:- ${error.message}` };
    }
}

const dbSignupCheck = async (uuid, username, email, password) => {
    const checkUsernameFirst = await checkUsernameExistSignup(username);
    if (!checkUsernameFirst.accept) {
        return checkUsernameFirst;
    }

    const checkEmailFirst = await checkEmailExistSignup(email);
    if (!checkEmailFirst.accept) {
        return checkEmailFirst;
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const checkInsert = await insertSignupData(uuid, username, email, hash);
        return checkInsert;
    } catch (error) {
        return { accept: false, message: error.message };
    }
}

// Edit details starts here

const editDetails = async (uuid, username, firstname, lastname, email, dob, phone_number, language, gender, region, bio, propicurl, token) => {
    if(!isValidRegex(username, 1)) {
        return { accept: false, message: "Invalid Username" };
    }
    if(!isValidRegex(firstname, 4)) {
        return { accept: false, message: "Invalid Firstname" };
    }
    if(!isValidRegex(lastname, 4)) {
        return { accept: false, message: "Invalid Lastname" };
    }
    if(!isValidRegex(email, 2)) {
        return { accept: false, message: "Invalid Email" };
    }
    if(!isValidRegex(phone_number, 4)) {
        return { accept: false, message: "Invalid Phone Number" };
    }
    if(!isValidRegex(language, 4)) {
        return { accept: false, message: "Invalid Language" };
    }
    if(!isValidRegex(region, 4)) {
        return { accept: false, message: "Invalid Region" };
    }
    if(!isValidRegex(bio, 4)) {
        return { accept: false, message: "Invalid Bio" };
    }
    if(!isValidRegex(propicurl, 4)) {
        return { accept: false, message: "Invalid Profile Picture URL" };
    }
    if(!isValidRegex(dob, 4)) {
        return { accept: false, message: "Invalid Date of Birth" };
    }

    const checkUsernameFirst = await checkUsernameExistSignup(username);
    if (!checkUsernameFirst.accept) {
        return checkUsernameFirst;
    }

    const checkEmailFirst = await checkEmailExistSignup(email);
    if (!checkEmailFirst.accept) {
        return checkEmailFirst;
    }

    try {
        const result = await sql`UPDATE users SET user_name=${username}, first_name=${firstname}, last_name=${lastname} email=${email}, date_of_birth=${dob}, phone_number=${phone_number}, language=${language}, gender=${gender}, region=${region}, bio=${bio}, profile_picture_url=${propicurl}  WHERE uuid=${uuid} returning *`;
        if (result[0].email == email) {
            return { accept: true, message: result[0] };
        }
        return { accept: false, message: 'Something went wrong' };
    } catch (error) {
        return { accept: false, message: error.message };
    }
}
export { dbLoginCheck, dbSignupCheck, editDetails };