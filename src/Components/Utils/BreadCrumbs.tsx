import React from 'react';

export default function BreadCrumbs() {
  return (
    <nav className="w-[90%] mx-auto my-6" aria-label="Breadcrumb">
      <ul className="flex items-center gap-3 text-sm font-medium text-gray-600">
        {['ابزارها', 'ابزار برقی', 'دریل', 'دریل شارژی'].map((item, index) => (
          <li
            key={index}
            className="flex items-center gap-2 group"
          >
            <a
              href={`/${item.toLowerCase().replace(/\s+/g, '-')}`} // Example dynamic URL
              className={`hover:text-blue-600 transition-colors duration-200 ${
                index === 3 ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              {item}
            </a>
            {index < 3 && (
              <span className="text-gray-400 group-hover:text-blue-400 transition-colors duration-200">
                {">"}
              </span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}