import { neon } from "@neondatabase/serverless";
import { v4 as uuidv4 } from 'uuid';
import { config } from "dotenv";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
config();

const sql = neon(process.env.DATABASE_URL);

const dbLoginCheck = async (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    try {
        const result = await sql`SELECT password, uuid FROM users WHERE email=${trimmedEmail}`;
        if (result.length == 0) {
            return "email id does not exist"
        }
        if (result.length > 1) {
            return "something went wrong"
        }
        if (result.length == 1) {
            var comparePass = bcrypt.compareSync(trimmedPassword, result[0].password);
            if (comparePass) {
                let token = jwt.sign(
                    { userId: result[0].uuid },
                    process.env.JWT_SECRET,
                    { expiresIn: 60 * 10 }
                );
                return {
                    status: '200',
                    statusText: 'ok',
                    message: "login success",
                    token: token
                }
            }
            return "password incorrect"
        }
        return "something went wrong"
    } catch (error) {
        return `SQL Error -> ${error.message}`;
    }
}

const dbSignupCheck = async (username, email, password) => {

    let trimmedUser = username.trim().toLowerCase();
    let trimmedEmail = email.trim().toLowerCase();
    let trimmedPassword = password.trim();

    try {
        const result = await sql`SELECT * FROM users WHERE email=${trimmedEmail}`;
        const result2 = await sql`SELECT * FROM users WHERE user_name=${trimmedUser}`;

        if (result.length == 0) {
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(trimmedPassword, salt);
            if (result2.length == 0) {
                try {
                    const result = await sql`INSERT INTO users (uuid, user_name, email, password) VALUES (${uuidv4()}, ${trimmedUser}, ${trimmedEmail}, ${hash}) RETURNING email, uuid`;
                    if (result[0].email == trimmedEmail) {
                        let token = jwt.sign(
                            { userId: result[0].uuid },
                            process.env.JWT_SECRET,
                            { expiresIn: 60 * 10 }
                        );
                        return {
                            status: '200',
                            statusText: 'ok',
                            message: "signup success",
                            token: token
                        }
                    }
                    return "something went wrong"
                } catch (error) {
                    return `SQL Error -> ${error.message}`;
                }
            } else {
                return "user already exist with this username";
            }
        }

        if (result.length == 1) {
            return "user already exist with this email";
        }

        if (result.length > 1) {
            return "something went wrong"
        }

        return false;

    } catch (error) {
        return `SQL Error -> ${error.message}`;
    }
}

export { dbLoginCheck, dbSignupCheck };