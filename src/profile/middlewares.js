const RESPONSE_MESSAGES = require("../../__constants__/response_messages");
const Profile = require("./models/profile");

const profileExistsMiddleware = async function (req, res, next) {
   
    const profile = await Profile.findOne({ id: req.params.id });
    if (!profile) {
        return res.status(404).json({ msg: RESPONSE_MESSAGES.POST_NOT_FOUND });
    }

    req.profile = profile;

    next();
};


module.exports = {
    profileExistsMiddleware,
};
