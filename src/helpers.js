const Comment = require("./blog/models/comment");

async function getComments(filter, page = 1, limit = 10) {
    const [comments, count] = await Promise.all([
        Comment.find(filter)
            .select("-_id -__v")
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .exec(),
        Comment.countDocuments(filter),
    ]);

    return {
        comments,
        count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
    };
}

module.exports = { getComments };
