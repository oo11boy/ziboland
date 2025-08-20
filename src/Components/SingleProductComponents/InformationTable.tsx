import React, { useState } from 'react';
import './SingleProduct.css';
import { Product } from '@/types/types';

export const InformationTable: React.FC<{ infoproduct: Product }> = ({ infoproduct }) => {
  const [showAll, setShowAll] = useState(false);
  const displayRows = infoproduct.infotable && showAll ? infoproduct.infotable : infoproduct.infotable?.slice(0, 3) || [];

  if (!infoproduct.infotable || infoproduct.infotable.length === 0) {
    return <p className="text-gray-500">هیچ مشخصات فنی برای این محصول ثبت نشده است.</p>;
  }

  return (
    <div className="sp-info-table-container">
      <div className="sp-info-table-wrapper">
        <table className="sp-info-table" aria-label="Product Details">
          <tbody>
            {displayRows.map((item, index) => (
              <tr
                key={item.id}
                className={`sp-info-table-row ${index % 2 === 0 ? 'sp-info-table-row-even' : 'sp-info-table-row-odd'}`}
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
        {!showAll && infoproduct.infotable.length > 3 && (
          <div className="sp-info-table-gradient"></div>
        )}
      </div>
      {infoproduct.infotable.length > 3 && (
        <div className="sp-info-table-button-container">
          <button
            onClick={() => setShowAll(!showAll)}
            className="sp-info-table-button"
          >
            {showAll ? 'نمایش کمتر' : 'مشاهده بیشتر'}
          </button>
        </div>
      )}
    </div>
  );
};