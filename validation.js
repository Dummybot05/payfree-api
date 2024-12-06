const usernameRegex = /^[a-z0-9_]{5,15}$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const isValidRegex = (value, numb) => {
    const usernameCheck = usernameRegex.test(value);
    const emailCheck = emailRegex.test(value);
    const passwordCheck = passwordRegex.test(value);
    if (numb == 1) {
        return usernameCheck;
    } else if (numb == 2) {
        return emailCheck;
    } else if (numb == 3) {
        return passwordCheck;
    } else {
        return false;
    }
}

export default isValidRegex;