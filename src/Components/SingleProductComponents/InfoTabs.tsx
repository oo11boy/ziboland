'use client';

import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { InformationTable } from './InformationTable';
import { CommentOutlined, DescriptionOutlined, InfoOutlined } from '@mui/icons-material';
import { CommentsSection } from './CommentsSection';
import './SingleProduct.css';
import { Product, Variant } from '@/types/types';

function CustomTabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      className="sp-tabs-panel"
      {...other}
    >
      {value === index && <Box className="sp-tabs-panel-content">{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export const InfoTabs: React.FC<{ infoproduct: Product; selectedVariant?: Variant | null }> = ({ 
  infoproduct, 
  selectedVariant = null 
}) => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  // مشخصات فنی مربوط به واریانت انتخاب‌شده یا پیش‌فرض (اگر واریانت انتخاب نشده)
  const currentInfotable = selectedVariant?.infotable || [];

  // توضیحات محصول (از محصول اصلی)
  const productDescription = infoproduct.content || 'توضیحاتی برای این محصول ثبت نشده است.';

  return (
    <Box className="sp-tabs-container">
      <Box className="sp-tabs-header">
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="جزئیات محصول"
          className="sp-tabs"
          variant="fullWidth"
          centered
        >
          <Tab
            className="sp-tab"
            label="مشخصات فنی"
            icon={<InfoOutlined className="sp-tab-icon" />}
            iconPosition="start"
            {...a11yProps(0)}
          />
          <Tab
            className="sp-tab"
            label="توضیحات"
            icon={<DescriptionOutlined className="sp-tab-icon" />}
            iconPosition="start"
            {...a11yProps(1)}
          />
          <Tab
            className="sp-tab"
            label="نظرات کاربران"
            icon={<CommentOutlined className="sp-tab-icon" />}
            iconPosition="start"
            {...a11yProps(2)}
          />
        </Tabs>
      </Box>

      {/* تب مشخصات فنی */}
      <CustomTabPanel value={value} index={0}>
        {currentInfotable && currentInfotable.length > 0 ? (
          <InformationTable infotable={currentInfotable} />
        ) : (
          <div className="text-center py-12 text-gray-500">
            <InfoOutlined className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl">مشخصات فنی برای این محصول ثبت نشده است.</p>
          </div>
        )}
      </CustomTabPanel>

      {/* تب توضیحات */}
      <CustomTabPanel value={value} index={1}>
        <div 
          className="sp-tabs-content-text p-8 text-justify leading-relaxed text-lg"
          dangerouslySetInnerHTML={{ __html: productDescription }}
        />
      </CustomTabPanel>

      {/* تب نظرات */}
      <CustomTabPanel value={value} index={2}>
        <CommentsSection infoproduct={infoproduct} />
      </CustomTabPanel>
    </Box>
  );
};