"use client";
import React from 'react';
import { Product, Categoryapi } from '@/types/types';
import Link from 'next/link';

interface BreadCrumbsProps {
  product: Product;
  categories: Categoryapi[];
}

export default function BreadCrumbs({ product, categories }: BreadCrumbsProps) {
  const motherCat = categories.find(c => c.id === product.mothercatId);
  const subCat = motherCat?.subcat.find(s => s.id === product.subcatId);
  const item = subCat?.items.find(i => i.id === product.itemId);

  const crumbs: { name: string; href?: string }[] = [];

  if (motherCat) crumbs.push({ name: motherCat.name, href: `/search?mothercatId=${motherCat.id}` });
  if (subCat) crumbs.push({ name: subCat.name, href: `/search?mothercatId=${motherCat?.id}&subcatId=${subCat.id}` });
  if (item) crumbs.push({ name: item.name, href: `/search?mothercatId=${motherCat?.id}&subcatId=${subCat?.id}&itemId=${item.id}` });

  crumbs.push({ name: product.title });

  return (
    <nav className="w-[95%] sm:w-[90%] mx-auto my-4 sm:my-6" aria-label="Breadcrumb">
      <ul className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 text-sm sm:text-base font-medium text-gray-600">
        {crumbs.map((crumb, index) => (
          <li key={index} className="flex items-center gap-1 sm:gap-2 group">
            {crumb.href ? (
              <Link
                href={crumb.href}
                className={`hover:text-blue-600 transition-colors duration-200 ${
                  index === crumbs.length - 1 ? 'text-blue-600 font-semibold' : ''
                } truncate max-w-[120px] sm:max-w-full`}
              >
                {crumb.name}
              </Link>
            ) : (
              <span className="text-blue-600 font-semibold truncate max-w-[120px] sm:max-w-full">{crumb.name}</span>
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
