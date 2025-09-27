"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Rating from "@mui/material/Rating";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import SendIcon from "@mui/icons-material/Send";
import ReplyIcon from "@mui/icons-material/Reply";
import { toast } from "react-toastify";
import "./SingleProduct.css";
import { Product, Comment } from "@/types/types";

export const CommentsSection: React.FC<{ infoproduct: Product; isAdmin?: boolean }> = ({
  infoproduct,
  isAdmin = false,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);

  // Fetch comments on mount
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/comments?product_id=${infoproduct.id}`);
        if (!response.ok) throw new Error("Failed to fetch comments");
        const data = await response.json();
        setComments(data.filter((comment: Comment) => comment.product_id === infoproduct.id));
      } catch (error) {
        console.error("Error fetching comments:", error);
        toast.error("خطا در بارگذاری نظرات", { position: "top-center", className: "yekan" });
      }
    };
    fetchComments();
  }, [infoproduct.id]);

  const handleSubmit = async (e: React.FormEvent, parentId: number | null = null) => {
    e.preventDefault();
    const payload = {
      product_id: infoproduct.id,
      parent_id: parentId,
      name: isAdmin ? "ادمین" : name,
      rating: isAdmin ? null : rating,
      text: parentId ? replyText : text,
      is_admin: isAdmin ? 1 : 0,
      status: isAdmin ? 1 : 0,
    };

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to submit comment");

      const { id } = await response.json();
      const newComment: Comment = {
        id,
        product_id: infoproduct.id,
        name: payload.name,
        rating: payload.rating,
        text: payload.text,
        admin_reply: null,
        date: new Date().toISOString(),
        status: payload.status,
        is_admin: payload.is_admin,
        parent_id: payload.parent_id,
        product_title: infoproduct.title,
        replies: [],
      };

      if (parentId) {
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === parentId
              ? { ...comment, replies: [...(comment.replies || []), newComment] }
              : comment
          )
        );
      } else {
        setComments([newComment, ...comments]);
      }

      setName("");
      setRating(null);
      setText("");
      setReplyText("");
      setReplyTo(null);
      toast.success(isAdmin ? "پاسخ شما ثبت شد!" : "نظر شما با موفقیت ثبت شد!", {
        position: "top-center",
        className: "yekan",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error("خطا در ثبت نظر. لطفاً دوباره تلاش کنید.", {
        position: "top-center",
        className: "yekan",
        autoClose: 3000,
      });
    }
  };

  const renderComment = (comment: Comment, depth = 0) => (
    <Card
      key={comment.id}
      className={`sp-comment-card  ${comment.is_admin ? "sp-comment-card-admin" : ""}`}
      style={{ marginLeft: depth * 20 }}
    >
      <CardContent className="sp-comment-card-content ">
        <div className="sp-comment-header">
          <Avatar className="sp-comment-avatar">{comment.name[0]}</Avatar>
          <div className="sp-comment-info">
            <Typography variant="subtitle1" className="sp-comment-typography-name">
              {comment.name} {comment.is_admin ? "(ادمین)" : ""}
            </Typography>
            <Typography variant="caption" className="sp-comment-typography-date">
              {new Date(comment.date).toLocaleDateString("fa-IR")}
            </Typography>
          </div>
        </div>
        {!comment.is_admin && comment.rating !== null && (
          <Rating
            value={comment.rating}
            readOnly
            size="small"
            className="sp-comment-rating"
          />
        )}
        <Typography variant="body2" className="sp-comment-typography-text">
          {comment.text}
        </Typography>
        {isAdmin && !comment.is_admin && (
          <Button
            variant="text"
            startIcon={<ReplyIcon />}
            onClick={() => setReplyTo(comment.id)}
            className="sp-comment-reply-button"
          >
            پاسخ
          </Button>
        )}
        {replyTo === comment.id && isAdmin && (
          <Box component="form" onSubmit={(e) => handleSubmit(e, comment.id)} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="پاسخ ادمین"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              margin="normal"
              multiline
              rows={2}
              required
              InputLabelProps={{ className: "sp-comment-textfield-label" }}
              InputProps={{ className: "sp-comment-textfield-input" }}
            />
            <Button
              type="submit"
              variant="contained"
              startIcon={<SendIcon />}
              className="sp-comment-submit-button"
            >
              ارسال پاسخ
            </Button>
            <Button
              variant="outlined"
              onClick={() => setReplyTo(null)}
              className="sp-comment-cancel-button"
              sx={{ ml: 1 }}
            >
              لغو
            </Button>
          </Box>
        )}
        {comment.replies?.map((reply) => renderComment(reply, depth + 1))}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 2 }} className="sp-comment-container">
      {comments.length === 0 ? (
        <Typography variant="body1" className="sp-comment-typography-empty ">
          هنوز نظری ثبت نشده است.
        </Typography>
      ) : (
        comments.map((comment) => renderComment(comment))
      )}

      {!isAdmin && (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Typography variant="h6" className="sp-comment-typography-title ">
            ثبت نظر جدید
          </Typography>
          <TextField
            fullWidth
            label="نام"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            required
            InputLabelProps={{ className: "sp-comment-textfield-label" }}
            InputProps={{ className: "sp-comment-textfield-input" }}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, my: 2 }}>
            <Typography variant="body2" className="sp-comment-typography-rating-label">
              امتیاز
            </Typography>
            <Rating
              value={rating}
              onChange={(event, newValue) => setRating(newValue)}
              size="medium"
              className="sp-comment-rating-input"
            />
          </Box>
          <TextField
            fullWidth
            label="متن نظر"
            value={text}
            onChange={(e) => setText(e.target.value)}
            margin="normal"
            multiline
            rows={4}
            required
            InputLabelProps={{ className: "sp-comment-textfield-label" }}
            InputProps={{ className: "sp-comment-textfield-input" }}
          />
          <Button
            type="submit"
            variant="contained"
            startIcon={<SendIcon />}
            className="sp-comment-submit-button"
            sx={{ mt: 1 }}
          >
            ارسال نظر
          </Button>
        </Box>
      )}
    </Box>
  );
};