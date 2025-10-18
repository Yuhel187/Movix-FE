"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#111] text-gray-400 py-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8">
        {/* Home */}
        <div>
          <h3 className="text-white font-semibold mb-3">Trang chủ</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <Link href="/" className="hover:text-white transition">
                Trendings
              </Link>
            </li>
            <li>
              <Link href="/signup" className="hover:text-white transition">
                Đăng ký
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-white transition">
                Đăng nhập
              </Link>
            </li>
          </ul>
        </div>

        {/* Movies */}
        <div>
          <h3 className="text-white font-semibold mb-3">Phim hay</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <Link href="/recommended" className="hover:text-white transition">
                Dành riêng cho bạn
              </Link>
            </li>
            <li>
              <Link href="/chatbot" className="hover:text-white transition">
                AI Chatbot
              </Link>
            </li>
          </ul>
        </div>

        {/* Shows */}
        <div>
          <h3 className="text-white font-semibold mb-3">Thể loại</h3>
          <ul className="space-y-1 text-sm">
            <li>Hành động</li>
            <li>Kinh dị</li>
            <li>Trinh thám</li>
            <li>
              <Link href="/genres" className="hover:text-white transition">
                Tìm theo thể loại
              </Link>
            </li>
          </ul>
        </div>

        {/* Topics */}
        <div>
          <h3 className="text-white font-semibold mb-3">Chủ đề</h3>
          <ul className="space-y-1 text-sm">
            <li>Marvel</li>
            <li>Tình cảm</li>
          </ul>
        </div>

        {/* Account */}
        <div>
          <h3 className="text-white font-semibold mb-3">Tài khoản</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <Link href="/account" className="hover:text-white transition">
                Thông tin tài khoản
              </Link>
            </li>
          </ul>
        </div>

        {/* Connect */}
        <div>
          <h3 className="text-white font-semibold mb-3">Connect With Us</h3>
          <div className="flex gap-3">
            <a
              href="#"
              className="bg-[#222] p-2 rounded-md hover:bg-[#333] transition"
            >
              <i className="fab fa-facebook-f"></i>
            </a>
            <a
              href="#"
              className="bg-[#222] p-2 rounded-md hover:bg-[#333] transition"
            >
              <i className="fab fa-twitter"></i>
            </a>
            <a
              href="#"
              className="bg-[#222] p-2 rounded-md hover:bg-[#333] transition"
            >
              <i className="fab fa-linkedin-in"></i>
            </a>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700 mt-10 pt-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
          <p>©2025 Movix, All Rights Reserved</p>
          <div className="flex gap-6 mt-3 sm:mt-0">
            <a href="#" className="hover:text-white transition">
              Terms of Use
            </a>
            <a href="#" className="hover:text-white transition">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
