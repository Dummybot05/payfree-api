import { dbLoginCheck } from "./db.js";
import isValidRegex from "./validation.js";
import jwt from 'jsonwebtoken';

const login = async (req, res) => {
    const { email, password } = req.body;
    if(!email) {
        res.json({ accept: false, message: 'Email is required' });
        return;
    }
    if(!password) {
        res.json({ accept: false, message: 'Password is required' });
        return;
    }
    const email1 = email.trim().toLowerCase();
    const password1 = password.trim();
    const checkEmailRegex = isValidRegex(email1, 2);
    const checkPasswordRegex = isValidRegex(password1, 3);

    if (!checkEmailRegex) {
        res.json({ accept: false, message: 'Invalid Email Format (example@domain.com)' });
        return;
    }

    if (!checkPasswordRegex) {
        res.json({ accept: false, message: 'Invalid Password format' });
        return;
    }

    const loginCheck = await dbLoginCheck(email1, password1);
    if (loginCheck.accept) {
        const token = jwt.sign(
            {
                uuid: loginCheck.message,
                email: email1,
            },
            process.env.JWT_SECRET,
            { 
                expiresIn: 60 * 10
            }
        );
        res.json({ accept: true, message: "Login Success", token: token });
        return;
    }
    res.json({ accept: false, message: loginCheck.message });
    return;
}

export default login;