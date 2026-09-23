import { revalidateTag, revalidatePath } from "next/cache";


export function revalidateSliders() {
  revalidateTag("sliders", "max");
  revalidatePath("/");
}

export function revalidateCategories() {
  revalidateTag("categories", "max");
  revalidatePath("/");
}

export function revalidateProducts() {
  revalidateTag("products", "max");
  revalidatePath("/");
}