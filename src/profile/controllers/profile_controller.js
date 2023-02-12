const Person = require("../models/person");
const Company = require("../models/company");

const { getUrl } = require("../../../utils/getter");
const { removeFields } = require("../../../utils/remover");

const createProfile = async (req, res) => {
    const { kind, ...body } = req.body;
    let profile;

    const profileExists = await Person.find({ owner: req.account }).exec();
    if (profileExists.length >= 5) {
        return res.status(400).json({ msg: "You already have 5 profiles" });
    }

    try {
        switch (kind) {
            case "person":
                profile = new Person({ ...body, owner: req.account });
                break;
            case "company":
                profile = new Company({ ...body, owner: req.account });
                break;
            default:
                return res.status(400).json({ msg: "Invalid kind" });
        }

        await profile.save();

        res.header("Location", getUrl(req, profile.id));
        res.status(201).json(removeFields(profile.toObject()));
    } catch (err) {
        res.status(500).json({ msg: err });
    }
};

module.exports = {
    createProfile,
};
