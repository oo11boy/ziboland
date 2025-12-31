import React, { useState } from 'react';
import './SingleProduct.css';
import { InfoTable as InfoTableType } from '@/types/types';

interface InformationTableProps {
  infotable: InfoTableType[] | null | undefined;
}

export const InformationTable: React.FC<InformationTableProps> = ({ infotable }) => {
  const [showAll, setShowAll] = useState(false);

  // اگر infotable خالی یا وجود نداشته باشد
  if (!infotable || infotable.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-500 dark:text-gray-400">
          هیچ مشخصات فنی برای این محصول ثبت نشده است.
        </p>
      </div>
    );
  }

  // تعداد ردیف‌های نمایش داده شده
  const displayRows = showAll ? infotable : infotable.slice(0, 5);

  return (
    <div className="sp-info-table-container">
      <div className="sp-info-table-wrapper">
        <table className="sp-info-table" aria-label="مشخصات فنی محصول">
          <tbody>
            {displayRows.map((item, index) => (
              <tr
                key={`${item.name}-${index}`} // چون id نداریم، از نام + ایندکس استفاده می‌کنیم
                className={`sp-info-table-row ${
                  index % 2 === 0 ? 'sp-info-table-row-even' : 'sp-info-table-row-odd'
                }`}
              >
                <th className="sp-info-table-header" scope="row">
                  {item.name}
                </th>
                <td className="sp-info-table-cell">
                  <p className="sp-info-table-value">{item.value}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* گرادیان برای حالت نمایش کمتر */}
        {!showAll && infotable.length > 5 && (
          <div className="sp-info-table-gradient"></div>
        )}
      </div>

      {/* دکمه مشاهده بیشتر/کمتر */}
      {infotable.length > 5 && (
        <div className="sp-info-table-button-container">
          <button
            onClick={() => setShowAll(!showAll)}
            className="sp-info-table-button"
            aria-label={showAll ? 'نمایش کمتر' : 'مشاهده بیشتر'}
          >
            {showAll ? 'نمایش کمتر' : 'مشاهده بیشتر'}
          </button>
        </div>
      )}
    </div>
  );
};