import { dbSignupCheck } from "./db.js";

const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}

const isValidUsername = (username) => {
    const usernameRegex = /^[a-z0-9_]{5,20}$/;
    return usernameRegex.test(username);
}

const signup = (req, res) => {
    const { username, email, password } = req.body;
    let username1 = username.trim().toLowerCase();
    let email1 = email.trim().toLowerCase(); 
    let password1 = password.trim();



    if (!isValidEmail(email1)) {
        res.status(400).json({
            status: '400',
            statusText: 'error',
            message: 'Invalid email format'
        });
        return;
    }

    if (!isValidPassword(password1)) {
        res.status(400).json({
            status: '400',
            statusText: 'error',
            message: 'Invalid Password format'
        });
        return;
    }

    if (!isValidUsername(username1)) {
        res.status(400).json({
            status: '400',
            statusText: 'error',
            message: 'Invalid Username format'
        });
        return;
    }

    dbSignupCheck(username1, email1, password1).then(data => {
        if (data.startsWith('e')) {
            res.status(200).json({
                status: '200',
                statusText: 'ok',
                message: data
            });
        } else {
            res.status(400).json({
                status: '400',
                statusText: 'error',
                message: data
            });
        }
        return
    })
}

export default signup;