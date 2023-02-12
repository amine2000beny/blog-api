// Email regex from https://emailregex.com/
const emailValidator = (val) => {
    const emailRegex =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return emailRegex.test(val);
};

// Minimum eight characters, at least one uppercase letter, one lowercase letter and one number
const passwordValidator = (val) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

    return passwordRegex.test(val);
};

module.exports = {
    emailValidator,
    passwordValidator,
};
