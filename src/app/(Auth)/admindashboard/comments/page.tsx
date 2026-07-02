"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import {
  Trash2,
  Reply,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  MessageCircle,
} from "lucide-react";
import { Comment } from "@/types/types";
import { API } from "@/lib/MainRoutes";
import { toast } from "react-hot-toast";

interface DebugComment extends Comment {
  level?: number;
  collapsed?: boolean;
}

const CommentsPage = () => {
  const [comments, setComments] = useState<DebugComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParent, setSelectedParent] = useState<DebugComment | null>(
    null,
  );
  const [replyText, setReplyText] = useState("");

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data: Comment[] = await res.json();
      // Add level and collapsed for frontend rendering
      const addLevels = (
        comments: Comment[],
        level: number = 0,
      ): DebugComment[] =>
        comments.map((comment) => ({
          ...comment,
          level,
          collapsed: false,
          replies: comment.replies ? addLevels(comment.replies, level + 1) : [],
        }));
      setComments(addLevels(data.filter((c) => !c.parent_id))); // Only top-level comments
    } catch {
      toast.error("خطا در دریافت کامنت‌ها");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchComments();
  }, []);

  const handleToggleStatus = async (id: number, currentStatus: number) => {
    try {
      const res = await fetch(`/api/comments`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: currentStatus ? 0 : 1 }),
      });
      if (!res.ok) throw new Error("Failed to toggle status");
      setComments((prev) =>
        prev.map((comment) => ({
          ...comment,
          status: comment.id === id ? (currentStatus ? 0 : 1) : comment.status,
          replies:
            comment.replies?.map((reply) => ({
              ...reply,
              status: reply.id === id ? (currentStatus ? 0 : 1) : reply.status,
              replies: reply.replies || [],
            })) || [],
        })),
      );
      toast.success("وضعیت کامنت تغییر یافت");
    } catch {
      toast.error("خطا در تغییر وضعیت");
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "آیا مطمئن هستید؟ این عمل کامنت و تمام پاسخ‌های زیرین را حذف می‌کند.",
      )
    )
      return;
    try {
      const res = await fetch(`/api/comments`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete comment");
      await fetchComments();
      toast.success("کامنت حذف شد");
    } catch {
      toast.error("خطا در حذف کامنت");
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedParent) return;
    try {
      const res = await fetch(`/api/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: selectedParent.product_id,
          parent_id: selectedParent.id,
          name: "ادمین سایت",
          text: replyText,
          status: 1,
          is_admin: 1,
          rating: null,
        }),
      });
      if (!res.ok) throw new Error("Failed to add reply");
      setSelectedParent(null);
      setReplyText("");
      await fetchComments();
      toast.success("پاسخ ارسال شد");
    } catch {
      toast.error("خطا در ارسال پاسخ");
    }
  };

  const toggleCollapse = (id: number) => {
    setComments((prev: DebugComment[]) =>
      prev.map((comment: DebugComment) => ({
        ...comment,
        collapsed: comment.id === id ? !comment.collapsed : comment.collapsed,
        replies:
          comment.replies?.map((reply: DebugComment) => ({
            ...reply,
            collapsed: reply.id === id ? !reply.collapsed : reply.collapsed,
            replies: reply.replies || [],
          })) || [],
      })),
    );
  };

  const renderComment = (comment: DebugComment, level: number = 0) => {
    const levelColors = ["#7C3AED", "#6366F1", "#10B981", "#F59E0B"];
    const borderColor = levelColors[level % levelColors.length];

    return (
      <Card
        key={comment.id}
        className={`bg-gradient-to-br ${comment.is_admin ? "from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800" : "from-white to-gray-50 dark:from-gray-800 dark:to-gray-900"} shadow-xl rounded-2xl mt-4 hover:shadow-2xl transition-shadow duration-300`}
        style={{
          marginLeft: `${level * 28}px`,
          borderLeft: level > 0 ? `4px solid ${borderColor}` : "none",
        }}
      >
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="space-y-1 text-right w-full md:w-auto">
            <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              {comment.name}
              {comment.is_admin ? (
                <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                  ادمین
                </span>
              ) : null}
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[250px] md:max-w-full">
              {comment.product_title || `Product ID: ${comment.product_id}`}
            </p>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            {comment.replies && comment.replies.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                onClick={() => toggleCollapse(comment.id)}
              >
                {comment.collapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            )}
            {!comment.is_admin && (
              <Button
                variant={comment.status ? "outline" : "default"}
                size="sm"
                className="flex items-center gap-1 transition-colors"
                onClick={() => handleToggleStatus(comment.id, comment.status)}
              >
                {comment.status ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                {comment.status ? "مخفی کردن" : "نمایش دادن"}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors rounded-md"
              onClick={() => setSelectedParent(comment)}
            >
              <Reply className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-red-100 dark:hover:bg-red-900 transition-colors rounded-md"
              onClick={() => handleDelete(comment.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
  <CardContent className="transition-all duration-300">
  {/* امتیاز */}
  {comment.rating !== null && comment.rating !== undefined && (
    <div className="flex items-center gap-1 mb-3">
      <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">
        امتیاز:
      </span>

      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-xl ${
            star <= (comment.rating ?? 0)
              ? "text-yellow-500"
              : "text-gray-300 dark:text-gray-600"
          }`}
        >
          ★
        </span>
      ))}

      <span className="text-sm text-gray-500 mr-2">
        ({comment.rating ?? 0}/5)
      </span>
    </div>
  )}

  {/* متن کامنت */}
  <p className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
    {comment.text}
  </p>

  {/* تاریخ */}
  <p className="text-sm text-gray-400 mt-2">
    {new Date(comment.date).toLocaleDateString("fa-IR")}
  </p>

  {/* ریپلای‌ها */}
  {comment.replies &&
    comment.replies.length > 0 &&
    !comment.collapsed && (
      <div className="mt-4 space-y-3">
        {comment.replies.map((reply) =>
          renderComment(reply, level + 1)
        )}
      </div>
    )}
</CardContent>
      </Card>
    );
  };

  if (loading)
    return (
      <div className="text-center py-8 animate-pulse text-gray-500">
        در حال بارگذاری...
      </div>
    );
  if (!comments.length)
    return (
      <div className="text-center py-8 text-gray-500">هیچ کامنتی یافت نشد.</div>
    );

  return (
    <div className="space-y-6 px-2 md:px-6">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-white mb-4">
        کامنت‌ها
      </h1>
      <Card className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">لیست کامنت‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comments.map((comment) =>
              renderComment(comment, comment.level || 0),
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedParent}
        onOpenChange={(open: any) => !open && setSelectedParent(null)}
      >
        <DialogContent className="rounded-2xl shadow-2xl max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>پاسخ به کامنت</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="font-medium text-gray-800 dark:text-gray-200">
              از: {selectedParent?.name}
            </p>
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="پاسخ خود را بنویسید..."
              rows={4}
              className="rounded-xl border-purple-300 focus:border-purple-500 focus:ring focus:ring-purple-200 dark:border-gray-600 dark:focus:border-purple-500 dark:focus:ring-purple-900"
            />
            <div className="flex gap-2 justify-end flex-wrap">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedParent(null)}
              >
                لغو
              </Button>
              <Button
                onClick={handleReply}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                ارسال پاسخ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommentsPage;
