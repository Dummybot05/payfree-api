import { neon } from "@neondatabase/serverless";
import { v4 as uuidv4 } from 'uuid';
import { config } from "dotenv";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
config();

const sql = neon(process.env.DATABASE_URL);

const dbLoginCheck = async (email, password) => {
    try {
        const result = await sql`SELECT password, uuid FROM users WHERE email=${email}`;
        if (result.length == 0) {
            return "email id does not exist"
        }
        if (result.length > 1) {
            return "something went wrong"
        }
        if (result.length == 1) {
            var comparePass = bcrypt.compareSync(password, result[0].password);
            if (comparePass) {
                let token = jwt.sign(
                    { userId: result[0].uuid },
                    process.env.JWT_SECRET,
                    { expiresIn: 60 * 5 }
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
        return error.message
    }
}

const dbSignupCheck = async (email, password) => {

    try {
        const result = await sql`SELECT * FROM users WHERE email=${email}`;

        if (result.length == 0) {
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(password, salt);
            try {
                const result = await sql`INSERT INTO users (uuid, email, password) VALUES (${uuidv4()}, ${email}, ${hash}) RETURNING email`;
                if (result[0].email == email) {
                    return "signup success";
                }
                return "something went wrong"
            } catch (error) {
                return error.message
            }
        }

        if (result.length == 1) {
            return "user already exist";
        }

        if (result.length > 1) {
            return "something went wrong"
        }

        return false;

    } catch (error) {
        return error.message;
    }
}

export { dbLoginCheck, dbSignupCheck };