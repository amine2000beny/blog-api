const Account = require("../models/account");
const { emailValidator, passwordValidator } = require("../validators");
const { getUrl } = require("../../../utils/getter");
const profile = require("../../profile/models/profile");
const post = require("../../blog/models/post");
const comment = require("../../blog/models/comment");

const deleteAccount = async (req, res) => {
    const { email } = req.body;

    try {
        const account = await Account.findOne({ email: email });
        if (!account) {
            res.status(404).json({ error: "Account not found" });
        }
        const { id } = account;

        try {
            await Promise.all([Account.deleteOne({ id }), profile.deleteMany({ owner: id }), post.deleteMany({ owner: id }), comment.deleteMany({ owner: id })]);

            res.status(204).end();
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }

        res.status(204).end();
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));

    try {
        const account = await Account.findOne({ email: email });

        if (!account) {
            return res.status(400).json({ error: "Email and password are invalid" });
        }

        account.comparePassword(password, (err, isMatch) => {
            if (err || !isMatch) {
                return res.status(400).json({ error: "Email and password are invalid" });
            }

            return res.status(200).json({
                id: account.id,
                email: account.email,
                token: account.generateJwt(),
            });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const register = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    if (!emailValidator(email)) {
        return res.status(400).json({ error: "Email is invalid" });
    }

    if (!passwordValidator(password)) {
        return res.status(400).json({ error: "Password is invalid" });
    }

    const exists = await Account.findOne({ email: email });
    if (exists) {
        return res.status(400).json({ error: "Email already exists" });
    }

    const account = new Account({
        email: email,
        password: password,
    });

    try {
        await account.save();

        res.header("Location", getUrl(req, account.id));
        res.status(201).json({ id: account.id, email: account.email });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { deleteAccount, login, register };
