'use client';

import * as React from 'react';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Rating from '@mui/material/Rating';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import SendIcon from '@mui/icons-material/Send';
import './SingleProduct.css'
interface Comment {
  id: number;
  name: string;
  rating: number;
  text: string;
  date: string;
}

export const CommentsSection: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      name: 'علی محمدی',
      rating: 4,
      text: 'محصول بسیار باکیفیتی است و عملکرد خوبی دارد. فقط بسته‌بندی می‌توانست بهتر باشد.',
      date: '1404/03/10',
    },
    {
      id: 2,
      name: 'سارا حسینی',
      rating: 5,
      text: 'عالی بود! دقیقاً همان چیزی که انتظار داشتم.',
      date: '1404/03/08',
    },
  ]);

  const [name, setName] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && rating && text) {
      const newComment: Comment = {
        id: comments.length + 1,
        name,
        rating,
        text,
        date: new Date().toLocaleDateString('fa-IR'),
      };
      setComments([newComment, ...comments]);
      setName('');
      setRating(null);
      setText('');
    }
  };

  return (
    <Box className="sp-comment-container">
      {comments.length === 0 ? (
        <Typography variant="body1" className="sp-comment-typography-empty">
          هنوز نظری ثبت نشده است.
        </Typography>
      ) : (
        comments.map((comment) => (
          <Card key={comment.id} className="sp-comment-card">
            <CardContent className="sp-comment-card-content">
              <div className="sp-comment-header">
                <Avatar className="sp-comment-avatar">{comment.name[0]}</Avatar>
                <div className="sp-comment-info">
                  <Typography variant="subtitle1" className="sp-comment-typography-name">
                    {comment.name}
                  </Typography>
                  <Typography variant="caption" className="sp-comment-typography-date">
                    {comment.date}
                  </Typography>
                </div>
              </div>
              <Rating
                value={comment.rating}
                readOnly
                size="small"
                className="sp-comment-rating"
              />
              <Typography variant="body2" className="sp-comment-typography-text">
                {comment.text}
              </Typography>
            </CardContent>
          </Card>
        ))
      )}

      <Box component="form" onSubmit={handleSubmit} className="sp-comment-form">
        <Typography variant="h6" className="sp-comment-typography-title">
          ثبت نظر جدید
        </Typography>
        <TextField
          fullWidth
          label="نام"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
          required
          className="sp-comment-textfield"
          InputLabelProps={{ className: 'sp-comment-textfield-label' }}
          InputProps={{ className: 'sp-comment-textfield-input' }}
        />
        <div className="sp-comment-rating-section">
          <Typography variant="body2" className="sp-comment-typography-rating-label">
            امتیاز
          </Typography>
          <Rating
            value={rating}
            onChange={(event, newValue) => setRating(newValue)}
            size="medium"
            className="sp-comment-rating-input"
          />
        </div>
        <TextField
          fullWidth
          label="متن نظر"
          value={text}
          onChange={(e) => setText(e.target.value)}
          margin="normal"
          multiline
          rows={4}
          required
          className="sp-comment-textfield"
          InputLabelProps={{ className: 'sp-comment-textfield-label' }}
          InputProps={{ className: 'sp-comment-textfield-input' }}
        />
        <Button
          type="submit"
          variant="contained"
          startIcon={<SendIcon />}
          className="sp-comment-submit-button"
        >
          ارسال نظر
        </Button>
      </Box>
    </Box>
  );
};