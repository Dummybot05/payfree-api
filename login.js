import { dbLoginCheck } from "./db.js";

const isValid = (value, numb) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (numb == 1) {
        return emailRegex.test(value);
    } else if (numb == 2) {
        return passwordRegex.test(value);
    } else {
        return false;
    }
}

const login = (req, res) => {
    const { email, password } = req.body;

    let email1 = email.trim().toLowerCase(); 
    let password1 = password.trim();

    if(!isValid(email1, 1)) {
        res.json({
            status: '400',
            statusText: 'error',
            message: 'Invalid Email Format'
        });
        return;
    }

    if (!isValid(password1, 2)) {
        res.json({
            status: '400',
            statusText: 'error',
            message: 'Invalid Password format'
        });
        return;
    }

    dbLoginCheck(email1, password1).then(data => {
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