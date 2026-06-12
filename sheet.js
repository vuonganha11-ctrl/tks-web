/* ============================================================
   sheet.js — Lớp đọc dữ liệu Google Sheet (dùng chung)
   ------------------------------------------------------------
   Đọc trực tiếp từ endpoint gviz của Google Sheet (JSON), không
   cần backend. Sheet chỉ cần đặt quyền "Bất kỳ ai có link đều XEM
   được". Mỗi tab = 1 nguồn; DÒNG 1 của mỗi tab phải là tiêu đề cột
   (đúng tên cột mô tả trong README).
   ============================================================ */
(function (global) {
  "use strict";

  // Dựng URL gviz cho 1 tab
  function gvizUrl(sheetId, tab) {
    return "https://docs.google.com/spreadsheets/d/" + sheetId +
      "/gviz/tq?tqx=out:csv&headers=1&sheet=" + encodeURIComponent(tab);
  }

  // Bóc lớp vỏ "/*O_o*/ google.visualization.Query.setResponse(...);"
  function parseGviz(text) {
    var start = text.indexOf("{");
    var end = text.lastIndexOf("}");
    if (start < 0 || end < 0) throw new Error("gviz: không đọc được phản hồi");
    return JSON.parse(text.slice(start, end + 1));
  }

  // Chuyển bảng gviz -> mảng object, key = nhãn cột (dòng tiêu đề)
  function tableToRows(json) {
    var table = json.table || {};
    var cols = (table.cols || []).map(function (c, i) {
      return (c.label && c.label.trim()) || c.id || ("col" + i);
    });
    var rows = (table.rows || []).map(function (r) {
      var obj = {};
      (r.c || []).forEach(function (cell, i) {
        var key = cols[i];
        if (!key) return;
        if (cell == null) { obj[key] = ""; return; }
        // ưu tiên giá trị thô (v); nếu là số/ngày đã format thì có f
        obj[key] = cell.v != null ? cell.v : (cell.f != null ? cell.f : "");
        obj["_f_" + key] = cell.f != null ? cell.f : (cell.v != null ? cell.v : "");
      });
      return obj;
    });
    return rows;
  }

  // Đọc 1 tab -> mảng object. Trả về [] nếu lỗi (để caller fallback dữ liệu mẫu).
  // CSV reader (RFC4180) - moi gia tri la CHUOI, tranh bay suy luan kieu cua gviz JSON
  function parseCsv(text){
    text=String(text||"");
    if(text.charCodeAt(0)===65279)text=text.slice(1);
    var Q=String.fromCharCode(34),CR=String.fromCharCode(13),LF=String.fromCharCode(10);
    var rows=[],row=[],f="",i=0,q=false,ch;
    while(i<text.length){ch=text[i];
      if(q){if(ch===Q){if(text[i+1]===Q){f+=Q;i+=2;continue;}q=false;i++;continue;}f+=ch;i++;continue;}
      if(ch===Q){q=true;i++;continue;}
      if(ch===","){row.push(f);f="";i++;continue;}
      if(ch===CR){i++;continue;}
      if(ch===LF){row.push(f);rows.push(row);row=[];f="";i++;continue;}
      f+=ch;i++;
    }
    if(f!==""||row.length){row.push(f);rows.push(row);}
    return rows;
  }
  function csvToRows(csvText){
    var m=parseCsv(csvText);if(!m.length)return [];
    var cols=m[0].map(function(h,i){return (h&&h.trim())||("col"+i);});
    var out=[];
    for(var r=1;r<m.length;r++){var cells=m[r];
      if(cells.every(function(x){return x==null||x==="";}))continue;
      var obj={};
      for(var k=0;k<cols.length;k++){var key=cols[k];var val=cells[k]!=null?cells[k]:"";obj[key]=val;obj["_f_"+key]=val;}
      out.push(obj);}
    return out;
  }
  
  var TKS_USE_SUPABASE=(new URLSearchParams(location.search).get("src")||"supabase")!=="sheet";
var TKS_SB_URL="https://yncksjmovgfsyvhkztgw.supabase.co";
var TKS_SB_ANON="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluY2tzam1vdmdmc3l2aGt6dGd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNDk1NjIsImV4cCI6MjA5NjgyNTU2Mn0.y-4DDvM8X2rBRpG0im2qNP-S1c_50IoxCIOVhYN0WpE";
var TKS_TBL={Meta:["meta","key"],KPI:["kpi","id"],NhanSu:["nhansu","id"],DoanhSo:["doanhso",""],LichCongTac:["lichcongtac","id"],SuCo:["suco","id"],RuiRo:["ruiro","id"],DonHang:["donhang",""]};
async function fetchTabSupabase(tab){var m=TKS_TBL[tab];if(!m)return [];var u=TKS_SB_URL+"/rest/v1/"+m[0]+"?select=*"+(m[1]?"&order="+m[1]:"");var res=await fetch(u,{headers:{apikey:TKS_SB_ANON,Authorization:"Bearer "+TKS_SB_ANON},cache:"no-store"});if(!res.ok)throw new Error("SB HTTP "+res.status+" "+tab);var arr=await res.json();return arr.map(function(o){var r={};for(var k in o){var kk=(k==="descr")?"desc":k;r[kk]=(o[k]==null?"":o[k]);r["_f_"+kk]=r[kk];}return r;});}
async function fetchTab(sheetId, tab) {
  if(TKS_USE_SUPABASE)return fetchTabSupabase(tab);
    var url = gvizUrl(sheetId, tab);
    var res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status + " khi đọc tab " + tab);
    var text = await res.text();
    return csvToRows(text);
  }

  // Đọc nhiều tab cùng lúc -> { tabName: rows[] }
  async function fetchTabs(sheetId, tabs) {
    var out = {};
    await Promise.all(tabs.map(async function (t) {
      try { out[t] = await fetchTab(sheetId, t); } catch (e) { console.warn("Bo qua tab loi:", t, e && e.message); out[t] = []; }
    }));
    return out;
  }

  // Tiện ích chung
  function getflyTask(id) {
    return "https://thaikhuong.getflycrm.com/#/tasks/?task_id=" + encodeURIComponent(id);
  }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function num(v) {
    if (v == null || v === "") return 0;
    var n = parseFloat(String(v).replace(/[^\d.-]/g, ""));
    return isNaN(n) ? 0 : n;
  }
  // %->lớp màu theo quy ước: >=100 xanh, >=50 hổ phách, <50 đỏ, 0 xám
  function rateClass(pct) {
    if (pct <= 0) return "z";
    if (pct >= 100) return "g";
    if (pct >= 50) return "a";
    return "r";
  }
  function vnd(v) {
    var n = num(v);
    return n ? n.toLocaleString("vi-VN") : "0";
  }

  global.Sheet = {
    fetchTab: fetchTab,
    fetchTabs: fetchTabs,
    getflyTask: getflyTask,
    esc: esc,
    num: num,
    rateClass: rateClass,
    vnd: vnd
  };
})(window);
