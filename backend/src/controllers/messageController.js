import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { listCourseMessages, sendCourseMessage } from "../services/messageService.js";

export const listByCourse = asyncHandler(async (req, res) => {
  const rows = await listCourseMessages(req.user, req.params.courseId);
  return sendSuccess(res, rows.reverse(), "Messages fetched");
});

export const send = asyncHandler(async (req, res) => {
  const row = await sendCourseMessage(req.user, req.body.courseId, req.body.content);
  return sendSuccess(res, row, "Message sent", 201);
});
