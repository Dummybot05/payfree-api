import { dbSignupCheck } from "./db.js";
import isValidRegex from "./validation.js";
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

const signup = async (req, res) => {
    const { username, email, password } = req.body;
    if(!username) {
        res.json({ accept: false, message: 'Username is required' });
        return;
    }
    if(!email) {
        res.json({ accept: false, message: 'Email is required' });
        return;
    }
    if(!password) {
        res.json({ accept: false, message: 'Password is required' });
        return;
    }
    const username1 = username.trim().toLowerCase();
    const email1 = email.trim().toLowerCase();
    const password1 = password.trim();
    const checkUsernameRegex = isValidRegex(username1, 1);
    const checkEmailRegex = isValidRegex(email1, 2);
    const checkPasswordRegex = isValidRegex(password1, 3);

    if (!checkUsernameRegex) {
        res.json({ accept: false, message: 'Invalid Username Format' });
        return;
    }

    if (!checkEmailRegex) {
        res.json({ accept: false, message: 'Invalid Email Format (example@domain.com)' });
        return;
    }

    if (!checkPasswordRegex) {
        res.json({ accept: false, message: 'Invalid Password format' });
        return;
    }

    const signupCheck = await dbSignupCheck(uuidv4(), username1, email1, password1);
    if (signupCheck.accept) {
        const token = jwt.sign(
            {
                uuid: signupCheck.message,
                email: email1,
            },
            process.env.JWT_SECRET,
            { 
                expiresIn: 60 * 10
            }
        );
        res.json({ accept: true, message: "Signup Success", token: token });
        return;
    }
    res.json({ accept: false, message: signupCheck.message });
    return;
}

export default signup;