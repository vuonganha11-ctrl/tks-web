/* =================================================================
   supabase.js — LỚP ĐỌC DỮ LIỆU SUPABASE (thay cho sheet.js / Google Sheet)
   --------------------------------------------------------------------
   Web tĩnh GitHub Pages đọc THẲNG Supabase REST (anon key, chỉ ĐỌC).
   Trả về object `d` cùng SHAPE như bản Google Sheet cũ:
     { Meta, KPI, DonHang, NhanSu, DoanhSo, LichCongTac, SuCo, RuiRo }
   để các hàm render trong index.html dùng lại gần như nguyên vẹn.
   Cấu hình URL + anon key đặt trong config.js (window.TKS_SB_URL / TKS_SB_ANON).
   ==================================================================== */
(function (global) {
  "use strict";

  var URL  = (global.TKS_SB_URL  || "").replace(/\/+$/, "");   // vd https://yncksjmovgfsyvhkztgw.supabase.co
  var ANON = (global.TKS_SB_ANON || "");                       // anon (public) key — chỉ ĐỌC

  function rest(path) { return URL + "/rest/v1/" + path; }

  // GET 1 bảng → mảng object. Lỗi → [] (caller fallback SAMPLE).
  async function tbl(path) {
    if (!URL || !ANON) throw new Error("supabase: thiếu TKS_SB_URL / TKS_SB_ANON trong config.js");
    var res = await fetch(rest(path), {
      cache: "no-store",
      headers: { apikey: ANON, Authorization: "Bearer " + ANON }
    });
    if (!res.ok) throw new Error("Supabase HTTP " + res.status + " @ " + path);
    return await res.json();
  }

  // ---- Chuẩn hoá tên cột lệch giữa Supabase ↔ hàm render cũ ----
  var KY_MAP = { thang: "Tháng", quy: "Quý", nam: "Năm" };
  function mapDoanhSo(r) {
    return { loai: r.loai, ky: (KY_MAP[String(r.ky).toLowerCase()] || r.ky),
             actual: r.actual, target: r.target };
  }
  function mapLich(r) {
    // Supabase dùng `descr`; render cũ đọc `desc`
    return { cot: r.cot, dt: r.dt, desc: (r.descr != null ? r.descr : r.desc),
             task_id: r.task_id, ppl: r.ppl, today: r.today };
  }
  function mapSuCo(r) {
    // Supabase dùng `nguoi_th` (người xử lý). Cấp cả `don` để tương thích render cũ,
    // nhưng render mới nên hiển thị cột "Người xử lý" = nguoi_th.
    return { muc_do: r.muc_do, task_id: r.task_id, noi_dung: r.noi_dung,
             tre: r.tre, nguoi_th: r.nguoi_th, don: r.nguoi_th, action: r.action };
  }
  // RuiRo: bảng LIVE đúng schema cũ (kha_nang/giai_phap/trang_thai) — render giữ nguyên,
  // không cần map. (KHÁC với skill cap-nhat-ruiro: skill đó ghi sai cột → cần sửa skill.)

  function mapGantt(r) {
    return { pha: r.pha, meta: r.meta, mau: r.mau, order_id: r.order_id,
             offset: (r.offset != null ? r.offset : r.gantt_offset),
             width:  (r.width  != null ? r.width  : r.gantt_width) };
  }

  // Đọc toàn bộ dữ liệu dashboard (1 lần, song song).
  async function fetchAll() {
    var res = await Promise.all([
      tbl("meta?select=key,value"),
      tbl("kpi?select=label,value,sub,color&order=id.asc"),
      tbl("donhang?select=kh,kh_sub,task_id,giai_doan,tien_do,han_congno,order_id,uu_tien,san_xuat,dich_vu,cham_giao,theo_doi&order=order_id.asc"),
      tbl("nhansu?select=nhom,ten,vai_tro,dang_lam,hom_nay,qua_han,ke_hoach,uid,nghi_phep,ord&order=ord.asc"),
      tbl("doanhso?select=loai,ky,actual,target"),
      tbl("lichcongtac?select=cot,dt,descr,task_id,ppl,today&order=id.asc"),
      tbl("suco?select=muc_do,task_id,noi_dung,tre,nguoi_th,action&order=ord.asc"),
      tbl("ruiro?select=id,muc_do,noi_dung,kha_nang,giai_phap,trang_thai&order=id.asc")
    ]);
    return {
      Meta:        res[0],
      KPI:         res[1],
      DonHang:     res[2],
      NhanSu:      res[3],
      DoanhSo:     res[4].map(mapDoanhSo),
      LichCongTac: res[5].map(mapLich),
      SuCo:        res[6].map(mapSuCo),
      RuiRo:       res[7],  // schema live khớp render — không map
      NhapKhau:    []       // để renderImports tự fallback SAMPLE.NhapKhau (hardcode trong index.html)
    };
  }

  // Đọc dữ liệu 1 đơn hàng (cho don-hang.html) — lọc theo order_id.
  async function fetchOrder(orderId) {
    var oid = encodeURIComponent(orderId);
    var q = "?order_id=eq." + oid;
    var res = await Promise.all([
      tbl("dh_info" + q),
      tbl("dh_congviec" + q),
      tbl("dh_todo" + q),
      tbl("dh_timeline" + q),
      tbl("dh_hangmuc" + q),
      tbl("dh_hoso" + q),
      tbl("dh_gantt" + q)
    ]);
    return {
      Info: res[0][0] || null,
      CongViec: res[1], ToDo: res[2], Timeline: res[3],
      HangMuc: res[4], HoSo: res[5], Gantt: res[6].map(mapGantt)
    };
  }

  // Đọc danh sách TẤT CẢ đơn (cho danh-sach-don.html) + meta cập nhật.
  async function fetchOrders() {
    var res = await Promise.all([
      tbl("donhang?select=order_id,kh,kh_sub,task_id,giai_doan,tien_do,han_congno&order=order_id.asc"),
      tbl("meta?select=key,value")
    ]);
    return { DH_Info: res[0], Meta: res[1] };
  }

  // ---- Tiện ích dùng chung (giữ y hệt sheet.js để render không phải đổi) ----
  function getflyTask(id){ return "https://thaikhuong.getflycrm.com/#/tasks/?task_id=" + encodeURIComponent(id); }
  function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
  function num(v){ if(v==null||v==="")return 0; var n=parseFloat(String(v).replace(/[^\d.-]/g,"")); return isNaN(n)?0:n; }
  function rateClass(p){ if(p<=0)return"z"; if(p>=100)return"g"; if(p>=50)return"a"; return"r"; }
  function vnd(v){ var n=num(v); return n?n.toLocaleString("vi-VN"):"0"; }

  global.Supa = {
    fetchAll: fetchAll,
    fetchOrder: fetchOrder,
    fetchOrders: fetchOrders,
    getflyTask: getflyTask,
    esc: esc, num: num, rateClass: rateClass, vnd: vnd
  };
})(window);
