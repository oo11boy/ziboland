"use client";
import React from 'react';
import { Product, Categoryapi } from '@/types/types';
import Link from 'next/link';

interface BreadCrumbsProps {
  product: Product;
  categories: Categoryapi[]; // دسته‌بندی‌ها و زیرمجموعه‌ها
}

export default function BreadCrumbs({ product, categories }: BreadCrumbsProps) {
  // پیدا کردن دسته‌بندی مادر
  const motherCat = categories.find(c => c.id === product.mothercatId);

  // پیدا کردن زیرمجموعه
  const subCat = motherCat?.subcat.find(s => s.id === product.subcatId);

  // پیدا کردن آیتم خاص
  const item = subCat?.items.find(i => i.id === product.itemId);

  // ساخت آرایه نان‌کرامب‌ها
  const crumbs: { name: string; href?: string }[] = [];

  if (motherCat) crumbs.push({ name: motherCat.name, href: `/search?mothercatId=${motherCat.id}` });
  if (subCat) crumbs.push({ name: subCat.name, href: `/search?mothercatId=${motherCat?.id}&subcatId=${subCat.id}` });
  if (item) crumbs.push({ name: item.name, href: `/search?mothercatId=${motherCat?.id}&subcatId=${subCat?.id}&itemId=${item.id}` });


  // نام خود محصول (آخرین آیتم بدون لینک)
  crumbs.push({ name: product.title });

  return (
    <nav className="w-[90%] mx-auto my-6" aria-label="Breadcrumb">
      <ul className="flex items-center gap-3 text-sm font-medium text-gray-600">
        {crumbs.map((crumb, index) => (
          <li key={index} className="flex items-center gap-2 group">
            {crumb.href ? (
              <Link
                href={crumb.href}
                className={`hover:text-blue-600 transition-colors duration-200 ${
                  index === crumbs.length - 1 ? 'text-blue-600 font-semibold' : ''
                }`}
              >
                {crumb.name}
              </Link>
            ) : (
              <span className="text-blue-600 font-semibold">{crumb.name}</span>
            )}
            {index < crumbs.length - 1 && (
              <span className="text-gray-400 group-hover:text-blue-400 transition-colors duration-200">
                {'>'}
              </span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
