import { revalidateTag, revalidatePath } from "next/cache";

// cast به any برای سازگاری با همه نسخه‌ها
const invalidateTag = revalidateTag as (tag: string) => void;

export function revalidateSliders() {
  invalidateTag("sliders");
  revalidatePath("/");
}

export function revalidateCategories() {
  invalidateTag("categories");
  revalidatePath("/");
}