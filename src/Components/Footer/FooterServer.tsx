import { API } from '@/lib/MainRoutes';
import React from 'react'
import FooterContainer from './FooterContainer';

export default async function FooterServer() {
       const settings = await fetch(`${API}/settings`, {
          cache: 'force-cache', 
          next: { revalidate: 3600 }, 
        })
          .then((res) => {
            if (!res.ok) {
              throw new Error('Failed to fetch settings');
            }
            return res.json();
          })
          .catch((error) => {
            console.error('Error fetching settings:', error);
            return []; 
          });
    
  return (
   <FooterContainer settings={settings}/>
  )
}
