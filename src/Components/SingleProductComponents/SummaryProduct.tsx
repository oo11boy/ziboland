'use client';

import React, { useState, useEffect } from 'react';
import { FavoriteBorderOutlined, FavoriteOutlined, ShareOutlined } from '@mui/icons-material';
import './SingleProduct.css';
import { Categoryapi, Product, Variant } from '@/types/types';
import { useCat } from '@/ContextApi/CategoriesContext';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { Modal, Box, Typography, Button } from '@mui/material';

interface SummaryProductProps {
  infoproduct: Product;
  selectedVariant?: Variant | null;
  onVariantChange?: (variant: Variant) => void;
}

const SummaryProduct: React.FC<SummaryProductProps> = ({
  infoproduct,
  selectedVariant,
}) => {
  const { categories } = useCat();
  const router = useRouter();
  const motherCat = categories.find(c => c.id === infoproduct.mothercatId);

  // State برای وضعیت علاقه‌مندی
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // State برای مودال ورود
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // بررسی وضعیت ورود کاربر و وضعیت علاقه‌مندی
  useEffect(() => {
    const token = Cookies.get('authToken');
    setIsLoggedIn(!!token);

    if (token) {
      checkWishlistStatus();
    }
  }, [infoproduct.id]);

  // بررسی اینکه آیا محصول در لیست علاقه‌مندی‌ها وجود دارد
  const checkWishlistStatus = async () => {
    try {
      const token = Cookies.get('authToken');
      if (!token) return;

      const res = await fetch(`/api/wishlist/check?productId=${infoproduct.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setIsInWishlist(data.inWishlist);
      }
    } catch (err) {
      console.error('Error checking wishlist status:', err);
    }
  };

  // تابع افزودن/حذف از علاقه‌مندی‌ها
  const handleWishlistToggle = async () => {
    const token = Cookies.get('authToken');
    
    // اگر کاربر وارد نشده است، مودال را نمایش بده
    if (!token) {
      setLoginModalOpen(true);
      return;
    }

    setIsLoading(true);

    try {
      const variantId = selectedVariant?.id || null;
      
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: infoproduct.id,
          variantId: variantId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsInWishlist(data.action === 'added');
        
        if (data.action === 'added') {
          toast.success('محصول به لیست علاقه‌مندی‌ها اضافه شد', {
            position: 'top-center',
            autoClose: 2000,
          });
        } else {
          toast.info('محصول از لیست علاقه‌مندی‌ها حذف شد', {
            position: 'top-center',
            autoClose: 2000,
          });
        }
      } else {
        const error = await res.json();
        toast.error(error.error || 'خطا در تغییر وضعیت علاقه‌مندی', {
          position: 'top-center',
          autoClose: 2000,
        });
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      toast.error('خطا در ارتباط با سرور', {
        position: 'top-center',
        autoClose: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // تابع اشتراک‌گذاری
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: infoproduct.title,
        text: `محصول ${infoproduct.title} از زیبولند`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      // کپی لینک در کلیپ‌بورد
      navigator.clipboard.writeText(window.location.href);
      toast.success('لینک محصول کپی شد', {
        position: 'top-center',
        autoClose: 2000,
      });
    }
  };

  // استایل مودال
  const modalStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: 500,
    bgcolor: 'white',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    p: 4,
    borderRadius: '16px',
    direction: 'rtl',
  };

  return (
    <div className="sp-summary-container">
      {/* عنوان محصول */}
      <h1 className="sp-summary-title">{infoproduct.title || 'بدون عنوان'}</h1>

      {/* ویژگی‌های محصول */}
      <h2 className="sp-summary-features-title">ویژگی‌های محصول</h2>
      {Array.isArray(infoproduct.features) && infoproduct.features.length > 0 ? (
        <ul className="sp-summary-features-list">
          {infoproduct.features.map((item, index) => (
            <li key={index} className="sp-summary-feature-item">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">ویژگی‌ای برای این محصول ثبت نشده است.</p>
      )}

      {/* جزئیات اضافی */}
      <div className="sp-summary-details">
        <span>دسته: {motherCat && motherCat.name || 'نامشخص'}</span>
        <br />
        <span>برند: {infoproduct.brandDetails?.title || 'نامشخص'}</span>
      </div>

      {/* دکمه‌های علاقه‌مندی و اشتراک‌گذاری */}
      <div className="sp-summary-actions">
        <button
          onClick={handleWishlistToggle}
          disabled={isLoading}
          className={`sp-summary-icon-button ${isInWishlist ? 'sp-wishlist-active' : ''}`}
          aria-label={isInWishlist ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
          title={isInWishlist ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
        >
          {isInWishlist ? (
            <FavoriteOutlined className="sp-summary-icon sp-wishlist-icon" />
          ) : (
            <FavoriteBorderOutlined className="sp-summary-icon" />
          )}
          {isLoading && (
            <span className="sp-summary-icon-loading">...</span>
          )}
        </button>
        <button
          onClick={handleShare}
          className="sp-summary-icon-button"
          aria-label="اشتراک‌گذاری محصول"
          title="اشتراک‌گذاری"
        >
          <ShareOutlined className="sp-summary-icon" />
        </button>
      </div>

      {/* مودال ورود به حساب کاربری */}
      <Modal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      >
        <Box sx={modalStyle}>
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontFamily: 'yekannew',
              fontWeight: 'bold',
              textAlign: 'center',
              mb: 2,
              color: '#805b99',
            }}
          >
            🔐 نیاز به ورود به حساب کاربری
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: 'yekannew',
              textAlign: 'center',
              mb: 3,
              color: '#666',
            }}
          >
            برای افزودن این محصول به لیست علاقه‌مندی‌ها، باید وارد حساب کاربری خود شوید.
          </Typography>

          <Typography
            variant="body2"
            sx={{
              fontFamily: 'yekannew',
              textAlign: 'center',
              mb: 4,
              color: '#999',
            }}
          >
            پس از ورود، می‌توانید محصولات را به لیست علاقه‌مندی‌های خود اضافه کنید و از امکانات دیگر استفاده کنید.
          </Typography>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                setLoginModalOpen(false);
                router.push('/myaccount');
              }}
              sx={{
                fontFamily: 'yekannew',
                bgcolor: '#805b99',
                '&:hover': { bgcolor: '#6d4c82' },
                borderRadius: '12px',
                py: 1.5,
              }}
            >
              ورود به حساب کاربری
            </Button>

            <Button
              fullWidth
              variant="outlined"
              onClick={() => setLoginModalOpen(false)}
              sx={{
                fontFamily: 'yekannew',
                borderColor: '#ccc',
                color: '#666',
                '&:hover': { borderColor: '#999' },
                borderRadius: '12px',
                py: 1.5,
              }}
            >
              بستن
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default SummaryProduct;