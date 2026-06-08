/* ====================================================================
 * auth.js — Xác thực phiên làm việc TKS Web v1.0
 * Nhúng vào mọi trang cần bảo vệ NGAY SAU config.js.
 * KHÔNG nhúng vào login.html (tránh vòng lặp redirect).
 * ==================================================================== */
(function () {
  'use strict';
  var SESSION_KEY = 'tks_auth_v1';
  var LOGIN_PAGE = 'login.html';

  function esc(s) {
    return String(s || '').replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function getUser() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
    catch (e) { return null; }
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = LOGIN_PAGE;
  }

  /* Inject CSS cho thanh user badge */
  var style = document.createElement('style');
  style.textContent =
    '#tks-auth-bar{display:flex;justify-content:flex-end;align-items:center;gap:10px;' +
    'padding:0 0 8px;font-size:12px;font-family:"IBM Plex Sans",sans-serif}' +
    '#tks-auth-bar .auth-name{font-weight:600;color:#3d6695}' +
    '#tks-auth-bar .auth-btn{background:#fff;border:1px solid #d6dee8;color:#6b7a8d;' +
    'padding:4px 12px;border-radius:8px;cursor:pointer;font-size:11px;font-weight:700;' +
    'font-family:inherit;transition:.12s;line-height:1.4}' +
    '#tks-auth-bar .auth-btn:hover{border-color:#3d6695;color:#0f2742}';
  document.head.appendChild(style);

  /* Kiểm tra session ngay lập tức — redirect nếu chưa đăng nhập */
  var user = getUser();
  if (!user || !user.tai_khoan) {
    var from = encodeURIComponent(window.location.href);
    window.location.replace(LOGIN_PAGE + '?from=' + from);
  } else {
    /* Render badge sau khi DOM sẵn sàng */
    document.addEventListener('DOMContentLoaded', function () {
      var bar = document.getElementById('tks-auth-bar');
      if (!bar) return;
      bar.innerHTML =
        '<span class="auth-name">&#128100; ' + esc(user.ho_ten || user.tai_khoan) + '</span>' +
        '<button class="auth-btn" onclick="TKS_Auth.logout()">Đăng xuất</button>';
    });
  }

  window.TKS_Auth = { getUser: getUser, logout: logout };
})();
