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
} from "lucide-react";
import { Comment } from "@/types/types";
import { API } from "@/lib/MainRoutes";
import { toast } from "react-hot-toast";

interface DebugComment extends Comment {
  children?: DebugComment[];
  level?: number;
  product_title?: string;
  collapsed?: boolean;
}

const buildCommentTree = (comments: DebugComment[]): DebugComment[] => {
  const map: Record<number, DebugComment> = {};
  const roots: DebugComment[] = [];

  comments.forEach((c) => {
    map[c.id] = { ...c, children: [], level: 0 };
  });

  comments.forEach((c) => {
    if (!c.parent_id || c.parent_id === c.id || !map[c.parent_id]) {
      roots.push(map[c.id]);
    } else {
      map[c.id].level = (map[c.parent_id].level || 0) + 1;
      map[c.parent_id].children!.push(map[c.id]);
    }
  });

  return roots;
};

const CommentsPage = () => {
  const [comments, setComments] = useState<DebugComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParent, setSelectedParent] = useState<DebugComment | null>(
    null
  );
  const [replyText, setReplyText] = useState("");

  const fetchComments = async () => {
    try {
      const res = await fetch(`${API}/comments`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data: DebugComment[] = await res.json();
      setComments(data);
    } catch {
      toast.error("خطا در دریافت کامنت‌ها");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`${API}/comments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: !currentStatus }),
      });
      if (!res.ok) throw new Error("Failed to toggle status");
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: !currentStatus } : c))
      );
      toast.success("وضعیت کامنت تغییر یافت");
    } catch {
      toast.error("خطا در تغییر وضعیت");
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "آیا مطمئن هستید؟ این عمل کامنت و تمام پاسخ‌های زیرین را حذف می‌کند."
      )
    )
      return;
    try {
      const res = await fetch(`${API}/comments/${id}`, { method: "DELETE" });
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
      const res = await fetch(`${API}/comments`, {
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
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === id) return { ...c, collapsed: !c.collapsed };
        if (c.children && c.children.length > 0) {
          return {
            ...c,
            children: c.children.map((child) => toggleChildCollapse(child, id)),
          };
        }
        return c;
      })
    );
  };

  const toggleChildCollapse = (
    comment: DebugComment,
    id: number
  ): DebugComment => {
    if (comment.id === id) return { ...comment, collapsed: !comment.collapsed };
    if (comment.children && comment.children.length > 0) {
      return {
        ...comment,
        children: comment.children.map((child) =>
          toggleChildCollapse(child, id)
        ),
      };
    }
    return comment;
  };

  const renderComment = (comment: DebugComment) => {
    const levelColors = ["#7C3AED", "#6366F1", "#10B981", "#F59E0B"];
    const borderColor = levelColors[comment.level! % levelColors.length];

    return (
      <Card
        key={comment.id}
        className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-xl rounded-2xl mt-4 hover:shadow-2xl transition-shadow duration-300"
        style={{
          marginLeft: `${(comment.level || 0) * 28}px`,
          borderLeft:
            (comment.level || 0) > 0 ? `4px solid ${borderColor}` : "none",
        }}
      >
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="space-y-1 text-right w-full md:w-auto">
            <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {comment.name}
              {comment.is_admin && (
                <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                  ادمین
                </span>
              )}
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[250px] md:max-w-full">
              {comment.product_title || `Product ID: ${comment.product_id}`}
            </p>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            {comment.children && comment.children.length > 0 && (
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
          <p className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
            {comment.text}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {new Date(comment.date).toLocaleDateString("fa-IR")}
          </p>
          {comment.children &&
            comment.children.length > 0 &&
            !comment.collapsed && (
              <div className="mt-4 space-y-3">
                {comment.children.map((child) => renderComment(child))}
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
            {buildCommentTree(comments).map((comment) =>
              renderComment(comment)
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedParent}
        onOpenChange={(open) => !open && setSelectedParent(null)}
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
