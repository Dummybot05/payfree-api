import { dbSignupCheck } from "./db.js";

const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}

const signup = (req, res) => {
    const { email, password } = req.body;
    email.toLowerCase();

    if (!isValidEmail(email)) {
        res.status(400).json({
            status: '400',
            statusText: 'error',
            message: 'Invalid email format'
        });
        return;
    }

    if (!isValidPassword(password)) {
        res.status(400).json({
            status: '400',
            statusText: 'error',
            message: 'Invalid Password format'
        });
        return;
    }

    dbSignupCheck(email, password).then(data => {
        if (data == 'signup success') {
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