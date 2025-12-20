import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
    getTweetComments,
    addTweetComment,
    addReply,
    getCommentReplies,
} from "../controllers/comment.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);
router.route("/tweet/:tweetId").get(getTweetComments).post(addTweetComment);
router.route("/replies/:commentId").get(getCommentReplies).post(addReply);

export default router
