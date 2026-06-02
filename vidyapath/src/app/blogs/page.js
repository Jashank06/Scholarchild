'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BlogHero from '@/components/blogs/BlogHero';
import BlogGrid from '@/components/blogs/BlogGrid';
import api from '@/lib/api';

export default function BlogsPage() {
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.getBlogs({ sort: 'latest', limit: 1 });
        if (res.data?.length > 0) {
          const full = await api.getBlog(res.data[0].slug);
          setFeatured(full.data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <>
      <Navbar />
      <main style={{ background: '#ffffff' }}>
        <BlogHero featured={featured} />
        <BlogGrid />
      </main>
      <Footer />
    </>
  );
}
