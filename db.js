import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import bcrypt from 'bcryptjs';
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

export { dbLoginCheck, dbSignupCheck };