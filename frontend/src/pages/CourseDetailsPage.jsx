import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { LevelBadge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { RatingSummary } from "../components/RatingSummary";
import { getCourse } from "../api/services/courseService";
import { getCourseFeedback, submitFeedback } from "../api/services/feedbackService";
import { myEnrollments } from "../api/services/enrollmentService";
import { listCourseMessages, sendCourseMessage } from "../api/services/messageService";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { pushRecentCourse } from "../utils/recentCourses";

export function CourseDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [chat, setChat] = useState("");
  const [feedbackErr, setFeedbackErr] = useState("");
  const [chatErr, setChatErr] = useState("");

  const courseQuery = useQuery({ queryKey: ["course", id], queryFn: () => getCourse(id) });
  const enrollmentsQuery = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: myEnrollments,
    enabled: user?.role === "learner" && Boolean(id),
  });
  const feedbackQuery = useQuery({
    queryKey: ["feedback", id],
    queryFn: () => getCourseFeedback(id),
    enabled: Boolean(user && id),
  });

  const chatQuery = useQuery({ queryKey: ["messages", id], queryFn: () => listCourseMessages(id) });

  const isEnrolledLearner =
    user?.role === "learner" &&
    (enrollmentsQuery.data || []).some(
      (e) => String(e.courseId?._id || e.courseId) === String(id),
    );

  const summary = feedbackQuery.data?.summary;
  const myFeedback = feedbackQuery.data?.myFeedback;

  useEffect(() => {
    if (myFeedback) {
      setRating(myFeedback.rating);
      setComment(myFeedback.comment || "");
    } else if (user?.role === "learner") {
      setRating(5);
      setComment("");
    }
  }, [myFeedback, user?.role]);

  const feedbackMut = useMutation({
    mutationFn: () => submitFeedback({ courseId: id, rating: Number(rating), comment }),
    onSuccess: () => {
      setFeedbackErr("");
      qc.invalidateQueries({ queryKey: ["feedback", id] });
    },
    onError: (err) => {
      setFeedbackErr(err.response?.data?.message || err.message || "Could not submit feedback.");
    },
  });

  const chatMut = useMutation({
    mutationFn: () => sendCourseMessage({ courseId: id, content: chat }),
    onSuccess: () => {
      setChat("");
      setChatErr("");
      qc.invalidateQueries({ queryKey: ["messages", id] });
    },
    onError: (err) => {
      setChatErr(err.response?.data?.message || err.message || "Could not send message.");
    },
  });

  const course = courseQuery.data;

  useEffect(() => {
    if (course?._id && course?.title) {
      pushRecentCourse({ id: course._id, title: course.title });
    }
  }, [course?._id, course?.title]);

  if (courseQuery.isLoading) {
    return (
      <div className="grid">
        <Card title="Loading course…">
          <Skeleton className="skeleton-title-wide" />
          <Skeleton lines={3} />
        </Card>
      </div>
    );
  }

  if (courseQuery.isError || !course) {
    return (
      <Card title="Course">
        <p className="error">This course could not be loaded.</p>
        <Link to="/courses" className="inline-link">
          ← Back to catalog
        </Link>
      </Card>
    );
  }

  return (
    <div className="grid course-detail-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/courses">Courses</Link>
        <span aria-hidden className="breadcrumb-sep">
          /
        </span>
        <span className="breadcrumb-current">{course.title}</span>
      </nav>

      <Card
        title={course.title}
        action={
          user?.role === "admin" && id ? (
            <Link to={`/courses/${id}/edit`} className="btn btn-secondary btn-sm">
              Edit course
            </Link>
          ) : null
        }
      >
        <div className="course-detail-meta row">
          <LevelBadge level={course.level || "beginner"} />
          <span className="meta-line">{course.durationHours || 0} hours</span>
          {course.category ? <span className="meta-line">{course.category}</span> : null}
        </div>
        <p className="course-detail-description">{course.description}</p>

        <h4 className="section-heading">Materials</h4>
        {(course.materials || []).length === 0 ? (
          <p className="meta-line">No materials listed yet.</p>
        ) : (
          <ul className="material-links">
            {(course.materials || []).map((m, idx) => (
              <li key={`${m.url}-${idx}`}>
                <a href={m.url} target="_blank" rel="noreferrer" className="material-link">
                  <span className="material-type">{m.type}</span>
                  {m.title}
                </a>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Course rating">
        {feedbackQuery.isLoading ? (
          <Skeleton lines={2} />
        ) : feedbackQuery.isError ? (
          <p className="error">Could not load rating.</p>
        ) : (
          <>
            <RatingSummary
              averageRating={summary?.averageRating}
              count={summary?.count ?? 0}
            />
            <p className="meta-line section-sub feedback-policy">
              Everyone sees the average grade. Only enrolled learners can submit a rating and optional
              note; other learners’ notes are not listed here.
            </p>

            {user?.role === "learner" ? (
              isEnrolledLearner ? (
                <div className="learner-feedback-form">
                  <h4 className="section-heading section-heading--inline">Your feedback</h4>
                  <p className="meta-line section-sub">
                    Enrolled learners can rate this course (1–5) and leave an optional note for
                    instructors.
                  </p>
                  <div className="feedback-row row">
                    <label className="rating-wrap">
                      <span className="feedback-label-text">Grade (1–5)</span>
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        className="input-narrow"
                      />
                    </label>
                    <Input
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Optional note (kept with your rating)"
                    />
                    <Button onClick={() => feedbackMut.mutate()} disabled={feedbackMut.isPending}>
                      {feedbackMut.isPending ? "Saving…" : myFeedback ? "Update feedback" : "Submit"}
                    </Button>
                  </div>
                  {feedbackErr ? <p className="error">{feedbackErr}</p> : null}
                  {myFeedback ? (
                    <p className="meta-line learner-feedback-saved" role="status">
                      You rated this course <strong>{myFeedback.rating}/5</strong>
                      {myFeedback.comment ? " · Your note is saved." : ""}
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="meta-line learner-feedback-locked">
                  Enroll in this course to leave a rating and feedback.
                </p>
              )
            ) : (
              <p className="meta-line learner-feedback-locked">
                Only enrolled learners can submit ratings. Faculty and admins see the aggregate
                score above.
              </p>
            )}
          </>
        )}
      </Card>

      <Card title="Group chat">
        <p className="meta-line section-sub">
          Faculty teaching this course can discuss with enrolled learners here.
        </p>
        <div className="chat-compose row">
          <Input
            value={chat}
            onChange={(e) => setChat(e.target.value)}
            placeholder="Write a message…"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (chat.trim()) chatMut.mutate();
              }
            }}
          />
          <Button onClick={() => chatMut.mutate()} disabled={chatMut.isPending || !chat.trim()}>
            {chatMut.isPending ? "Sending…" : "Send"}
          </Button>
        </div>
        {chatErr ? <p className="error">{chatErr}</p> : null}
        <ul className="chat-thread">
          {(chatQuery.data || []).length === 0 ? (
            <li className="meta-line">No messages yet — start the conversation.</li>
          ) : (
            (chatQuery.data || []).map((m) => (
              <li key={m._id} className="chat-bubble">
                <span className="chat-author">{m.senderId?.name || "Member"}</span>
                <span className="chat-text">{m.content}</span>
              </li>
            ))
          )}
        </ul>
      </Card>
    </div>
  );
}
