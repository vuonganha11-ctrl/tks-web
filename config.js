/* ====================================================================
   config.js — CẤU HÌNH DÙNG CHUNG cho toàn bộ web TKS
   Đã chuyển từ Google Sheet → Supabase (đọc bằng anon/public key, chỉ ĐỌC).
   Mọi trang (dashboard, danh sách, từng đơn) dùng chung 2 giá trị dưới.
   ==================================================================== */
// GIỮ LẠI cho trang đơn hàng (don-hang.html/danh-sach-don.html) vẫn đọc gviz
// tới khi migrate Phase 2. Dashboard (index.html) đã chuyển sang Supabase.

window.TKS_SB_URL  = "https://yncksjmovgfsyvhkztgw.supabase.co";

// ⚠️ DÁN ANON (PUBLIC) KEY CỦA SUPABASE VÀO ĐÂY.
// Đây là khoá CÔNG KHAI chỉ-ĐỌC (Settings → API → Project API keys → "anon public").
// KHÔNG dán service_role key (bí mật) vào file web.
window.TKS_SB_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluY2tzam1vdmdmc3l2aGt6dGd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNDk1NjIsImV4cCI6MjA5NjgyNTU2Mn0.y-4DDvM8X2rBRpG0im2qNP-S1c_50IoxCIOVhYN0WpE";
