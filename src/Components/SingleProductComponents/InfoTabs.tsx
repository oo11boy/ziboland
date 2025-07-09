'use client';

import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { InformationTable } from './InformationTable';
import { CommentOutlined, DescriptionOutlined, InfoOutlined } from '@mui/icons-material';
import { CommentsSection } from './CommentsSection';
import './SingleProduct.css';

interface SummaryProductProps {
  infoproduct: {
    title: string;
    features: string[];
    mothercat: string;
    subcat: string;
    brand: string;
    content: string;
    infotable: { id: number; name: string; value: string }[];
  };
}

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

export const InfoTabs: React.FC<SummaryProductProps> = ({ infoproduct }) => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box className="sp-tabs-container">
      <Box className="sp-tabs-header">
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
          className="sp-tabs"
        >
          <Tab
            className="sp-tab"
            label="مشخصات فنی"
            icon={<InfoOutlined />}
            iconPosition="start"
            {...a11yProps(0)}
          />
          <Tab
            className="sp-tab"
            label="توضیحات"
            icon={<DescriptionOutlined />}
            iconPosition="start"
            {...a11yProps(1)}
          />
          <Tab
            className="sp-tab"
            label="نظرات"
            icon={<CommentOutlined />}
            iconPosition="start"
            {...a11yProps(2)}
          />
        </Tabs>
      </Box>
      <CustomTabPanel  value={value} index={0}>
        <InformationTable infoproduct={infoproduct} />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <p className="sp-tabs-content-text p-4 text-justify">{infoproduct.content}</p>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <CommentsSection />
      </CustomTabPanel>
    </Box>
  );
};