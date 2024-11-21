import { dbLoginCheck } from "./db.js";

const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}

const login = (req, res) => {
    const { email, password } = req.body;
    email.toLowerCase();

    if (!isValidEmail(email)) {
        res.status(400).json({
            status: '400',
            statusText: 'error',
            message: 'Invalid email format (example@example.com)'
        });
        return;
    }

    if (!isValidPassword(password)) {
        res.status(400).json({
            status: '400',
            statusText: 'error',
            message: 'Invalid password format (Abcd@123)'
        });
        return;
    }

    dbLoginCheck(email, password).then(data => {
        if (data.statusText == 'ok') {
            res.status(200).json(data);
            return;
        }
        res.status(400).json({
            status: '400',
            statusText: 'error',
            message: data
        });
        return;
    })
}

export default login;