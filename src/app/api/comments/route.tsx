import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";
import { Comment, CommentRow } from "@/types/types";

export async function GET() {
  try {
    const [rows] = await pool.query<CommentRow[]>(
      "SELECT c.*, p.title as product_title FROM comments c LEFT JOIN products p ON c.product_id = p.id ORDER BY c.date DESC",
    );

    // Build a tree structure for comments and replies
    const commentMap = new Map<number, Comment & { replies?: Comment[] }>();
    const comments: Comment[] = [];

    // Initialize commentMap with all comments
    rows.forEach((row) => {
      const comment: Comment = {
        id: row.id,
        product_id: row.product_id,
        name: row.name,
        rating: row.rating,
        text: row.text,
        admin_reply: row.admin_reply,
        date: row.date,
        status: row.status,
        parent_id: row.parent_id,
        is_admin: row.is_admin,
        product_title: row.product_title,
        replies: [],
      };
      commentMap.set(row.id, comment);
    });

    // Organize comments into a tree
    rows.forEach((row) => {
      if (row.parent_id) {
        const parent = commentMap.get(row.parent_id);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(commentMap.get(row.id)!);
        }
      } else {
        comments.push(commentMap.get(row.id)!);
      }
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments", details: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const {
      product_id,
      parent_id,
      name,
      rating,
      text,
      status = 0,
      is_admin = 0,
    } = await request.json();
    if (!product_id || !text || (!is_admin && !name)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate product exists
    const [prodRows] = await conn.query<RowDataPacket[]>(
      "SELECT id, title FROM products WHERE id = ?",
      [product_id],
    );
    if (prodRows.length === 0) {
      return NextResponse.json(
        { error: "Invalid product_id" },
        { status: 400 },
      );
    }

    // Validate parent if exists
    if (parent_id) {
      const [parentRows] = await conn.query<RowDataPacket[]>(
        "SELECT id FROM comments WHERE id = ? AND product_id = ?",
        [parent_id, product_id],
      );
      if (parentRows.length === 0) {
        return NextResponse.json(
          { error: "Invalid parent_id" },
          { status: 400 },
        );
      }
    }

    const [result] = await conn.query(
      "INSERT INTO comments (product_id, name, rating, text, status, parent_id, is_admin, comment_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        product_id,
        name || "ادمین",
        rating || null,
        text,
        status,
        parent_id || null,
        is_admin,
        is_admin ? "admin" : "user",
      ],
    );

    const commentId = (result as any).insertId;
    const productTitle = prodRows[0].title;
    const notificationMessage = is_admin
      ? `پاسخ ادمین برای کامنت محصول "${productTitle}" ثبت شد`
      : `کامنت جدید برای محصول "${productTitle}" ثبت شد`;

    await conn.query(
      "INSERT INTO notifications (type, message, related_id) VALUES (?, ?, ?)",
      ["comment", notificationMessage, product_id],
    );

    await conn.commit();
    return NextResponse.json({ id: commentId }, { status: 201 });
  } catch (error) {
    await conn.rollback();
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment", details: (error as Error).message },
      { status: 500 },
    );
  } finally {
    conn.release();
  }
}

export async function PUT(request: Request) {
  const conn = await pool.getConnection();
  try {
    const { id, status } = await request.json();
    if (!id || status === undefined) {
      return NextResponse.json(
        { error: "Missing id or status" },
        { status: 400 },
      );
    }

    const [result] = await conn.query(
      "UPDATE comments SET status = ? WHERE id = ?",
      [status, id],
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    await conn.commit();
    return NextResponse.json({ message: "Status updated" });
  } catch (error) {
    await conn.rollback();
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { error: "Failed to update comment", details: (error as Error).message },
      { status: 500 },
    );
  } finally {
    conn.release();
  }
}

export async function DELETE(request: Request) {
  const conn = await pool.getConnection();
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await conn.beginTransaction();

    // Recursively delete comment and its replies
    const deleteReplies = async (commentId: number) => {
      const [replies] = await conn.query<RowDataPacket[]>(
        "SELECT id FROM comments WHERE parent_id = ?",
        [commentId],
      );
      for (const reply of replies) {
        await deleteReplies(reply.id);
      }
      await conn.query("DELETE FROM comments WHERE id = ?", [commentId]);
    };

    await deleteReplies(id);
    await conn.commit();
    return NextResponse.json({ message: "Comment deleted" });
  } catch (error) {
    await conn.rollback();
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment", details: (error as Error).message },
      { status: 500 },
    );
  } finally {
    conn.release();
  }
}
