import { dbSignupCheck } from "./db.js";

const isValid = (value, numb) => {
    const usernameRegex = /^[a-z0-9_]{5,15}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (numb == 1) {
        return usernameRegex.test(value);
    } else if (numb == 2) {
        return emailRegex.test(value);
    } else if (numb == 3) {
        return passwordRegex.test(value);
    } else {
        return false;
    }
}

const signup = (req, res) => {
    const { username, email, password } = req.body;
    let username1 = username.trim().toLowerCase();
    let email1 = email.trim().toLowerCase(); 
    let password1 = password.trim();

    if(!isValid(username1, 1)) {
        res.json({
            status: '400',
            statusText: 'error',
            message: 'Invalid Username Format'
        });
        return;
    }

    if(!isValid(email1, 2)) {
        res.json({
            status: '400',
            statusText: 'error',
            message: 'Invalid Email Format'
        });
        return;
    }

    if (!isValid(password1, 3)) {
        res.json({
            status: '400',
            statusText: 'error',
            message: 'Invalid Password format'
        });
        return;
    }

    dbSignupCheck(username1, email1, password1).then(data => {
        if (data.startsWith('ey')) {
            res.json({
                status: '200',
                statusText: 'ok',
                token: data
            });
        } else {
            res.json({
                status: '400',
                statusText: 'error',
                message: 'something error'
            });
        }
        return
    })
}

export default signup;