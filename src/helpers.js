const Comment = require("./blog/models/comment");
const Post = require("./blog/models/post");

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

async function getPosts(filter, page = 1, limit = 10) {
    const postCount = await Post.countDocuments();
    const posts = await Post.aggregate([
        {
            $match: filter,
        },
        {
            $sort: { createdAt: -1 },
        },
        {
            $skip: (page - 1) * limit,
        },
        {
            $limit: parseInt(limit),
        },
        {
            $lookup: {
                from: "comments",
                localField: "id",
                foreignField: "postId",
                as: "comments",
            },
        },
        {
            $project: {
                commentsCount: { $size: "$comments" },
                createdAt: 1,
                createdBy: 1,
                id: 1,
                title: 1,
                updatedAt: 1,
                _id: 0,
            },
        },
    ]).exec();

    return {
        posts,
        count: postCount,
        currentPage: parseInt(page),
        totalPages: Math.ceil(postCount / limit),
    };
}
module.exports = { getComments, getPosts };
