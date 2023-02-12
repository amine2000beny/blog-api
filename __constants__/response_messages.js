module.exports = ResponseMessages = {
    INVALID_POST_BODY: "Post body is invalid",
    INVALID_POST_BODY_LENGTH: (minLength, maxLength) =>
        `Post body length must be between ${minLength} and ${maxLength} characters`,
    POST_NOT_FOUND: "Post not found",
    POST_UPDATED: "Post updated",
};
